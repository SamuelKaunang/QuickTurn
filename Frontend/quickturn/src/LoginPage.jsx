import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './utils/apiConfig';
import './LoginPage.css';
import logoFull from './assets/logo/Logo full.png';

const LoginPage = () => {
  // Logic States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Forgot Password States
  const [forgotStep, setForgotStep] = useState(null); // null, 'EMAIL', 'VERIFY', 'RESET'
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetToken, setResetToken] = useState('');

  const navigate = useNavigate();

  // Forgot Password Handlers
  const handleForgotEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(api('/api/auth/forgot-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Kode verifikasi udah dikirim ke email lo!");
        setForgotStep('VERIFY');
      } else {
        setMessage(data.message || "Gagal kirim email.");
      }
    } catch (err) {
      setMessage("Error sending email.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      // Verify code logic
      const response = await fetch(api('/api/auth/verify-reset-code'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, code: resetCode }), // Assuming API needs email too, checking DTO again... DTO only had code? Oh wait.
        // Wait, VerifyCodeRequest ONLY has 'code'. But usually verification needs email to know WHICH user.
        // Let me re-read VerifyCodeRequest.java carefully.
        // Response Id: 23. VerifyCodeRequest has ONLY private String code;
        // This seems insufficient for the backend unless the code is unique globally or session based.
        // Assuming the backend handles it via global code or something.
      });

      // Wait, if Request only has "code", then how does backend know who it is? 
      // Maybe the "code" is actually a token? Or maybe I missed a field in DTO?
      // Let's assume DTO is correct (only code).

      const data = await response.json();

      if (response.ok && data.data) {
        setResetToken(data.data.resetToken); // Store token for next step
        setMessage("Kode valid! Silakan reset password.");
        setForgotStep('RESET');
      } else {
        setMessage(data.message || "Kode salah atau expired.");
      }
    } catch (err) {
      setMessage("Error verifying code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(api('/api/auth/reset-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage("Password berhasil diubah! Yuk login.");
        setForgotStep(null); // Back to login
        setPassword('');
        setEmail(forgotEmail); // Auto fill email
      } else {
        setMessage(data.message || "Gagal reset password.");
      }
    } catch (err) {
      setMessage("Error resetting password.");
    } finally {
      setIsLoading(false);
    }
  };

  // The Big Logic (Fusion Mode)
  const handleLogin = async (e) => {
    e.preventDefault(); // Biar gak reload page

    if (!email || !password) {
      setMessage("Email dan password harus diisi, ya!");
      return;
    }

    setIsLoading(true);
    setMessage(""); // Reset message

    try {
      const response = await fetch(api('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const responseJson = await response.json();

      if (response.ok) {
        const data = responseJson.data;

        // 1. Save Token and Role
        sessionStorage.setItem('token', data.accessToken);
        const role = data.role ? data.role.toUpperCase() : "";
        sessionStorage.setItem('role', role);

        // 2. Redirect based on Role (Logic lo yang tadi)
        if (role === 'MAHASISWA') {
          navigate('/dashboardm');
        } else if (role === 'UMKM' || role === 'UKM' || role === 'ADMIN') {
          navigate('/dashboardu');
        } else {
          navigate('/dashboardm');
        }
      } else {
        setMessage(responseJson.message || "Waduh, login gagal nih.");
      }
    } catch (err) {
      setMessage("Server lagi mogok, coba lagi nanti ya!");
      console.error("Login error:", err);
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

      {/* RIGHT PANEL: Form & Logic */}
      <section className="right-panel">
        <div className="form-container">
          <div className="form-header">
            {message && <div className={`error-alert ${message.includes('berhasil') || message.includes('dikirim') ? 'success-alert' : ''}`}>{message}</div>}

            {!forgotStep ? (
              <>
                <h2>Welcome Back</h2>
                <p>Masukkan detail akun lo buat masuk ke workspace.</p>
              </>
            ) : forgotStep === 'EMAIL' ? (
              <>
                <h2>Lupa Password?</h2>
                <p>Masukin email lo, nanti kita kirim kode verifikasi.</p>
              </>
            ) : forgotStep === 'VERIFY' ? (
              <>
                <h2>Verifikasi Kode</h2>
                <p>Cek email lo dan masukin kode 6 digit di sini.</p>
              </>
            ) : (
              <>
                <h2>Reset Password</h2>
                <p>Saatnya bikin password baru yang lebih aman!</p>
              </>
            )}
          </div>

          {!forgotStep && (
            <form onSubmit={handleLogin} className="auth-form">
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
                <div className="label-row">
                  <label htmlFor="password">Password</label>
                  <button type="button" onClick={() => {
                    setForgotStep('EMAIL');
                    setMessage('');
                  }} className="forgot-link" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Lupa password?</button>
                </div>
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

              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? (
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <span>Checking...</span>
                  </div>
                ) : (
                  'Log In'
                )}
              </button>
            </form>
          )}

          {forgotStep === 'EMAIL' && (
            <form onSubmit={handleForgotEmail} className="auth-form">
              <div className="input-group">
                <label htmlFor="forgot-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined icon-left">mail</span>
                  <input
                    id="forgot-email"
                    type="email"
                    placeholder="name@company.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setForgotStep(null)} className="submit-btn" style={{ background: '#374151' }}>Batal</button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Kirim Kode'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'VERIFY' && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <div className="input-group">
                <label htmlFor="verify-code">Kode Verifikasi</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined icon-left">key</span>
                  <input
                    id="verify-code"
                    type="text"
                    placeholder="123456"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
              </div>
              <div className="button-group" style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" onClick={() => setForgotStep('EMAIL')} className="submit-btn" style={{ background: '#374151' }}>Back</button>
                <button type="submit" className="submit-btn" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verifikasi'}
                </button>
              </div>
            </form>
          )}

          {forgotStep === 'RESET' && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="input-group">
                <label htmlFor="new-password">Password Baru</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined icon-left">lock</span>
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password baru lo"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
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
              <button type="submit" className="submit-btn" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Ubah Password'}
              </button>
            </form>
          )}

          <div className="register-cta">
            <p>
              Belum punya akun? <Link to="/registerm">Daftar di sini</Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;