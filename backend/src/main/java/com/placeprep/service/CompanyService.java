package com.placeprep.service;

import com.placeprep.model.Company;
import com.placeprep.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    public CompanyService() {
    }

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public List<Company> getAll() {
        return companyRepository.findAll();
    }

    public List<Company> getAll(String batch) {
        if (batch != null && !batch.trim().isEmpty()) {
            return companyRepository.findByEligibleBatch(batch.trim());
        }
        return companyRepository.findAll();
    }

    public Company getByCompanyId(String companyId) {
        return companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with companyId: " + companyId));
    }

    public Company create(Company company) {
        return companyRepository.save(company);
    }
}
