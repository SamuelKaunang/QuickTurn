import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
    ArrowLeft, User, MapPin, Star, Briefcase, ExternalLink,
    Award, Phone, Globe, Linkedin, Github, GraduationCap, Clock
} from 'lucide-react';
import { api } from './utils/apiConfig';
import { Skeleton, SkeletonAvatar, SkeletonText } from './Skeleton';
import './PublicProfile.css';

const PublicProfile = () => {
    const { userId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = sessionStorage.getItem('token');
    const userRole = sessionStorage.getItem('role');

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [userId, token]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            const username = searchParams.get('username');

            let response;
            if (username) {
                response = await fetch(api(`/api/users/profile/username/${username}`), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } else {
                response = await fetch(api(`/api/users/profile/${userId}`), {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            }

            const data = await response.json();

            if (response.ok) {
                setProfile(data.data);
            } else {
                setError(data.message || 'User not found');
            }
        } catch (err) {
            setError('Failed to load profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        if (userRole === 'UMKM') {
            navigate('/dashboardu');
        } else {
            navigate('/dashboardm');
        }
    };



    if (loading) {
        return (
            <div className="public-profile-page">
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="profile-layout">
                    {/* Skeleton Sidebar */}
                    <div className="profile-sidebar">
                        <button onClick={handleBack} className="btn-back">
                            <ArrowLeft size={16} />
                            Back
                        </button>
                        <div className="profile-picture-section">
                            <div className="profile-picture-wrapper">
                                <SkeletonAvatar size="120px" />
                            </div>
                        </div>
                        <div className="sidebar-user-info">
                            <Skeleton width="150px" height="24px" borderRadius="4px" />
                            <Skeleton width="100px" height="16px" borderRadius="4px" style={{ marginTop: '8px' }} />
                            <Skeleton width="80px" height="28px" borderRadius="14px" style={{ marginTop: '12px' }} />
                        </div>
                        <div className="sidebar-stats">
                            <div className="skeleton-stat">
                                <Skeleton width="40px" height="24px" borderRadius="4px" />
                                <Skeleton width="50px" height="12px" borderRadius="4px" style={{ marginTop: '4px' }} />
                            </div>
                            <div className="skeleton-stat">
                                <Skeleton width="40px" height="24px" borderRadius="4px" />
                                <Skeleton width="50px" height="12px" borderRadius="4px" style={{ marginTop: '4px' }} />
                            </div>
                        </div>
                    </div>

                    {/* Skeleton Content */}
                    <div className="profile-content">
                        <div className="profile-header-section">
                            <Skeleton width="100px" height="32px" borderRadius="4px" />
                            <Skeleton width="250px" height="16px" borderRadius="4px" style={{ marginTop: '8px' }} />
                        </div>
                        <div className="info-card">
                            <div className="info-card-header">
                                <Skeleton width="20px" height="20px" borderRadius="4px" />
                                <Skeleton width="80px" height="20px" borderRadius="4px" />
                            </div>
                            <div className="info-card-body">
                                <SkeletonText lines={3} />
                            </div>
                        </div>
                        <div className="info-card">
                            <div className="info-card-header">
                                <Skeleton width="20px" height="20px" borderRadius="4px" />
                                <Skeleton width="120px" height="20px" borderRadius="4px" />
                            </div>
                            <div className="info-card-body">
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    <Skeleton width="70px" height="28px" borderRadius="14px" />
                                    <Skeleton width="90px" height="28px" borderRadius="14px" />
                                    <Skeleton width="60px" height="28px" borderRadius="14px" />
                                    <Skeleton width="80px" height="28px" borderRadius="14px" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="public-profile-page">
                <div className="bg-glow glow-1"></div>
                <div className="bg-glow glow-2"></div>
                <div className="error-state">
                    <h2>Profile Not Found</h2>
                    <p>{error}</p>
                    <button onClick={handleBack} className="btn-primary">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const skillsList = profile?.skills?.split(',').map(s => s.trim()).filter(s => s) || [];
    const isTalent = profile?.role === 'MAHASISWA';
    const accentColor = isTalent ? 'purple' : 'rose';

    return (
        <div className={`public-profile-page ${accentColor}`}>
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="profile-layout">
                {/* Left Sidebar */}
                <div className="profile-sidebar">
                    <button onClick={handleBack} className="btn-back">
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {/* Profile Picture */}
                    <div className="profile-picture-section">
                        <div className="profile-picture-wrapper">
                            {profile?.profilePictureUrl ? (
                                <img src={profile.profilePictureUrl} alt={profile.nama} className="profile-picture" />
                            ) : (
                                <div className="profile-picture-placeholder">
                                    <User size={56} />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="sidebar-user-info">
                        <h2>{profile?.nama}</h2>
                        {profile?.headline && <p className="headline">{profile.headline}</p>}
                        {profile?.username && <p className="username">@{profile.username}</p>}
                        <span className={`role-badge ${isTalent ? 'talent' : 'client'}`}>
                            {isTalent ? 'Talent' : 'Client'}
                        </span>
                    </div>

                    {/* Stats */}
                    <div className="sidebar-stats">
                        <div className="sidebar-stat">
                            <Star size={18} className="stat-icon" />
                            <div className="sidebar-stat-value">{profile?.averageRating?.toFixed(1) || '5.0'}</div>
                            <div className="sidebar-stat-label">Rating</div>
                        </div>
                        <div className="sidebar-stat">
                            <Award size={18} className="stat-icon" />
                            <div className="sidebar-stat-value">{profile?.totalReviews || 0}</div>
                            <div className="sidebar-stat-label">Reviews</div>
                        </div>
                    </div>

                    {/* Social Links Buttons for Talent - Direct Action Buttons */}
                    {isTalent && (profile?.linkedinUrl || profile?.githubUrl) && (
                        <div className="sidebar-actions">
                            {profile?.linkedinUrl && (
                                <a
                                    href={profile.linkedinUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-social linkedin"
                                >
                                    <Linkedin size={18} />
                                    LinkedIn Profile
                                </a>
                            )}
                            {profile?.githubUrl && (
                                <a
                                    href={profile.githubUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-social github"
                                >
                                    <Github size={18} />
                                    GitHub Profile
                                </a>
                            )}
                        </div>
                    )}
                </div>


                {/* Right Content */}
                <div className="profile-content">
                    <div className="profile-header-section">
                        <h1>Profile</h1>
                        <p>View detailed information about this {isTalent ? 'talent' : 'client'}</p>
                    </div>

                    {/* About Section */}
                    {profile?.bio && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <User size={20} />
                                <h3>About</h3>
                            </div>
                            <div className="info-card-body">
                                <p className="bio-text">{profile.bio}</p>
                            </div>
                        </div>
                    )}

                    {/* Education & Experience (Talent only) */}
                    {isTalent && (profile?.university || profile?.yearsExperience || profile?.availability) && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <GraduationCap size={20} />
                                <h3>Education & Experience</h3>
                            </div>
                            <div className="info-card-body">
                                <div className="info-grid">
                                    {profile?.university && (
                                        <div className="info-item">
                                            <span className="info-label">University</span>
                                            <span className="info-value">{profile.university}</span>
                                        </div>
                                    )}
                                    {profile?.yearsExperience !== undefined && profile?.yearsExperience > 0 && (
                                        <div className="info-item">
                                            <span className="info-label">Experience</span>
                                            <span className="info-value">{profile.yearsExperience} years</span>
                                        </div>
                                    )}
                                    {profile?.availability && (
                                        <div className="info-item">
                                            <span className="info-label">Availability</span>
                                            <span className="info-value availability-badge">{profile.availability}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Skills (Talent only) */}
                    {isTalent && skillsList.length > 0 && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <Briefcase size={20} />
                                <h3>Skills & Expertise</h3>
                            </div>
                            <div className="info-card-body">
                                <div className="skills-list">
                                    {skillsList.map((skill, index) => (
                                        <span key={index} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Business Information (Client only) - Always show for clients */}
                    {!isTalent && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <Briefcase size={20} />
                                <h3>Business Information</h3>
                            </div>
                            <div className="info-card-body">
                                <div className="info-grid">
                                    <div className="info-item">
                                        <span className="info-label">Company / Business Name</span>
                                        <span className="info-value">{profile?.university || profile?.nama || 'Not specified'}</span>
                                    </div>
                                    {profile?.bidang && (
                                        <div className="info-item">
                                            <span className="info-label">Industry / Field</span>
                                            <span className="info-value">{profile.bidang}</span>
                                        </div>
                                    )}
                                    <div className="info-item">
                                        <span className="info-label">Email</span>
                                        <span className="info-value">{profile?.email || 'Not available'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Contact Info */}
                    {(profile?.location || profile?.phone || profile?.address) && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <Phone size={20} />
                                <h3>Contact Information</h3>
                            </div>
                            <div className="info-card-body">
                                <div className="info-grid">
                                    {profile?.location && (
                                        <div className="info-item">
                                            <MapPin size={16} className="info-icon" />
                                            <span className="info-value">{profile.location}</span>
                                        </div>
                                    )}
                                    {profile?.phone && (
                                        <div className="info-item">
                                            <Phone size={16} className="info-icon" />
                                            <span className="info-value">{profile.phone}</span>
                                        </div>
                                    )}
                                    {profile?.address && (
                                        <div className="info-item full-width">
                                            <MapPin size={16} className="info-icon" />
                                            <span className="info-value">{profile.address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Online Presence */}
                    {(profile?.portfolioUrl || profile?.linkedinUrl || profile?.githubUrl) && (
                        <div className="info-card">
                            <div className="info-card-header">
                                <Globe size={20} />
                                <h3>Online Presence</h3>
                            </div>
                            <div className="info-card-body">
                                <div className="links-list">
                                    {profile?.portfolioUrl && (
                                        <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="link-item">
                                            <ExternalLink size={16} />
                                            <span>Portfolio / Website</span>
                                        </a>
                                    )}
                                    {profile?.linkedinUrl && (
                                        <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="link-item linkedin">
                                            <Linkedin size={16} />
                                            <span>LinkedIn Profile</span>
                                        </a>
                                    )}
                                    {profile?.githubUrl && (
                                        <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="link-item github">
                                            <Github size={16} />
                                            <span>GitHub Profile</span>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* No information message for clients with minimal profile */}
                    {!isTalent && !profile?.bio && !profile?.location && !profile?.phone && !profile?.address && !profile?.portfolioUrl && (
                        <div className="info-card empty-profile-notice">
                            <div className="info-card-body">
                                <p className="empty-notice-text">
                                    This client hasn't added detailed profile information yet.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PublicProfile;
