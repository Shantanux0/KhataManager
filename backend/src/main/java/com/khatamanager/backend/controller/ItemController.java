package com.khatamanager.backend.controller;

import com.khatamanager.backend.model.Item;
import com.khatamanager.backend.model.User;
import com.khatamanager.backend.repository.ItemRepository;
import com.khatamanager.backend.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/items")
public class ItemController {

    private final ItemRepository itemRepository;
    private final UserRepository userRepository;

    public ItemController(ItemRepository itemRepository, UserRepository userRepository) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
    }

    private User getAuthenticatedUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName()).orElseThrow();
    }

    @GetMapping
    public ResponseEntity<List<Item>> getItems(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        List<Item> items = itemRepository.findByUserId(user.getId());
        return ResponseEntity.ok(items);
    }

    @PostMapping
    public ResponseEntity<Item> createItem(@RequestBody Item item, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        item.setUser(user);
        Item saved = itemRepository.save(item);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Item> updateItem(@PathVariable Long id, @RequestBody Item itemDetails, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return itemRepository.findById(id).map(item -> {
            if (!item.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).<Item>build();
            }
            item.setName(itemDetails.getName());
            item.setPrice(itemDetails.getPrice());
            item.setUnit(itemDetails.getUnit());
            Item updated = itemRepository.save(item);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return itemRepository.findById(id).map(item -> {
            if (!item.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(403).<Void>build();
            }
            itemRepository.delete(item);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
