package com.placeprep.controller;

import com.placeprep.model.Company;
import com.placeprep.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    public CompanyController() {
    }

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping
    public ResponseEntity<List<Company>> getCompanies(@RequestParam(required = false) String batch) {
        return ResponseEntity.ok(companyService.getAll(batch));
    }

    @GetMapping("/{companyId}")
    public ResponseEntity<?> getCompanyById(@PathVariable String companyId) {
        try {
            Company company = companyService.getByCompanyId(companyId);
            return ResponseEntity.ok(company);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Company> createCompany(@RequestBody Company company) {
        Company created = companyService.create(company);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
