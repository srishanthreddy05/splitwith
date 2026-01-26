package com.splittrip.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splittrip.backend.dto.ApiResponse;
import com.splittrip.backend.dto.CreateExpenseRequest;
import com.splittrip.backend.model.Expense;
import com.splittrip.backend.service.ExpenseService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/expenses")
@RequiredArgsConstructor
@Validated
public class ExpenseController {

    private final ExpenseService expenseService;

    @PostMapping
    public ResponseEntity<ApiResponse<Expense>> createExpense(@Valid @RequestBody CreateExpenseRequest request) {
        try {
            Expense expense = expenseService.createExpense(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(expense));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<ApiResponse<java.util.List<Expense>>> getExpensesByTrip(@PathVariable String tripId) {
        try {
            java.util.List<Expense> expenses = expenseService.getExpensesForTrip(tripId);
            return ResponseEntity.ok(ApiResponse.success(expenses));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
