import React, { useState, useEffect } from 'react';
import './UserAvatar.css';

const UserAvatar = ({ src, name, size = 'default', className = '' }) => {
    const [imgError, setImgError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setImgError(false);
    }, [src]);

    const getInitials = (name) => {
        return name?.charAt(0)?.toUpperCase() || '?';
    };

    if (!src || imgError) {
        return (
            <div className={`user-avatar-initials size-${size} ${className}`}>
                {getInitials(name)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name || 'User'}
            className={`user-avatar-img size-${size} ${className}`}
            onError={() => setImgError(true)}
        />
    );
};

export default UserAvatar;
