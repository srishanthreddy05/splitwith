package com.splittrip.backend.controller;

import java.util.List;
import java.util.Map;

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
import com.splittrip.backend.dto.CreateTripRequest;
import com.splittrip.backend.dto.UserBalance;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.service.BalanceService;
import com.splittrip.backend.service.TripService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@Validated
public class TripController {

    private final TripService tripService;
    private final BalanceService balanceService;

    @PostMapping
    public ResponseEntity<ApiResponse<Trip>> createTrip(@Valid @RequestBody CreateTripRequest request) {
        try {
            Trip trip = tripService.createTrip(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(trip));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Trip>>> getTripsByUser(@PathVariable String userId) {
        List<Trip> trips = tripService.getTripsByUser(userId);
        return ResponseEntity.ok(ApiResponse.success(trips));
    }

    @PostMapping("/{tripId}/join")
    public ResponseEntity<ApiResponse<Trip>> addMemberToTrip(
            @PathVariable String tripId,
            @RequestBody Map<String, String> request) {
        try {
            String userId = request.get("userId");
            if (userId == null || userId.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("userId is required"));
            }
            
            Trip trip = tripService.addMemberToTrip(tripId, userId);
            return ResponseEntity.ok(ApiResponse.success(trip));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{tripId}/balances")
    public ResponseEntity<ApiResponse<List<UserBalance>>> getBalances(@PathVariable String tripId) {
        try {
            List<UserBalance> balances = balanceService.calculateBalances(tripId);
            return ResponseEntity.ok(ApiResponse.success(balances));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
