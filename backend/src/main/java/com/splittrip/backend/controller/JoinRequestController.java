package com.splittrip.backend.controller;

import java.util.List;

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
import com.splittrip.backend.dto.JoinRequestResponseRequest;
import com.splittrip.backend.dto.JoinRequestSubmitRequest;
import com.splittrip.backend.model.JoinRequest;
import com.splittrip.backend.service.JoinRequestService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/join-requests")
@RequiredArgsConstructor
@Validated
public class JoinRequestController {

    private final JoinRequestService joinRequestService;

    @PostMapping
    public ResponseEntity<ApiResponse<JoinRequest>> submitJoinRequest(
            @Valid @RequestBody JoinRequestSubmitRequest request) {
        try {
            JoinRequest joinRequest = joinRequestService.submitJoinRequest(
                    request.getTripId(), request.getUserId());
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.success(joinRequest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/trip/{tripId}/pending")
    public ResponseEntity<ApiResponse<List<JoinRequest>>> getPendingRequestsForTrip(
            @PathVariable String tripId) {
        List<JoinRequest> requests = joinRequestService.getPendingRequestsForTrip(tripId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @GetMapping("/user/{userId}/pending")
    public ResponseEntity<ApiResponse<List<JoinRequest>>> getUserPendingRequests(
            @PathVariable String userId) {
        List<JoinRequest> requests = joinRequestService.getUserJoinRequests(userId);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/approve")
    public ResponseEntity<ApiResponse<JoinRequest>> approveJoinRequest(
            @Valid @RequestBody JoinRequestResponseRequest request) {
        try {
            JoinRequest approvedRequest = joinRequestService.approveJoinRequest(
                    request.getRequestId(), request.getUserId());
            return ResponseEntity.ok(ApiResponse.success(approvedRequest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/reject")
    public ResponseEntity<ApiResponse<JoinRequest>> rejectJoinRequest(
            @Valid @RequestBody JoinRequestResponseRequest request) {
        try {
            JoinRequest rejectedRequest = joinRequestService.rejectJoinRequest(
                    request.getRequestId(), request.getUserId());
            return ResponseEntity.ok(ApiResponse.success(rejectedRequest));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error(e.getMessage()));
        }
    }
}
