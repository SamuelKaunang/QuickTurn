import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, User, Star, Briefcase, MapPin, Filter,
    ChevronDown, X, Users, Award, Building2, GraduationCap,
    ArrowLeft, RefreshCw
} from 'lucide-react';
import { api } from './utils/apiConfig';
import { useSettings } from './SettingsContext';
import './SearchUsers.css';

const SearchUsers = () => {
    const navigate = useNavigate();
    const { t } = useSettings();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [bidangFilter, setBidangFilter] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [showFilters, setShowFilters] = useState(false);

    const token = sessionStorage.getItem('token');
    const currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');

    // Available bidang options
    const bidangOptions = [
        'Web Development',
        'Mobile Development',
        'UI/UX Design',
        'Graphic Design',
        'Data Science',
        'Digital Marketing',
        'Content Writing',
        'Video Editing',
        'Photography',
        'Translation',
        'Virtual Assistant',
        'Other'
    ];

    // Fetch all users on mount
    useEffect(() => {
        fetchAllUsers();
    }, []);

    // Filter users when search/filters change
    useEffect(() => {
        filterUsers();
    }, [searchQuery, roleFilter, bidangFilter, sortBy, allUsers]);

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

    const handleBack = () => {
        navigate(-1);
    };

    const getRoleIcon = (role) => {
        return role === 'MAHASISWA' ? <GraduationCap size={14} /> : <Building2 size={14} />;
    };

    const getRoleLabel = (role) => {
        return role === 'MAHASISWA' ? 'Talent' : 'Client';
    };

    const activeFiltersCount = [roleFilter, bidangFilter].filter(Boolean).length;

    return (
        <div className="search-users-page">
            {/* Header */}
            <header className="search-header">
                <div className="header-left">
                    <button className="back-btn" onClick={handleBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <div className="header-title">
                        <Users size={24} />
                        <h1>{t('findUsers')}</h1>
                    </div>
                </div>
                <div className="header-stats">
                    <span className="stat-badge">
                        <Users size={16} />
                        {results.length} {t('usersFound')}
                    </span>
                </div>
            </header>

            {/* Search & Filters Bar */}
            <div className="search-controls">
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
                        {activeFiltersCount > 0 && (
                            <span className="filter-count">{activeFiltersCount}</span>
                        )}
                        <ChevronDown size={16} className={showFilters ? 'rotated' : ''} />
                    </button>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="sort-select"
                    >
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
                <div className="filters-panel">
                    <div className="filter-group">
                        <label>{t('userType')}</label>
                        <div className="filter-options">
                            <button
                                className={`filter-chip ${roleFilter === '' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('')}
                            >
                                <Users size={14} />
                                {t('allUsers')}
                            </button>
                            <button
                                className={`filter-chip ${roleFilter === 'MAHASISWA' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('MAHASISWA')}
                            >
                                <GraduationCap size={14} />
                                {t('talent')}
                            </button>
                            <button
                                className={`filter-chip ${roleFilter === 'UMKM' ? 'active' : ''}`}
                                onClick={() => setRoleFilter('UMKM')}
                            >
                                <Building2 size={14} />
                                {t('client')}
                            </button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>{t('category')}</label>
                        <select
                            value={bidangFilter}
                            onChange={(e) => setBidangFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">{t('allCategories')}</option>
                            {bidangOptions.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    {(roleFilter || bidangFilter) && (
                        <button className="clear-filters-btn" onClick={clearFilters}>
                            <X size={16} />
                            {t('clearFilters')}
                        </button>
                    )}
                </div>
            )}

            {/* Results Grid */}
            <div className="results-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>{t('loadingUsers')}</p>
                    </div>
                ) : results.length === 0 ? (
                    <div className="empty-state">
                        <Users size={64} />
                        <h3>{t('noUsersFound')}</h3>
                        <p>{t('tryAdjustingFilters')}</p>
                        {(searchQuery || roleFilter || bidangFilter) && (
                            <button className="clear-btn" onClick={clearFilters}>
                                {t('clearFilters')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="users-grid">
                        {results.map((user) => (
                            <div
                                key={user.id}
                                className="user-card"
                                onClick={() => handleViewProfile(user.id)}
                            >
                                <div className="user-card-header">
                                    <div className="user-avatar">
                                        {user.profilePictureUrl ? (
                                            <img
                                                src={user.profilePictureUrl}
                                                alt={user.nama}
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
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
                                    {user.username && (
                                        <p className="user-username">@{user.username}</p>
                                    )}
                                    {user.headline && (
                                        <p className="user-headline">{user.headline}</p>
                                    )}

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

                                    <div className="user-stats">
                                        {user.averageRating > 0 && (
                                            <span className="stat-item rating">
                                                <Star size={14} />
                                                {user.averageRating.toFixed(1)}
                                            </span>
                                        )}
                                        {user.totalReviews > 0 && (
                                            <span className="stat-item reviews">
                                                <Award size={14} />
                                                {user.totalReviews} {t('reviews')}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="user-card-footer">
                                    <button className="view-profile-btn">
                                        {t('viewProfile')}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchUsers;
