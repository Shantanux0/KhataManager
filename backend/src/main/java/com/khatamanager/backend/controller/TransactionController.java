package com.khatamanager.backend.controller;

import com.khatamanager.backend.dto.TransactionRequest;
import com.khatamanager.backend.model.Customer;
import com.khatamanager.backend.model.Transaction;
import com.khatamanager.backend.model.User;
import com.khatamanager.backend.repository.CustomerRepository;
import com.khatamanager.backend.repository.TransactionRepository;
import com.khatamanager.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class TransactionController {

    private final TransactionRepository transactionRepository;
    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;

    public TransactionController(TransactionRepository transactionRepository, CustomerRepository customerRepository, UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.customerRepository = customerRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName()).orElseThrow();
    }

    @GetMapping("/entries")
    public ResponseEntity<List<Transaction>> getEntries(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Transaction> entries = transactionRepository.findByUserIdOrderByTimestampDesc(user.getId())
                .stream().filter(t -> "credit".equals(t.getType())).collect(Collectors.toList());
        return ResponseEntity.ok(entries);
    }

    @PostMapping("/entries")
    public ResponseEntity<Transaction> createEntry(@RequestBody TransactionRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Customer customer = customerRepository.findById(request.getCustomerId()).orElseThrow();
        
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setCustomer(customer);
        tx.setAmount(request.getAmount());
        tx.setType("credit");
        tx.setDate(request.getDate());
        tx.setNote(request.getNote());
        tx.setItemsJson(request.getItemsJson());
        
        return ResponseEntity.ok(transactionRepository.save(tx));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<Transaction>> getPayments(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Transaction> payments = transactionRepository.findByUserIdOrderByTimestampDesc(user.getId())
                .stream().filter(t -> "payment".equals(t.getType())).collect(Collectors.toList());
        return ResponseEntity.ok(payments);
    }

    @PostMapping("/payments")
    public ResponseEntity<Transaction> createPayment(@RequestBody TransactionRequest request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        Customer customer = customerRepository.findById(request.getCustomerId()).orElseThrow();
        
        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setCustomer(customer);
        tx.setAmount(request.getAmount());
        tx.setType("payment");
        tx.setDate(request.getDate());
        tx.setNote(request.getNote());
        tx.setItemsJson(request.getItemsJson());
        
        return ResponseEntity.ok(transactionRepository.save(tx));
    }

    @DeleteMapping("/transactions/{id}")
    public ResponseEntity<Void> deleteTransaction(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return transactionRepository.findById(id).map(tx -> {
            if (!tx.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).<Void>build();
            }
            transactionRepository.delete(tx);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/transactions")
    public ResponseEntity<Void> deleteTransactions(@RequestParam List<Long> ids, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Transaction> txs = transactionRepository.findAllById(ids);
        for (Transaction tx : txs) {
            if (!tx.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).build();
            }
        }
        transactionRepository.deleteAll(txs);
        return ResponseEntity.ok().build();
    }
}
