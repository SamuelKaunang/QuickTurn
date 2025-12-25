package com.example.QucikTurn.Repository;

import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.Review;
import com.example.QucikTurn.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    // Custom query to check if this user already reviewed this specific project
    boolean existsByProjectAndReviewer(Project project, User reviewer);
}