package com.placeprep.controller;

import com.placeprep.service.CodeExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dsa")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CodeExecutionController {

    @Autowired
    private CodeExecutionService codeExecutionService;

    public CodeExecutionController() {
    }

    public CodeExecutionController(CodeExecutionService codeExecutionService) {
        this.codeExecutionService = codeExecutionService;
    }

    @PostMapping("/execute")
    public ResponseEntity<Map<String, Object>> executeCode(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = codeExecutionService.executeCode(payload);
        return ResponseEntity.ok(response);
    }
}
