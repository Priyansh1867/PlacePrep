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
        if (batch != null && !batch.trim().isEmpty() && !"all".equalsIgnoreCase(batch.trim())) {
            return companyRepository.findByEligibleBatch(batch.trim());
        }
        return companyRepository.findAll();
    }

    public Company getByCompanyId(String companyId) {
        return companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with companyId: " + companyId));
    }

    public Company create(Company company) {
        if (company.getCompanyId() == null || company.getCompanyId().trim().isEmpty()) {
            String slug = company.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-");
            company.setCompanyId(slug);
            company.setSlug(slug);
        }
        return companyRepository.save(company);
    }

    public Company update(String companyId, Company updated) {
        Company existing = getByCompanyId(companyId);
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getTier() != null) existing.setTier(updated.getTier());
        if (updated.getCtcRange() != null) existing.setCtcRange(updated.getCtcRange());
        if (updated.getEligibilityCriteria() != null) existing.setEligibilityCriteria(updated.getEligibilityCriteria());
        if (updated.getDriveStatus() != null) existing.setDriveStatus(updated.getDriveStatus());
        if (updated.getUpcomingDriveDate() != null) existing.setUpcomingDriveDate(updated.getUpcomingDriveDate());
        if (updated.getEligibleBatches() != null) existing.setEligibleBatches(updated.getEligibleBatches());
        if (updated.getRoles() != null) existing.setRoles(updated.getRoles());
        if (updated.getFrequentTopics() != null) existing.setFrequentTopics(updated.getFrequentTopics());
        if (updated.getHeadquarters() != null) existing.setHeadquarters(updated.getHeadquarters());
        if (updated.getIndustry() != null) existing.setIndustry(updated.getIndustry());
        if (updated.getRecruitmentProcessJson() != null) existing.setRecruitmentProcessJson(updated.getRecruitmentProcessJson());
        existing.setVerifiedUpcomingDrive(updated.isVerifiedUpcomingDrive());
        return companyRepository.save(existing);
    }

    public void delete(String companyId) {
        Company existing = getByCompanyId(companyId);
        companyRepository.delete(existing);
    }
}
