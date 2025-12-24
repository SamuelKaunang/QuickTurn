package com.example.QucikTurn.dto;

public record UpdateProfileRequest(
    String nama,
    String bio,
    String skills,
    String portfolioUrl,
    String location,
    String phone
) {}