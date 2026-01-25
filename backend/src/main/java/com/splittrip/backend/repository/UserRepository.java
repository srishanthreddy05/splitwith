package com.splittrip.backend.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.splittrip.backend.model.User;

public interface UserRepository extends MongoRepository<User, String> {
}
