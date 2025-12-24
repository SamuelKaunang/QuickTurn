import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegistrationPageM.css';

function RegistrationPageM() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  const handleRoleToggle = (role) => {
      navigate(role === 'UMKM' ? '/registeru' : '/registerm');
  };

  const handleRegistration = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setMessage('Harap isi semua kolom.');
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Password dan konfirmasi password tidak cocok.');
      return;
    }

    try {
      // 1. FIX: Use relative path (Proxy)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. FIX: Send the ROLE explicitly
        body: JSON.stringify({ 
            nama: name, 
            email, 
            password, 
            role: 'MAHASISWA' 
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Registrasi Berhasil! Silakan Login.");
        navigate('/login');
      } else {
        setMessage(data.message || "Registrasi Gagal");
      }
    } catch (err) {
      setMessage('Terjadi kesalahan saat menghubungi server.');
      console.error(err);
    }
  };

  return (
    <div className="registration-page">
      <div className="registration-container">
        <h2>Registrasi Mahasiswa</h2>
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
              setPasswordMatch(e.target.value === password);
            }}
            style={{
              borderColor: passwordMatch === true ? 'green' : passwordMatch === false ? 'red' : '#ccc',
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
      
      {/* Role Toggle at the bottom allows switching to UMKM */}
      <div className="role-toggle">
        <button className="role-btn" onClick={() => handleRoleToggle('UMKM')}>UMKM</button>
        <button className="role-btn active" disabled>Mahasiswa</button>
      </div>
    </div>
  );
}

export default RegistrationPageM;