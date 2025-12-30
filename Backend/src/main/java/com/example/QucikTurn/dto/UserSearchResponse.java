package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Entity.enums.Role;

public record UserSearchResponse(
        Long id,
        String nama,
        String username,
        Role role,
        String bidang,
        Double averageRating) {
    public static UserSearchResponse from(User user) {
        return new UserSearchResponse(
                user.getId(),
                user.getNama(),
                user.getUsernameField(),
                user.getRole(),
                user.getBidang(),
                user.getAverageRating());
    }
}
