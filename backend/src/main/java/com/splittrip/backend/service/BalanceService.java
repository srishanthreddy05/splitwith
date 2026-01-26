package com.splittrip.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.splittrip.backend.dto.BalanceSummary;
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
            // Amount is stored in paise; convert to rupees for calculations
            double amountRupees = (expense.getAmount() == null ? 0.0 : expense.getAmount() / 100.0);

            // Person who paid gets credited the full amount (in rupees)
            balances.put(expense.getPaidBy(),
                balances.getOrDefault(expense.getPaidBy(), 0.0) + amountRupees);

            // Calculate equal share (in rupees)
            int splitCount = expense.getSplitBetween().size();
            double sharePerPerson = splitCount > 0 ? amountRupees / splitCount : 0.0;

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

    /**
     * Calculate human-readable balance summary with payment instructions
     * Example: "You have to pay ₹135 to Rahul" or "Rahul has to pay you ₹200"
     */
    public BalanceSummary calculateBalanceSummary(String tripId) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        List<UserBalance> rawBalances = calculateBalances(tripId);
        List<BalanceSummary.BalanceInstruction> instructions = new ArrayList<>();

        // Separate debtors and creditors
        Map<String, UserBalance> creditors = new HashMap<>();  // Positive balance - should receive
        Map<String, UserBalance> debtors = new HashMap<>();     // Negative balance - should pay

        for (UserBalance balance : rawBalances) {
            if (balance.getBalance() > 0.01) {  // Small threshold to handle floating point
                creditors.put(balance.getUserId(), balance);
            } else if (balance.getBalance() < -0.01) {
                debtors.put(balance.getUserId(), balance);
            }
        }

        // Generate payment instructions using greedy algorithm
        for (UserBalance debtor : debtors.values()) {
            double amountOwed = Math.abs(debtor.getBalance());
            
            for (UserBalance creditor : creditors.values()) {
                if (amountOwed < 0.01) break;  // Debt settled
                if (creditor.getBalance() < 0.01) continue;  // Creditor already paid

                double amountToSettle = Math.min(amountOwed, creditor.getBalance());
                amountToSettle = Math.round(amountToSettle * 100.0) / 100.0;

                // Create instruction
                BalanceSummary.BalanceInstruction instruction = BalanceSummary.BalanceInstruction.builder()
                        .fromUserId(debtor.getUserId())
                        .fromUserName(debtor.getUserName())
                        .toUserId(creditor.getUserId())
                        .toUserName(creditor.getUserName())
                        .amount(amountToSettle)
                        .message(String.format("%s has to pay ₹%.2f to %s", 
                                debtor.getUserName(), amountToSettle, creditor.getUserName()))
                        .build();

                instructions.add(instruction);

                // Update balances
                amountOwed -= amountToSettle;
                creditor.setBalance(creditor.getBalance() - amountToSettle);
            }
        }

        return BalanceSummary.builder()
                .tripId(tripId)
                .tripName(trip.getName())
                .rawBalances(rawBalances)
                .instructions(instructions)
                .build();
    }
}
