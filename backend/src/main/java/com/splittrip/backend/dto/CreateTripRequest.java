package com.splittrip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateTripRequest {
    
    @NotBlank(message = "Trip name is required")
    private String name;
    
    @NotBlank(message = "Creator userId is required")
    private String createdBy;

    // For lightweight identity system (MVP)
    // Will auto-create user if not exists
    @NotBlank(message = "Creator userName is required")
    private String createdByName;
}
