package com.placeprep.service;

import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.dto.SampleJdDto;
import com.placeprep.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAtsService {

    @Value("${placeprep.resume-ats.approval-threshold:75}")
    private int approvalThreshold;

    // Curated high-frequency technical multi-word phrases for precise ATS extraction
    private static final List<String> RECOGNIZED_TECH_PHRASES = List.of(
            "REST API", "REST APIs", "RESTful API", "RESTful APIs",
            "Spring Boot", "Spring Data JPA", "Spring Security", "Microservices Architecture",
            "Data Structures", "Algorithms", "Object Oriented Programming",
            "CI/CD", "Continuous Integration", "Continuous Deployment",
            "Docker Container", "Docker Containers", "Kubernetes",
            "Machine Learning", "Deep Learning", "Natural Language Processing",
            "Relational Database", "SQL Query", "SQL Queries", "NoSQL Database",
            "Cloud Computing", "AWS Cloud", "Azure Cloud", "Google Cloud",
            "System Design", "Distributed Systems", "Unit Testing", "Test Driven Development",
            "Version Control", "Git GitHub", "Full Stack", "Front End", "Back End",
            "Agile Methodology", "Database Management", "Clean Code", "Design Patterns"
    );

    // Common stop words and boilerplate recruitment terms to exclude
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone",
            "along", "already", "also", "although", "always", "among", "an", "and", "another",
            "any", "anybody", "anyone", "anything", "anywhere", "are", "area", "areas", "around",
            "as", "ask", "asked", "asking", "asks", "at", "away", "b", "back", "backed", "backing",
            "backs", "be", "became", "because", "become", "becomes", "becoming", "been", "before",
            "beforehand", "began", "behind", "being", "beings", "below", "beside", "besides",
            "best", "better", "between", "beyond", "big", "both", "but", "by", "c", "came", "can",
            "cannot", "cant", "case", "cases", "certain", "certainly", "clear", "clearly", "come",
            "could", "d", "did", "differ", "different", "differently", "do", "does", "done", "down",
            "downed", "downing", "downs", "during", "e", "each", "early", "either", "end", "ended",
            "ending", "ends", "enough", "even", "evenly", "ever", "every", "everybody", "everyone",
            "everything", "everywhere", "f", "face", "faces", "fact", "facts", "far", "felt", "few",
            "fewer", "find", "finds", "first", "for", "four", "from", "full", "fully", "further",
            "furthered", "furthering", "furthers", "g", "gave", "general", "generally", "get",
            "gets", "give", "given", "gives", "go", "going", "good", "goods", "got", "great",
            "greater", "greatest", "group", "grouped", "grouping", "groups", "h", "had", "has",
            "have", "having", "he", "her", "here", "herself", "high", "higher", "highest", "him",
            "himself", "his", "how", "however", "i", "if", "important", "in", "interest",
            "interested", "interesting", "interests", "into", "is", "it", "its", "itself", "j",
            "just", "k", "keep", "keeps", "kind", "knew", "know", "known", "knows", "l", "large",
            "largely", "last", "later", "latest", "least", "less", "let", "lets", "like", "likely",
            "long", "longer", "longest", "m", "made", "make", "making", "man", "many", "may", "me",
            "member", "members", "men", "might", "more", "most", "mostly", "mr", "mrs", "much",
            "must", "my", "myself", "n", "necessary", "need", "needed", "needing", "needs", "never",
            "new", "newer", "newest", "next", "no", "nobody", "non", "noone", "not", "nothing",
            "now", "nowhere", "number", "numbers", "o", "of", "off", "often", "old", "older",
            "oldest", "on", "once", "one", "only", "open", "opened", "opening", "opens", "or",
            "order", "ordered", "ordering", "orders", "other", "others", "our", "out", "over", "p",
            "part", "parted", "parting", "parts", "per", "perhaps", "place", "places", "point",
            "pointed", "pointing", "points", "possible", "present", "presented", "presenting",
            "presents", "problem", "problems", "put", "puts", "q", "quite", "r", "rather", "really",
            "right", "room", "rooms", "s", "said", "same", "saw", "say", "saying", "says", "second",
            "seconds", "see", "sees", "seem", "seemed", "seeming", "seems", "several", "shall",
            "she", "should", "show", "showed", "showing", "shows", "side", "sides", "since",
            "small", "smaller", "smallest", "so", "some", "somebody", "someone", "something",
            "somewhere", "state", "states", "still", "such", "sure", "t", "take", "taken", "than",
            "that", "the", "their", "them", "then", "there", "therefore", "these", "they", "thing",
            "things", "think", "thinks", "this", "those", "though", "thought", "thoughts", "three",
            "through", "thus", "to", "today", "together", "too", "took", "toward", "turn", "turned",
            "turning", "turns", "two", "u", "under", "until", "up", "upon", "us", "use", "used",
            "uses", "v", "very", "w", "want", "wanted", "wanting", "wants", "was", "way", "ways",
            "we", "well", "wells", "went", "were", "what", "when", "where", "whether", "which",
            "while", "who", "whole", "whose", "why", "will", "with", "within", "without", "work",
            "worked", "working", "works", "would", "x", "y", "year", "years", "yet", "you", "young",
            "younger", "youngest", "your", "yours", "z",
            // Generic recruitment boilerplates
            "experience", "candidate", "candidates", "applicant", "applicants", "role", "roles",
            "responsibility", "responsibilities", "qualification", "qualifications", "requirement",
            "requirements", "skill", "skills", "ability", "abilities", "opportunity", "team",
            "teams", "company", "culture", "plus", "preferred", "knowledge", "degree", "bachelor",
            "master", "bachelors", "masters", "minimum", "maximum", "strong", "excellent"
    );

    // Whitelist of valid 2-letter technical tokens
    private static final Set<String> SHORT_TECH_TERMS = Set.of(
            "go", "c", "r", "js", "ts", "ai", "ml", "os", "db", "ui", "ux", "qa", "ci", "cd", "ip"
    );

    /**
     * Performs explainable, deterministic ATS keyword matching and scoring.
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

        // 1. Extract keywords and multi-word phrases from Job Description
        Set<String> jdKeywords = extractKeywordsFromJobDescription(jobDescription);
        if (jdKeywords.isEmpty()) {
            throw new BadRequestException("Could not extract meaningful technical keywords from the provided Job Description. " +
                    "Please include specific technologies, frameworks, and job competencies.");
        }

        // 2. Match each keyword against the normalized resume text
        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        for (String keyword : jdKeywords) {
            if (isKeywordPresentInResume(keyword, resumeText)) {
                matched.add(keyword);
            } else {
                missing.add(keyword);
            }
        }

        // Sort alphabetically for clean UI presentation
        matched.sort(String.CASE_INSENSITIVE_ORDER);
        missing.sort(String.CASE_INSENSITIVE_ORDER);

        // 3. Calculate score
        int totalKeywords = jdKeywords.size();
        int matchedCount = matched.size();
        int matchScore = (int) Math.round(((double) matchedCount / totalKeywords) * 100);

        // 4. Approval status determination against configurable threshold (default 75%)
        String approvalStatus = (matchScore >= approvalThreshold) ? "APPROVED" : "NEEDS_REVISION";

        // 5. Generate transparent actionable recommendations
        List<String> recommendations = generateRecommendations(matched, missing, matchScore, safeRole);

        String summary = String.format(Locale.ROOT,
                "Your resume matched %d out of %d key competencies (score: %d%%) for %s at %s. %s",
                matchedCount, totalKeywords, matchScore, safeRole, safeCompany,
                (matchScore >= approvalThreshold)
                        ? "High ATS compatibility rating — ready for submission."
                        : "Requires keyword reinforcement to pass typical campus ATS filtering.");

        return ResumeAtsResponse.builder()
                .company(safeCompany)
                .role(safeRole)
                .fileName(safeFileName)
                .matchScore(matchScore)
                .approvalStatus(approvalStatus)
                .approvalThreshold(approvalThreshold)
                .totalJobKeywords(totalKeywords)
                .matchedCount(matchedCount)
                .missingCount(missing.size())
                .matchedKeywords(matched)
                .missingKeywords(missing)
                .recommendations(recommendations)
                .summary(summary)
                .disclaimer("This ATS compatibility evaluation is an educational diagnostic estimate based on keyword frequency " +
                        "and semantic matching against the provided job description. It does not guarantee employment selection by third-party systems.")
                .analyzedAt(Instant.now().toString())
                .build();
    }

    /**
     * Extracts multi-word technical phrases and normalized technical tokens from the JD.
     */
    public Set<String> extractKeywordsFromJobDescription(String jdText) {
        Set<String> keywords = new LinkedHashSet<>();
        String workingText = jdText;

        // A. Match and extract recognized multi-word phrases first
        for (String phrase : RECOGNIZED_TECH_PHRASES) {
            Pattern pattern = Pattern.compile("(?i)\\b" + Pattern.quote(phrase) + "\\b");
            Matcher matcher = pattern.matcher(workingText);
            if (matcher.find()) {
                keywords.add(phrase); // preserve canonical phrase casing
                // Mask matched phrase from working text so individual words aren't double counted
                workingText = matcher.replaceAll(" ");
            }
        }

        // B. Tokenize remaining words, sanitize punctuation and check stopwords
        // Match tokens like: C++, C#, .NET, Node.js, or alphanumeric words
        Pattern tokenPattern = Pattern.compile("(?i)\\b([a-z0-9+#.]+)\\b|\\b([a-z]+)\\b");
        Matcher tokenMatcher = tokenPattern.matcher(workingText);

        while (tokenMatcher.find()) {
            String token = tokenMatcher.group().trim();
            String lower = token.toLowerCase(Locale.ROOT);

            // Strip trailing/leading punctuation
            token = token.replaceAll("^[.]+ champion |[.]+$", "");
            lower = lower.replaceAll("^[.]+|[.]+$", "");

            if (lower.isEmpty()) continue;

            // Reject if stop word
            if (STOP_WORDS.contains(lower)) continue;

            // Reject if purely numeric
            if (lower.matches("^\\d+$")) continue;

            // Accept if short tech term or length >= 3
            if (SHORT_TECH_TERMS.contains(lower) || lower.length() >= 3) {
                // Capitalize first letter or retain tech uppercase conventions
                keywords.add(formatKeyword(token));
            }
        }

        return keywords;
    }

    private boolean isKeywordPresentInResume(String keyword, String resumeText) {
        // Multi-word phrase or word boundary matching
        String patternString;
        if (keyword.equalsIgnoreCase("C++")) {
            patternString = "(?i)\\bC\\+\\+";
        } else if (keyword.equalsIgnoreCase("C#")) {
            patternString = "(?i)\\bC#";
        } else if (keyword.equalsIgnoreCase(".NET")) {
            patternString = "(?i)\\.NET\\b";
        } else {
            patternString = "(?i)\\b" + Pattern.quote(keyword) + "\\b";
        }

        Pattern pattern = Pattern.compile(patternString);
        return pattern.matcher(resumeText).find();
    }

    private String formatKeyword(String token) {
        String lower = token.toLowerCase(Locale.ROOT);
        if (lower.equals("sql") || lower.equals("aws") || lower.equals("api") || lower.equals("html") ||
                lower.equals("css") || lower.equals("dsa") || lower.equals("oop") || lower.equals("jwt") ||
                lower.equals("gcp") || lower.equals("sdk") || lower.equals("dbms") || lower.equals("jpa") ||
                lower.equals("rest") || lower.equals("ci/cd")) {
            return token.toUpperCase(Locale.ROOT);
        }
        if (lower.equals("javascript") || lower.equals("typescript") || lower.equals("postgresql") ||
                lower.equals("mongodb") || lower.equals("mysql") || lower.equals("docker") ||
                lower.equals("react") || lower.equals("python") || lower.equals("java")) {
            return Character.toUpperCase(lower.charAt(0)) + lower.substring(1);
        }
        if (token.length() <= 3 && SHORT_TECH_TERMS.contains(lower)) {
            return token.toUpperCase(Locale.ROOT);
        }
        return Character.toUpperCase(token.charAt(0)) + token.substring(1);
    }

    private List<String> generateRecommendations(List<String> matched, List<String> missing, int score, String role) {
        List<String> recs = new ArrayList<>();

        if (!missing.isEmpty()) {
            List<String> topMissing = missing.stream().limit(5).collect(Collectors.toList());
            recs.add("Incorporate missing core competencies prominently in your Technical Skills and Projects sections: " +
                    String.join(", ", topMissing) + ".");
        }

        if (score < approvalThreshold) {
            recs.add("Your match score (" + score + "%) is currently below the campus recruiter shortlisting threshold (" +
                    approvalThreshold + "%). Tailor your project bullet points to directly reflect the requirements of " + role + ".");
        } else {
            recs.add("Strong alignment achieved (" + score + "%). Ensure each matched skill is substantiated by a concrete project or internship bullet point.");
        }

        recs.add("Apply the STAR method (Situation, Task, Action, Result) and quantify outcomes with measurable metrics (e.g., 'Reduced query latency by 35%').");
        recs.add("Verify standard ATS document formatting: use standard single-column layouts, clear section headers (Education, Skills, Experience, Projects), and avoid non-standard embedded tables or graphics.");
        recs.add("Begin bullet points with authoritative engineering action verbs such as 'Architected', 'Implemented', 'Engineered', 'Optimized', and 'Spearheaded'.");

        return recs;
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
