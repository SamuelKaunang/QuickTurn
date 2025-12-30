import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './utils/apiConfig';
import './LoginPage.css';
import logoFull from './assets/logo/Logo full.png';

function RegistrationPageU() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleToggle = (role) => {
    navigate(role === 'CLIENT' ? '/registeru' : '/registerm');
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      setMessage('Harap isi semua kolom.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi password tidak cocok.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(api('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: name,
          email,
          password,
          role: 'UMKM'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Registrasi Client Berhasil! Silakan Login.");
        navigate('/login');
      } else {
        setMessage(data.message || "Registrasi Gagal");
      }
    } catch (err) {
      setMessage('Terjadi kesalahan saat menghubungi server.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      {/* LEFT PANEL: Branding & Visual */}
      <section className="left-panel">
        <div className="left-content-bg"></div>
        <div className="glass-overlay">
          <div className="brand-header">
            <img src={logoFull} alt="QuickTurn" className="brand-logo" />
          </div>

          <div className="hero-text-container">
            <h1 className="hero-title">
              Empowering your <br />
              <span className="highlight-text">digital future.</span>
            </h1>
            <p className="hero-desc">
              Platform workspace generasi terbaru. Aman, kenceng, dan didesain buat inovator kayak lo.
            </p>

            <div className="quote-block">
              <p className="quote-text">
                "Innovation distinguishes between a leader and a follower."
              </p>
              <p className="quote-author">STEVE JOBS</p>
            </div>
          </div>

          <div className="left-footer">
            <p>© 2025 QuickTurn Inc.</p>
            <div className="footer-links">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: Form */}
      <section className="right-panel">
        <div className="form-container">
          <div className="form-header">
            {message && <div className={`error-alert ${message.includes('Berhasil') ? 'success-alert' : ''}`}>{message}</div>}
            <h2>Registrasi Client</h2>
            <p>Buat akun baru dan temukan Talent terbaik untuk bisnis lo.</p>
          </div>

          <form onSubmit={handleRegistration} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Nama Lengkap / Nama Bisnis</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon-left">business</span>
                <input
                  id="name"
                  type="text"
                  placeholder="Masukkan nama lengkap atau nama bisnis"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon-left">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon-left">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password lo"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Konfirmasi Password</label>
              <div className="input-wrapper">
                <span className="material-symbols-outlined icon-left">lock</span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi password lo"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    borderColor: confirmPassword && (confirmPassword === password ? '#16a34a' : '#ef4444')
                  }}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <span className="material-symbols-outlined">
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Buat Akun'
              )}
            </button>
          </form>

          <div className="register-cta">
            <p>
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button className="role-btn active" disabled>Client</button>
            <button className="role-btn" onClick={() => handleRoleToggle('TALENT')}>Talent</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegistrationPageU;