import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, User, Star, Briefcase } from 'lucide-react';
import { api } from './utils/apiConfig';
import './UserSearchModal.css';

const UserSearchModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [roleFilter, setRoleFilter] = useState('');

    const token = sessionStorage.getItem('token');

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);

        try {
            let url = `/api/users/search?query=${encodeURIComponent(searchQuery)}`;
            if (roleFilter) {
                url += `&role=${roleFilter}`;
            }

            const response = await fetch(api(url), {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data.data || []);
            } else {
                setResults([]);
            }
        } catch (err) {
            console.error(err);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleViewProfile = (userId) => {
        onClose();
        navigate(`/profile/${userId}`);
    };

    const handleClose = () => {
        setSearchQuery('');
        setResults([]);
        setSearched(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="search-modal-overlay" onClick={handleClose}>
            <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                <div className="search-modal-header">
                    <h2>Find Users</h2>
                    <button className="close-btn" onClick={handleClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="search-modal-body">
                    <div className="search-input-group">
                        <div className="search-input-wrapper">
                            <Search size={18} className="search-icon" />
                            <input
                                type="text"
                                placeholder="Search by name or username..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                                autoFocus
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="role-filter"
                        >
                            <option value="">All Users</option>
                            <option value="MAHASISWA">Talent</option>
                            <option value="UMKM">Client</option>
                        </select>
                        <button className="search-btn" onClick={handleSearch} disabled={loading}>
                            {loading ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    <div className="search-results">
                        {loading && (
                            <div className="loading-indicator">
                                <div className="spinner-small"></div>
                                <span>Searching...</span>
                            </div>
                        )}

                        {!loading && searched && results.length === 0 && (
                            <div className="no-results">
                                <User size={40} />
                                <p>No users found for "{searchQuery}"</p>
                            </div>
                        )}

                        {!loading && results.length > 0 && (
                            <div className="results-list">
                                {results.map((user) => (
                                    <div
                                        key={user.id}
                                        className="result-item"
                                        onClick={() => handleViewProfile(user.id)}
                                    >
                                        <div className="result-avatar">
                                            <User size={24} />
                                        </div>
                                        <div className="result-info">
                                            <h4>{user.nama}</h4>
                                            {user.username && <p className="username">@{user.username}</p>}
                                            <div className="result-meta">
                                                <span className={`role-tag ${user.role?.toLowerCase()}`}>
                                                    {user.role === 'MAHASISWA' ? 'Talent' : 'Client'}
                                                </span>
                                                {user.bidang && (
                                                    <span className="bidang-tag">
                                                        <Briefcase size={12} />
                                                        {user.bidang}
                                                    </span>
                                                )}
                                                {user.averageRating > 0 && (
                                                    <span className="rating-tag">
                                                        <Star size={12} />
                                                        {user.averageRating.toFixed(1)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button className="view-profile-btn">View</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSearchModal;
