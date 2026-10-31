package com.placeprep.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.dto.SampleJdDto;
import com.placeprep.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAtsService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAtsService.class);

    @Value("${placeprep.resume-ats.approval-threshold:75}")
    private int approvalThreshold;

    private final ChatClient chatClient;
    private final ObjectMapper objectMapper;

    public ResumeAtsService() {
        this.chatClient = null;
        this.objectMapper = new ObjectMapper();
    }

    @Autowired
    public ResumeAtsService(ChatClient chatClient) {
        this.chatClient = chatClient;
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Evaluates resume against a target job description using the AI ChatClient to determine
     * the ATS match score, matched and missing keywords, recommendations, and executive summary.
     */
    public ResumeAtsResponse analyze(String resumeText, String company, String role, String jobDescription, String fileName) {
        if (resumeText == null || resumeText.trim().isEmpty()) {
            throw new BadRequestException("Resume text cannot be empty.");
        }
        if (jobDescription == null || jobDescription.trim().length() < 15) {
            throw new BadRequestException("Please provide a valid, descriptive Job Description (at least 15 characters).");
        }

        String safeCompany = (company != null && !company.trim().isEmpty()) ? company.trim() : "Target Recruiter";
        String safeRole = (role != null && !role.trim().isEmpty()) ? role.trim() : "Target Technical Role";
        String safeFileName = (fileName != null && !fileName.trim().isEmpty()) ? fileName.trim() : "uploaded_resume.pdf";

        if (chatClient != null) {
            return analyzeWithAi(resumeText, safeCompany, safeRole, jobDescription, safeFileName);
        }

        return analyzeFallback(resumeText, safeCompany, safeRole, jobDescription, safeFileName);
    }

    /**
     * Uses Spring AI ChatClient to evaluate the resume against the job description.
     */
    private ResumeAtsResponse analyzeWithAi(String resumeText, String company, String role, String jobDescription, String fileName) {
        String systemPrompt = """
                You are an expert Applicant Tracking System (ATS) and senior technical recruiter.
                Evaluate the candidate's resume against the target Job Description (JD).
                Analyze technical skills, tools, frameworks, system design, domain knowledge, and requirements.

                Calculate an objective ATS compatibility score (0 to 100) based on how well the candidate meets the JD requirements.
                Identify matched keywords and skills that are present in the resume.
                Identify missing keywords and skills required by the JD that are absent or insufficiently demonstrated in the resume.
                Provide 4 to 6 actionable, concrete recommendations for improving ATS compatibility and alignment.
                Provide a concise 2-3 sentence executive evaluation summary.

                Respond ONLY with a valid JSON object matching this schema:
                {
                  "matchScore": <integer 0-100>,
                  "matchedKeywords": ["<skill1>", "<skill2>"],
                  "missingKeywords": ["<missingSkill1>", "<missingSkill2>"],
                  "recommendations": ["<recommendation1>", "<recommendation2>"],
                  "summary": "<evaluation summary>"
                }
                Do not include markdown code block syntax (such as ```json) or any additional text outside the JSON.
                """;

        String userPrompt = String.format(Locale.ROOT,
                """
                Target Company: %s
                Target Role: %s

                === JOB DESCRIPTION ===
                %s

                === CANDIDATE RESUME ===
                %s
                """,
                company, role, jobDescription, resumeText);

        try {
            String aiResponse = chatClient.prompt()
                    .system(systemPrompt)
                    .user(userPrompt)
                    .call()
                    .content();

            return parseAiResponse(aiResponse, company, role, fileName);
        } catch (Exception e) {
            log.error("AI ATS analysis call failed: {}", e.getMessage(), e);
            return analyzeFallback(resumeText, company, role, jobDescription, fileName);
        }
    }

    /**
     * Parses the AI response JSON and constructs the ResumeAtsResponse.
     */
    private ResumeAtsResponse parseAiResponse(String rawContent, String company, String role, String fileName) {
        int matchScore = 0;
        List<String> matchedKeywords = new ArrayList<>();
        List<String> missingKeywords = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        String summary = null;

        if (rawContent != null && !rawContent.isBlank()) {
            String cleanJson = extractJson(rawContent);
            try {
                JsonNode root = objectMapper.readTree(cleanJson);

                if (root.has("matchScore")) {
                    matchScore = Math.max(0, Math.min(100, root.get("matchScore").asInt(0)));
                }

                if (root.has("matchedKeywords") && root.get("matchedKeywords").isArray()) {
                    for (JsonNode node : root.get("matchedKeywords")) {
                        String kw = node.asText("").trim();
                        if (!kw.isEmpty()) {
                            matchedKeywords.add(kw);
                        }
                    }
                }

                if (root.has("missingKeywords") && root.get("missingKeywords").isArray()) {
                    for (JsonNode node : root.get("missingKeywords")) {
                        String kw = node.asText("").trim();
                        if (!kw.isEmpty()) {
                            missingKeywords.add(kw);
                        }
                    }
                }

                if (root.has("recommendations") && root.get("recommendations").isArray()) {
                    for (JsonNode node : root.get("recommendations")) {
                        String rec = node.asText("").trim();
                        if (!rec.isEmpty()) {
                            recommendations.add(rec);
                        }
                    }
                }

                if (root.has("summary") && !root.get("summary").isNull()) {
                    summary = root.get("summary").asText("").trim();
                }
            } catch (Exception e) {
                log.warn("Failed to parse AI JSON response: {}. Raw response: {}", e.getMessage(), rawContent);
            }
        }

        matchedKeywords.sort(String.CASE_INSENSITIVE_ORDER);
        missingKeywords.sort(String.CASE_INSENSITIVE_ORDER);

        int totalKeywords = matchedKeywords.size() + missingKeywords.size();
        int matchedCount = matchedKeywords.size();
        int missingCount = missingKeywords.size();

        if (matchScore == 0 && totalKeywords > 0) {
            matchScore = (int) Math.round(((double) matchedCount / totalKeywords) * 100);
        }

        String approvalStatus = (matchScore >= approvalThreshold) ? "APPROVED" : "NEEDS_REVISION";

        if (summary == null || summary.isBlank()) {
            summary = String.format(Locale.ROOT,
                    "Your resume matched %d out of %d key competencies (score: %d%%) for %s at %s. %s",
                    matchedCount, totalKeywords, matchScore, role, company,
                    (matchScore >= approvalThreshold)
                            ? "High ATS compatibility rating — ready for submission."
                            : "Requires keyword reinforcement to pass typical campus ATS filtering.");
        }

        return ResumeAtsResponse.builder()
                .company(company)
                .role(role)
                .fileName(fileName)
                .matchScore(matchScore)
                .approvalStatus(approvalStatus)
                .approvalThreshold(approvalThreshold)
                .totalJobKeywords(totalKeywords)
                .matchedCount(matchedCount)
                .missingCount(missingCount)
                .matchedKeywords(matchedKeywords)
                .missingKeywords(missingKeywords)
                .recommendations(recommendations)
                .summary(summary)
                .disclaimer("This ATS compatibility evaluation is an AI-powered diagnostic estimate based on semantic and keyword matching against the provided job description. It does not guarantee employment selection by third-party systems.")
                .analyzedAt(Instant.now().toString())
                .build();
    }

    /**
     * Extracts JSON object string by stripping markdown code fences or non-JSON wrapper text.
     */
    private String extractJson(String text) {
        if (text == null) {
            return "{}";
        }
        String trimmed = text.trim();
        if (trimmed.startsWith("```json")) {
            trimmed = trimmed.substring(7);
        } else if (trimmed.startsWith("```")) {
            trimmed = trimmed.substring(3);
        }
        if (trimmed.endsWith("```")) {
            trimmed = trimmed.substring(0, trimmed.length() - 3);
        }
        trimmed = trimmed.trim();

        int start = trimmed.indexOf('{');
        int end = trimmed.lastIndexOf('}');
        if (start != -1 && end != -1 && end >= start) {
            return trimmed.substring(start, end + 1);
        }
        return trimmed;
    }

    /**
     * Fallback ATS analyzer used when AI ChatClient is unavailable.
     */
    private ResumeAtsResponse analyzeFallback(String resumeText, String company, String role, String jobDescription, String fileName) {
        Set<String> jdKeywords = extractKeywordsFromJobDescription(jobDescription);
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String kw : jdKeywords) {
            Pattern pattern = Pattern.compile("(?i)\\b" + Pattern.quote(kw) + "\\b");
            if (pattern.matcher(resumeText).find()) {
                matched.add(kw);
            } else {
                missing.add(kw);
            }
        }

        matched.sort(String.CASE_INSENSITIVE_ORDER);
        missing.sort(String.CASE_INSENSITIVE_ORDER);

        int totalKeywords = jdKeywords.size();
        int matchedCount = matched.size();
        int matchScore = totalKeywords > 0 ? (int) Math.round(((double) matchedCount / totalKeywords) * 100) : 0;
        String approvalStatus = (matchScore >= approvalThreshold) ? "APPROVED" : "NEEDS_REVISION";

        List<String> recs = new ArrayList<>();
        if (!missing.isEmpty()) {
            recs.add("Incorporate missing core competencies prominently in your Technical Skills and Projects sections: " +
                    String.join(", ", missing.stream().limit(5).collect(Collectors.toList())) + ".");
        }
        if (matchScore < approvalThreshold) {
            recs.add("Your match score (" + matchScore + "%) is currently below the campus recruiter shortlisting threshold (" +
                    approvalThreshold + "%). Tailor your project bullet points to directly reflect the requirements of " + role + ".");
        } else {
            recs.add("Strong alignment achieved (" + matchScore + "%). Ensure each matched skill is substantiated by a concrete project or internship bullet point.");
        }
        recs.add("Apply the STAR method (Situation, Task, Action, Result) and quantify outcomes with measurable metrics (e.g., 'Reduced query latency by 35%').");
        recs.add("Verify standard ATS document formatting: use standard single-column layouts, clear section headers (Education, Skills, Experience, Projects), and avoid non-standard embedded tables or graphics.");
        recs.add("Begin bullet points with authoritative engineering action verbs such as 'Architected', 'Implemented', 'Engineered', 'Optimized', and 'Spearheaded'.");

        String summary = String.format(Locale.ROOT,
                "Your resume matched %d out of %d key competencies (score: %d%%) for %s at %s. %s",
                matchedCount, totalKeywords, matchScore, role, company,
                (matchScore >= approvalThreshold)
                        ? "High ATS compatibility rating — ready for submission."
                        : "Requires keyword reinforcement to pass typical campus ATS filtering.");

        return ResumeAtsResponse.builder()
                .company(company)
                .role(role)
                .fileName(fileName)
                .matchScore(matchScore)
                .approvalStatus(approvalStatus)
                .approvalThreshold(approvalThreshold)
                .totalJobKeywords(totalKeywords)
                .matchedCount(matchedCount)
                .missingCount(missing.size())
                .matchedKeywords(matched)
                .missingKeywords(missing)
                .recommendations(recs)
                .summary(summary)
                .disclaimer("This ATS compatibility evaluation is an educational diagnostic estimate based on keyword frequency " +
                        "and semantic matching against the provided job description. It does not guarantee employment selection by third-party systems.")
                .analyzedAt(Instant.now().toString())
                .build();
    }

    /**
     * Extracts keywords from the job description.
     */
    public Set<String> extractKeywordsFromJobDescription(String jdText) {
        if (jdText == null || jdText.isBlank()) {
            return Collections.emptySet();
        }
        Set<String> keywords = new LinkedHashSet<>();
        Pattern pattern = Pattern.compile("(?i)\\b([a-zA-Z0-9+#.]+)\\b");
        Matcher matcher = pattern.matcher(jdText);
        while (matcher.find()) {
            String token = matcher.group().trim();
            if (token.length() >= 2) {
                keywords.add(token);
            }
        }
        return keywords;
    }

    /**
     * Curated sample job descriptions for prominent campus recruiters.
     */
    public List<SampleJdDto> getSampleJds() {
        return List.of(
                SampleJdDto.builder()
                        .id("jd-tcs-digital")
                        .company("TCS")
                        .role("Software Engineer (Digital Cadre)")
                        .category("IT Services & Consulting")
                        .ctc("₹7.5 - ₹9.0 LPA")
                        .description("TCS Digital is hiring passionate Software Engineers proficient in Java, Spring Boot, REST APIs, and modern web frameworks like React. The candidate must possess solid foundations in Data Structures, Algorithms, Object Oriented Programming, and Relational Database management with SQL Queries. Familiarity with Docker Containers, CI/CD pipelines, and Cloud Computing concepts is a plus.")
                        .keySkills(List.of("Java", "Spring Boot", "REST API", "React", "Data Structures", "Algorithms", "SQL Query", "Git"))
                        .build(),
                SampleJdDto.builder()
                        .id("jd-infosys-sp")
                        .company("Infosys")
                        .role("Specialist Programmer (Power Programmer)")
                        .category("Product Engineering & Elite Hiring")
                        .ctc("₹9.5 - ₹11.0 LPA")
                        .description("We are seeking high-caliber problem solvers for the Specialist Programmer role. Key competencies: advanced Data Structures, dynamic programming, Graph algorithms, Microservices Architecture, Python, or Java. Experience with distributed caching, Docker, Kubernetes, Unit Testing, and AWS Cloud services will give candidates an edge.")
                        .keySkills(List.of("Data Structures", "Algorithms", "Microservices", "Java", "Python", "Docker", "Kubernetes", "AWS Cloud"))
                        .build(),
                SampleJdDto.builder()
                        .id("jd-amazon-sde1")
                        .company("Amazon")
                        .role("Software Development Engineer I (SDE-1)")
                        .category("Product & Big Tech")
                        .ctc("₹28.0 - ₹34.0 LPA")
                        .description("Amazon is seeking ambitious SDE 1 candidates. You will design, build, and deploy high-throughput distributed systems. Required: exceptional mastery of Object Oriented Programming in Java, C++, or Go; deep understanding of System Design, multi-threading, REST APIs, and database indexing. You should have hands-on experience with Unit Testing, Test Driven Development, Version Control with Git GitHub, and Cloud Computing on AWS.")
                        .keySkills(List.of("Java", "System Design", "Distributed Systems", "REST API", "Data Structures", "Unit Testing", "AWS Cloud", "Git GitHub"))
                        .build(),
                SampleJdDto.builder()
                        .id("jd-atlassian-ase")
                        .company("Atlassian")
                        .role("Associate Software Engineer")
                        .category("Product / SaaS")
                        .ctc("₹22.5 LPA")
                        .description("Join our engineering team to build world-class collaborative developer tools. We require strong skills in React, TypeScript, JavaScript, Java, and Spring Boot. You must write Clean Code with high unit test coverage, design scalable REST APIs, and participate in Agile Methodology sprints. Understanding of Docker, CI/CD, and Microservices Architecture is strongly valued.")
                        .keySkills(List.of("React", "TypeScript", "Java", "Spring Boot", "REST API", "CI/CD", "Docker", "Clean Code"))
                        .build(),
                SampleJdDto.builder()
                        .id("jd-capgemini-diff")
                        .company("Capgemini")
                        .role("Senior Analyst / Differential Developer")
                        .category("IT & Digital Solutions")
                        .ctc("₹7.0 - ₹8.5 LPA")
                        .description("Looking for full stack and backend developers with proficiency in Java, Spring Boot, SQL Queries, and frontend integration. Must demonstrate clear understanding of Object Oriented Programming, Data Structures, Relational Database normalization, and version control. Experience with cloud platforms (Azure Cloud or AWS) and agile delivery is preferred.")
                        .keySkills(List.of("Java", "Spring Boot", "SQL Query", "Data Structures", "Object Oriented Programming", "Git", "Cloud Computing"))
                        .build()
        );
    }
}
