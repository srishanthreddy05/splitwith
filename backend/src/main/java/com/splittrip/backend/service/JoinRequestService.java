package com.splittrip.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.splittrip.backend.model.JoinRequest;
import com.splittrip.backend.model.JoinRequest.RequestStatus;
import com.splittrip.backend.model.Trip;
import com.splittrip.backend.model.User;
import com.splittrip.backend.repository.JoinRequestRepository;
import com.splittrip.backend.repository.TripRepository;
import com.splittrip.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class JoinRequestService {

    private final JoinRequestRepository joinRequestRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    /**
     * Submit a join request for a trip
     */
    public JoinRequest submitJoinRequest(String tripId, String userId) {
        // Validate trip exists
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Validate user exists
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is already a member
        if (trip.getMembers().contains(userId)) {
            throw new IllegalArgumentException("You are already a member of this trip");
        }

        // Check if there's already a pending request
        if (joinRequestRepository.existsByTripIdAndUserIdAndStatus(tripId, userId, RequestStatus.PENDING)) {
            throw new IllegalArgumentException("You already have a pending join request for this trip");
        }

        JoinRequest joinRequest = JoinRequest.builder()
                .id(UUID.randomUUID().toString())
                .tripId(tripId)
                .userId(userId)
                .userName(user.getName())
                .build();

        return joinRequestRepository.save(joinRequest);
    }

    /**
     * Get all pending join requests for a trip
     */
    public List<JoinRequest> getPendingRequestsForTrip(String tripId) {
        return joinRequestRepository.findByTripIdAndStatus(tripId, RequestStatus.PENDING);
    }

    /**
     * Approve a join request and add user to trip
     */
    public JoinRequest approveJoinRequest(String requestId, String approverId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("This request has already been processed");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Verify approver is the trip creator
        if (!trip.getCreatedBy().equals(approverId)) {
            throw new IllegalArgumentException("Only the trip creator can approve join requests");
        }

        // Add user to trip
        if (!trip.getMembers().contains(request.getUserId())) {
            trip.getMembers().add(request.getUserId());
            tripRepository.save(trip);
        }

        // Update request status
        request.setStatus(RequestStatus.APPROVED);
        request.setRespondedBy(approverId);
        request.setRespondedAt(LocalDateTime.now());

        return joinRequestRepository.save(request);
    }

    /**
     * Reject a join request
     */
    public JoinRequest rejectJoinRequest(String requestId, String rejectorId) {
        JoinRequest request = joinRequestRepository.findById(requestId)
                .orElseThrow(() -> new IllegalArgumentException("Join request not found"));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("This request has already been processed");
        }

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new IllegalArgumentException("Trip not found"));

        // Verify rejector is the trip creator
        if (!trip.getCreatedBy().equals(rejectorId)) {
            throw new IllegalArgumentException("Only the trip creator can reject join requests");
        }

        // Update request status
        request.setStatus(RequestStatus.REJECTED);
        request.setRespondedBy(rejectorId);
        request.setRespondedAt(LocalDateTime.now());

        return joinRequestRepository.save(request);
    }

    /**
     * Get user's join requests
     */
    public List<JoinRequest> getUserJoinRequests(String userId) {
        return joinRequestRepository.findByUserIdAndStatus(userId, RequestStatus.PENDING);
    }
}
