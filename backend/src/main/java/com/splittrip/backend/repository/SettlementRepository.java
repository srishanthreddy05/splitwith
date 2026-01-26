package com.splittrip.backend.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.Settlement;

public interface SettlementRepository extends MongoRepository<Settlement, String> {

    List<Settlement> findByTripId(String tripId);

    List<Settlement> findByFromUserId(String fromUserId);

    List<Settlement> findByToUserId(String toUserId);
}
