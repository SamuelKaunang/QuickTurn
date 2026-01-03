import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './OAuth2Callback.css';

/**
 * OAuth2 Callback Component
 * This component handles the redirect from the backend after Google OAuth2 login.
 * It extracts the JWT token from the URL and stores it in localStorage.
 */
const OAuth2Callback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            setStatus('error');
            setError('Login gagal: ' + errorParam);
            setTimeout(() => navigate('/login'), 3000);
            return;
        }

        if (token) {
            try {
                // Store the JWT token in localStorage (same as normal login)
                localStorage.setItem('token', token);

                // Decode the token to get user info
                const payload = JSON.parse(atob(token.split('.')[1]));

                // Store user info
                localStorage.setItem('userId', payload.id);
                localStorage.setItem('role', payload.role);
                localStorage.setItem('nama', payload.nama);

                setStatus('success');

                // Redirect based on role
                setTimeout(() => {
                    const role = payload.role;
                    if (role === 'ADMIN') {
                        navigate('/dashboardadmin');
                    } else if (role === 'UMKM') {
                        navigate('/dashboardu');
                    } else {
                        navigate('/dashboardm');
                    }
                }, 1500);
            } catch (err) {
                console.error('Error processing OAuth token:', err);
                setStatus('error');
                setError('Token tidak valid');
                setTimeout(() => navigate('/login'), 3000);
            }
        } else {
            setStatus('error');
            setError('Token tidak ditemukan');
            setTimeout(() => navigate('/login'), 3000);
        }
    }, [searchParams, navigate]);

    return (
        <div className="oauth2-callback-container">
            <div className="oauth2-callback-card">
                {status === 'processing' && (
                    <>
                        <div className="oauth2-spinner"></div>
                        <h2>Memproses login...</h2>
                        <p>Harap tunggu sebentar</p>
                    </>
                )}
                {status === 'success' && (
                    <>
                        <div className="oauth2-success-icon">✓</div>
                        <h2>Login Berhasil!</h2>
                        <p>Mengalihkan ke dashboard...</p>
                    </>
                )}
                {status === 'error' && (
                    <>
                        <div className="oauth2-error-icon">✕</div>
                        <h2>Login Gagal</h2>
                        <p>{error}</p>
                        <p className="redirect-notice">Mengalihkan ke halaman login...</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuth2Callback;
