import React from 'react';
import './Skeleton.css';

/**
 * Base Skeleton component with shimmer animation
 * @param {string} variant - 'default' | 'wave' | 'pulse' | 'glow'
 */
export const Skeleton = ({
    width = '100%',
    height = '20px',
    borderRadius = '8px',
    className = '',
    variant = 'default',
    style = {}
}) => (
    <div
        className={`skeleton ${variant !== 'default' ? variant : ''} ${className}`}
        style={{
            width,
            height,
            borderRadius,
            ...style
        }}
    />
);

/**
 * Text line skeleton
 */
export const SkeletonText = ({ lines = 1, gap = '10px', lastLineWidth = '60%' }) => (
    <div className="skeleton-text" style={{ gap }}>
        {Array.from({ length: lines }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === lines - 1 && lines > 1 ? lastLineWidth : '100%'}
                height="14px"
            />
        ))}
    </div>
);

/**
 * Avatar/Circle skeleton
 */
export const SkeletonAvatar = ({ size = '40px' }) => (
    <Skeleton
        width={size}
        height={size}
        borderRadius="50%"
        className="skeleton-avatar glow"
    />
);

/**
 * Button skeleton
 */
export const SkeletonButton = ({ width = '120px', height = '44px' }) => (
    <Skeleton
        width={width}
        height={height}
        borderRadius="12px"
        className="skeleton-button"
    />
);

/**
 * Input skeleton
 */
export const SkeletonInput = ({ width = '100%', height = '48px' }) => (
    <Skeleton
        width={width}
        height={height}
        borderRadius="12px"
        className="skeleton-input"
    />
);

/**
 * Stat Card Skeleton - Premium design
 */
export const SkeletonStatCard = () => (
    <div className="skeleton-stat-card">
        <div className="skeleton-stat-header">
            <Skeleton width="48px" height="48px" borderRadius="14px" variant="glow" />
            <Skeleton width="50px" height="24px" borderRadius="8px" />
        </div>
        <div className="skeleton-stat-content">
            <Skeleton width="80px" height="36px" borderRadius="6px" />
            <Skeleton width="120px" height="14px" borderRadius="4px" style={{ marginTop: '12px' }} />
        </div>
    </div>
);

/**
 * Project Card Skeleton - Premium design
 */
export const SkeletonProjectCard = () => (
    <div className="skeleton-project-card">
        <div className="skeleton-project-header">
            <Skeleton width="100px" height="28px" borderRadius="14px" variant="glow" />
            <Skeleton width="70px" height="24px" borderRadius="12px" />
        </div>
        <div className="skeleton-project-body">
            <Skeleton width="85%" height="24px" borderRadius="6px" />
            <Skeleton width="60%" height="16px" borderRadius="4px" style={{ marginTop: '12px' }} />
            <div className="skeleton-project-tags">
                <Skeleton width="70px" height="28px" borderRadius="14px" />
                <Skeleton width="90px" height="28px" borderRadius="14px" />
                <Skeleton width="60px" height="28px" borderRadius="14px" />
            </div>
            <Skeleton width="100%" height="60px" borderRadius="8px" style={{ marginTop: '8px' }} />
            <div className="skeleton-project-footer">
                <Skeleton width="120px" height="16px" borderRadius="4px" />
                <Skeleton width="100px" height="40px" borderRadius="12px" variant="glow" />
            </div>
        </div>
    </div>
);

/**
 * Activity Item Skeleton
 */
export const SkeletonActivityItem = () => (
    <div className="skeleton-activity-item">
        <Skeleton width="40px" height="40px" borderRadius="12px" variant="glow" />
        <div className="skeleton-activity-content">
            <Skeleton width="85%" height="16px" borderRadius="4px" />
            <Skeleton width="50%" height="12px" borderRadius="4px" />
        </div>
        <Skeleton width="60px" height="12px" borderRadius="4px" />
    </div>
);

/**
 * Profile Card Skeleton
 */
export const SkeletonProfileCard = () => (
    <div className="skeleton-profile-card">
        <div className="skeleton-profile-header">
            <SkeletonAvatar size="120px" />
            <div className="skeleton-profile-info">
                <Skeleton width="180px" height="28px" borderRadius="6px" />
                <Skeleton width="140px" height="18px" borderRadius="4px" />
                <Skeleton width="100px" height="16px" borderRadius="4px" />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <Skeleton width="80px" height="32px" borderRadius="16px" />
                    <Skeleton width="80px" height="32px" borderRadius="16px" />
                </div>
            </div>
        </div>
        <div className="skeleton-profile-body">
            <SkeletonText lines={3} gap="12px" />
        </div>
    </div>
);

/**
 * User Card Skeleton - For search results
 */
export const SkeletonUserCard = () => (
    <div className="skeleton-user-card">
        <SkeletonAvatar size="80px" />
        <Skeleton width="140px" height="22px" borderRadius="4px" />
        <Skeleton width="100px" height="16px" borderRadius="4px" />
        <div className="skeleton-skills-grid" style={{ justifyContent: 'center', marginTop: '8px' }}>
            <Skeleton width="60px" height="26px" borderRadius="13px" />
            <Skeleton width="80px" height="26px" borderRadius="13px" />
        </div>
        <Skeleton width="100%" height="40px" borderRadius="12px" style={{ marginTop: '12px' }} variant="glow" />
    </div>
);

/**
 * Chat Contact Skeleton
 */
export const SkeletonChatContact = () => (
    <div className="skeleton-chat-contact">
        <SkeletonAvatar size="52px" />
        <div className="skeleton-chat-info">
            <Skeleton width="140px" height="18px" borderRadius="4px" />
            <Skeleton width="100px" height="14px" borderRadius="4px" />
        </div>
        <Skeleton width="40px" height="12px" borderRadius="4px" />
    </div>
);

/**
 * Chat Message Skeleton
 */
export const SkeletonChatMessage = ({ isOwn = false }) => (
    <div className={`skeleton-chat-message ${isOwn ? 'own' : ''}`}>
        <Skeleton
            width={isOwn ? '180px' : '240px'}
            height="48px"
            borderRadius={isOwn ? '20px 20px 4px 20px' : '20px 20px 20px 4px'}
            className="skeleton-message-bubble"
        />
        <Skeleton
            width="50px"
            height="10px"
            borderRadius="4px"
            style={{ marginTop: '6px' }}
        />
    </div>
);

/**
 * Table Row Skeleton
 */
export const SkeletonTableRow = ({ columns = 4 }) => (
    <div className="skeleton-table-row">
        {Array.from({ length: columns }).map((_, i) => (
            <Skeleton
                key={i}
                width={i === 0 ? '30%' : `${60 / (columns - 1)}%`}
                height="18px"
                borderRadius="4px"
            />
        ))}
    </div>
);

/**
 * Form Group Skeleton
 */
export const SkeletonFormGroup = ({ labelWidth = '100px' }) => (
    <div className="skeleton-form-group">
        <Skeleton width={labelWidth} height="14px" borderRadius="4px" />
        <SkeletonInput />
    </div>
);

/* =========================================
   PAGE-LEVEL SKELETONS
   ========================================= */

/**
 * Dashboard Skeleton - Full page skeleton for dashboards
 */
export const SkeletonDashboard = () => (
    <div className="skeleton-dashboard">
        {/* Welcome Banner */}
        <div className="skeleton-welcome-banner">
            <div className="skeleton-banner-text">
                <Skeleton width="280px" height="36px" borderRadius="6px" />
                <Skeleton width="380px" height="18px" borderRadius="4px" />
            </div>
            <SkeletonButton width="160px" height="48px" />
        </div>

        {/* Stats Grid */}
        <div className="skeleton-stats-grid">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>

        {/* Grid Layout */}
        <div className="skeleton-grid-layout">
            {/* Projects Section */}
            <div className="skeleton-projects-section">
                <div className="skeleton-section-header">
                    <Skeleton width="180px" height="24px" borderRadius="6px" />
                    <Skeleton width="80px" height="16px" borderRadius="4px" />
                </div>
                <div className="skeleton-project-list">
                    <SkeletonProjectCard />
                    <SkeletonProjectCard />
                </div>
            </div>

            {/* Activity Section */}
            <div className="skeleton-activity-section">
                <Skeleton width="160px" height="24px" borderRadius="6px" style={{ marginBottom: '20px' }} />
                <div className="skeleton-activity-list">
                    <SkeletonActivityItem />
                    <SkeletonActivityItem />
                    <SkeletonActivityItem />
                    <SkeletonActivityItem />
                </div>
            </div>
        </div>
    </div>
);

/**
 * Projects List Skeleton
 */
export const SkeletonProjectsList = ({ count = 6 }) => (
    <div className="skeleton-projects-list">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonProjectCard key={i} />
        ))}
    </div>
);

/**
 * Profile Page Skeleton
 */
export const SkeletonProfilePage = () => (
    <div className="skeleton-profile-page">
        <div className="skeleton-profile-main">
            <div className="skeleton-profile-sidebar">
                <SkeletonProfileCard />
                <div className="skeleton-section">
                    <Skeleton width="100px" height="20px" borderRadius="4px" className="skeleton-section-title" />
                    <div className="skeleton-skills-grid">
                        <Skeleton width="80px" height="32px" borderRadius="16px" />
                        <Skeleton width="100px" height="32px" borderRadius="16px" />
                        <Skeleton width="70px" height="32px" borderRadius="16px" />
                        <Skeleton width="90px" height="32px" borderRadius="16px" />
                    </div>
                </div>
            </div>
            <div className="skeleton-profile-sections">
                <div className="skeleton-section">
                    <Skeleton width="120px" height="24px" borderRadius="6px" className="skeleton-section-title" />
                    <SkeletonText lines={4} gap="12px" />
                </div>
                <div className="skeleton-section">
                    <Skeleton width="140px" height="24px" borderRadius="6px" className="skeleton-section-title" />
                    <SkeletonProjectCard />
                    <SkeletonProjectCard />
                </div>
            </div>
        </div>
    </div>
);

/**
 * Search Users Page Skeleton
 */
export const SkeletonSearchUsers = () => (
    <div className="skeleton-search-page">
        <div className="skeleton-search-header">
            <SkeletonInput width="300px" />
            <SkeletonButton width="120px" />
        </div>
        <div className="skeleton-filter-bar">
            <Skeleton width="120px" height="40px" borderRadius="12px" />
            <Skeleton width="140px" height="40px" borderRadius="12px" />
            <Skeleton width="100px" height="40px" borderRadius="12px" />
            <Skeleton width="130px" height="40px" borderRadius="12px" />
        </div>
        <div className="skeleton-user-grid">
            <SkeletonUserCard />
            <SkeletonUserCard />
            <SkeletonUserCard />
            <SkeletonUserCard />
            <SkeletonUserCard />
            <SkeletonUserCard />
        </div>
    </div>
);

/**
 * Chat Page Skeleton
 */
export const SkeletonChatPage = () => (
    <div className="skeleton-chat-page">
        <div className="skeleton-chat-sidebar">
            <SkeletonInput height="44px" />
            <SkeletonChatContact />
            <SkeletonChatContact />
            <SkeletonChatContact />
            <SkeletonChatContact />
            <SkeletonChatContact />
        </div>
        <div className="skeleton-chat-main">
            <div className="skeleton-chat-header" style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <SkeletonAvatar size="48px" />
                <div style={{ flex: 1 }}>
                    <Skeleton width="140px" height="20px" borderRadius="4px" />
                    <Skeleton width="80px" height="14px" borderRadius="4px" style={{ marginTop: '6px' }} />
                </div>
            </div>
            <div className="skeleton-chat-messages">
                <SkeletonChatMessage />
                <SkeletonChatMessage isOwn />
                <SkeletonChatMessage />
                <SkeletonChatMessage />
                <SkeletonChatMessage isOwn />
            </div>
            <div className="skeleton-chat-input">
                <SkeletonInput />
                <SkeletonButton width="48px" height="48px" />
            </div>
        </div>
    </div>
);

/**
 * Login Page Skeleton
 */
export const SkeletonLoginPage = () => (
    <div className="skeleton-login-page">
        <div className="skeleton-login-left">
            <Skeleton width="200px" height="50px" borderRadius="8px" />
            <div style={{ marginTop: '40px' }}>
                <Skeleton width="250px" height="36px" borderRadius="6px" />
                <Skeleton width="180px" height="18px" borderRadius="4px" style={{ marginTop: '12px' }} />
            </div>
            <div style={{ marginTop: '32px' }}>
                <SkeletonFormGroup labelWidth="60px" />
                <SkeletonFormGroup labelWidth="80px" />
            </div>
            <SkeletonButton width="100%" height="52px" />
            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Skeleton width="100%" height="48px" borderRadius="12px" />
                <Skeleton width="100%" height="48px" borderRadius="12px" />
            </div>
        </div>
        <div className="skeleton-login-right">
            <Skeleton width="400px" height="400px" borderRadius="24px" variant="glow" />
        </div>
    </div>
);

/**
 * Post Project Page Skeleton
 */
export const SkeletonPostProject = () => (
    <div className="skeleton-post-project">
        <Skeleton width="200px" height="32px" borderRadius="6px" style={{ marginBottom: '32px' }} />
        <div className="skeleton-form-section">
            <Skeleton width="140px" height="24px" borderRadius="4px" style={{ marginBottom: '20px' }} />
            <SkeletonFormGroup labelWidth="100px" />
            <SkeletonFormGroup labelWidth="80px" />
            <div className="skeleton-form-group">
                <Skeleton width="100px" height="14px" borderRadius="4px" />
                <Skeleton width="100%" height="150px" borderRadius="12px" />
            </div>
        </div>
        <div className="skeleton-form-section">
            <Skeleton width="120px" height="24px" borderRadius="4px" style={{ marginBottom: '20px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <SkeletonFormGroup labelWidth="80px" />
                <SkeletonFormGroup labelWidth="90px" />
            </div>
        </div>
        <SkeletonButton width="100%" height="56px" />
    </div>
);

/**
 * Admin Dashboard Skeleton
 */
export const SkeletonAdminDashboard = () => (
    <div className="skeleton-admin-dashboard">
        <div className="skeleton-admin-header">
            <Skeleton width="200px" height="32px" borderRadius="6px" />
            <div style={{ display: 'flex', gap: '12px' }}>
                <SkeletonButton width="120px" />
                <SkeletonButton width="100px" />
            </div>
        </div>
        <div className="skeleton-admin-stats">
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
            <SkeletonStatCard />
        </div>
        <div className="skeleton-admin-table">
            <div className="skeleton-table-header">
                <Skeleton width="15%" height="16px" borderRadius="4px" />
                <Skeleton width="25%" height="16px" borderRadius="4px" />
                <Skeleton width="20%" height="16px" borderRadius="4px" />
                <Skeleton width="15%" height="16px" borderRadius="4px" />
                <Skeleton width="15%" height="16px" borderRadius="4px" />
            </div>
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
            <SkeletonTableRow columns={5} />
        </div>
    </div>
);

/**
 * Landing Page Skeleton
 */
export const SkeletonLandingPage = () => (
    <div className="skeleton-landing-page">
        <div className="skeleton-hero-section">
            <Skeleton width="600px" height="60px" borderRadius="8px" />
            <Skeleton width="500px" height="24px" borderRadius="4px" />
            <Skeleton width="400px" height="20px" borderRadius="4px" />
            <div className="skeleton-hero-buttons">
                <SkeletonButton width="160px" height="52px" />
                <SkeletonButton width="140px" height="52px" />
            </div>
        </div>
    </div>
);

export default Skeleton;
