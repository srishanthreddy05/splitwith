package com.splittrip.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.JoinRequest;
import com.splittrip.backend.model.JoinRequest.RequestStatus;

public interface JoinRequestRepository extends MongoRepository<JoinRequest, String> {

    List<JoinRequest> findByTripIdAndStatus(String tripId, RequestStatus status);

    List<JoinRequest> findByUserIdAndStatus(String userId, RequestStatus status);

    boolean existsByTripIdAndUserIdAndStatus(String tripId, String userId, RequestStatus status);
}
