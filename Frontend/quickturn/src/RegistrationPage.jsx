import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './RegistrationPage.css';
import { useNavigate } from 'react-router-dom';

function RegistrationPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegistration = async () => {
    if (!name) {
      setMessage('Harap isi nama.');
      return;
    }
    if (!email) {
      setMessage('Harap isi email.');
      return;
    }
    if (!password) {
      setMessage('Harap isi password.');
      return;
    }
    if (!confirmPassword) {
      setMessage('Harap konfirmasi password.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi password tidak cocok.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success === true) {
        navigate('/login');
      } else if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      setMessage('Terjadi kesalahan saat menghubungi server.');
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <h2>Registrasi</h2>
        <input
          type="text"
          placeholder="Nama Lengkap"
          className="registration-input-field"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          className="registration-input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <div className="registration-password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="registration-input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="registration-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🚫' : '👁️'}
          </button>
        </div>
        <div className="registration-confirm-password-wrapper">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Konfirmasi Password"
            className="registration-input-field"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value === password) {
                setPasswordMatch(true);
              } else if (e.target.value !== '') {
                setPasswordMatch(false);
              } else {
                setPasswordMatch(null);
              }
            }}
            style={{
              borderColor: passwordMatch === true ? 'green' : passwordMatch === false ? 'red' : 'initial',
            }}
          />
          <button
            type="button"
            className="registration-toggle-confirm-password"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? '🚫' : '👁️'}
          </button>
        </div>

        <button className="registration-button" onClick={handleRegistration}>Buat Akun</button>
        <p className="registration-message">{message}</p>
        <p className="registration-login-text">
          Sudah punya akun? <Link className="registration-login-link" to="/login">Login disini</Link>
        </p>
      </div>
    </div>
  );
}

export default RegistrationPage;