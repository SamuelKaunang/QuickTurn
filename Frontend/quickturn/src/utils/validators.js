/**
 * Form validation utility
 * Provides validation functions with clear error messages
 */

// Validation rules
export const validators = {
    // Email validation
    email: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Email wajib diisi' };
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            return { valid: false, message: 'Format email tidak valid (contoh: nama@email.com)' };
        }
        return { valid: true, message: '' };
    },

    // Name validation
    name: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Nama wajib diisi' };
        }
        if (value.trim().length < 2) {
            return { valid: false, message: 'Nama minimal 2 karakter' };
        }
        if (value.trim().length > 100) {
            return { valid: false, message: 'Nama maksimal 100 karakter' };
        }
        return { valid: true, message: '' };
    },

    // Password validation
    password: (value) => {
        if (!value) {
            return { valid: false, message: 'Password wajib diisi' };
        }
        if (value.length < 6) {
            return { valid: false, message: 'Password minimal 6 karakter' };
        }
        if (value.length > 50) {
            return { valid: false, message: 'Password maksimal 50 karakter' };
        }
        // Check for at least one letter and one number (recommended)
        const hasLetter = /[a-zA-Z]/.test(value);
        const hasNumber = /\d/.test(value);
        if (!hasLetter || !hasNumber) {
            return { valid: false, message: 'Password harus mengandung huruf dan angka' };
        }
        return { valid: true, message: '' };
    },

    // Password confirmation
    confirmPassword: (value, originalPassword) => {
        if (!value) {
            return { valid: false, message: 'Konfirmasi password wajib diisi' };
        }
        if (value !== originalPassword) {
            return { valid: false, message: 'Password tidak cocok' };
        }
        return { valid: true, message: '' };
    },

    // Username validation
    username: (value) => {
        if (!value || !value.trim()) {
            return { valid: false, message: 'Username wajib diisi' };
        }
        if (value.length < 3) {
            return { valid: false, message: 'Username minimal 3 karakter' };
        }
        if (value.length > 30) {
            return { valid: false, message: 'Username maksimal 30 karakter' };
        }
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(value)) {
            return { valid: false, message: 'Username hanya boleh huruf, angka, dan underscore (_)' };
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
            return { valid: false, message: 'Format nomor telepon tidak valid' };
        }
        if (value.replace(/\D/g, '').length < 10) {
            return { valid: false, message: 'Nomor telepon minimal 10 digit' };
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
            return { valid: false, message: 'Format URL tidak valid (harus dimulai dengan http:// atau https://)' };
        }
    },

    // Required field
    required: (value, fieldName = 'Field') => {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { valid: false, message: `${fieldName} wajib diisi` };
        }
        return { valid: true, message: '' };
    },

    // Min length
    minLength: (value, min, fieldName = 'Field') => {
        if (value && value.length < min) {
            return { valid: false, message: `${fieldName} minimal ${min} karakter` };
        }
        return { valid: true, message: '' };
    },

    // Max length
    maxLength: (value, max, fieldName = 'Field') => {
        if (value && value.length > max) {
            return { valid: false, message: `${fieldName} maksimal ${max} karakter` };
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

    if (strength <= 2) return { strength, label: 'Lemah', color: '#ef4444' };
    if (strength <= 4) return { strength, label: 'Sedang', color: '#f59e0b' };
    if (strength <= 5) return { strength, label: 'Kuat', color: '#22c55e' };
    return { strength, label: 'Sangat Kuat', color: '#16a34a' };
};

export default validators;
