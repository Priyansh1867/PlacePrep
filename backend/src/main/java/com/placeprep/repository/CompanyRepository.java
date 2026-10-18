package com.placeprep.repository;

import com.placeprep.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByCompanyId(String companyId);

    @Query("SELECT c FROM Company c JOIN c.eligibleBatches b WHERE b = :batch")
    List<Company> findByEligibleBatch(@Param("batch") String batch);
}
