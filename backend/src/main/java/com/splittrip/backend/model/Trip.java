package com.splittrip.backend.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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
@Document(collection = "trips")
public class Trip {

    @Id
    private String id;

    private String name;

    private String createdBy; // userId

    @Builder.Default
    private List<String> members = new ArrayList<>(); // list of userIds

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
