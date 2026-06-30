package com.khatamanager.backend.dto;

import lombok.Data;

@Data
public class TransactionRequest {
    private Long customerId;
    private Double amount;
    private String date;
    private String note;
}
