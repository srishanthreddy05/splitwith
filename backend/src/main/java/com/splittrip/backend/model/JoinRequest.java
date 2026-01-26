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
@Document(collection = "join_requests")
public class JoinRequest {

    @Id
    private String id;

    private String tripId;

    private String userId; // User requesting to join

    private String userName; // For display purposes

    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Builder.Default
    private LocalDateTime requestedAt = LocalDateTime.now();

    private LocalDateTime respondedAt;

    private String respondedBy; // Creator who approved/rejected

    public enum RequestStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
}
