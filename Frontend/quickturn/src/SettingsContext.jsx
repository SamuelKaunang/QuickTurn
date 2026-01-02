import React, { createContext, useContext, useState, useEffect } from 'react';

// Default settings (No dark mode)
const defaultSettings = {
    language: 'id',           // 'id' (Indonesia) or 'en' (English)
    currency: 'IDR',          // 'IDR' or 'USD'
    dateFormat: 'dd/mm/yyyy'  // 'dd/mm/yyyy' or 'mm/dd/yyyy'
};

// Create context
const SettingsContext = createContext(undefined);

// Comprehensive Translations
export const translations = {
    id: {
        // Common
        save: 'Simpan',
        cancel: 'Batal',
        settings: 'Pengaturan',
        logout: 'Keluar',
        back: 'Kembali',
        close: 'Tutup',
        submit: 'Kirim',
        apply: 'Terapkan',
        delete: 'Hapus',
        edit: 'Edit',
        view: 'Lihat',
        search: 'Cari',
        filter: 'Filter',
        loading: 'Memuat...',
        error: 'Terjadi kesalahan',
        success: 'Berhasil',
        confirm: 'Konfirmasi',
        yes: 'Ya',
        no: 'Tidak',

        // Navigation
        dashboard: 'Dasbor',
        profile: 'Profil',
        messages: 'Pesan',
        projects: 'Proyek',
        chat: 'Obrolan',

        // Settings Modal
        language: 'Bahasa',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        currency: 'Mata Uang',
        dateFormat: 'Format Tanggal',
        preferences: 'Preferensi',

        // Dashboard - Talent
        welcomeBack: 'Selamat datang kembali',
        welcomeToQuickTurn: 'Selamat datang di QuickTurn',
        talentDashboard: 'Dasbor Talent',
        clientDashboard: 'Dasbor Klien',
        findWork: 'Cari Kerja',
        browseProjects: 'Telusuri Proyek',
        myProjects: 'Proyek Saya',
        activeProjects: 'Proyek Aktif',
        findUsers: 'Cari Pengguna',
        availableProjects: 'Proyek Tersedia',
        projectsCompleted: 'Proyek Selesai',
        applicationsSent: 'Lamaran Terkirim',
        totalApplicants: 'Total Pelamar',
        latestAnnouncements: 'Pengumuman Terbaru',
        recentActivity: 'Aktivitas Terbaru',
        noAnnouncements: 'Tidak ada pengumuman baru',
        recommendedProjects: 'Proyek yang Direkomendasikan',
        viewAll: 'Lihat Semua',
        buildPortfolio: 'Saatnya membangun portofolio dan temukan peluang berikutnya.',
        microInternships: 'Magang Mikro',

        // Dashboard - Client
        postProject: 'Pasang Proyek',
        manageProjects: 'Kelola proyek Anda dan temukan talenta terbaik.',
        projectsPosted: 'Proyek Dipasang',
        ongoingProjects: 'Proyek Berjalan',
        completedProjects: 'Proyek Selesai',

        // Projects
        projectDetails: 'Detail Proyek',
        projectTitle: 'Judul Proyek',
        projectDescription: 'Deskripsi Proyek',
        budget: 'Anggaran',
        deadline: 'Tenggat Waktu',
        category: 'Kategori',
        skills: 'Keahlian',
        status: 'Status',
        applyNow: 'Lamar Sekarang',
        applied: 'Sudah Melamar',
        acceptApplication: 'Terima Lamaran',
        rejectApplication: 'Tolak Lamaran',
        viewApplications: 'Lihat Lamaran',
        noProjectsFound: 'Tidak ada proyek ditemukan',
        createFirstProject: 'Buat proyek pertama Anda',

        // Project Status
        statusOpen: 'Terbuka',
        statusOngoing: 'Sedang Berjalan',
        statusDone: 'Selesai',
        statusClosed: 'Ditutup',

        // Profile
        editProfile: 'Edit Profil',
        saveChanges: 'Simpan Perubahan',
        deleteAccount: 'Hapus Akun',
        reportIssue: 'Laporkan Masalah',
        personalInfo: 'Informasi Pribadi',
        contactInfo: 'Informasi Kontak',
        socialLinks: 'Tautan Sosial',
        aboutMe: 'Tentang Saya',
        biography: 'Biografi',
        fullName: 'Nama Lengkap',
        email: 'Email',
        phone: 'Telepon',
        location: 'Lokasi',
        address: 'Alamat',
        university: 'Universitas',
        experience: 'Pengalaman',
        years: 'tahun',
        availability: 'Ketersediaan',
        portfolio: 'Portofolio',
        headline: 'Headline',

        // Chat
        typeMessage: 'Ketik pesan...',
        sendMessage: 'Kirim Pesan',
        noMessages: 'Belum ada pesan',
        startConversation: 'Mulai percakapan',
        onlineNow: 'Online sekarang',
        lastSeen: 'Terakhir dilihat',

        // Applications
        applications: 'Lamaran',
        myApplications: 'Lamaran Saya',
        applicationStatus: 'Status Lamaran',
        pending: 'Menunggu',
        accepted: 'Diterima',
        rejected: 'Ditolak',

        // Search Users
        usersFound: 'Pengguna Ditemukan',
        searchByNameOrUsername: 'Cari nama atau username...',
        sortByName: 'Urutkan: Nama',
        sortByRating: 'Urutkan: Rating',
        sortByReviews: 'Urutkan: Ulasan',
        userType: 'Tipe Pengguna',
        allUsers: 'Semua Pengguna',
        allCategories: 'Semua Kategori',
        clearFilters: 'Hapus Filter',
        loadingUsers: 'Memuat pengguna...',
        tryAdjustingFilters: 'Coba sesuaikan filter pencarian',
        viewProfile: 'Lihat Profil',
        reviews: 'Ulasan',
        filters: 'Filter',

        // Reports
        reportBug: 'Laporkan Bug',
        reportUser: 'Laporkan Pengguna',
        reportProject: 'Laporkan Proyek',
        bugTechnical: 'Bug / Teknis',
        contractIssue: 'Masalah Kontrak',
        userComplaint: 'Keluhan Pengguna',
        paymentIssue: 'Masalah Pembayaran',
        other: 'Lainnya',
        describeIssue: 'Jelaskan masalah Anda',
        attachEvidence: 'Lampirkan bukti',

        // Submissions
        submitWork: 'Kirim Hasil Kerja',
        viewSubmissions: 'Lihat Hasil Kerja',
        workSubmission: 'Pengiriman Hasil Kerja',

        // Empty States
        noDataFound: 'Data tidak ditemukan',
        noResultsFound: 'Hasil tidak ditemukan',
        tryAgain: 'Coba lagi',

        // Time
        justNow: 'Baru saja',
        minutesAgo: 'menit yang lalu',
        hoursAgo: 'jam yang lalu',
        daysAgo: 'hari yang lalu',

        // Actions
        approve: 'Setujui',
        reject: 'Tolak',
        complete: 'Selesaikan',

        // User Types
        talent: 'Talent',
        client: 'Klien',
        admin: 'Admin',
        proLevel: 'Level Pro',
    },
    en: {
        // Common
        save: 'Save',
        cancel: 'Cancel',
        settings: 'Settings',
        logout: 'Logout',
        back: 'Back',
        close: 'Close',
        submit: 'Submit',
        apply: 'Apply',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        search: 'Search',
        filter: 'Filter',
        loading: 'Loading...',
        error: 'An error occurred',
        success: 'Success',
        confirm: 'Confirm',
        yes: 'Yes',
        no: 'No',

        // Navigation
        dashboard: 'Dashboard',
        profile: 'Profile',
        messages: 'Messages',
        projects: 'Projects',
        chat: 'Chat',

        // Settings Modal
        language: 'Language',
        indonesian: 'Bahasa Indonesia',
        english: 'English',
        currency: 'Currency',
        dateFormat: 'Date Format',
        preferences: 'Preferences',

        // Dashboard - Talent
        welcomeBack: 'Welcome back',
        welcomeToQuickTurn: 'Welcome to QuickTurn',
        talentDashboard: 'Talent Dashboard',
        clientDashboard: 'Client Dashboard',
        findWork: 'Find Work',
        browseProjects: 'Browse Projects',
        myProjects: 'My Projects',
        activeProjects: 'Active Projects',
        findUsers: 'Find Users',
        availableProjects: 'Available Projects',
        projectsCompleted: 'Projects Completed',
        applicationsSent: 'Applications Sent',
        totalApplicants: 'Total Applicants',
        latestAnnouncements: 'Latest Announcements',
        recentActivity: 'Recent Activity',
        noAnnouncements: 'No new announcements',
        recommendedProjects: 'Recommended Projects',
        viewAll: 'View All',
        buildPortfolio: 'Time to build your portfolio and find your next opportunity.',
        microInternships: 'Micro-Internships',

        // Dashboard - Client
        postProject: 'Post Project',
        manageProjects: 'Manage your projects and find the best talent.',
        projectsPosted: 'Projects Posted',
        ongoingProjects: 'Ongoing Projects',
        completedProjects: 'Completed Projects',

        // Projects
        projectDetails: 'Project Details',
        projectTitle: 'Project Title',
        projectDescription: 'Project Description',
        budget: 'Budget',
        deadline: 'Deadline',
        category: 'Category',
        skills: 'Skills',
        status: 'Status',
        applyNow: 'Apply Now',
        applied: 'Applied',
        acceptApplication: 'Accept Application',
        rejectApplication: 'Reject Application',
        viewApplications: 'View Applications',
        noProjectsFound: 'No projects found',
        createFirstProject: 'Create your first project',

        // Project Status
        statusOpen: 'Open',
        statusOngoing: 'Ongoing',
        statusDone: 'Done',
        statusClosed: 'Closed',

        // Profile
        editProfile: 'Edit Profile',
        saveChanges: 'Save Changes',
        deleteAccount: 'Delete Account',
        reportIssue: 'Report Issue',
        personalInfo: 'Personal Information',
        contactInfo: 'Contact Information',
        socialLinks: 'Social Links',
        aboutMe: 'About Me',
        biography: 'Biography',
        fullName: 'Full Name',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        address: 'Address',
        university: 'University',
        experience: 'Experience',
        years: 'years',
        availability: 'Availability',
        portfolio: 'Portfolio',
        headline: 'Headline',

        // Chat
        typeMessage: 'Type a message...',
        sendMessage: 'Send Message',
        noMessages: 'No messages yet',
        startConversation: 'Start a conversation',
        onlineNow: 'Online now',
        lastSeen: 'Last seen',

        // Applications
        applications: 'Applications',
        myApplications: 'My Applications',
        applicationStatus: 'Application Status',
        pending: 'Pending',
        accepted: 'Accepted',
        rejected: 'Rejected',

        // Search Users
        usersFound: 'Users Found',
        searchByNameOrUsername: 'Search by name or username...',
        sortByName: 'Sort by: Name',
        sortByRating: 'Sort by: Rating',
        sortByReviews: 'Sort by: Reviews',
        userType: 'User Type',
        allUsers: 'All Users',
        allCategories: 'All Categories',
        clearFilters: 'Clear Filters',
        loadingUsers: 'Loading users...',
        tryAdjustingFilters: 'Try adjusting search filters',
        viewProfile: 'View Profile',
        reviews: 'Reviews',
        filters: 'Filters',

        // Reports
        reportBug: 'Report Bug',
        reportUser: 'Report User',
        reportProject: 'Report Project',
        bugTechnical: 'Bug / Technical',
        contractIssue: 'Contract Issue',
        userComplaint: 'User Complaint',
        paymentIssue: 'Payment Issue',
        other: 'Other',
        describeIssue: 'Describe your issue',
        attachEvidence: 'Attach evidence',

        // Submissions
        submitWork: 'Submit Work',
        viewSubmissions: 'View Submissions',
        workSubmission: 'Work Submission',

        // Empty States
        noDataFound: 'No data found',
        noResultsFound: 'No results found',
        tryAgain: 'Try again',

        // Time
        justNow: 'Just now',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',

        // Actions
        approve: 'Approve',
        reject: 'Reject',
        complete: 'Complete',

        // User Types
        talent: 'Talent',
        client: 'Client',
        admin: 'Admin',
        proLevel: 'Pro Level',
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
        formatCurrency
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
