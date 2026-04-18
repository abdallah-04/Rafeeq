package com.rafeeq.backend.repository;

import com.rafeeq.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    boolean existsByPhone(String phone);

    boolean existsByEmail(String email);

    boolean existsByNationalId(String nationalId);

    Optional<User> findByPhone(String phone);

    Optional<User> findByEmail(String email);

    Optional<User> findByNationalId(String nationalId);
}