import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './DashboardU.css'; // Link to the CSS file
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
    <div className="dashboardU">
      <header className={`headerU ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoU">QuickTurn</div>
        <nav>
          <ul className="nav-menuU">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#"> My Projects</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-rightU">
          <i className="fas fa-bell" style={{ color: '#b3b3b3', cursor: 'pointer' }}></i>
          <div className="profile-btnU">
            <i className="fas fa-user"></i>
          </div>
          <div className="logoU">UMKM</div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-contentU">
        {/* Hero Section */}
        <section className="heroU">
          <div className="hero-overlayU ">
            <h1>Percepat proses perekrutan Anda dengan kandidat yang sesuai</h1>
            <p>Ketika Anda memposting lowongan pekerjaan, kami akan mencocokkan Anda dengan kandidat yang relevan dari database kami.</p>
            <div className="hero-btnsU">
              <button onClick={() => navigate('/postproject')} className="btn-primaryU">
                <i className="fas fa-plus"></i> Post Project
              </button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <div className="stats-gridU">
          <div className="stat-cardU">
            <div className="stat-iconU red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueU">24</div>
            <div className="stat-labelU">Total Projects</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueU">18</div>
            <div className="stat-labelU">Completed</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueU">156</div>
            <div className="stat-labelU">Applicants</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actionsU">
          <div className="action-cardU">
            <div className="action-iconU"><i className="fas fa-plus"></i></div>
            <div className="action-textU">
              <h3>Post Project Baru</h3>
              <p>Buat lowongan untuk mahasiswa</p>
            </div>
          </div>
          <div className="action-cardU">
            <div className="action-iconU"><i className="fas fa-search"></i></div>
            <div className="action-textU">
              <h3>Cari Talent</h3>
              <p>Temukan mahasiswa berbakat</p>
            </div>
          </div>
          <div className="action-cardU">
            <div className="action-iconU"><i className="fas fa-chart-line"></i></div>
            <div className="action-textU">
              <h3>Lihat Analytics</h3>
              <p>Pantau performa project</p>
            </div>
          </div>
        </div>

        {/* Projects Row: Open */}
        <div className="section-titleU">
          <span>●</span> Project Terbaru
          <div className="see-allU">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        <div className="projects-rowU">
          <div className="project-cardU">
            <div className="card-headerU design">
              <i className="fas fa-paint-brush"></i>
              <span className="card-statusU open">● OPEN</span>
            </div>
            <div className="card-bodyU">
              <div className="card-categoryU">Desain</div>
              <div className="card-titleU">Desain Logo Modern untuk Coffee Shop</div>
              <div className="card-metaU">
                <span className="card-budgetU">Rp 500.000</span>
                <span className="card-deadlineU">⏰ 5 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardU">
            <div className="card-headerU it">
              <i className="fas fa-code"></i>
              <span className="card-statusU open">● OPEN</span>
            </div>
            <div className="card-bodyU">
              <div className="card-categoryU">IT / Web</div>
              <div className="card-titleU">Pembuatan Website Company Profile</div>
              <div className="card-metaU">
                <span className="card-budgetU">Rp 2.500.000</span>
                <span className="card-deadlineU">⏰ 14 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardU">
            <div className="card-headerU marketing">
              <i className="fas fa-bullhorn"></i>
              <span className="card-statusU open">● OPEN</span>
            </div>
            <div className="card-bodyU">
              <div className="card-categoryU">Marketing</div>
              <div className="card-titleU">Social Media Management 1 Bulan</div>
              <div className="card-metaU">
                <span className="card-budgetU">Rp 1.200.000</span>
                <span className="card-deadlineU">⏰ 7 hari lagi</span>
              </div>
            </div>
          </div>
          <div className="project-cardU">
            <div className="card-headerU">
              <i className="fas fa-video"></i>
              <span className="card-statusU open">● OPEN</span>
            </div>
            <div className="card-bodyU">
              <div className="card-categoryU">Video</div>
              <div className="card-titleU">Video Promosi Produk UMKM</div>
              <div className="card-metaU">
                <span className="card-budgetU">Rp 800.000</span>
                <span className="card-deadlineU">⏰ 10 hari lagi</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
