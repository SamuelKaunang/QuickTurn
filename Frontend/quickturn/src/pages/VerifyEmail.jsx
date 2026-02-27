import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import { CheckCircle, XCircle, Loader, Mail } from 'lucide-react';
import './VerifyEmail.css';

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error', 'no-token'
    const [message, setMessage] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [countdown, setCountdown] = useState(3); // Countdown before redirect

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('no-token');
            setMessage('Link verifikasi tidak valid.');
            return;
        }

        verifyEmail(token);
    }, [searchParams]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (status === 'success' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'success' && countdown === 0) {
            handleGoToDashboard();
        }
    }, [status, countdown]);


    const verifyEmail = async (token) => {
        try {
            const response = await fetch(api(`/api/auth/verify-email?token=${token}`), {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setStatus('success');
                setMessage('Email Anda berhasil diverifikasi!');
                setUserEmail(data.data?.email || '');
            } else {
                setStatus('error');
                setMessage(data.message || 'Verifikasi gagal. Link mungkin sudah expired.');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    const handleGoToDashboard = () => {
        // Check sessionStorage for token (user might have the same tab session)
        const token = sessionStorage.getItem('token');
        const role = sessionStorage.getItem('role');

        if (token) {
            // Same tab/session - can go directly to dashboard
            if (role === 'MAHASISWA') {
                navigate('/dashboardm');
            } else if (role === 'UMKM' || role === 'UKM') {
                navigate('/dashboardu');
            } else if (role === 'ADMIN') {
                navigate('/admin');
            } else {
                navigate('/login', { state: { verificationSuccess: true } });
            }
        } else {
            // New tab - no session, redirect to login with success message
            navigate('/login', { state: { verificationSuccess: true } });
        }
    };

    return (
        <div className="verify-email-wrapper">
            <div className="verify-email-container">
                <div className="verify-email-card">
                    {status === 'loading' && (
                        <>
                            <div className="verify-icon loading">
                                <Loader size={48} className="spin" />
                            </div>
                            <h1>Memverifikasi Email...</h1>
                            <p>Mohon tunggu sebentar</p>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="verify-icon success">
                                <CheckCircle size={64} />
                            </div>
                            <h1>Verifikasi Berhasil!</h1>
                            <p>{message}</p>
                            {userEmail && (
                                <p className="email-display">
                                    <Mail size={16} /> {userEmail}
                                </p>
                            )}
                            <p className="redirect-notice">
                                Mengalihkan ke dashboard dalam <strong>{countdown}</strong> detik...
                            </p>
                            <button onClick={handleGoToDashboard} className="verify-btn primary">
                                Lanjut ke Dashboard Sekarang
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="verify-icon error">
                                <XCircle size={64} />
                            </div>
                            <h1>Verifikasi Gagal</h1>
                            <p>{message}</p>
                            <div className="verify-actions">
                                <Link to="/login" className="verify-btn secondary">
                                    Kembali ke Login
                                </Link>
                            </div>
                        </>
                    )}

                    {status === 'no-token' && (
                        <>
                            <div className="verify-icon error">
                                <XCircle size={64} />
                            </div>
                            <h1>Link Tidak Valid</h1>
                            <p>{message}</p>
                            <Link to="/login" className="verify-btn secondary">
                                Kembali ke Login
                            </Link>
                        </>
                    )}
                </div>

                <div className="verify-footer">
                    <p>© 2026 QuickTurn. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;

