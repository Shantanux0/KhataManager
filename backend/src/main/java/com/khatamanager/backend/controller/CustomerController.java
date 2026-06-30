package com.khatamanager.backend.controller;

import com.khatamanager.backend.model.Customer;
import com.khatamanager.backend.model.User;
import com.khatamanager.backend.repository.CustomerRepository;
import com.khatamanager.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public CustomerController(CustomerRepository customerRepository, UserRepository userRepository) {
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<Customer>> getCustomers(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(customerRepository.findByUserIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping
    public ResponseEntity<Customer> createCustomer(@RequestBody Customer customer, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        customer.setUser(user);
        if (customer.getCreatedAt() == null) {
            customer.setCreatedAt(java.time.LocalDate.now().toString());
        }
        return ResponseEntity.ok(customerRepository.save(customer));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer updatedCustomer, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return customerRepository.findById(id).map(customer -> {
            if (!customer.getUser().getId().equals(user.getId())) {
                throw new RuntimeException("Unauthorized");
            }
            if (updatedCustomer.getName() != null) customer.setName(updatedCustomer.getName());
            if (updatedCustomer.getMobile() != null) customer.setMobile(updatedCustomer.getMobile());
            if (updatedCustomer.getAddress() != null) customer.setAddress(updatedCustomer.getAddress());
            if (updatedCustomer.getNotes() != null) customer.setNotes(updatedCustomer.getNotes());
            if (updatedCustomer.getPaymentCycle() != null) customer.setPaymentCycle(updatedCustomer.getPaymentCycle());
            return ResponseEntity.ok(customerRepository.save(customer));
        }).orElse(ResponseEntity.notFound().build());
    }
}
