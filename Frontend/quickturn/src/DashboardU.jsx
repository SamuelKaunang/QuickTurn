import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardU.css';
import ProjectsU from './ProjectsU';
import ApplicantsModalU from './ApplicantsModalU';
import ContractModal from './ContractModal';

const DashboardU = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]); 
  
  // Modals State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);

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

  const fetchProjects = async (authToken) => {
      try {
          const t = authToken || token;
          const response = await fetch("/api/projects/my-projects", {
              headers: { "Authorization": `Bearer ${t}` }
          });
          const data = await response.json();
          if (response.ok) setProjects(data.data || []);
      } catch (err) { console.error(err); }
  };

  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'CLOSED').length;
  const totalApplicants = projects.reduce((acc, curr) => acc + (curr.applicantCount || 0), 0);
  
  const totalSpentRaw = projects
    .filter(p => p.status === 'CLOSED')
    .reduce((acc, curr) => acc + (Number(curr.budget) || 0), 0);

  const formatCompact = (number) => {
      return new Intl.NumberFormat('en-US', {
          notation: "compact",
          maximumFractionDigits: 2 
      }).format(number);
  };

  return (
    <div className="dashboardU">
      <header className={`headerU ${isScrolled ? 'scrolled' : ''}`}>
        <div className="logoU">QuickTurn</div>
        <nav>
          <ul className="nav-menuU">
            <li><a href="#" className="active">Home</a></li>
            <li><a href="#">My Projects</a></li>
            
            {/* ✅ UPDATED MESSAGES LINK */}
            <li>
                <span 
                    onClick={() => navigate('/chat')} 
                    style={{cursor: 'pointer', color: '#ccc', fontSize:'14px', transition:'0.3s'}}
                    onMouseOver={(e) => e.target.style.color='white'}
                    onMouseOut={(e) => e.target.style.color='#ccc'}
                >
                    Messages
                </span>
            </li>
          </ul>
        </nav>
        <div className="header-rightU">
           <div 
                className="profile-btnU" 
                onClick={() => navigate('/profile-umkm')} 
                style={{cursor:'pointer'}}
                title="Edit Profile"
            >
                <i className="fas fa-user"></i>
            </div>

           <div className="logout-btnU" style={{cursor:'pointer', marginLeft:'15px', color:'#ccc'}} 
                onClick={()=>{localStorage.clear(); navigate('/login')}}>
                Logout
           </div>
        </div>
      </header>

      <main className="main-contentU">
        <section className="heroU">
          <div className="hero-overlayU">
            <div className="hero-badgeU">🚀 HIRING</div>
            <h1>Percepat Proses Perekrutan</h1>
            <p>Posting lowongan pekerjaan dan temukan kandidat mahasiswa terbaik untuk bisnis Anda.</p>
            <div className="hero-btnsU">
              <button className="btn-primaryU" onClick={() => navigate('/post-project')}>
                <i className="fas fa-plus"></i> Post Project
              </button>
            </div>
          </div>
        </section>

        <div className="stats-grid-new">
            <div className="stat-card-new">
                <div className="stat-icon-box red"><i className="fas fa-briefcase"></i></div>
                <h1>{totalProjects}</h1>
                <p>Total Projects</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box green"><i className="fas fa-check-circle"></i></div>
                <h1>{completedProjects}</h1>
                <p>Completed</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box blue"><i className="fas fa-users"></i></div>
                <h1>{totalApplicants}</h1>
                <p>Applicants</p>
            </div>
            <div className="stat-card-new">
                <div className="stat-icon-box purple"><i className="fas fa-wallet"></i></div>
                <h1>{formatCompact(totalSpentRaw)}</h1> 
                <p>Total Spent (Rp)</p>
            </div>
        </div>

        <div className="section-titleU">
          <span>●</span> Project Terbaru
        </div>
        
        <ProjectsU 
            projects={projects} 
            token={token} 
            onRefresh={() => fetchProjects(token)}
            onViewApplicants={(id) => { setSelectedProjectId(id); setShowApplicantsModal(true); }} 
            onViewContract={(id) => { setSelectedProjectId(id); setShowContractModal(true); }} 
        />
      </main>

      {showApplicantsModal && (
          <ApplicantsModalU 
              projectId={selectedProjectId}
              token={token}
              onClose={() => setShowApplicantsModal(false)}
              onAcceptSuccess={() => fetchProjects(token)}
          />
      )}

      {showContractModal && (
          <ContractModal 
              projectId={selectedProjectId}
              token={token}
              onClose={() => setShowContractModal(false)}
          />
      )}
    </div>
  );
};

export default DashboardU;