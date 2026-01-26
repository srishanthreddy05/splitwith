package com.splittrip.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.Trip;

public interface TripRepository extends MongoRepository<Trip, String> {
    List<Trip> findByMembersContaining(String userId);
    
    Optional<Trip> findByTripCode(String tripCode);
    
    boolean existsByTripCode(String tripCode);
}
