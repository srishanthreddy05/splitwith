package com.splittrip.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.Expense;

public interface ExpenseRepository extends MongoRepository<Expense, String> {
    List<Expense> findByTripId(String tripId);
}
