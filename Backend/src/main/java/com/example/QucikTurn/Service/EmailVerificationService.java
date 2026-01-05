package com.example.QucikTurn.Service;

import com.example.QucikTurn.Entity.EmailVerificationToken;
import com.example.QucikTurn.Entity.User;
import com.example.QucikTurn.Repository.EmailVerificationTokenRepository;
import com.example.QucikTurn.Repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for handling email verification flow.
 * 
 * Flow:
 * 1. User tries to perform core action (apply/create project)
 * 2. System checks if email is verified
 * 3. If not, redirect to verification page and send verification email
 * 4. User clicks verification link in email
 * 5. Backend verifies token and marks email as verified
 * 6. User is redirected back to perform the action
 */
@Service
public class EmailVerificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailVerificationService.class);

    private final EmailVerificationTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final String frontendUrl;

    public EmailVerificationService(
            EmailVerificationTokenRepository tokenRepository,
            UserRepository userRepository,
            EmailService emailService,
            @Value("${app.frontend.url}") String frontendUrl) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.frontendUrl = frontendUrl;
    }

    /**
     * Send verification email to user.
     * Creates a new token or refreshes existing one.
     */
    @Transactional
    public void sendVerificationEmail(User user) {
        // Check if already verified
        if (user.isEmailVerified()) {
            log.info("User {} is already verified, skipping email", user.getEmail());
            return;
        }

        // Delete existing token if any
        tokenRepository.findByUser(user).ifPresent(token -> {
            tokenRepository.delete(token);
        });

        // Create new token
        EmailVerificationToken verificationToken = new EmailVerificationToken(user);
        tokenRepository.save(verificationToken);

        // Build verification URL
        String verificationUrl = frontendUrl + "/verify-email?token=" + verificationToken.getToken();

        // Send email asynchronously
        emailService.sendVerificationEmail(user.getEmail(), user.getNama(), verificationUrl);

        log.info("Verification email sent to: {}", maskEmail(user.getEmail()));
    }

    /**
     * Verify email using token from link.
     * Returns the verified user.
     */
    @Transactional
    public User verifyEmail(String token) {
        EmailVerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid verification token"));

        if (verificationToken.isExpired()) {
            throw new RuntimeException("Verification link has expired. Please request a new one.");
        }

        if (verificationToken.getVerifiedAt() != null) {
            throw new RuntimeException("Email has already been verified.");
        }

        // Mark token as used
        verificationToken.markVerified();
        tokenRepository.save(verificationToken);

        // Mark user as verified
        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        log.info("Email verified for user: {}", maskEmail(user.getEmail()));

        return user;
    }

    /**
     * Check if user's email is verified.
     * Call this before allowing core actions.
     */
    public boolean isEmailVerified(User user) {
        return user.isEmailVerified();
    }

    /**
     * Resend verification email if token is expired or user requests new one.
     */
    @Transactional
    public void resendVerificationEmail(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.isEmailVerified()) {
            throw new RuntimeException("Email is already verified.");
        }

        sendVerificationEmail(user);
    }

    /**
     * Mask email for logging (e.g., "sam***@gmail.com")
     */
    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@");
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 3) {
            return local.charAt(0) + "***@" + domain;
        }
        return local.substring(0, 3) + "***@" + domain;
    }
}
