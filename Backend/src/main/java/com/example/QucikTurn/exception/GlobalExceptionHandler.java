package com.example.QucikTurn.exception;

import com.example.QucikTurn.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.util.HashMap;
import java.util.Map;

/**
 * SECURITY FIX P1: Global Exception Handler
 * Prevents stack trace leaks and provides consistent error responses.
 * 
 * Key security features:
 * - Generic error messages for unexpected exceptions (no internal details)
 * - Detailed logging for debugging (server-side only)
 * - User-friendly messages for validation errors
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    /**
     * Handle validation errors from @Valid annotations
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationExceptions(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        log.debug("Validation failed: {}", errors);
        // Return validation errors as a structured response
        return ResponseEntity.badRequest()
                .body(new ApiResponse<>(false, "Validation failed", errors));
    }

    /**
     * Handle RuntimeException - our business logic errors
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Void>> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        // List of safe error messages that can be shown to users
        String[] safeMessages = {
                "User not found",
                "Project not found",
                "Submission not found",
                "File not found",
                "Application not found",
                "Contract not found",
                "Already applied",
                "Invalid credentials",
                "Email already registered",
                "Access denied",
                "Only approved applicants",
                "Only students can apply",
                "Only UMKM can",
                "Password mismatch",
                "Kode verifikasi",
                "Reset token",
                "Project is not in",
                "You don't have permission",
                "Hanya akun UMKM",
                "Cannot apply to your own project"
        };

        // Check if the message is safe to expose
        boolean isSafeMessage = false;
        for (String safe : safeMessages) {
            if (message != null && message.contains(safe)) {
                isSafeMessage = true;
                break;
            }
        }

        if (isSafeMessage) {
            log.debug("Business error: {}", message);
            return ResponseEntity.badRequest().body(ApiResponse.fail(message));
        } else {
            // For unexpected errors, log full details but return generic message
            log.error("Unexpected error occurred: ", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("An unexpected error occurred. Please try again later."));
        }
    }

    /**
     * Handle authentication errors
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials(BadCredentialsException ex) {
        log.debug("Authentication failed: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.fail("Invalid email or password"));
    }

    /**
     * Handle authorization errors
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.fail("Access denied. You don't have permission to perform this action."));
    }

    /**
     * Handle database constraint violations
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Database constraint violation: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("Operation failed due to data conflict. Please try again."));
    }

    /**
     * Handle file upload size exceeded
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.debug("File upload size exceeded: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error("File size exceeds the maximum allowed limit."));
    }

    /**
     * Handle IllegalArgumentException - typically validation errors
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Void>> handleIllegalArgument(IllegalArgumentException ex) {
        log.debug("Illegal argument: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(ApiResponse.fail(ex.getMessage()));
    }

    /**
     * Catch-all handler for any unhandled exceptions
     * SECURITY: Never expose internal error details to client
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleAllExceptions(Exception ex) {
        log.error("Unhandled exception occurred: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse
                        .error("An unexpected error occurred. Please contact support if the problem persists."));
    }
}
