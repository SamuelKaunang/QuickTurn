package com.example.QucikTurn.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for account deletion.
 * User must type the exact confirmation phrase to proceed.
 */
public record DeleteAccountRequest(
        @NotBlank(message = "Confirmation phrase is required") String confirmationPhrase) {
    /**
     * The exact phrase user must type to confirm account deletion.
     * This prevents accidental deletions and ensures user understands the
     * consequences.
     */
    public static final String REQUIRED_PHRASE = "Saya mengerti bahwa akun saya akan dihapus permanen dan tidak bisa dikembalikan.";

    /**
     * Validates if the provided confirmation phrase matches the required phrase.
     */
    public boolean isValidConfirmation() {
        return REQUIRED_PHRASE.equals(confirmationPhrase);
    }
}
