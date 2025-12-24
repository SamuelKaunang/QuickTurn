package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Repository.UserRepository;
import com.example.QucikTurn.dto.UpdateProfileRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        if (req.nama() != null && !req.nama().isEmpty()) user.setNama(req.nama());
        if (req.bio() != null) user.setBio(req.bio());
        if (req.skills() != null) user.setSkills(req.skills());
        if (req.portfolioUrl() != null) user.setPortfolioUrl(req.portfolioUrl());
        if (req.location() != null) user.setLocation(req.location());
        if (req.phone() != null) user.setPhone(req.phone());

        return userRepo.save(user);
    }
    
    public User getUserById(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }
}