package com.khatamanager.backend.repository;

import com.khatamanager.backend.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByUserId(Long userId);
    List<Customer> findByUserIdOrderByCreatedAtDesc(Long userId);
}
