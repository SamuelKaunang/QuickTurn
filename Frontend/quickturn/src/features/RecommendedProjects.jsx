import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import { Sparkles, Star, Clock, Users, DollarSign, Calendar, Target, ChevronRight } from 'lucide-react';
import './RecommendedProjects.css';

/**
 * RecommendedProjects Component
 * Displays AI-recommended projects based on user's skills and category preferences.
 * Uses Content-Based Filtering algorithm from backend.
 */
const RecommendedProjects = ({ token, limit = 6, onViewAll }) => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (token) {
            fetchRecommendations();
        }
    }, [token]);

    const fetchRecommendations = async () => {
        try {
            setLoading(true);
            const response = await fetch(api(`/api/projects/recommendations?limit=${limit}`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProjects(data.data || []);
            } else {
                setError("Failed to load recommendations");
            }
        } catch (err) {
            setError("Connection error");
        } finally {
            setLoading(false);
        }
    };

    const getCategoryClass = (cat) => {
        if (!cat) return "design";
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        if (cat.includes("Video")) return "video";
        if (cat.includes("Writing")) return "writing";
        return "design";
    };

    const getComplexityInfo = (complexity) => {
        switch (complexity) {
            case 'BEGINNER':
                return { label: 'Beginner', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
            case 'EXPERT':
                return { label: 'Expert', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            default:
                return { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        }
    };

    const handleProjectClick = (projectId) => {
        // Navigate to project detail or open modal
        console.log("View project:", projectId);
    };

    if (loading) {
        return (
            <div className="recommended-section">
                <div className="recommended-header">
                    <div className="recommended-title">
                        <Sparkles size={20} className="sparkle-icon" />
                        <h3>Recommended For You</h3>
                    </div>
                </div>
                <div className="recommended-grid">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rec-card-skeleton">
                            <div className="skeleton-header"></div>
                            <div className="skeleton-body">
                                <div className="skeleton-line"></div>
                                <div className="skeleton-line short"></div>
                                <div className="skeleton-line"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error || projects.length === 0) {
        return null; // Don't show section if no recommendations
    }

    return (
        <div className="recommended-section">
            <div className="recommended-header">
                <div className="recommended-title">
                    <Sparkles size={20} className="sparkle-icon" />
                    <h3>Recommended For You</h3>
                    <span className="ai-badge">AI Powered</span>
                </div>
                {onViewAll && (
                    <button className="view-all-btn" onClick={onViewAll}>
                        View All <ChevronRight size={16} />
                    </button>
                )}
            </div>

            <div className="recommended-grid">
                {projects.map((project) => {
                    const complexityInfo = getComplexityInfo(project.complexity);

                    return (
                        <div
                            key={project.id}
                            className={`rec-card ${getCategoryClass(project.category)}`}
                            onClick={() => handleProjectClick(project.id)}
                        >
                            {/* Category Strip */}
                            <div className={`rec-card-accent ${getCategoryClass(project.category)}`}>
                                <span className="rec-category-label">{project.category}</span>
                            </div>

                            {/* Card Content */}
                            <div className="rec-card-content">
                                {/* Header with client info */}
                                <div className="rec-card-header">
                                    <div className="rec-client-info">
                                        {project.owner?.profilePictureUrl ? (
                                            <img
                                                src={project.owner.profilePictureUrl}
                                                alt={project.owner.nama}
                                                className="rec-client-avatar"
                                            />
                                        ) : (
                                            <div className="rec-client-avatar-placeholder">
                                                {project.owner?.nama?.charAt(0) || '?'}
                                            </div>
                                        )}
                                        <div className="rec-client-details">
                                            <span className="rec-client-name">{project.owner?.nama || 'Unknown'}</span>
                                            <span className="rec-client-rating">
                                                <Star size={12} fill="#f59e0b" strokeWidth={0} />
                                                {project.owner?.averageRating > 0
                                                    ? project.owner.averageRating.toFixed(1)
                                                    : 'New'}
                                            </span>
                                        </div>
                                    </div>
                                    <span
                                        className="rec-complexity-badge"
                                        style={{ backgroundColor: complexityInfo.bg, color: complexityInfo.color }}
                                    >
                                        <Target size={12} />
                                        {complexityInfo.label}
                                    </span>
                                </div>

                                {/* Title */}
                                <h4 className="rec-card-title">{project.title}</h4>

                                {/* Description */}
                                <p className="rec-card-desc">
                                    {project.description?.length > 80
                                        ? project.description.substring(0, 80) + '...'
                                        : project.description}
                                </p>

                                {/* Meta Info */}
                                <div className="rec-card-meta">
                                    <div className="rec-meta-item budget">
                                        <DollarSign size={14} />
                                        Rp {project.budget?.toLocaleString()}
                                    </div>
                                    <div className="rec-meta-item">
                                        <Calendar size={14} />
                                        {project.deadline}
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="rec-card-footer">
                                    {project.estimatedDuration && (
                                        <span className="rec-duration">
                                            <Clock size={12} />
                                            {project.estimatedDuration}
                                        </span>
                                    )}
                                    <span className="rec-appliers">
                                        <Users size={12} />
                                        {project.applicantCount || 0} applied
                                    </span>
                                </div>

                                {/* Match Indicator */}
                                <div className="rec-match-indicator">
                                    <Sparkles size={14} />
                                    <span>Best Match for You</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RecommendedProjects;
