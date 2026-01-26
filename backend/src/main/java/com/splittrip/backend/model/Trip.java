package com.splittrip.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "trips")
public class Trip {

    @Id
    private String id;

    private String name;

    // Short shareable trip code (TUID) - 6-8 characters
    @Indexed(unique = true)
    private String tripCode;

    private String createdBy; // userId

    @Builder.Default
    private List<String> members = new ArrayList<>(); // list of userIds

    // Trip status
    @Builder.Default
    private TripStatus status = TripStatus.ACTIVE;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum TripStatus {
        ACTIVE,      // Has pending balances
        COMPLETED    // Fully settled, read-only
    }
}
