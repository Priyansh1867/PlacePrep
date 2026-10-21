package com.placeprep.controller;

import com.placeprep.service.InsightsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/insights")
public class InsightsController {

    @Autowired
    private InsightsService insightsService;

    public InsightsController() {
    }

    public InsightsController(InsightsService insightsService) {
        this.insightsService = insightsService;
    }

    @GetMapping("/overview")
    public ResponseEntity<Map<String, Object>> getOverview() {
        return ResponseEntity.ok(insightsService.getOverviewInsights());
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<Map<String, Object>> getInsights(@PathVariable String companyId) {
        return ResponseEntity.ok(insightsService.getInsights(companyId));
    }
}
