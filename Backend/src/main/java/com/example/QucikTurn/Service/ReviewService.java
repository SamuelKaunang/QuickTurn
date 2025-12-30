package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.Contract;
import com.example.QucikTurn.Entity.Project;
import com.example.QucikTurn.Entity.Review;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.ProjectStatus;
import com.example.QucikTurn.Repository.ContractRepository;
import com.example.QucikTurn.Repository.ProjectRepository;
import com.example.QucikTurn.Repository.ReviewRepository;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.ReviewRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private ContractRepository contractRepository; // We need this to find the student!

    @Transactional
    public void addReview(Long projectId, ReviewRequest request, String reviewerEmail) {
        // 1. Find the Project
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // 2. Validate Status (Must be DONE or CLOSED)
        // Note: Check your ProjectStatus enum if 'CLOSED' is the correct term for
        // finished projects
        if (project.getStatus() != ProjectStatus.DONE && project.getStatus() != ProjectStatus.CLOSED) {
            throw new RuntimeException("You can only review completed projects.");
        }

        // 3. Find the Contract (This is how we know who the Student is!)
        Contract contract = contractRepository.findByProjectId(project.getId())
                .orElseThrow(() -> new RuntimeException("Contract not found for this project"));

        // 4. Identify the Reviewer (Who is logged in?)
        User reviewer = userRepository.findByEmail(reviewerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 5. Determine the Target (Who is being reviewed?)
        User targetUser;

        // Data from Contract
        User student = contract.getStudent();
        User umkm = contract.getUmkm();

        if (reviewer.getId().equals(student.getId())) {
            // If Student is reviewing -> Target is UMKM
            targetUser = umkm;
        } else if (reviewer.getId().equals(umkm.getId())) {
            // If UMKM is reviewing -> Target is Student
            targetUser = student;
        } else {
            throw new RuntimeException("You are not a participant in this project.");
        }

        // 6. Prevent Duplicate Reviews
        if (reviewRepository.existsByProjectAndReviewer(project, reviewer)) {
            throw new RuntimeException("You have already reviewed this project.");
        }

        // 7. Save the Review
        Review review = new Review();
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setProject(project);
        review.setReviewer(reviewer);
        review.setReviewedUser(targetUser);
        reviewRepository.save(review);

        // 8. Update the Target User's Average Rating
        updateUserRating(targetUser, request.getRating());
    }

    private void updateUserRating(User user, Integer newRating) {
        Double currentAvg = (user.getAverageRating() == null) ? 0.0 : user.getAverageRating();
        Integer currentCount = (user.getTotalReviews() == null) ? 0 : user.getTotalReviews();

        // Calculate new average
        Double newAvg = ((currentAvg * currentCount) + newRating) / (currentCount + 1);

        user.setAverageRating(newAvg);
        user.setTotalReviews(currentCount + 1);
        userRepository.save(user);
    }

    /**
     * Get the user's review for a specific project (if exists)
     */
    public Review getMyReviewForProject(Long projectId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.findByProjectAndReviewer(project, user).orElse(null);
    }

    /**
     * Check if user has already reviewed a project
     */
    public boolean hasUserReviewedProject(Long projectId, String userEmail) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return reviewRepository.existsByProjectAndReviewer(project, user);
    }
}