package com.splittrip.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserBalance {
    private String userId;
    private String userName;
    private Double balance; // positive = receives, negative = owes
}
