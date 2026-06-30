package com.khatamanager.backend;

import com.khatamanager.backend.model.Customer;
import com.khatamanager.backend.model.Transaction;
import com.khatamanager.backend.model.User;
import com.khatamanager.backend.repository.CustomerRepository;
import com.khatamanager.backend.repository.TransactionRepository;
import com.khatamanager.backend.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
public class KhataManagerBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(KhataManagerBackendApplication.class, args);
	}

	@Bean
	public CommandLineRunner demoData(UserRepository userRepository, CustomerRepository customerRepository, TransactionRepository transactionRepository) {
		return args -> {
			List<User> users = userRepository.findAll();
			if (users.isEmpty()) {
				System.out.println("No users found. Skip seeding Kapil.");
				return;
			}
			User user = users.get(0);
			
			Customer customer = customerRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
					.stream().filter(c -> "Kapil".equalsIgnoreCase(c.getName()))
					.findFirst().orElse(null);

			if (customer != null) {
				List<Transaction> existingTx = transactionRepository.findByCustomerId(customer.getId());
				transactionRepository.deleteAll(existingTx);
				System.out.println("Deleted existing transactions for Kapil.");
			} else {
				customer = new Customer();
				customer.setUser(user);
				customer.setName("Kapil");
				customer.setMobile("9876543210");
				customer.setAddress("123 Main Street, Delhi");
				customer.setPaymentCycle("weekly");
				customer.setNotes("Regular customer");
				customer.setCreatedAt(LocalDate.now().toString());
				customer = customerRepository.save(customer);
				System.out.println("Created new customer Kapil.");
			}
			
			System.out.println("Seeding Kapil customer entries with 30 credits...");
			for (int i = 1; i <= 30; i++) {
				Transaction tx = new Transaction();
				tx.setUser(user);
				tx.setCustomer(customer);
				tx.setType("credit");
				tx.setAmount(100.0 * i);
				tx.setNote("Purchase #" + i);
				tx.setDate(LocalDate.now().minusDays(30 - i).toString());
				tx.setTimestamp(LocalDateTime.now().minusDays(30 - i).plusHours(i % 12).plusMinutes(i * 15));
				transactionRepository.save(tx);
			}
			System.out.println("Successfully seeded Kapil with 30 credit transactions!");
		};
	}
}
