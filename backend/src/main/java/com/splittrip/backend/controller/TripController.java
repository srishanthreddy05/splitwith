package com.splittrip.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.splittrip.backend.dto.ApiResponse;
import com.splittrip.backend.dto.BalanceSummary;
import com.splittrip.backend.dto.CreateTripRequest;
import com.splittrip.backend.dto.TripSummaryDTO;
import com.splittrip.backend.dto.UserBalance;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.service.BalanceService;
import com.splittrip.backend.service.TripService;
import com.splittrip.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/trips")
@RequiredArgsConstructor
@Validated
public class TripController {

    private final TripService tripService;
    private final BalanceService balanceService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<Trip>> createTrip(@Valid @RequestBody CreateTripRequest request) {
        try {
            // Auto-create or get user if not exists (lightweight identity)
            userService.getOrCreateByIdAndName(request.getCreatedBy(), request.getCreatedByName());

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

    @GetMapping("/code/{tripCode}")
    public ResponseEntity<ApiResponse<Trip>> getTripByCode(@PathVariable String tripCode) {
        try {
            Trip trip = tripService.getTripByCode(tripCode);
            return ResponseEntity.ok(ApiResponse.success(trip));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{tripId}")
    public ResponseEntity<ApiResponse<Trip>> getTripById(@PathVariable String tripId) {
        try {
            Trip trip = tripService.getTripById(tripId);
            return ResponseEntity.ok(ApiResponse.success(trip));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
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

    @GetMapping("/{tripId}/balance-summary")
    public ResponseEntity<ApiResponse<BalanceSummary>> getBalanceSummary(@PathVariable String tripId) {
        try {
            BalanceSummary summary = balanceService.calculateBalanceSummary(tripId);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{tripId}/summary")
    public ResponseEntity<ApiResponse<TripSummaryDTO>> getTripSummary(@PathVariable String tripId) {
        try {
            TripSummaryDTO summary = tripService.getTripSummary(tripId);
            return ResponseEntity.ok(ApiResponse.success(summary));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/{tripId}/status")
    public ResponseEntity<ApiResponse<Trip>> updateTripStatus(
            @PathVariable String tripId,
            @RequestBody Map<String, String> request) {
        try {
            String status = request.get("status");
            if (status == null || status.isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("status is required"));
            }
            
            Trip trip = tripService.updateTripStatus(tripId, status);
            return ResponseEntity.ok(ApiResponse.success(trip));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
