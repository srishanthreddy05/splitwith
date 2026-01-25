package com.splittrip.backend.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.UserBalance;
import com.splittrip.backend.model.Expense;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.model.User;
import com.splittrip.backend.repository.ExpenseRepository;
import com.splittrip.backend.repository.TripRepository;
import com.splittrip.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BalanceService {

    private final TripRepository tripRepository;
    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    /**
     * Calculate balances for all members in a trip.
     * Logic:
     * - For each expense, the person who paid gets credited the full amount
     * - Each person in splitBetween gets debited their equal share
     * - Positive balance = user should receive money
     * - Negative balance = user owes money
     * - Total of all balances must equal zero
     */
    public List<UserBalance> calculateBalances(String tripId) {
        // Validate trip exists
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Get all expenses for this trip
        List<Expense> expenses = expenseRepository.findByTripId(tripId);

        // Initialize balance map for all trip members
        Map<String, Double> balances = new HashMap<>();
        for (String memberId : trip.getMembers()) {
            balances.put(memberId, 0.0);
        }

        // Calculate balances from expenses
        for (Expense expense : expenses) {
            // Person who paid gets credited the full amount
            balances.put(expense.getPaidBy(), 
                    balances.get(expense.getPaidBy()) + expense.getAmount());

            // Calculate equal share
            int splitCount = expense.getSplitBetween().size();
            double sharePerPerson = expense.getAmount() / splitCount;

            // Each person in split gets debited their share
            for (String userId : expense.getSplitBetween()) {
                balances.put(userId, 
                        balances.getOrDefault(userId, 0.0) - sharePerPerson);
            }
        }

        // Convert to UserBalance DTOs with user names
        return balances.entrySet().stream()
                .map(entry -> {
                    User user = userRepository.findById(entry.getKey())
                            .orElseThrow(() -> new IllegalArgumentException("User not found: " + entry.getKey()));
                    
                    return UserBalance.builder()
                            .userId(entry.getKey())
                            .userName(user.getName())
                            .balance(Math.round(entry.getValue() * 100.0) / 100.0) // Round to 2 decimals
                            .build();
                })
                .collect(Collectors.toList());
    }
}
