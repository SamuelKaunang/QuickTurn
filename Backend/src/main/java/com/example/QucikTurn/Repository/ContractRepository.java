package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {
    Optional<Contract> findByProjectId(Long projectId);
}