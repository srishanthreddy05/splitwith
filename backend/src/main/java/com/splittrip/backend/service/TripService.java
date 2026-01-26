package com.splittrip.backend.service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.CreateTripRequest;
import com.splittrip.backend.dto.TripSummaryDTO;
import com.splittrip.backend.model.Expense;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.model.User;
import com.splittrip.backend.repository.ExpenseRepository;
import com.splittrip.backend.repository.TripRepository;
import com.splittrip.backend.repository.UserRepository;
import com.splittrip.backend.utils.TripCodeGenerator;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final ExpenseRepository expenseRepository;

    public Trip createTrip(CreateTripRequest request) {
        // Validate creator exists
        if (!userRepository.existsById(request.getCreatedBy())) {
            throw new IllegalArgumentException("Creator user not found");
        }

        // Creator is automatically added as first member
        List<String> members = new ArrayList<>();
        members.add(request.getCreatedBy());

        // Generate unique trip code (TUID)
        String tripCode = generateUniqueTripCode();

        Trip trip = Trip.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .tripCode(tripCode)
                .createdBy(request.getCreatedBy())
                .members(members)
                .build();

        return tripRepository.save(trip);
    }

    private String generateUniqueTripCode() {
        String tripCode;
        int attempts = 0;
        do {
            tripCode = TripCodeGenerator.generate();
            attempts++;
            if (attempts > 10) {
                throw new RuntimeException("Failed to generate unique trip code");
            }
        } while (tripRepository.existsByTripCode(tripCode));
        return tripCode;
    }

    public Trip getTripByCode(String tripCode) {
        return tripRepository.findByTripCode(tripCode)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with code: " + tripCode));
    }

    public List<Trip> getTripsByUser(String userId) {
        return tripRepository.findByMembersContaining(userId);
    }

    public Trip addMemberToTrip(String tripId, String userId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Validate user exists
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found");
        }

        // Check if user is already a member
        if (trip.getMembers().contains(userId)) {
            throw new IllegalArgumentException("User is already a member of this trip");
        }

        trip.getMembers().add(userId);
        return tripRepository.save(trip);
    }

    public Trip getTripById(String tripId) {
        return tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));
    }

    /**
     * Get lightweight trip summary for landing/dashboard pages
     * Includes trip name, code, member count, and total expenses
     */
    public TripSummaryDTO getTripSummary(String tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Fetch member names
        List<String> memberNames = trip.getMembers().stream()
                .map(userId -> {
                    User user = userRepository.findById(userId).orElse(null);
                    return user != null ? user.getName() : "Unknown";
                })
                .collect(Collectors.toList());

        // Calculate total expenses
        List<Expense> expenses = expenseRepository.findByTripId(tripId);
        long totalAmount = expenses.stream()
                .mapToLong(e -> Math.round(e.getAmount() * 100)) // Convert to paise/cents
                .sum();

        return TripSummaryDTO.builder()
                .tripId(trip.getId())
                .tripCode(trip.getTripCode())
                .name(trip.getName())
                .memberCount(trip.getMembers().size())
                .totalExpensesAmount(totalAmount)
                .memberNames(memberNames)
                .build();
    }
}
