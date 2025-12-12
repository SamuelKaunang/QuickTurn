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
    <div className="dashboardM">
      <header className={`headerM ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoM">QuickTurn</div>
        <nav>
          <ul className="nav-menuM">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">My Projects</a></li>
            <li><a href="#">My Applications</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-rightM">
          <i className="fas fa-bell" style={{ color: '#b3b3b3', cursor: 'pointer' }}></i>
          <div className="profile-btnM">
            <i className="fas fa-user"></i>
          </div>
           <div className="logoM">Mahasiswa</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-contentM">
        {/* Hero Section */}
        <section className="heroM">
          <div className="hero-overlayM">
            <div className="hero-badgeM">🔥 TRENDING</div>
            <h1>Temukan Project Impianmu</h1>
            <p>Bergabunglah dengan ribuan mahasiswa dan UMKM yang sudah sukses berkolaborasi. Mulai perjalananmu sekarang!</p>
            <div className="hero-btnsM">
              <button onClick={() => navigate('/postproject')} className="btn-primaryM">
                <i className="fas fa-plus"></i> Post Project
              </button>
              <button className="btn-glassM">
                <i className="fas fa-compass"></i> Explore
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-gridM">
          <div className="stat-cardM">
            <div className="stat-iconM red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueM">24</div>
            <div className="stat-labelM">Total Projects</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueM">18</div>
            <div className="stat-labelM">Completed</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueM">156</div>
            <div className="stat-labelM">Applications</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actionsM">
          <div className="action-cardM">
            <div className="action-iconM"><i className="fas fa-plus"></i></div>
            <div className="action-textM">
              <h3>Post Project Baru</h3>
              <p>Buat lowongan untuk mahasiswa</p>
            </div>
          </div>
          <div className="action-cardM">
            <div className="action-iconM"><i className="fas fa-search"></i></div>
            <div className="action-textM">
              <h3>Cari Talent</h3>
              <p>Temukan mahasiswa berbakat</p>
            </div>
          </div>
          <div className="action-cardM">
            <div className="action-iconM"><i className="fas fa-chart-line"></i></div>
            <div className="action-textM">
              <h3>Lihat Analytics</h3>
              <p>Pantau performa project</p>
            </div>
          </div>
        </div>

        {/* Projects Row: Open */}
        <div className="section-titleM">
          <span>●</span> Project Terbaru
          <div className="see-allM">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        <div className="projects-rowM">
          <div className="project-cardM">
            <div className="card-headerM design">
              <i className="fas fa-paint-brush"></i>
              <span className="card-statusM open">● OPEN</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">Desain</div>
              <div className="card-titleM">Desain Logo Modern untuk Coffee Shop</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 500.000</span>
                <span className="card-deadlineM">⏰ 5 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardM">
            <div className="card-headerM it">
              <i className="fas fa-code"></i>
              <span className="card-statusM open">● OPEN</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">IT / Web</div>
              <div className="card-titleM">Pembuatan Website Company Profile</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 2.500.000</span>
                <span className="card-deadlineM">⏰ 14 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardM">
            <div className="card-headerM marketing">
              <i className="fas fa-bullhorn"></i>
              <span className="card-statusM open">● OPEN</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">Marketing</div>
              <div className="card-titleM">Social Media Management 1 Bulan</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 1.200.000</span>
                <span className="card-deadlineM">⏰ 7 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardM">
            <div className="card-headerM">
              <i className="fas fa-video"></i>
              <span className="card-statusM open">● OPEN</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">Video</div>
              <div className="card-titleM">Video Promosi Produk UMKM</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 800.000</span>
                <span className="card-deadlineM">⏰ 10 hari lagi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Row: Ongoing */}
        <div className="section-titleM">
          <span>●</span> Sedang Berjalan
          <div className="see-allM">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        <div className="projects-rowM">
          <div className="project-cardM">
            <div className="card-headerM it">
              <i className="fas fa-mobile-alt"></i>
              <span className="card-statusM ongoing">● ONGOING</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">IT / Mobile</div>
              <div className="card-titleM">Aplikasi Kasir Android</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 3.000.000</span>
                <span className="card-deadlineM">Progress: 60%</span>
              </div>
            </div>
          </div>
          <div className="project-cardM">
            <div className="card-headerM design">
              <i className="fas fa-palette"></i>
              <span className="card-statusM ongoing">● ONGOING</span>
            </div>
            <div className="card-bodyM">
              <div className="card-categoryM">Desain</div>
              <div className="card-titleM">Branding Kit Lengkap</div>
              <div className="card-metaM">
                <span className="card-budgetM">Rp 1.500.000</span>
                <span className="card-deadlineM">Progress: 80%</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
