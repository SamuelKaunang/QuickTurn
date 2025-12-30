package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.PublicProfileResponse;
import com.example.QucikTurn.dto.UpdateProfileRequest;
import com.example.QucikTurn.dto.UserSearchResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepo;

    public UserService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Transactional
    public User updateProfile(Long userId, UpdateProfileRequest req) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Only update fields if they are sent (not null)
        if (req.nama() != null && !req.nama().isEmpty())
            user.setNama(req.nama());
        if (req.bio() != null)
            user.setBio(req.bio());
        if (req.skills() != null)
            user.setSkills(req.skills());
        if (req.portfolioUrl() != null)
            user.setPortfolioUrl(req.portfolioUrl());
        if (req.location() != null)
            user.setLocation(req.location());
        if (req.phone() != null)
            user.setPhone(req.phone());

        // New fields
        if (req.headline() != null)
            user.setHeadline(req.headline());
        if (req.university() != null)
            user.setUniversity(req.university());
        if (req.yearsExperience() != null)
            user.setYearsExperience(req.yearsExperience());
        if (req.availability() != null)
            user.setAvailability(req.availability());
        if (req.address() != null)
            user.setAddress(req.address());
        if (req.linkedinUrl() != null)
            user.setLinkedinUrl(req.linkedinUrl());
        if (req.githubUrl() != null)
            user.setGithubUrl(req.githubUrl());

        return userRepo.save(user);
    }

    public User getUserById(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    // --- PROFILE SEARCH & VIEW ---

    /**
     * Search users by name or username
     */
    public List<UserSearchResponse> searchUsers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepo.searchUsers(query.trim())
                .stream()
                .map(UserSearchResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Search users by name or username with role filter
     */
    public List<UserSearchResponse> searchUsersByRole(String query, Role role) {
        if (query == null || query.trim().isEmpty()) {
            return List.of();
        }
        return userRepo.searchUsersByRole(query.trim(), role)
                .stream()
                .map(UserSearchResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Get public profile by user ID
     */
    public PublicProfileResponse getPublicProfileById(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return PublicProfileResponse.from(user);
    }

    /**
     * Get public profile by username
     */
    public PublicProfileResponse getPublicProfileByUsername(String username) {
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return PublicProfileResponse.from(user);
    }

    /**
     * Update username for a user
     */
    @Transactional
    public User updateUsername(Long userId, String newUsername) {
        // Check if username is already taken
        if (userRepo.existsByUsername(newUsername)) {
            throw new RuntimeException("Username already taken");
        }

        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setUsername(newUsername);
        return userRepo.save(user);
    }

    /**
     * Update bidang (field/category) for a user
     */
    @Transactional
    public User updateBidang(Long userId, String bidang) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setBidang(bidang);
        return userRepo.save(user);
    }
}