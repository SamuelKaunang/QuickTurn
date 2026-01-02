import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from './RouteGuards';
import {
    Search, User, Star, Briefcase, MapPin, Filter,
    ChevronDown, X, Users, Award, Building2, GraduationCap,
    ArrowLeft, RefreshCw, LayoutDashboard, MessageSquare, Settings, LogOut
} from 'lucide-react';
import { api } from './utils/apiConfig';
import { useSettings } from './SettingsContext';
import './SearchUsers.css';
import './DashboardM.css'; // Use Dashboard styles for consistency
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';
import SettingsModal from './SettingsModal';

const SearchUsers = () => {
    const navigate = useNavigate();
    const { t } = useSettings();

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [bidangFilter, setBidangFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showFilters, setShowFilters] = useState(false);

    // Dashboard-like State
    const [user, setUser] = useState(null);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const token = sessionStorage.getItem('token');

    // Bidang Options
    const bidangOptions = [
        'Web Development', 'Mobile Development', 'UI/UX Design', 'Graphic Design',
        'Data Science', 'Digital Marketing', 'Content Writing', 'Video Editing',
        'Photography', 'Translation', 'Virtual Assistant', 'Other'
    ];

    // --- EFFECTS ---

    useEffect(() => {
        // Auth check
        if (!token) {
            navigate('/login');
            return;
        }

        // Load Data
        fetchUserProfile();
        fetchAllUsers();
        fetchUnreadCount();

        // Poll unread
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [token, navigate]);

    useEffect(() => {
        filterUsers();
    }, [searchQuery, roleFilter, bidangFilter, sortBy, allUsers]);

    // --- API CALLS ---

    const fetchUserProfile = async () => {
        try {
            const response = await fetch(api("/api/users/profile"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setUser({
                    name: data.data.nama,
                    role: sessionStorage.getItem("role"),
                    profilePicture: data.data.profilePictureUrl
                });
            } else {
                // Fallback if profile fetch fails but we have session data
                setUser({
                    name: sessionStorage.getItem("name") || "User",
                    role: sessionStorage.getItem("role"),
                    profilePicture: null
                });
            }
        } catch (err) { console.error("Failed to fetch user profile", err); }
    };

    const fetchUnreadCount = async () => {
        try {
            const response = await fetch(api("/api/chat/unread"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setUnreadCount(data.data.unreadCount || 0);
            }
        } catch (err) { console.error("Failed to fetch unread count", err); }
    };

    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch(api('/api/users/search?query='), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setAllUsers(data.data || []);
            }
        } catch (err) {
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC ---

    const filterUsers = () => {
        let filtered = [...allUsers];

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(user =>
                user.nama?.toLowerCase().includes(query) ||
                user.username?.toLowerCase().includes(query) ||
                user.bidang?.toLowerCase().includes(query) ||
                user.headline?.toLowerCase().includes(query)
            );
        }

        // Role filter
        if (roleFilter) {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Bidang filter
        if (bidangFilter) {
            filtered = filtered.filter(user =>
                user.bidang?.toLowerCase().includes(bidangFilter.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'rating':
                    return (b.averageRating || 0) - (a.averageRating || 0);
                case 'reviews':
                    return (b.totalReviews || 0) - (a.totalReviews || 0);
                case 'name':
                default:
                    return (a.nama || '').localeCompare(b.nama || '');
            }
        });

        setResults(filtered);
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            filterUsers();
            return;
        }
        setLoading(true);
        try {
            let url = `/api/users/search?query=${encodeURIComponent(searchQuery)}`;
            if (roleFilter) url += `&role=${roleFilter}`;
            const response = await fetch(api(url), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setResults(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setRoleFilter('');
        setBidangFilter('');
        setSortBy('name');
    };

    const handleViewProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    const handleLogout = () => {
        performLogout(navigate);
    };

    const getRoleIcon = (role) => {
        return role === 'MAHASISWA' ? <GraduationCap size={14} /> : <Building2 size={14} />;
    };

    const getRoleLabel = (role) => {
        return role === 'MAHASISWA' ? 'Talent' : 'Client';
    };

    const activeFiltersCount = [roleFilter, bidangFilter].filter(Boolean).length;

    // --- RENDER ---

    return (
        <div className="dashboard-container">
            {/* Background Blobs (Consistent with Dashboard) */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>
            <div className="bg-glow glow-3"></div>

            {/* Sidebar (Consistent with DashboardM) */}
            <aside className="sidebar">
                <div className="sidebar-inner">
                    <div className="logo-section">
                        <img src={logoQ} alt="QuickTurn" className="logo-icon-img" />
                        <div>
                            <img src={logoText} alt="QuickTurn" className="logo-text-img" />
                            <p className="logo-subtext">{t('microInternships')}</p>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <button onClick={() => navigate('/dashboardm')} className="nav-item">
                            <LayoutDashboard size={20} />
                            <span>{t('dashboard')}</span>
                        </button>
                        {/* Note: In DashboardM, "Browse Projects" is a tab. Here we link back to dashboard's browse tab */}
                        <button onClick={() => { navigate('/dashboardm'); /* In a real app we might pass state to switch tab */ }} className="nav-item">
                            <Search size={20} />
                            <span>{t('browseProjects')}</span>
                        </button>
                        <button onClick={() => navigate('/dashboardm') /* Maps to active projects tab ideally */} className="nav-item">
                            <Briefcase size={20} />
                            <span>{t('myProjects')}</span>
                        </button>
                        <button onClick={() => navigate('/chat')} className="nav-item">
                            <div className="nav-item-icon-wrapper">
                                <MessageSquare size={20} />
                                {unreadCount > 0 && <span className="unread-dot"></span>}
                            </div>
                            <span>{t('messages')}</span>
                            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                        </button>
                        <button className="nav-item active">
                            <Users size={20} />
                            <span>{t('findUsers')}</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="nav-item settings-nav" onClick={() => setShowSettingsModal(true)}>
                            <Settings size={18} />
                            <span>{t('settings')}</span>
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Topbar (Consistent with DashboardM) */}
                <header className="topbar">
                    <div className="topbar-greeting">
                        {/* Optional: Static greeting or breadcrumb for this page */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Users size={20} className="text-slate-500" />
                            <span className="greeting-text" style={{ fontSize: '1.1rem', fontWeight: '700' }}>{t('findUsers')}</span>
                        </div>
                    </div>

                    <div className="topbar-actions">
                        <div
                            className="profile-pill"
                            onClick={() => navigate('/profile-mahasiswa')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="profile-info">
                                <p className="p-name">{user?.name || t('talent')}</p>
                                <p className="p-status">{t('proLevel')}</p>
                            </div>
                            {user?.profilePicture ? (
                                <img src={user.profilePicture} alt="Profile" className="avatar-img" />
                            ) : (
                                <div className="avatar-placeholder">
                                    <Users size={20} />
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Body */}
                <section className="content-body" style={{ paddingBottom: '40px' }}>

                    {/* Search Controls (Refactored to match dashboard aesthetic) */}
                    <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
                        <div className="search-controls" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                            <div className="search-bar-container">
                                <div className="search-input-wrapper">
                                    <Search size={20} className="search-icon" />
                                    <input
                                        type="text"
                                        placeholder={t('searchByNameOrUsername')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    {searchQuery && (
                                        <button className="clear-search" onClick={() => setSearchQuery('')}>
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                                <button className="search-btn" onClick={handleSearch}>
                                    <Search size={18} />
                                    {t('search')}
                                </button>
                            </div>

                            <div className="filter-controls">
                                <button
                                    className={`filter-toggle ${showFilters ? 'active' : ''}`}
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter size={18} />
                                    {t('filters')}
                                    {activeFiltersCount > 0 && <span className="filter-count">{activeFiltersCount}</span>}
                                    <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
                                </button>

                                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                                    <option value="name">{t('sortByName')}</option>
                                    <option value="rating">{t('sortByRating')}</option>
                                    <option value="reviews">{t('sortByReviews')}</option>
                                </select>

                                <button className="refresh-btn" onClick={fetchAllUsers} title="Refresh">
                                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                                </button>
                            </div>
                        </div>

                        {/* Expanded Filters */}
                        {showFilters && (
                            <div className="filters-panel" style={{ padding: '20px 0 0', borderTop: '1px solid #e2e8f0', marginTop: '20px', background: 'transparent' }}>
                                <div className="filter-group">
                                    <label>{t('userType')}</label>
                                    <div className="filter-options">
                                        <button className={`filter-chip ${roleFilter === '' ? 'active' : ''}`} onClick={() => setRoleFilter('')}>
                                            <Users size={14} /> {t('allUsers')}
                                        </button>
                                        <button className={`filter-chip ${roleFilter === 'MAHASISWA' ? 'active' : ''}`} onClick={() => setRoleFilter('MAHASISWA')}>
                                            <GraduationCap size={14} /> {t('talent')}
                                        </button>
                                        <button className={`filter-chip ${roleFilter === 'UMKM' ? 'active' : ''}`} onClick={() => setRoleFilter('UMKM')}>
                                            <Building2 size={14} /> {t('client')}
                                        </button>
                                    </div>
                                </div>

                                <div className="filter-group">
                                    <label>{t('category')}</label>
                                    <select value={bidangFilter} onChange={(e) => setBidangFilter(e.target.value)} className="filter-select">
                                        <option value="">{t('allCategories')}</option>
                                        {bidangOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                </div>

                                {(roleFilter || bidangFilter) && (
                                    <button className="clear-filters-btn" onClick={clearFilters}>
                                        <X size={16} /> {t('clearFilters')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Results Grid */}
                    <div className="results-wrapper">
                        {/* Stats Badge */}
                        <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.9rem', fontWeight: '500' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e11d48' }}></div>
                            {results.length} {t('usersFound')}
                        </div>

                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>{t('loadingUsers')}</p>
                            </div>
                        ) : results.length === 0 ? (
                            <div className="empty-state glass-card">
                                <Users size={64} />
                                <h3>{t('noUsersFound')}</h3>
                                <p>{t('tryAdjustingFilters')}</p>
                                {(searchQuery || roleFilter || bidangFilter) && (
                                    <button className="clear-btn" onClick={clearFilters}>{t('clearFilters')}</button>
                                )}
                            </div>
                        ) : (
                            <div className="users-grid">
                                {results.map((user) => (
                                    <div key={user.id} className="user-card" onClick={() => handleViewProfile(user.id)}>
                                        <div className="user-card-header">
                                            <div className="user-avatar">
                                                {user.profilePictureUrl ? (
                                                    <img
                                                        src={user.profilePictureUrl}
                                                        alt={user.nama}
                                                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                                                    />
                                                ) : null}
                                                <div className="avatar-fallback" style={{ display: user.profilePictureUrl ? 'none' : 'flex' }}>
                                                    <User size={28} />
                                                </div>
                                            </div>
                                            <div className={`role-badge ${user.role?.toLowerCase()}`}>
                                                {getRoleIcon(user.role)}
                                                {getRoleLabel(user.role)}
                                            </div>
                                        </div>

                                        <div className="user-card-body">
                                            <h3 className="user-name">{user.nama}</h3>
                                            {user.username && <p className="user-username">@{user.username}</p>}
                                            {user.headline && <p className="user-headline">{user.headline}</p>}

                                            <div className="user-meta">
                                                {user.bidang && (
                                                    <span className="meta-item">
                                                        <Briefcase size={14} />
                                                        {user.bidang}
                                                    </span>
                                                )}
                                                {user.location && (
                                                    <span className="meta-item">
                                                        <MapPin size={14} />
                                                        {user.location}
                                                    </span>
                                                )}
                                            </div>

                                            {/* NEW: General Field */}
                                            <div className="user-general-info" style={{
                                                marginTop: '8px',
                                                marginBottom: '12px',
                                                padding: '8px',
                                                background: '#f8fafc',
                                                borderRadius: '6px',
                                                fontSize: '0.8rem',
                                                color: '#475569',
                                                textAlign: 'left'
                                            }}>
                                                <span style={{ fontWeight: '600', display: 'block', marginBottom: '2px', color: '#94a3b8', fontSize: '0.7rem', textTransform: 'uppercase' }}>General</span>
                                                {user.bidang || "General Talent"}
                                            </div>

                                            <div className="user-stats">
                                                {user.averageRating > 0 && (
                                                    <span className="stat-item rating">
                                                        <Star size={14} /> {user.averageRating.toFixed(1)}
                                                    </span>
                                                )}
                                                {user.totalReviews > 0 && (
                                                    <span className="stat-item reviews">
                                                        <Award size={14} /> {user.totalReviews} {t('reviews')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="user-card-footer">
                                            <button className="view-profile-btn">{t('viewProfile')}</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            </main>

            <SettingsModal isOpen={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
        </div>
    );
};

export default SearchUsers;
