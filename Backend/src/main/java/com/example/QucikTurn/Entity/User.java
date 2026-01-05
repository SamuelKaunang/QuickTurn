package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.AccountStatus;
import com.example.QucikTurn.Entity.enums.Role;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "users")
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nama;
    @Column(nullable = false, unique = true, length = 190)
    private String email;
    @Column(unique = true, length = 50)
    private String username; // For profile search

    @JsonIgnore // SECURITY: Never expose password hash in API responses
    @Column(name = "password_hash", nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 20) // Nullable for OAuth users who haven't selected role
    private Role role; // No default - must be set explicitly or selected by user

    // Account status for soft-delete functionality
    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false, length = 20)
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    // Timestamp when account was deleted (for audit purposes)
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    // Email verification status - required for core actions (apply/create project)
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified = false;

    private LocalDateTime lastLoginAt;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 255)
    private String skills; // Stored as comma-separated string (e.g., "Java, React, Design")

    @Column(length = 255)
    private String portfolioUrl;

    @Column(length = 100)
    private String location;

    @Column(length = 20)
    private String phone;

    @Column(length = 100)
    private String bidang; // Field/Category for matching projects

    @Column(length = 500)
    private String profilePictureUrl; // Path to profile picture

    private Double averageRating = 0.0;
    private Integer totalReviews = 0;

    // Additional Profile Fields
    @Column(length = 150)
    private String headline; // Short tagline like "Full Stack Developer"

    @Column(length = 200)
    private String university; // For students: university name, For UMKM: company name

    private Integer yearsExperience = 0;

    @Column(length = 100)
    private String availability; // "Full-time", "Part-time", "Freelance"

    @Column(length = 500)
    private String address; // Business address for UMKM

    @Column(length = 200)
    private String linkedinUrl;

    @Column(length = 200)
    private String githubUrl;

    // New social media fields for UMKM/Client
    @Column(length = 200)
    private String youtubeUrl;

    @Column(length = 200)
    private String instagramUrl;

    @Column(length = 200)
    private String facebookUrl;

    @Column(length = 200)
    private String businessWebsite;

    // UserDetails - All security methods are hidden from JSON serialization
    @JsonIgnore // SECURITY: Hide authorities from API responses
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Handle null role for OAuth users who haven't selected their role yet
        String roleName = (role != null) ? role.name() : "PENDING";
        return List.of(new SimpleGrantedAuthority("ROLE_" + roleName));
    }

    @JsonIgnore // SECURITY: Never expose password in API responses
    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return isActive;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive;
    }

    // getters/setters
    public Long getId() {
        return id;
    }

    public String getNama() {
        return nama;
    }

    public void setNama(String nama) {
        this.nama = nama;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    @JsonIgnore // SECURITY: Never expose password hash
    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public void setActive(boolean active) {
        isActive = active;
    }

    public void setLastLoginAt(LocalDateTime t) {
        this.lastLoginAt = t;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getPortfolioUrl() {
        return portfolioUrl;
    }

    public void setPortfolioUrl(String portfolioUrl) {
        this.portfolioUrl = portfolioUrl;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Double getAverageRating() {
        return averageRating;
    }

    public void setAverageRating(Double averageRating) {
        this.averageRating = averageRating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public String getUsernameField() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getBidang() {
        return bidang;
    }

    public void setBidang(String bidang) {
        this.bidang = bidang;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }

    // New fields getters/setters
    public String getHeadline() {
        return headline;
    }

    public void setHeadline(String headline) {
        this.headline = headline;
    }

    public String getUniversity() {
        return university;
    }

    public void setUniversity(String university) {
        this.university = university;
    }

    public Integer getYearsExperience() {
        return yearsExperience;
    }

    public void setYearsExperience(Integer yearsExperience) {
        this.yearsExperience = yearsExperience;
    }

    public String getAvailability() {
        return availability;
    }

    public void setAvailability(String availability) {
        this.availability = availability;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLinkedinUrl() {
        return linkedinUrl;
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = linkedinUrl;
    }

    public String getGithubUrl() {
        return githubUrl;
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = githubUrl;
    }

    public AccountStatus getAccountStatus() {
        return accountStatus;
    }

    public void setAccountStatus(AccountStatus accountStatus) {
        this.accountStatus = accountStatus;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    /**
     * Helper method to check if account is deleted
     */
    public boolean isDeleted() {
        return accountStatus == AccountStatus.DELETED;
    }

    // New social media getters/setters
    public String getYoutubeUrl() {
        return youtubeUrl;
    }

    public void setYoutubeUrl(String youtubeUrl) {
        this.youtubeUrl = youtubeUrl;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getFacebookUrl() {
        return facebookUrl;
    }

    public void setFacebookUrl(String facebookUrl) {
        this.facebookUrl = facebookUrl;
    }

    public String getBusinessWebsite() {
        return businessWebsite;
    }

    public void setBusinessWebsite(String businessWebsite) {
        this.businessWebsite = businessWebsite;
    }

    // Email verification getter/setter
    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }
}
