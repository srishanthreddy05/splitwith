package com.splittrip.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BalanceSummary {
    
    private String tripId;
    private String tripName;
    private List<UserBalance> rawBalances;  // For debugging/calculations
    private List<BalanceInstruction> instructions;  // Human-readable
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceInstruction {
        private String fromUserId;
        private String fromUserName;
        private String toUserId;
        private String toUserName;
        private Double amount;
        private String message;  // "You have to pay ₹135 to Rahul"
    }
}
