import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage("Email dan password harus diisi");
      return;
    }
  
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
  
      const responseJson = await response.json();
  
      if (response.ok) {
        // Extract the data object from the response
        const data = responseJson.data;

        // 1. Save Token and Role
        localStorage.setItem('token', data.accessToken); 
        
        // Ensure role is uppercase to match logic below
        const role = data.role ? data.role.toUpperCase() : "";
        localStorage.setItem('role', role);

        // 2. Switch Page based on Role
        if (role === 'MAHASISWA') {
            navigate('/dashboardm');
        } 
        else if (role === 'UMKM' || role === 'UKM') {
            navigate('/dashboardu');
        } 
        else if (role === 'ADMIN') {
            navigate('/dashboardu'); 
        }
        else {
            // Fallback for unknown roles (defaults to Mahasiswa dashboard)
            navigate('/dashboardm');
        }

      } else {
        setMessage(responseJson.message || "Login gagal");
      }
    } catch (err) {
      setMessage("Terjadi kesalahan saat menghubungi server");
      console.error("Login error:", err);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          className="login-input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="login-password-wrapper">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            className="login-input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="login-toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? '🚫' : '👁️'}
          </button>
        </div>

        <button className="login-button" onClick={handleLogin}>Login</button>
        <p className="login-message">{message}</p>
        <p className="login-register-text">
          Belum punya akun? <Link className="login-register-link" to="/registerm">Daftar disini</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;