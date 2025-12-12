import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './DashboardM.css'; // Link to the CSS file
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="dashboard">
      <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logo">QuickTurn</div>
        <nav>
          <ul className="nav-menu">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">My Projects</a></li>
            <li><a href="#">My Applications</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-right">
          <i className="fas fa-bell" style={{ color: '#b3b3b3', cursor: 'pointer' }}></i>
          <div className="profile-btn">
            <i className="fas fa-user"></i>
          </div>
           <div className="logo">Mahasiswa</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-overlay">
            <div className="hero-badge">🔥 TRENDING</div>
            <h1>Temukan Project Impianmu</h1>
            <p>Bergabunglah dengan ribuan mahasiswa dan UMKM yang sudah sukses berkolaborasi. Mulai perjalananmu sekarang!</p>
            <div className="hero-btns">
              <button onClick={() => navigate('/postproject')} className="btn-primary">
                <i className="fas fa-plus"></i> Post Project
              </button>
              <button className="btn-glass">
                <i className="fas fa-compass"></i> Explore
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-gridM">
          <div className="stat-card">
            <div className="stat-icon red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-value">24</div>
            <div className="stat-label">Total Projects</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-value">18</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><i className="fas fa-users"></i></div>
            <div className="stat-value">156</div>
            <div className="stat-label">Applications</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="action-card">
            <div className="action-icon"><i className="fas fa-plus"></i></div>
            <div className="action-text">
              <h3>Post Project Baru</h3>
              <p>Buat lowongan untuk mahasiswa</p>
            </div>
          </div>
          <div className="action-card">
            <div className="action-icon"><i className="fas fa-search"></i></div>
            <div className="action-text">
              <h3>Cari Talent</h3>
              <p>Temukan mahasiswa berbakat</p>
            </div>
          </div>
          <div className="action-card">
            <div className="action-icon"><i className="fas fa-chart-line"></i></div>
            <div className="action-text">
              <h3>Lihat Analytics</h3>
              <p>Pantau performa project</p>
            </div>
          </div>
        </div>

        {/* Projects Row: Open */}
        <div className="section-title">
          <span>●</span> Project Terbaru
          <div className="see-all">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        <div className="projects-row">
          <div className="project-card">
            <div className="card-header design">
              <i className="fas fa-paint-brush"></i>
              <span className="card-status open">● OPEN</span>
            </div>
            <div className="card-body">
              <div className="card-category">Desain</div>
              <div className="card-title">Desain Logo Modern untuk Coffee Shop</div>
              <div className="card-meta">
                <span className="card-budget">Rp 500.000</span>
                <span className="card-deadline">⏰ 5 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-card">
            <div className="card-header it">
              <i className="fas fa-code"></i>
              <span className="card-status open">● OPEN</span>
            </div>
            <div className="card-body">
              <div className="card-category">IT / Web</div>
              <div className="card-title">Pembuatan Website Company Profile</div>
              <div className="card-meta">
                <span className="card-budget">Rp 2.500.000</span>
                <span className="card-deadline">⏰ 14 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-card">
            <div className="card-header marketing">
              <i className="fas fa-bullhorn"></i>
              <span className="card-status open">● OPEN</span>
            </div>
            <div className="card-body">
              <div className="card-category">Marketing</div>
              <div className="card-title">Social Media Management 1 Bulan</div>
              <div className="card-meta">
                <span className="card-budget">Rp 1.200.000</span>
                <span className="card-deadline">⏰ 7 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-card">
            <div className="card-header">
              <i className="fas fa-video"></i>
              <span className="card-status open">● OPEN</span>
            </div>
            <div className="card-body">
              <div className="card-category">Video</div>
              <div className="card-title">Video Promosi Produk UMKM</div>
              <div className="card-meta">
                <span className="card-budget">Rp 800.000</span>
                <span className="card-deadline">⏰ 10 hari lagi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Row: Ongoing */}
        <div className="section-title">
          <span>●</span> Sedang Berjalan
          <div className="see-all">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        <div className="projects-row">
          <div className="project-card">
            <div className="card-header it">
              <i className="fas fa-mobile-alt"></i>
              <span className="card-status ongoing">● ONGOING</span>
            </div>
            <div className="card-body">
              <div className="card-category">IT / Mobile</div>
              <div className="card-title">Aplikasi Kasir Android</div>
              <div className="card-meta">
                <span className="card-budget">Rp 3.000.000</span>
                <span className="card-deadline">Progress: 60%</span>
              </div>
            </div>
          </div>
          <div className="project-card">
            <div className="card-header design">
              <i className="fas fa-palette"></i>
              <span className="card-status ongoing">● ONGOING</span>
            </div>
            <div className="card-body">
              <div className="card-category">Desain</div>
              <div className="card-title">Branding Kit Lengkap</div>
              <div className="card-meta">
                <span className="card-budget">Rp 1.500.000</span>
                <span className="card-deadline">Progress: 80%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
