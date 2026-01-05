import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import { Mail, ArrowLeft, CheckCircle, Send, Shield } from 'lucide-react';
import './EmailVerificationRequired.css';

const EmailVerificationRequired = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isSending, setIsSending] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [error, setError] = useState('');

    // Get data passed from previous page
    const { action, email, returnPath } = location.state || {};
    const token = sessionStorage.getItem('token');

    const handleSendVerification = async () => {
        setIsSending(true);
        setError('');

        try {
            const response = await fetch(api('/api/auth/send-verification'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
            } else {
                setError(data.message || 'Gagal mengirim email verifikasi.');
            }
        } catch (err) {
            setError('Koneksi gagal. Silakan coba lagi.');
        } finally {
            setIsSending(false);
        }
    };

    const handleBack = () => {
        if (returnPath) {
            navigate(returnPath);
        } else {
            navigate(-1);
        }
    };

    const getActionText = () => {
        switch (action) {
            case 'apply':
                return 'melamar ke project';
            case 'post':
                return 'membuat project baru';
            default:
                return 'menggunakan fitur ini';
        }
    };

    return (
        <div className="email-required-wrapper">
            <div className="email-required-container">
                <div className="email-required-card">
                    {!emailSent ? (
                        <>
                            {/* Header Icon */}
                            <div className="email-icon-container">
                                <div className="email-icon-bg">
                                    <Mail size={48} />
                                </div>
                                <div className="shield-badge">
                                    <Shield size={20} />
                                </div>
                            </div>

                            {/* Title */}
                            <h1>Verifikasi Email Diperlukan</h1>

                            {/* Description */}
                            <p className="description">
                                Untuk {getActionText()}, Anda perlu memverifikasi alamat email Anda terlebih dahulu.
                                Ini membantu kami menjaga keamanan platform.
                            </p>

                            {/* Email Display */}
                            {email && (
                                <div className="email-display-box">
                                    <Mail size={18} />
                                    <span>{email}</span>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="error-message">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="action-buttons">
                                <button
                                    className="verify-btn primary"
                                    onClick={handleSendVerification}
                                    disabled={isSending}
                                >
                                    {isSending ? (
                                        <>
                                            <span className="spinner"></span>
                                            Mengirim...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            Kirim Email Verifikasi
                                        </>
                                    )}
                                </button>

                                <button
                                    className="verify-btn secondary"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft size={18} />
                                    Kembali
                                </button>
                            </div>

                            {/* Help Text */}
                            <p className="help-text">
                                Setelah memverifikasi email, Anda dapat kembali dan melanjutkan aktivitas Anda.
                            </p>
                        </>
                    ) : (
                        /* Email Sent Success State */
                        <>
                            <div className="success-icon-container">
                                <CheckCircle size={64} />
                            </div>

                            <h1>Email Verifikasi Terkirim!</h1>

                            <p className="description">
                                Kami telah mengirim link verifikasi ke:
                            </p>

                            <div className="email-display-box sent">
                                <Mail size={18} />
                                <span>{email}</span>
                            </div>

                            <div className="instructions-box">
                                <h3>Langkah Selanjutnya:</h3>
                                <ol>
                                    <li>Buka inbox email Anda</li>
                                    <li>Cari email dari <strong>QuickTurn</strong></li>
                                    <li>Klik tombol <strong>"Verify Email"</strong> di dalam email</li>
                                    <li>Kembali ke sini dan lanjutkan aktivitas Anda</li>
                                </ol>
                            </div>

                            <div className="action-buttons">
                                <button
                                    className="verify-btn secondary"
                                    onClick={handleBack}
                                >
                                    <ArrowLeft size={18} />
                                    Kembali ke Halaman Sebelumnya
                                </button>
                            </div>

                            <p className="help-text">
                                Tidak menerima email? Periksa folder spam atau{' '}
                                <button
                                    className="resend-link"
                                    onClick={handleSendVerification}
                                    disabled={isSending}
                                >
                                    kirim ulang
                                </button>
                            </p>
                        </>
                    )}
                </div>

                <div className="email-required-footer">
                    <p>© 2026 QuickTurn. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerificationRequired;
