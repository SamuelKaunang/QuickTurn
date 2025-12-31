/**
 * Form validation utility
 * Provides validation functions with clear error messages
 */

// Validation rules
export const validators = {
    // Email validation
    email: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Email is required' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, message: 'Invalid email format (e.g., name@email.com)' };
        }
        return { valid: true, message: '' };
    },

    // Name validation
    name: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Name is required' };
        }
        if (value.trim().length < 2) {
            return { valid: false, message: 'Name must be at least 2 characters' };
        }
        if (value.trim().length > 100) {
            return { valid: false, message: 'Name must not exceed 100 characters' };
        }
        return { valid: true, message: '' };
    },

    // Password validation
    password: (value) => {
        if (!value) {
            return { valid: false, message: 'Password is required' };
        }
        if (value.length < 6) {
            return { valid: false, message: 'Password must be at least 6 characters' };
        }
        if (value.length > 50) {
            return { valid: false, message: 'Password must not exceed 50 characters' };
        }
        // Check for at least one letter and one number (recommended)
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasLetter || !hasNumber) {
            return { valid: false, message: 'Password must contain letters and numbers' };
        }
        return { valid: true, message: '' };
    },

    // Password confirmation
    confirmPassword: (value, originalPassword) => {
        if (!value) {
            return { valid: false, message: 'Password confirmation is required' };
        }
        if (value !== originalPassword) {
            return { valid: false, message: 'Passwords do not match' };
        }
        return { valid: true, message: '' };
    },

    // Username validation
    username: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Username is required' };
        }
        if (value.length < 3) {
            return { valid: false, message: 'Username must be at least 3 characters' };
        }
        if (value.length > 30) {
            return { valid: false, message: 'Username must not exceed 30 characters' };
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(value)) {
            return { valid: false, message: 'Username can only contain letters, numbers, and underscores (_)' };
        }
        return { valid: true, message: '' };
    },

    // Phone validation
    phone: (value) => {
        if (!value || !value.trim()) {
            return { valid: true, message: '' }; // Phone is optional
        }
        const phoneRegex = /^[0-9+\-\s()]+$/;
        if (!phoneRegex.test(value)) {
            return { valid: false, message: 'Invalid phone number format' };
        }
        if (value.replace(/\D/g, '').length < 10) {
            return { valid: false, message: 'Phone number must be at least 10 digits' };
        }
        return { valid: true, message: '' };
    },

    // URL validation
    url: (value) => {
        if (!value || !value.trim()) {
            return { valid: true, message: '' }; // URL is optional
        }
        try {
            new URL(value);
            return { valid: true, message: '' };
        } catch {
            return { valid: false, message: 'Invalid URL format (must start with http:// or https://)' };
        }
    },

    // Required field
    required: (value, fieldName = 'Field') => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { valid: false, message: `${fieldName} is required` };
        }
        return { valid: true, message: '' };
    },

    // Min length
    minLength: (value, min, fieldName = 'Field') => {
        if (value && value.length < min) {
            return { valid: false, message: `${fieldName} must be at least ${min} characters` };
        }
        return { valid: true, message: '' };
    },

    // Max length
    maxLength: (value, max, fieldName = 'Field') => {
        if (value && value.length > max) {
            return { valid: false, message: `${fieldName} must not exceed ${max} characters` };
        }
        return { valid: true, message: '' };
    }
};

// Password strength indicator
export const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, label: '', color: '' };

    let strength = 0;

    // Length check
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;

    // Character variety
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;

    if (strength <= 2) return { strength, label: 'Weak', color: '#ef4444' };
    if (strength <= 4) return { strength, label: 'Medium', color: '#f59e0b' };
    if (strength <= 5) return { strength, label: 'Strong', color: '#22c55e' };
    return { strength, label: 'Very Strong', color: '#16a34a' };
};

export default validators;
