package com.placeprep.controller;

import com.placeprep.service.InsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class InsightsController {

    @Autowired
    private InsightsService insightsService;

    public InsightsController() {
    }

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> getInsights(@PathVariable String companyId) {
        Map<String, Object> insights = insightsService.getInsights(companyId);
        return ResponseEntity.ok(insights);
    }
}
