package com.splittrip.backend.service;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.CreateExpenseRequest;
import com.splittrip.backend.model.Expense;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.repository.ExpenseRepository;
import com.splittrip.backend.repository.TripRepository;
import com.splittrip.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public Expense createExpense(CreateExpenseRequest request) {
        // Validate trip exists
        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Validate paidBy user exists
        if (!userRepository.existsById(request.getPaidBy())) {
            throw new IllegalArgumentException("PaidBy user not found");
        }

        // Validate paidBy is a member of the trip
        if (!trip.getMembers().contains(request.getPaidBy())) {
            throw new IllegalArgumentException("PaidBy user is not a member of this trip");
        }

        // Validate all splitBetween users exist and are members
        for (String userId : request.getSplitBetween()) {
            if (!userRepository.existsById(userId)) {
                throw new IllegalArgumentException("User not found in splitBetween: " + userId);
            }
            if (!trip.getMembers().contains(userId)) {
                throw new IllegalArgumentException("User not a trip member: " + userId);
            }
        }

        Expense expense = Expense.builder()
                .id(UUID.randomUUID().toString())
                .tripId(request.getTripId())
                .paidBy(request.getPaidBy())
                .amount(request.getAmount())
                .description(request.getDescription())
                .splitBetween(request.getSplitBetween())
                .build();

        return expenseRepository.save(expense);
    }

    public java.util.List<Expense> getExpensesForTrip(String tripId) {
        // Ensure trip exists
        if (!tripRepository.existsById(tripId)) {
            throw new IllegalArgumentException("Trip not found");
        }
        return expenseRepository.findByTripId(tripId);
    }
}
