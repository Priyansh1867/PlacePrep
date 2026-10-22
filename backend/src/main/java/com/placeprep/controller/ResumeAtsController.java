package com.placeprep.controller;

import com.placeprep.dto.ResumeAtsResponse;
import com.placeprep.service.ResumeAtsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/resume-ats")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ResumeAtsController {

    @Autowired
    private ResumeAtsService resumeAtsService;

    @PostMapping(value = "/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeResume(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "company", required = false, defaultValue = "Target Recruiter") String company,
            @RequestParam(value = "role", required = false, defaultValue = "Software Engineer") String role,
            @RequestParam("jobDescription") String jobDescription
    ) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Please upload a valid resume file (.pdf, .docx, or .doc)."));
        }

        if (jobDescription == null || jobDescription.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Job Description cannot be empty. Please paste the target job description."));
        }

        try {
            ResumeAtsResponse response = resumeAtsService.analyze(file, company, role, jobDescription);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", "ATS Analysis failed: " + e.getMessage()));
        }
    }

    @GetMapping("/sample-jds")
    public ResponseEntity<List<Map<String, String>>> getSampleJobDescriptions() {
        List<Map<String, String>> samples = Arrays.asList(
                createSample(
                        "hcltech",
                        "HCLTech",
                        "Software Engineer - Java / Cloud",
                        "HCLTech is seeking passionate Graduate Engineer Trainees to design, develop, and maintain enterprise software applications. Key requirements include proficiency in Java, Spring Boot, Microservices, and REST APIs. Experience with SQL databases (MySQL/PostgreSQL), Hibernate, and Git version control is essential. Familiarity with Docker, Kubernetes, CI/CD pipelines, and cloud platforms (AWS or Azure) is strongly preferred. Strong foundation in Data Structures, Algorithms, Object-Oriented Programming (OOP), and unit testing with JUnit and Mockito."
                ),
                createSample(
                        "tcs",
                        "TCS",
                        "Digital Software Developer",
                        "Tata Consultancy Services is hiring Digital Cadre Software Engineers. Responsibilities include building scalable web applications using Java or Python, RESTful Web Services, and modern front-end frameworks (React or Angular). Candidates should have solid knowledge of DBMS, complex SQL queries, Operating Systems concepts, and Computer Networks. Hands-on exposure to Agile Scrum workflows, JIRA, Docker containerization, and automated testing is advantageous."
                ),
                createSample(
                        "infosys",
                        "Infosys",
                        "Specialist Programmer",
                        "Infosys is hiring Specialist Programmers and System Engineers. Role involves full-stack software development, architectural design, and cloud-native solutions. Required technical skills: Java, Spring Framework, REST APIs, Microservices, PostgreSQL, and Redis caching. Candidate must possess deep knowledge of Data Structures, Algorithms, Distributed Systems, Docker, and CI/CD pipelines. Knowledge of clean code principles and Unit Testing."
                ),
                createSample(
                        "google",
                        "Google",
                        "Software Engineer - University Graduate",
                        "Google Software Engineers develop next-generation technologies that change how billions of users connect and interact. Minimum qualifications: BS/MS in Computer Science or related technical field. Experience with one or more general-purpose programming languages including Java, C++, Python, or Go. Strong command of Data Structures, Algorithms, System Design, Multithreading, Concurrency, and Operating Systems. Experience building distributed systems, cloud services, and microservices."
                )
        );

        return ResponseEntity.ok(samples);
    }

    private Map<String, String> createSample(String companyId, String companyName, String role, String jd) {
        Map<String, String> item = new LinkedHashMap<>();
        item.put("companyId", companyId);
        item.put("companyName", companyName);
        item.put("role", role);
        item.put("jobDescription", jd);
        return item;
    }
}
