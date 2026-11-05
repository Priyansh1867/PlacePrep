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

    public Company update(String companyId, Company updatedData) {
        Company existing = getByCompanyId(companyId);
        if (updatedData.getName() != null) existing.setName(updatedData.getName());
        if (updatedData.getTier() != null) existing.setTier(updatedData.getTier());
        if (updatedData.getCtcRange() != null) existing.setCtcRange(updatedData.getCtcRange());
        if (updatedData.getEligibilityCriteria() != null) existing.setEligibilityCriteria(updatedData.getEligibilityCriteria());
        if (updatedData.getUpcomingDriveDate() != null) existing.setUpcomingDriveDate(updatedData.getUpcomingDriveDate());
        if (updatedData.getDriveStatus() != null) existing.setDriveStatus(updatedData.getDriveStatus());
        if (updatedData.getRoles() != null && !updatedData.getRoles().isEmpty()) existing.setRoles(updatedData.getRoles());
        if (updatedData.getEligibleBatches() != null && !updatedData.getEligibleBatches().isEmpty()) existing.setEligibleBatches(updatedData.getEligibleBatches());
        return companyRepository.save(existing);
    }
}
