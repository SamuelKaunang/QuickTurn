package com.example.QucikTurn.dto;

/**
 * DTO for user profile response - excludes sensitive data like password
 */
public class UserProfileResponse {
    private Long id;
    private String nama;
    private String email;
    private String username;
    private String role;
    private String bio;
    private String skills;
    private String portfolioUrl;
    private String location;
    private String phone;
    private String bidang;
    private String profilePictureUrl;
    private Double averageRating;
    private Integer totalReviews;
    private String headline;
    private String university;
    private Integer yearsExperience;
    private String availability;
    private String address;
    private String linkedinUrl;
    private String githubUrl;

    // Constructor from User entity
    public static UserProfileResponse fromUser(com.example.QucikTurn.Entity.User user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.id = user.getId();
        dto.nama = user.getNama();
        dto.email = user.getEmail();
        dto.username = user.getUsernameField();
        dto.role = user.getRole() != null ? user.getRole().name() : null;
        dto.bio = user.getBio();
        dto.skills = user.getSkills();
        dto.portfolioUrl = user.getPortfolioUrl();
        dto.location = user.getLocation();
        dto.phone = user.getPhone();
        dto.bidang = user.getBidang();
        dto.profilePictureUrl = user.getProfilePictureUrl();
        dto.averageRating = user.getAverageRating();
        dto.totalReviews = user.getTotalReviews();
        dto.headline = user.getHeadline();
        dto.university = user.getUniversity();
        dto.yearsExperience = user.getYearsExperience();
        dto.availability = user.getAvailability();
        dto.address = user.getAddress();
        dto.linkedinUrl = user.getLinkedinUrl();
        dto.githubUrl = user.getGithubUrl();
        return dto;
    }

    // Getters only - no setters for immutability
    public Long getId() {
        return id;
    }

    public String getNama() {
        return nama;
    }

    public String getEmail() {
        return email;
    }

    public String getUsername() {
        return username;
    }

    public String getRole() {
        return role;
    }

    public String getBio() {
        return bio;
    }

    public String getSkills() {
        return skills;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public String getLocation() {
        return location;
    }

    public String getPhone() {
        return phone;
    }

    public String getBidang() {
        return bidang;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public String getHeadline() {
        return headline;
    }

    public String getUniversity() {
        return university;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public String getAvailability() {
        return availability;
    }

    public String getAddress() {
        return address;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }
}
