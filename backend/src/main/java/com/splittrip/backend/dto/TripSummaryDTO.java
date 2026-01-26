package com.splittrip.backend.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Lightweight trip summary for landing/dashboard pages
 * Contains essential info without full expense details
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripSummaryDTO {
    private String tripId;
    private String tripCode;
    private String name;
    private int memberCount;
    private long totalExpensesAmount; // in paise/cents
    private List<String> memberNames;
}
