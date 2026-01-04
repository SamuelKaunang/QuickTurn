import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/apiConfig';
import './SelectRole.css';
import logoFull from '../assets/logo/Logo full.png';

/**
 * SelectRole Component
 * This page is shown to new OAuth users who need to select their role (Client or Talent).
 * After role selection, user will be redirected to the appropriate dashboard.
 */
const SelectRole = () => {
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userName, setUserName] = useState('');

    useEffect(() => {
        // Get user name from localStorage (set during OAuth callback)
        const nama = localStorage.getItem('nama') || sessionStorage.getItem('nama') || 'there';
        setUserName(nama);

        // Check if user already has a role (shouldn't be on this page)
        const role = localStorage.getItem('role') || sessionStorage.getItem('role');
        if (role && role !== 'PENDING') {
            // Redirect to appropriate dashboard
            if (role === 'UMKM' || role === 'UKM') {
                navigate('/dashboardu');
            } else if (role === 'MAHASISWA') {
                navigate('/dashboardm');
            } else if (role === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        }
    }, [navigate]);

    const handleRoleSelect = async (role) => {
        setSelectedRole(role);
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');

            if (!token) {
                throw new Error('Token tidak ditemukan. Silakan login ulang.');
            }

            const response = await fetch(api('/api/auth/select-role'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: role })
            });

            const data = await response.json();

            if (response.ok && data.data) {
                // Update stored token with new one that has the role
                const newToken = data.data.accessToken;
                const newRole = data.data.role;

                // Update storage (use same storage as OAuth callback)
                if (localStorage.getItem('token')) {
                    localStorage.setItem('token', newToken);
                    localStorage.setItem('role', newRole);
                } else {
                    sessionStorage.setItem('token', newToken);
                    sessionStorage.setItem('role', newRole);
                }

                // Redirect based on selected role
                setTimeout(() => {
                    if (newRole === 'UMKM' || newRole === 'UKM') {
                        navigate('/dashboardu');
                    } else {
                        navigate('/dashboardm');
                    }
                }, 500);
            } else {
                throw new Error(data.message || 'Gagal memilih role. Silakan coba lagi.');
            }
        } catch (err) {
            console.error('Error selecting role:', err);
            setError(err.message || 'Terjadi kesalahan. Silakan coba lagi.');
            setSelectedRole(null);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="select-role-container">
            <div className="select-role-card">
                <div className="select-role-header">
                    <img src={logoFull} alt="QuickTurn" className="select-role-logo" />
                    <h1>Welcome, {userName}! 👋</h1>
                    <p>One last step! Tell us how you'd like to use QuickTurn:</p>
                </div>

                {error && (
                    <div className="select-role-error">
                        <span>⚠️</span> {error}
                    </div>
                )}

                <div className="role-options">
                    {/* Client Option */}
                    <button
                        className={`role-card client ${selectedRole === 'CLIENT' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('CLIENT')}
                        disabled={isLoading}
                    >
                        <div className="role-icon">🏢</div>
                        <div className="role-info">
                            <h3>I'm a Client</h3>
                            <p>I want to post projects and hire talented students for my business needs.</p>
                            <ul>
                                <li>✓ Post unlimited projects</li>
                                <li>✓ Browse verified talents</li>
                                <li>✓ Secure payment system</li>
                            </ul>
                        </div>
                        {selectedRole === 'CLIENT' && isLoading && (
                            <div className="role-loading">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </button>

                    {/* Talent Option */}
                    <button
                        className={`role-card talent ${selectedRole === 'TALENT' ? 'selected' : ''}`}
                        onClick={() => handleRoleSelect('TALENT')}
                        disabled={isLoading}
                    >
                        <div className="role-icon">🎓</div>
                        <div className="role-info">
                            <h3>I'm a Talent</h3>
                            <p>I'm a student looking to work on real projects and build my portfolio.</p>
                            <ul>
                                <li>✓ Apply to exciting projects</li>
                                <li>✓ Build real-world experience</li>
                                <li>✓ Earn while you learn</li>
                            </ul>
                        </div>
                        {selectedRole === 'TALENT' && isLoading && (
                            <div className="role-loading">
                                <div className="spinner"></div>
                            </div>
                        )}
                    </button>
                </div>

                <p className="select-role-note">
                    <strong>Note:</strong> This choice cannot be changed later. Choose wisely!
                </p>
            </div>
        </div>
    );
};

export default SelectRole;
