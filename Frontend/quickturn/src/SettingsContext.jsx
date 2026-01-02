import React, { createContext, useContext, useState, useEffect } from 'react';

// Default settings
const defaultSettings = {
    theme: 'light',           // 'light' or 'dark'
    language: 'id',           // 'id' (Indonesia) or 'en' (English)
    currency: 'IDR',          // 'IDR' or 'USD'
    dateFormat: 'dd/mm/yyyy'  // 'dd/mm/yyyy' or 'mm/dd/yyyy'
};

// Create context
const SettingsContext = createContext(undefined);

// Translations
export const translations = {
    id: {
        // Common
        save: 'Simpan',
        cancel: 'Batal',
        settings: 'Pengaturan',
        logout: 'Keluar',
        dashboard: 'Dashboard',
        profile: 'Profil',
        messages: 'Pesan',
        projects: 'Proyek',

        // Settings Modal
        appearance: 'Tampilan',
        lightMode: 'Mode Terang',
        darkMode: 'Mode Gelap',
        language: 'Bahasa',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        currency: 'Mata Uang',
        dateFormat: 'Format Tanggal',

        // Dashboard
        welcome: 'Selamat datang kembali',
        findWork: 'Cari Kerja',
        browseProjects: 'Telusuri Proyek',
        myProjects: 'Proyek Saya',
        findUsers: 'Cari Pengguna',
        availableProjects: 'Proyek Tersedia',
        projectsCompleted: 'Proyek Selesai',
        applicationsSent: 'Lamaran Terkirim',
        latestAnnouncements: 'Pengumuman Terbaru',
        recentActivity: 'Aktivitas Terbaru',
        noAnnouncements: 'Tidak ada pengumuman baru',
        recommendedProjects: 'Proyek yang Direkomendasikan',
        viewAll: 'Lihat Semua',

        // Profile
        editProfile: 'Edit Profil',
        saveChanges: 'Simpan Perubahan',
        deleteAccount: 'Hapus Akun',
        reportIssue: 'Laporkan Masalah',

        // Status
        loading: 'Memuat...',
        error: 'Terjadi kesalahan',
        success: 'Berhasil',
    },
    en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        settings: 'Settings',
        logout: 'Logout',
        dashboard: 'Dashboard',
        profile: 'Profile',
        messages: 'Messages',
        projects: 'Projects',

        // Settings Modal
        appearance: 'Appearance',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        language: 'Language',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        currency: 'Currency',
        dateFormat: 'Date Format',

        // Dashboard
        welcome: 'Welcome back',
        findWork: 'Find Work',
        browseProjects: 'Browse Projects',
        myProjects: 'My Projects',
        findUsers: 'Find Users',
        availableProjects: 'Available Projects',
        projectsCompleted: 'Projects Completed',
        applicationsSent: 'Applications Sent',
        latestAnnouncements: 'Latest Announcements',
        recentActivity: 'Recent Activity',
        noAnnouncements: 'No new announcements',
        recommendedProjects: 'Recommended Projects',
        viewAll: 'View All',

        // Profile
        editProfile: 'Edit Profile',
        saveChanges: 'Save Changes',
        deleteAccount: 'Delete Account',
        reportIssue: 'Report Issue',

        // Status
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
    }
};

// Provider component
export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(() => {
        // Load from localStorage on init
        const saved = localStorage.getItem('quickturn_settings');
        if (saved) {
            try {
                return { ...defaultSettings, ...JSON.parse(saved) };
            } catch {
                return defaultSettings;
            }
        }
        return defaultSettings;
    });

    // Save to localStorage whenever settings change
    useEffect(() => {
        localStorage.setItem('quickturn_settings', JSON.stringify(settings));

        // Apply theme to document
        if (settings.theme === 'dark') {
            document.documentElement.classList.add('dark-mode');
            document.documentElement.classList.remove('light-mode');
        } else {
            document.documentElement.classList.add('light-mode');
            document.documentElement.classList.remove('dark-mode');
        }
    }, [settings]);

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    // Translation helper
    const t = (key) => {
        return translations[settings.language]?.[key] || translations.id[key] || key;
    };

    // Format date based on settings
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        if (settings.dateFormat === 'mm/dd/yyyy') {
            return `${month}/${day}/${year}`;
        }
        return `${day}/${month}/${year}`;
    };

    // Format date with time
    const formatDateTime = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');

        if (settings.dateFormat === 'mm/dd/yyyy') {
            return `${month}/${day}/${year} ${hours}:${minutes}`;
        }
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    };

    // Format currency based on settings
    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined) return '-';
        const num = Number(amount);

        if (settings.currency === 'USD') {
            // Convert IDR to USD (approximate rate)
            const usdAmount = num / 15500;
            return new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(usdAmount);
        }

        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(num);
    };

    const value = {
        settings,
        updateSetting,
        resetSettings,
        t,
        formatDate,
        formatDateTime,
        formatCurrency,
        isDark: settings.theme === 'dark'
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

// Hook to use settings
export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export default SettingsContext;
