package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;

public record UserSearchResponse(
        Long id,
        String nama,
        String username,
        Role role,
        String bidang,
        Double averageRating,
        String profilePictureUrl,
        String headline,
        String location,
        Integer totalReviews) {
    public static UserSearchResponse from(User user) {
        return new UserSearchResponse(
                user.getId(),
                user.getNama(),
                user.getUsernameField(),
                user.getRole(),
                user.getBidang(),
                user.getAverageRating(),
                user.getProfilePictureUrl(),
                user.getHeadline(),
                user.getLocation(),
                user.getTotalReviews());
    }
}
