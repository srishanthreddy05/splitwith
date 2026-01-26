package com.splittrip.backend.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "settlements")
public class Settlement {

    @Id
    private String id;

    private String tripId;

    private String fromUserId;  // Who paid

    private String toUserId;    // Who received

    private Double amount;

    @Builder.Default
    private SettlementMethod method = SettlementMethod.MANUAL;

    @Builder.Default
    private SettlementStatus status = SettlementStatus.PENDING;

    private String transactionId; // UPI transaction ID (optional)

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime settledAt;

    public enum SettlementMethod {
        UPI,
        QR_CODE,
        MANUAL,
        OTHER
    }

    public enum SettlementStatus {
        PENDING,
        CONFIRMED,
        DISPUTED
    }
}
