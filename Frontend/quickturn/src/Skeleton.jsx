import React from 'react';
import './Skeleton.css';

/**
 * Base Skeleton component with shimmer animation
 */
export const Skeleton = ({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = '',
    style = {}
}) => (
    <div
        className={`skeleton ${className}`}
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
export const SkeletonText = ({ lines = 1, gap = '8px', lastLineWidth = '60%' }) => (
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
        className="skeleton-avatar"
    />
);

/**
 * Button skeleton
 */
export const SkeletonButton = ({ width = '100px', height = '36px' }) => (
    <Skeleton
        width={width}
        height={height}
        borderRadius="6px"
        className="skeleton-button"
    />
);

/**
 * Stat Card Skeleton
 */
export const SkeletonStatCard = () => (
    <div className="skeleton-stat-card">
        <div className="skeleton-stat-header">
            <Skeleton width="40px" height="40px" borderRadius="10px" />
        </div>
        <div className="skeleton-stat-content">
            <Skeleton width="60px" height="28px" borderRadius="4px" />
            <Skeleton width="100px" height="14px" borderRadius="4px" style={{ marginTop: '8px' }} />
        </div>
    </div>
);

/**
 * Project Card Skeleton
 */
export const SkeletonProjectCard = () => (
    <div className="skeleton-project-card">
        <div className="skeleton-project-header">
            <Skeleton width="80px" height="24px" borderRadius="12px" />
            <Skeleton width="60px" height="20px" borderRadius="10px" />
        </div>
        <div className="skeleton-project-body">
            <Skeleton width="90%" height="20px" borderRadius="4px" />
            <Skeleton width="70%" height="14px" borderRadius="4px" style={{ marginTop: '12px' }} />
            <Skeleton width="100%" height="50px" borderRadius="4px" style={{ marginTop: '16px' }} />
            <div className="skeleton-project-footer">
                <Skeleton width="100px" height="14px" borderRadius="4px" />
                <Skeleton width="80px" height="32px" borderRadius="6px" />
            </div>
        </div>
    </div>
);

/**
 * Activity Item Skeleton
 */
export const SkeletonActivityItem = () => (
    <div className="skeleton-activity-item">
        <Skeleton width="36px" height="36px" borderRadius="50%" />
        <div className="skeleton-activity-content">
            <Skeleton width="80%" height="14px" borderRadius="4px" />
            <Skeleton width="50%" height="12px" borderRadius="4px" style={{ marginTop: '6px' }} />
        </div>
    </div>
);

/**
 * Profile Card Skeleton
 */
export const SkeletonProfileCard = () => (
    <div className="skeleton-profile-card">
        <div className="skeleton-profile-header">
            <SkeletonAvatar size="100px" />
            <div className="skeleton-profile-info">
                <Skeleton width="150px" height="24px" borderRadius="4px" />
                <Skeleton width="100px" height="16px" borderRadius="4px" style={{ marginTop: '8px' }} />
                <Skeleton width="120px" height="14px" borderRadius="4px" style={{ marginTop: '8px' }} />
            </div>
        </div>
        <div className="skeleton-profile-body">
            <SkeletonText lines={3} />
        </div>
    </div>
);

/**
 * Chat Contact Skeleton
 */
export const SkeletonChatContact = () => (
    <div className="skeleton-chat-contact">
        <SkeletonAvatar size="48px" />
        <div className="skeleton-chat-info">
            <Skeleton width="120px" height="16px" borderRadius="4px" />
            <Skeleton width="80px" height="12px" borderRadius="4px" style={{ marginTop: '6px' }} />
        </div>
    </div>
);

/**
 * Chat Message Skeleton
 */
export const SkeletonChatMessage = ({ isOwn = false }) => (
    <div className={`skeleton-chat-message ${isOwn ? 'own' : ''}`}>
        <Skeleton
            width={isOwn ? '200px' : '250px'}
            height="40px"
            borderRadius="12px"
        />
        <Skeleton
            width="60px"
            height="10px"
            borderRadius="4px"
            style={{ marginTop: '4px', alignSelf: isOwn ? 'flex-end' : 'flex-start' }}
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
                width={`${100 / columns - 2}%`}
                height="16px"
                borderRadius="4px"
            />
        ))}
    </div>
);

/**
 * Dashboard Skeleton - Full page skeleton for dashboards
 */
export const SkeletonDashboard = () => (
    <div className="skeleton-dashboard">
        {/* Welcome Banner */}
        <div className="skeleton-welcome-banner">
            <div className="skeleton-banner-text">
                <Skeleton width="250px" height="32px" borderRadius="4px" />
                <Skeleton width="350px" height="16px" borderRadius="4px" style={{ marginTop: '12px' }} />
            </div>
            <SkeletonButton width="130px" height="42px" />
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
                    <Skeleton width="150px" height="20px" borderRadius="4px" />
                    <Skeleton width="60px" height="14px" borderRadius="4px" />
                </div>
                <div className="skeleton-project-list">
                    <SkeletonProjectCard />
                    <SkeletonProjectCard />
                </div>
            </div>

            {/* Activity Section */}
            <div className="skeleton-activity-section">
                <Skeleton width="130px" height="20px" borderRadius="4px" style={{ marginBottom: '16px' }} />
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
export const SkeletonProjectsList = ({ count = 4 }) => (
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
            <SkeletonProfileCard />
            <div className="skeleton-profile-sections">
                <div className="skeleton-section">
                    <Skeleton width="100px" height="20px" borderRadius="4px" />
                    <div style={{ marginTop: '16px' }}>
                        <SkeletonText lines={4} />
                    </div>
                </div>
                <div className="skeleton-section">
                    <Skeleton width="80px" height="20px" borderRadius="4px" />
                    <div className="skeleton-skills" style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Skeleton width="70px" height="28px" borderRadius="14px" />
                        <Skeleton width="90px" height="28px" borderRadius="14px" />
                        <Skeleton width="60px" height="28px" borderRadius="14px" />
                        <Skeleton width="80px" height="28px" borderRadius="14px" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Skeleton;
