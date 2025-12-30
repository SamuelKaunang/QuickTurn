package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Username search
    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    // Search users by name or username (case-insensitive)
    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.nama) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "u.isActive = true")
    List<User> searchUsers(@Param("query") String query);

    // Search users by name or username with role filter
    @Query("SELECT u FROM User u WHERE " +
            "(LOWER(u.nama) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(u.username) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
            "u.role = :role AND u.isActive = true")
    List<User> searchUsersByRole(@Param("query") String query, @Param("role") Role role);
}
