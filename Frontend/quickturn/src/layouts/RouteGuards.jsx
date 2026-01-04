import React, { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';

/**
 * ProtectedRoute - Protects routes that require authentication
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const location = useLocation();

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If roles are specified, check if user has permission
    if (allowedRoles.length > 0 && !allowedRoles.includes(role?.toUpperCase())) {
        // Redirect to appropriate dashboard based on role
        if (role === 'MAHASISWA') {
            return <Navigate to="/dashboardm" replace />;
        } else if (role === 'UMKM' || role === 'UKM') {
            return <Navigate to="/dashboardu" replace />;
        } else if (role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        return <Navigate to="/login" replace />;
    }

    return children;
};

/**
 * AuthRoute - For login/register pages
 * Redirects to dashboard if user is already authenticated
 * Prevents back navigation to protected pages after logout
 */
export const AuthRoute = ({ children }) => {
    const token = sessionStorage.getItem('token');
    const role = sessionStorage.getItem('role');
    const navigate = useNavigate();

    useEffect(() => {
        // Clear forward history to prevent going back to protected pages
        // This runs when user lands on auth pages
        window.history.pushState(null, '', window.location.href);

        const handlePopState = (e) => {
            // Prevent going forward to protected pages after logout
            if (!sessionStorage.getItem('token')) {
                window.history.pushState(null, '', window.location.href);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // If already logged in, redirect to appropriate dashboard
    if (token && role) {
        if (role === 'MAHASISWA') {
            return <Navigate to="/dashboardm" replace />;
        } else if (role === 'UMKM' || role === 'UKM') {
            return <Navigate to="/dashboardu" replace />;
        } else if (role === 'ADMIN') {
            return <Navigate to="/admin/dashboard" replace />;
        }
    }

    return children;
};

/**
 * Helper function to logout and clear session
 * Use this function for all logout actions
 */
export const performLogout = (navigate) => {
    // Clear all session data
    sessionStorage.clear();

    // Replace current history state to prevent back navigation
    window.history.replaceState(null, '', '/login');

    // Navigate to login
    navigate('/login', { replace: true });
};

export default { ProtectedRoute, AuthRoute, performLogout };
