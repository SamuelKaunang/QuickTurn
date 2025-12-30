package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;

public record PublicProfileResponse(
        Long id,
        String nama,
        String username,
        Role role,
        String bio,
        String skills,
        String portfolioUrl,
        String location,
        String bidang,
        String profilePictureUrl,
        Double averageRating,
        Integer totalReviews,
        String headline,
        String university,
        Integer yearsExperience,
        String availability,
        String address,
        String linkedinUrl,
        String githubUrl,
        String phone) {
    public static PublicProfileResponse from(User user) {
        return new PublicProfileResponse(
                user.getId(),
                user.getNama(),
                user.getUsernameField(),
                user.getRole(),
                user.getBio(),
                user.getSkills(),
                user.getPortfolioUrl(),
                user.getLocation(),
                user.getBidang(),
                user.getProfilePictureUrl(),
                user.getAverageRating(),
                user.getTotalReviews(),
                user.getHeadline(),
                user.getUniversity(),
                user.getYearsExperience(),
                user.getAvailability(),
                user.getAddress(),
                user.getLinkedinUrl(),
                user.getGithubUrl(),
                user.getPhone());
    }
}
