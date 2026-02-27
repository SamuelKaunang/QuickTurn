import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { api } from '../utils/apiConfig';
import { validators, getPasswordStrength } from '../utils/validators';
import { Timer, Shield, Sparkles, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import './LoginPage.css';
import logoFull from '../assets/logo/Logo full.png';

// Validation feedback component
const ValidationFeedback = ({ validation, show }) => {
  if (!show || validation.valid) return null;
  return (
    <div className="validation-feedback error">
      <XCircle size={14} />
      <span>{validation.message}</span>
    </div>
  );
};

// Password strength indicator component
const PasswordStrengthIndicator = ({ password }) => {
  const strength = getPasswordStrength(password);
  if (!password) return null;

  return (
    <div className="password-strength">
      <div className="strength-bar">
        <div
          className="strength-fill"
          style={{
            width: `${(strength.strength / 7) * 100}%`,
            backgroundColor: strength.color
          }}
        />
      </div>
      <span className="strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
};

function RegistrationPageM() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Track which fields have been touched (for showing validation)
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false
  });

  const navigate = useNavigate();
  const toast = useToast();

  // Real-time validation
  const validations = useMemo(() => ({
    name: validators.name(name),
    email: validators.email(email),
    password: validators.password(password),
    confirmPassword: validators.confirmPassword(confirmPassword, password)
  }), [name, email, password, confirmPassword]);

  // Check if form is valid
  const isFormValid = Object.values(validations).every(v => v.valid);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleRoleToggle = (role) => {
    navigate(role === 'CLIENT' ? '/registeru' : '/registerm');
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    // Mark all fields as touched to show validation
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });

    // Check validations
    if (!isFormValid) {
      // Find first error and show it
      const firstError = Object.values(validations).find(v => !v.valid);
      setMessage(firstError?.message || 'Please fix the errors in the form.');
      return;
    }

    if (!agreedToTerms) {
      setMessage('You must agree to the Terms & Conditions and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(api('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: 'MAHASISWA'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success('Registration successful! Please log in.', 'Congratulations!');
        navigate('/login');
      } else {
        setMessage(data.message || "Registration Failed");
      }
    } catch (err) {
      setMessage('An error occurred while connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <Helmet>
        <title>Daftar sebagai Talent Mahasiswa | QuickTurn</title>
        <meta name="description" content="Gabung QuickTurn sebagai mahasiswa, dapatkan proyek micro-internship berbayar, dan bangun portofolio karirmu sekarang." />
      </Helmet>
      {/* LEFT PANEL: Branding & Visual */}
      <section className="left-panel">
        <div className="left-content-bg"></div>
        <div className="glass-overlay">
          <div className="hero-text-container">
            <h1 className="hero-title">
              Empowering your <br />
              <span className="highlight-text">digital future.</span>
            </h1>
            <p className="hero-desc">
              The next-generation workspace platform. Secure, fast, and designed for innovators like you.
            </p>

            <div className="quote-block">
              <p className="quote-text">
                "Innovation distinguishes between a leader and a follower."
              </p>
              <p className="quote-author">STEVE JOBS</p>
            </div>

            <div className="login-feature-grid">
              <div className="login-feature-card red">
                <div className="feature-icon">
                  <Timer size={24} />
                </div>
                <div className="feature-content">
                  <h4>Quick Start</h4>
                  <p>Get matched with projects in minutes.</p>
                </div>
              </div>
              <div className="login-feature-card purple">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <div className="feature-content">
                  <h4>Verified Talents</h4>
                  <p>All talents are vetted/reviewed.</p>
                </div>
              </div>
              <div className="login-feature-card blue">
                <div className="feature-icon">
                  <Sparkles size={24} />
                </div>
                <div className="feature-content">
                  <h4>Real Impact</h4>
                  <p>Work on actual projects.</p>
                </div>
              </div>
              <div className="login-feature-card green">
                <div className="feature-icon">
                  <TrendingUp size={24} />
                </div>
                <div className="feature-content">
                  <h4>Grow Together</h4>
                  <p>Build your portfolio.</p>
                </div>
              </div>
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
          <div className="brand-logo-container">
            <img src={logoFull} alt="QuickTurn" className="brand-logo" />
          </div>
          <div className="form-header">
            {message && <div className={`error-alert ${message.includes('Berhasil') ? 'success-alert' : ''}`}>{message}</div>}
            <h2>Talent Registration</h2>
            <p>Create a new account and start your journey as a Talent.</p>
          </div>

          <form onSubmit={handleRegistration} className="auth-form">
            <div className="input-group">
              <label htmlFor="name">Full Name</label>
              <div className={`input-wrapper ${touched.name && !validations.name.valid ? 'input-error' : ''} ${touched.name && validations.name.valid ? 'input-valid' : ''}`}>
                <span className="material-symbols-outlined icon-left">person</span>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleBlur('name')}
                />
                {touched.name && validations.name.valid && (
                  <CheckCircle size={18} className="validation-icon valid" />
                )}
              </div>
              <ValidationFeedback validation={validations.name} show={touched.name} />
            </div>

            <div className="input-group">
              <label htmlFor="email">Email Address</label>
              <div className={`input-wrapper ${touched.email && !validations.email.valid ? 'input-error' : ''} ${touched.email && validations.email.valid ? 'input-valid' : ''}`}>
                <span className="material-symbols-outlined icon-left">mail</span>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                />
                {touched.email && validations.email.valid && (
                  <CheckCircle size={18} className="validation-icon valid" />
                )}
              </div>
              <ValidationFeedback validation={validations.email} show={touched.email} />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <div className={`input-wrapper ${touched.password && !validations.password.valid ? 'input-error' : ''} ${touched.password && validations.password.valid ? 'input-valid' : ''}`}>
                <span className="material-symbols-outlined icon-left">lock</span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 6 characters (letters + numbers)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
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
              <PasswordStrengthIndicator password={password} />
              <ValidationFeedback validation={validations.password} show={touched.password} />
            </div>

            <div className="input-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <div className={`input-wrapper ${touched.confirmPassword && !validations.confirmPassword.valid ? 'input-error' : ''} ${touched.confirmPassword && validations.confirmPassword.valid ? 'input-valid' : ''}`}>
                <span className="material-symbols-outlined icon-left">lock</span>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
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
                {touched.confirmPassword && validations.confirmPassword.valid && (
                  <CheckCircle size={18} className="validation-icon valid" style={{ right: '48px' }} />
                )}
              </div>
              <ValidationFeedback validation={validations.confirmPassword} show={touched.confirmPassword} />
            </div>

            <div className="terms-checkbox">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link to="/terms" target="_blank">Terms & Conditions</Link> and <Link to="/privacy" target="_blank">Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="loader-container">
                  <div className="spinner"></div>
                  <span>Creating...</span>
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="register-cta">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button className="role-btn" onClick={() => handleRoleToggle('CLIENT')}>Client</button>
            <button className="role-btn active" disabled>Talent</button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default RegistrationPageM;
