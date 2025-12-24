import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardM.css';
import ProjectsM from './ProjectsM';
import ActiveProjectsM from './ActiveProjectsM';

const DashboardM = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("browse"); 
  const projectsRef = useRef(null);
  
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  
  // Stats
  const [availableProjectsCount, setAvailableProjectsCount] = useState(0);
  const [myApplicationsCount, setMyApplicationsCount] = useState(0);
  const [projectsDoneCount, setProjectsDoneCount] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

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
        
        fetchAvailableProjects(storedToken);
        fetchStudentStats(storedToken);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [navigate]);

  const fetchAvailableProjects = async (authToken) => {
      try {
          const response = await fetch("/api/projects", {
              headers: { "Authorization": `Bearer ${authToken}` }
          });
          const data = await response.json();
          if (response.ok) {
              setAvailableProjectsCount((data.data || []).length);
          }
      } catch (err) { console.error(err); }
  };

  const fetchStudentStats = async (authToken) => {
      try {
          const response = await fetch("/api/projects/participating", {
              headers: { "Authorization": `Bearer ${authToken}` }
          });
          const data = await response.json();
          
          if (response.ok) {
              const myProjects = data.data || [];
              setMyApplicationsCount(myProjects.length);
              
              const doneProjects = myProjects.filter(p => p.status === 'CLOSED');
              setProjectsDoneCount(doneProjects.length);
              
              const earnings = doneProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
              setTotalEarnings(earnings);
          }
      } catch (err) { console.error(err); }
  };

  const scrollToProjects = () => {
      if (activeTab !== 'browse') setActiveTab('browse');
      setTimeout(() => {
          projectsRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
  };

  const formatCompact = (number) => {
      return new Intl.NumberFormat('en-US', {
          notation: "compact",
          maximumFractionDigits: 2 
      }).format(number);
  };

  return (
    <div className="dashboardM">
      <header className={`headerM ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoM">QuickTurn</div>
        <nav>
          <ul className="nav-menuM">
            <li><a href="#" className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>Home</a></li>
            <li><a href="#" className={activeTab === 'active' ? 'active' : ''} onClick={() => setActiveTab('active')}>My Projects</a></li>
            <li><a href="#">Messages</a></li>
          </ul>
        </nav>
        <div className="header-rightM">
            {/* ✅ LINK TO FULL PROFILE PAGE */}
            <div 
                className="profile-btnM" 
                onClick={() => navigate('/profile-mahasiswa')} 
                style={{cursor:'pointer'}}
                title="Edit Profile"
            >
                <i className="fas fa-user"></i>
            </div>
            
            <div className="logout-btnM" style={{cursor:'pointer', marginLeft:'15px', color:'#ccc'}} 
                 onClick={() => {localStorage.clear(); navigate('/login')}}>
                 Logout
            </div>
        </div>
      </header>

      <main className="main-contentM">
        {activeTab === 'browse' && (
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
        )}

        <div className="stats-grid-new">
            <div className="stat-card-new">
                <div className="stat-icon-box red"><i className="fas fa-briefcase"></i></div>
                <h1>{availableProjectsCount}</h1>
                <p>Available Projects</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box green"><i className="fas fa-check-circle"></i></div>
                <h1>{projectsDoneCount}</h1> 
                <p>Projects Done</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box blue"><i className="fas fa-paper-plane"></i></div>
                <h1>{myApplicationsCount}</h1>
                <p>Applications Sent</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box purple"><i className="fas fa-wallet"></i></div>
                <h1>Rp {formatCompact(totalEarnings)}</h1>
                <p>Total Earnings</p>
            </div>
        </div>

        <div ref={projectsRef} style={{marginTop: '40px'}}>
            {activeTab === 'browse' ? (
                <ProjectsM token={token} />
            ) : (
                <ActiveProjectsM token={token} />
            )}
        </div>
      </main>
    </div>
  );
};

export default DashboardM;