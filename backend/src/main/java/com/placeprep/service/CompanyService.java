package com.placeprep.service;

import com.placeprep.model.Company;
import com.placeprep.dto.EntityResponseDto;
import com.placeprep.mapper.EntityResponseMapper;
import com.placeprep.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAll() {
        return EntityResponseMapper.toDtoList(companyRepository.findAll());
    }

    @Transactional(readOnly = true)
    public List<EntityResponseDto> getAll(String batch) {
        if (batch != null && !batch.trim().isEmpty()) {
            return EntityResponseMapper.toDtoList(companyRepository.findByEligibleBatch(batch.trim()));
        }
        return EntityResponseMapper.toDtoList(companyRepository.findAll());
    }

    @Transactional(readOnly = true)
    public EntityResponseDto getByCompanyId(String companyId) {
        Company company = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with companyId: " + companyId));
        return EntityResponseMapper.toDto(company);
    }

    @Transactional
    public EntityResponseDto create(Company company) {
        return EntityResponseMapper.toDto(companyRepository.save(company));
    }

    @Transactional
    public EntityResponseDto update(String companyId, Company updatedData) {
        Company existing = companyRepository.findByCompanyId(companyId)
                .orElseThrow(() -> new IllegalArgumentException("Company not found with companyId: " + companyId));
        if (updatedData.getName() != null) existing.setName(updatedData.getName());
        if (updatedData.getTier() != null) existing.setTier(updatedData.getTier());
        if (updatedData.getCtcRange() != null) existing.setCtcRange(updatedData.getCtcRange());
        if (updatedData.getEligibilityCriteria() != null) existing.setEligibilityCriteria(updatedData.getEligibilityCriteria());
        if (updatedData.getUpcomingDriveDate() != null) existing.setUpcomingDriveDate(updatedData.getUpcomingDriveDate());
        if (updatedData.getDriveStatus() != null) existing.setDriveStatus(updatedData.getDriveStatus());
        if (updatedData.getRoles() != null && !updatedData.getRoles().isEmpty()) existing.setRoles(updatedData.getRoles());
        if (updatedData.getEligibleBatches() != null && !updatedData.getEligibleBatches().isEmpty()) existing.setEligibleBatches(updatedData.getEligibleBatches());
        return EntityResponseMapper.toDto(companyRepository.save(existing));
    }
}
