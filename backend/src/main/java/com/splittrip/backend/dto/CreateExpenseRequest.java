package com.splittrip.backend.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateExpenseRequest {
    
    @NotBlank(message = "Trip ID is required")
    private String tripId;
    
    @NotBlank(message = "PaidBy userId is required")
    private String paidBy;
    
    @NotNull(message = "Amount is required")
    @Positive(message = "Amount must be greater than 0")
    private Double amount;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    @NotEmpty(message = "SplitBetween cannot be empty")
    private List<String> splitBetween;
}
