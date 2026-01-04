import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './OAuth2Callback.css';

/**
 * OAuth2 Callback Component
 * This component handles the redirect from the backend after Google OAuth2 login.
 * It extracts the JWT token from the URL and stores it in localStorage.
 * Design matches the QuickTurn Dashboard styling.
 */
const OAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');
        const isNewUser = searchParams.get('isNewUser') === 'true';

        if (errorParam) {
            setStatus('error');
            setError('Login failed: ' + errorParam);
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            try {
                // Store the JWT token in sessionStorage (same as normal login)
                sessionStorage.setItem('token', token);

                // Decode the token to get user info
                const payload = JSON.parse(atob(token.split('.')[1]));

                // Store user info
                sessionStorage.setItem('userId', payload.id);
                sessionStorage.setItem('role', payload.role);
                sessionStorage.setItem('nama', payload.nama);

                setStatus('success');

                // Redirect based on whether user is new (needs role selection) or existing
                setTimeout(() => {
                    if (isNewUser || payload.role === 'PENDING') {
                        // New user - redirect to role selection page
                        navigate('/select-role');
                    } else {
                        // Existing user - redirect to dashboard based on role
                        const role = payload.role;
                        if (role === 'ADMIN') {
                            navigate('/admin/dashboard');
                        } else if (role === 'UMKM' || role === 'UKM') {
                            navigate('/dashboardu');
                        } else {
                            navigate('/dashboardm');
                        }
                    }
                }, 1500);
            } catch (err) {
                console.error('Error processing OAuth token:', err);
                setStatus('error');
                setError('Invalid token received');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setStatus('error');
            setError('No token found in response');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="oauth2-callback-container">
            {/* Decorative background elements */}
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="oauth2-callback-card">
                {status === 'processing' && (
                    <>
                        <div className="oauth2-spinner"></div>
                        <h2>Processing Login...</h2>
                        <p>Please wait while we verify your account</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="oauth2-success-icon">✓</div>
                        <h2>Login Successful!</h2>
                        <p>Welcome back! Redirecting to your dashboard...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="oauth2-error-icon">✕</div>
                        <h2>Login Failed</h2>
                        <p>{error}</p>
                        <p className="redirect-notice">Redirecting to login page...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuth2Callback;
