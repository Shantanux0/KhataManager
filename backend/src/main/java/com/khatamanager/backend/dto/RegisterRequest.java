package com.khatamanager.backend.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String name;
    private String shopName;
    private String email;
    private String password;
}
