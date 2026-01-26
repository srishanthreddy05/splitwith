package com.splittrip.backend.model;

import java.time.LocalDateTime;

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
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true, sparse = true)
    private String email;

    // Guest user support
    @Builder.Default
    private Boolean isGuest = false;

    // For guest identity tracking in localStorage (frontend generates this)
    private String guestId;

    // Optional UPI ID for settlements (future)
    private String upiId;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
