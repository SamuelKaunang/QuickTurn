import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardU.css';

// Import the component for the project list
import ProjectsU from './ProjectsU';

const DashboardU = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  // --- STATE ---
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]); 
  
  // Note: 'showModal' state is removed because we now navigate to a full page.

  // --- INITIAL LOAD ---
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!storedToken || role !== "UMKM") {
        navigate("/login");
    } else {
        setToken(storedToken);
        setUser({ name: "UMKM User", role: role });
        fetchProjects(storedToken); 
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  // --- FETCH DATA ---
  const fetchProjects = async (authToken) => {
      try {
          // Fallback to current token if argument not provided
          const t = authToken || token;
          const response = await fetch("/api/projects/my-projects", {
              headers: { "Authorization": `Bearer ${t}` }
          });
          const data = await response.json();
          if (response.ok) {
              setProjects(data.data || []);
          }
      } catch (err) {
          console.error("Failed to load projects", err);
      }
  };

  return (
    <div className="dashboardU">
      {/* HEADER */}
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
          <div className="profile-btnU"><i className="fas fa-user"></i></div>
        </div>
      </header>

      <main className="main-contentU">
        {/* HERO SECTION */}
        <section className="heroU">
          <div className="hero-overlayU ">
            <h1>Percepat proses perekrutan Anda</h1>
            <p>Posting lowongan pekerjaan dan temukan kandidat terbaik.</p>
            <div className="hero-btnsU">
              {/* UPDATED BUTTON: Navigates to the new PostProject page */}
              <button onClick={() => navigate('/post-project')} className="btn-primaryU">
                <i className="fas fa-plus"></i> Post Project
              </button>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <div className="stats-gridU">
          <div className="stat-cardU">
            <div className="stat-iconU red"><i className="fas fa-briefcase"></i></div>
            <div className="stat-valueU">{projects.length}</div>
            <div className="stat-labelU">Total Projects</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU green"><i className="fas fa-check-circle"></i></div>
            <div className="stat-valueU">0</div> 
            <div className="stat-labelU">Completed</div>
          </div>
          <div className="stat-cardU">
            <div className="stat-iconU blue"><i className="fas fa-users"></i></div>
            <div className="stat-valueU">0</div> 
            <div className="stat-labelU">Applicants</div>
          </div>
        </div>

        {/* PROJECT LIST SECTION */}
        <div className="section-titleU">
          <span>●</span> Project Terbaru
          <div className="see-allU">Lihat Semua <i className="fas fa-chevron-right"></i></div>
        </div>
        
        {/* Render the extracted component */}
        <ProjectsU projects={projects} />

      </main>
      
      {/* NO MODAL RENDER HERE ANYMORE */}
    </div>
  );
};

export default DashboardU;