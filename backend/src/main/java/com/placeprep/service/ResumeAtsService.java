package com.placeprep.service;

import com.placeprep.dto.ResumeAtsResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class ResumeAtsService {

    private static final Logger log = LoggerFactory.getLogger(ResumeAtsService.class);
    public static final int DEFAULT_APPROVAL_THRESHOLD = 75;

    @Autowired
    private ResumeParserService resumeParserService;

    // Standard English and generic resume stop-words to prevent score inflation
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            "a", "about", "above", "across", "after", "again", "against", "all", "almost", "alone", "along",
            "already", "also", "although", "always", "among", "an", "and", "another", "any", "anybody",
            "anyone", "anything", "anywhere", "are", "area", "areas", "around", "as", "ask", "asked",
            "asking", "asks", "at", "away", "b", "back", "backed", "backing", "backs", "be", "became",
            "because", "become", "becomes", "becoming", "been", "before", "began", "behind", "being",
            "beings", "best", "better", "between", "big", "both", "but", "by", "c", "came", "can",
            "cannot", "case", "cases", "certain", "certainly", "clear", "clearly", "come", "could", "d",
            "did", "differ", "different", "differently", "do", "does", "done", "down", "downed", "downing",
            "downs", "during", "e", "each", "early", "either", "end", "ended", "ending", "ends", "enough",
            "even", "evenly", "ever", "every", "everybody", "everyone", "everything", "everywhere", "f",
            "face", "faces", "fact", "facts", "far", "felt", "few", "fewer", "find", "finds", "first",
            "for", "four", "from", "full", "fully", "further", "furthered", "furthering", "furthers", "g",
            "gave", "general", "generally", "get", "gets", "give", "given", "gives", "go", "going", "good",
            "goods", "got", "great", "greater", "greatest", "group", "grouped", "grouping", "groups", "h",
            "had", "has", "have", "having", "he", "her", "here", "herself", "high", "higher", "highest",
            "him", "himself", "his", "how", "however", "i", "if", "important", "in", "interest",
            "interested", "interesting", "interests", "into", "is", "it", "its", "itself", "j", "just",
            "k", "keep", "keeps", "kind", "knew", "know", "known", "knows", "l", "large", "largely",
            "last", "later", "latest", "least", "less", "let", "lets", "like", "likely", "long", "longer",
            "longest", "m", "made", "make", "making", "man", "many", "may", "me", "member", "members",
            "men", "might", "more", "most", "mostly", "mr", "mrs", "much", "must", "my", "myself", "n",
            "necessary", "need", "needed", "needing", "needs", "never", "new", "newer", "newest", "next",
            "no", "nobody", "non", "noone", "not", "nothing", "now", "nowhere", "number", "numbers", "o",
            "of", "off", "often", "old", "older", "oldest", "on", "once", "one", "only", "open", "opened",
            "opening", "opens", "or", "order", "ordered", "ordering", "orders", "other", "others", "our",
            "out", "over", "p", "part", "parted", "parting", "parts", "per", "place", "places", "point",
            "pointed", "pointing", "points", "possible", "present", "presented", "presenting", "presents",
            "problem", "problems", "put", "puts", "q", "quite", "r", "rather", "really", "right",
            "room", "rooms", "s", "said", "same", "saw", "say", "saying", "says", "second", "seconds",
            "see", "seem", "seemed", "seeming", "seems", "sees", "several", "shall", "she", "should",
            "show", "showed", "showing", "shows", "side", "sides", "since", "small", "smaller", "smallest",
            "so", "some", "somebody", "someone", "something", "somewhere", "state", "states", "still",
            "such", "sure", "t", "take", "taken", "than", "that", "the", "their", "them", "then", "there",
            "therefore", "these", "they", "thing", "things", "think", "thinks", "this", "those", "though",
            "thought", "thoughts", "three", "through", "thus", "to", "today", "together", "too", "took",
            "toward", "turn", "turned", "turning", "turns", "two", "u", "under", "until", "up", "upon",
            "us", "use", "used", "uses", "v", "very", "w", "want", "wanted", "wanting", "wants", "was",
            "way", "ways", "we", "well", "wells", "went", "were", "what", "when", "where", "whether",
            "which", "while", "who", "whole", "whose", "why", "will", "with", "within", "without", "work",
            "worked", "working", "works", "would", "x", "y", "year", "years", "yet", "you", "young",
            "younger", "youngest", "your", "yours", "z",
            // Generic HR / job posting boilerplate words
            "candidate", "candidates", "requirement", "requirements", "responsibility", "responsibilities",
            "qualification", "qualifications", "preferred", "role", "job", "position", "ability", "strong",
            "opportunity", "company", "description", "experience", "years", "skills", "knowledge", "working",
            "team", "environment", "written", "verbal", "communication", "collaborate", "collaborating",
            "seeking", "joining", "deliver", "support", "competitive", "benefits", "equal", "opportunity",
            "employer", "salary", "package", "hiring", "apply", "applicant", "degree", "bachelor", "master",
            "btech", "mtech", "b.tech", "m.tech", "hands-on", "proven", "proficiency", "proficient", "track"
    ));

    // Curated catalog of recognized multi-token and technical terms for phrase-aware extraction
    private static final List<String> TECH_DICTIONARY = Arrays.asList(
            "REST APIs", "REST API", "RESTful Web Services", "RESTful APIs", "Spring Boot", "Spring MVC",
            "Spring Framework", "Microservices", "Data Structures", "Algorithms", "Object-Oriented Programming",
            "Object Oriented Programming", "OOP", "DBMS", "Database Management", "Operating Systems",
            "Computer Networks", "System Design", "Distributed Systems", "Machine Learning", "Deep Learning",
            "Artificial Intelligence", "Natural Language Processing", "Computer Vision", "Docker", "Kubernetes",
            "Containerization", "CI/CD", "CI/CD Pipelines", "Continuous Integration", "Continuous Deployment",
            "Git", "GitHub", "GitLab", "Bitbucket", "Maven", "Gradle", "Jenkins", "Ansible", "Terraform",
            "AWS", "Amazon Web Services", "Microsoft Azure", "Azure", "Google Cloud", "GCP", "PostgreSQL",
            "MySQL", "MongoDB", "Redis", "Cassandra", "Elasticsearch", "Kafka", "Apache Kafka", "RabbitMQ",
            "GraphQL", "Java", "Python", "C++", "C#", "JavaScript", "TypeScript", "Go", "Rust", "Kotlin",
            "Swift", "PHP", "Ruby", "HTML5", "CSS3", "React", "React.js", "Angular", "Vue.js", "Node.js",
            "Express.js", "Next.js", "Tailwind CSS", "Bootstrap", "Linux", "Unix", "Bash", "Shell Scripting",
            "Unit Testing", "JUnit", "Mockito", "Selenium", "Test-Driven Development", "TDD", "Agile",
            "Scrum", "Jira", "SQL", "NoSQL", "B-Tree", "B-Tree Indexing", "ACID Properties", "Deadlock",
            "Multithreading", "Concurrency", "Design Patterns", "Clean Code", "API Gateway", "OAuth2", "JWT"
    );

    public ResumeAtsResponse analyze(MultipartFile file, String company, String role, String jobDescription) {
        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            throw new IllegalArgumentException("Target Job Description is required for ATS matching analysis.");
        }

        String cleanedJd = jobDescription.trim();
        if (cleanedJd.length() < 20) {
            throw new IllegalArgumentException("The job description is too short to perform keyword matching. Please paste a more detailed job description (at least 20 characters).");
        }

        String targetCompany = (company != null && !company.trim().isEmpty()) ? company.trim() : "Target Recruiter";
        String targetRole = (role != null && !role.trim().isEmpty()) ? role.trim() : "Software Engineer";

        // Step 1: Secure in-memory resume text extraction
        ResumeParserService.ParseResult parseResult = resumeParserService.extractText(file);
        String resumeText = parseResult.getExtractedText();

        // Step 2: Extract meaningful keywords & phrases from the Job Description
        Set<String> targetKeywords = extractKeywordsFromJobDescription(cleanedJd);

        if (targetKeywords.isEmpty()) {
            throw new IllegalArgumentException("Could not extract any meaningful technical skills or requirements from the provided job description. Please paste a more detailed job posting.");
        }

        // Step 3: Match keywords against extracted resume text
        List<String> matchedList = new ArrayList<>();
        List<String> missingList = new ArrayList<>();

        for (String keyword : targetKeywords) {
            if (isKeywordPresentInResume(keyword, resumeText)) {
                matchedList.add(keyword);
            } else {
                missingList.add(keyword);
            }
        }

        // Step 4: Calculate deterministic match score
        int totalCount = targetKeywords.size();
        int matchedCount = matchedList.size();
        int matchScore = totalCount > 0 ? (int) Math.round(((double) matchedCount / totalCount) * 100.0) : 0;
        matchScore = Math.min(100, Math.max(0, matchScore));

        String approvalStatus = (matchScore >= DEFAULT_APPROVAL_THRESHOLD) ? "APPROVED" : "NEEDS_REVISION";

        // Step 5: Generate constructive recommendations
        List<String> recommendations = generateRecommendations(matchedList, missingList, matchScore, targetCompany, targetRole);

        log.info("ATS Analysis complete: company={}, role={}, score={}/100, status={}, matched={}, missing={}",
                targetCompany, targetRole, matchScore, approvalStatus, matchedCount, missingList.size());

        return ResumeAtsResponse.builder()
                .company(targetCompany)
                .role(targetRole)
                .matchScore(matchScore)
                .approvalStatus(approvalStatus)
                .approvalThreshold(DEFAULT_APPROVAL_THRESHOLD)
                .matchedKeywords(matchedList)
                .missingKeywords(missingList)
                .recommendations(recommendations)
                .totalKeywordsCount(totalCount)
                .matchedCount(matchedCount)
                .missingCount(missingList.size())
                .fileName(parseResult.getFileName())
                .fileType(parseResult.getDocumentType().name())
                .fileSizeBytes(parseResult.getFileSize())
                .analyzedAt(Instant.now())
                .disclaimer("This score is an educational keyword compatibility estimate and does not guarantee employer ATS selection.")
                .build();
    }

    /**
     * Extracts relevant technical keywords and important domain phrases from the job description.
     */
    public Set<String> extractKeywordsFromJobDescription(String jobDescription) {
        Set<String> extracted = new LinkedHashSet<>();
        String jdLower = jobDescription.toLowerCase(Locale.ENGLISH);

        // 1. Identify matched catalog terms from tech dictionary
        for (String term : TECH_DICTIONARY) {
            String termLower = term.toLowerCase(Locale.ENGLISH);
            if (containsWordOrPhrase(jdLower, termLower)) {
                extracted.add(term);
            }
        }

        // 2. Extract additional significant domain words/acronyms from JD
        // Matches tokens of letters, digits, plus signs (like C++), hashes (like C#), slashes (like CI/CD)
        Pattern wordPattern = Pattern.compile("\\b[a-zA-Z][a-zA-Z0-9+#/.-]{1,24}\\b");
        Matcher matcher = wordPattern.matcher(jobDescription);
        while (matcher.find()) {
            String rawWord = matcher.group();
            String cleanWord = rawWord.replaceAll("^[./-]+|[./-]+$", ""); // trim punctuation
            String lower = cleanWord.toLowerCase(Locale.ENGLISH);

            if (lower.length() < 3 && !lower.equals("c#") && !lower.equals("c") && !lower.equals("go") && !lower.equals("ui") && !lower.equals("ux") && !lower.equals("qa") && !lower.equals("os")) {
                continue;
            }

            if (STOP_WORDS.contains(lower)) {
                continue;
            }

            // Avoid numbers only or generic plurals
            if (cleanWord.matches("^\\d+$")) {
                continue;
            }

            // Check if already represented by an existing canonical phrase (e.g. "apis" when "REST APIs" is included)
            boolean alreadyRepresented = false;
            for (String canon : extracted) {
                if (canon.equalsIgnoreCase(cleanWord) || canon.toLowerCase(Locale.ENGLISH).contains(lower)) {
                    alreadyRepresented = true;
                    break;
                }
            }

            if (!alreadyRepresented && isValidDomainKeyword(cleanWord)) {
                // Capitalize first letter nicely
                String formatted = formatKeywordTitle(cleanWord);
                extracted.add(formatted);
            }
        }

        return extracted;
    }

    private boolean isValidDomainKeyword(String word) {
        String lower = word.toLowerCase(Locale.ENGLISH);
        // Exclude common noise tokens
        if (lower.matches("^(https?|www|com|org|etc|eg|ie|via|also|per|within)$")) {
            return false;
        }
        return true;
    }

    private String formatKeywordTitle(String word) {
        // If word is an acronym (all caps like SQL, AWS, GCP, REST), preserve it
        if (word.matches("^[A-Z0-9+#/]+$")) {
            return word;
        }
        if (word.equalsIgnoreCase("api") || word.equalsIgnoreCase("apis")) return "API";
        if (word.equalsIgnoreCase("sql")) return "SQL";
        if (word.equalsIgnoreCase("nosql")) return "NoSQL";
        if (word.equalsIgnoreCase("aws")) return "AWS";
        if (word.equalsIgnoreCase("gcp")) return "GCP";
        if (word.equalsIgnoreCase("jwt")) return "JWT";
        if (word.equalsIgnoreCase("ci/cd")) return "CI/CD";

        if (word.length() <= 1) return word.toUpperCase(Locale.ENGLISH);
        return Character.toUpperCase(word.charAt(0)) + word.substring(1).toLowerCase(Locale.ENGLISH);
    }

    /**
     * Case-insensitive, boundary-aware check for keyword presence in resume text.
     */
    public boolean isKeywordPresentInResume(String keyword, String resumeText) {
        if (keyword == null || resumeText == null) return false;

        String kw = keyword.trim().toLowerCase(Locale.ENGLISH);
        String text = resumeText.toLowerCase(Locale.ENGLISH);

        // Normalize spaces in both
        kw = kw.replaceAll("\\s+", " ");
        text = text.replaceAll("\\s+", " ");

        // Special handling for acronyms and special characters
        if (kw.equals("c++") || kw.equals("c#") || kw.equals(".net")) {
            return text.contains(kw);
        }

        // Substring and regex boundary check
        String escaped = Pattern.quote(kw);
        Pattern pattern = Pattern.compile("(?:^|[^a-zA-Z0-9])" + escaped + "(?:$|[^a-zA-Z0-9])");
        return pattern.matcher(text).find() || text.contains(kw);
    }

    private boolean containsWordOrPhrase(String text, String term) {
        if (term.contains(" ") || term.contains("/") || term.contains("-")) {
            return text.contains(term);
        }
        String regex = "(?:^|[^a-zA-Z0-9])" + Pattern.quote(term) + "(?:$|[^a-zA-Z0-9])";
        return Pattern.compile(regex).matcher(text).find() || text.contains(term);
    }

    private List<String> generateRecommendations(List<String> matched, List<String> missing, int score, String company, String role) {
        List<String> recs = new ArrayList<>();

        if (!missing.isEmpty()) {
            List<String> topMissing = missing.stream().limit(5).collect(Collectors.toList());
            recs.add("Incorporate missing target competencies: " + String.join(", ", topMissing) + 
                    " into your Technical Skills, Projects, or Work Experience sections where genuinely applicable.");
        }

        if (score < DEFAULT_APPROVAL_THRESHOLD) {
            recs.add("Your match score (" + score + "%) is currently below the campus recruiter shortlisting threshold (" + 
                    DEFAULT_APPROVAL_THRESHOLD + "%). Tailor your project bullet points to mirror the specific tools, frameworks, and architecture patterns outlined in " + company + "'s " + role + " job description.");
            recs.add("Quantify your impact: use the Google XYZ formula ('Accomplished [X] as measured by [Y], by doing [Z]') with concrete metrics (e.g. 'reduced latency by 35%', 'handled 50k+ daily queries').");
        } else {
            recs.add("Great alignment! Your resume demonstrates strong keyword coverage (" + score + "%) matching " + company + "'s core technical criteria.");
            recs.add("Ensure your GitHub repository links, hosted demo URLs, and LinkedIn profile links in the contact header are live and functional.");
        }

        recs.add("Ensure clear standard section headings (Technical Skills, Academic Projects, Experience, Education) with standard bullet points to guarantee fault-tolerant parsing across all major ATS engines (Workday, Taleo, Greenhouse).");

        return recs;
    }
}
