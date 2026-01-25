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
@Document(collection = "expenses")
public class Expense {

    @Id
    private String id;

    private String tripId;

    private String paidBy; // userId

    private Double amount;

    private String description;

    @Builder.Default
    private List<String> splitBetween = new ArrayList<>(); // list of userIds

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
