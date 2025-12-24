import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardM.css';
import ProjectsM from './ProjectsM';

const DashboardM = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const projectsRef = useRef(null); 
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");

  // --- INITIAL LOAD ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!storedToken || role !== "MAHASISWA") {
        navigate("/login");
    } else {
        setToken(storedToken);
        setUser({ name: "Mahasiswa User", role: role });
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const scrollToProjects = () => {
      projectsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLogout = () => {
      localStorage.clear();
      navigate('/login');
  };

  return (
    <div className="dashboardM">
      {/* HEADER */}
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
          <div className="profile-btnM"><i className="fas fa-user"></i></div>
          <div className="logout-btnM" onClick={handleLogout}>Logout</div>
        </div>
      </header>

      <main className="main-contentM">
        {/* HERO SECTION */}
        <section className="heroM">
          <div className="hero-overlayM">
            <div className="hero-badgeM">🔥 TRENDING</div>
            <h1>Temukan Project Impianmu</h1>
            <p>Bergabunglah dengan ribuan mahasiswa dan UMKM yang sudah sukses berkolaborasi.</p>
            <div className="hero-btnsM">
              <button className="btn-primaryM" onClick={scrollToProjects}>
                <i className="fas fa-compass"></i> Explore Projects
              </button>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <div className="stats-gridM">
          <div className="stat-cardM">
            <div className="stat-iconM red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueM">Active</div>
            <div className="stat-labelM">Status</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueM">0</div>
            <div className="stat-labelM">Completed</div>
          </div>
          <div className="stat-cardM">
            <div className="stat-iconM blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueM">0</div>
            <div className="stat-labelM">My Applications</div>
          </div>
        </div>

        {/* PROJECTS SECTION (Imported Component) */}
        <div ref={projectsRef}>
            <ProjectsM token={token} />
        </div>

      </main>
    </div>
  );
};

export default DashboardM;