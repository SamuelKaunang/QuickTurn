package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Activity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    // Get recent activities for a user
    @Query("SELECT a FROM Activity a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Activity> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    // Get all activities for a user
    List<Activity> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Count activities by type for a user
    @Query("SELECT COUNT(a) FROM Activity a WHERE a.user.id = :userId AND a.type = :type")
    Long countByUserIdAndType(@Param("userId") Long userId, @Param("type") String type);
}
