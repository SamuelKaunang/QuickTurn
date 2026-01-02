package com.example.QucikTurn.dto;

public record UpdateProfileRequest(
                String nama,
                String bio,
                String skills,
                String portfolioUrl,
                String location,
                String phone,
                String headline,
                String university,
                Integer yearsExperience,
                String availability,
                String address,
                String linkedinUrl,
                String githubUrl,
                // New social media fields for Client/UMKM
                String youtubeUrl,
                String instagramUrl,
                String facebookUrl,
                String businessWebsite) {
}