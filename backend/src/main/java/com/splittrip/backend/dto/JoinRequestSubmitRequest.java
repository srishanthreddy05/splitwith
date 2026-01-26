package com.splittrip.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JoinRequestSubmitRequest {
    
    @NotBlank(message = "Trip ID is required")
    private String tripId;
    
    @NotBlank(message = "User ID is required")
    private String userId;
}
