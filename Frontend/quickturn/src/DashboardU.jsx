import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardU.css';
import ProjectsU from './ProjectsU';
import ApplicantsModalU from './ApplicantsModalU';
import ContractModal from './ContractModal'; // ✅ Import Contract Modal

const DashboardU = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]); 
  
  // Modals State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false); // ✅ Contract State
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (!storedToken || role !== "UMKM") {
        navigate("/login");
    } else {
        setToken(storedToken);
        setUser({ name: "UMKM User", role: role });
        fetchProjects(storedToken); 
    }
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

  // === STATS CALCULATION ===
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
      {/* HEADER */}
      <header className="headerU">
        <div className="logoU">QuickTurn</div>
        <div className="header-rightU">
           <span style={{marginRight:'15px', color:'#ccc'}}>Hello, UMKM</span>
           <div className="logout-btnU" onClick={()=>{localStorage.clear(); navigate('/login')}}>Logout</div>
        </div>
      </header>

      <main className="main-contentU">
        
        {/* STATS GRID */}
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

        {/* QUICK ACTIONS */}
        <div className="quick-actions-grid">
            <div className="action-card" onClick={() => navigate('/post-project')}>
                <div className="action-icon red"><i className="fas fa-plus"></i></div>
                <div>
                    <h3>Post Project Baru</h3>
                    <p>Buat lowongan untuk mahasiswa</p>
                </div>
            </div>
            <div className="action-card">
                <div className="action-icon red"><i className="fas fa-search"></i></div>
                <div>
                    <h3>Cari Talent</h3>
                    <p>Temukan mahasiswa berbakat</p>
                </div>
            </div>
            <div className="action-card">
                <div className="action-icon red"><i className="fas fa-chart-line"></i></div>
                <div>
                    <h3>Lihat Analytics</h3>
                    <p>Pantau performa project</p>
                </div>
            </div>
        </div>

        {/* PROJECT LIST */}
        <div className="section-titleU">
          <span>●</span> Project Terbaru
        </div>
        
        <ProjectsU 
            projects={projects} 
            token={token} 
            onRefresh={() => fetchProjects(token)}
            onViewApplicants={(id) => { setSelectedProjectId(id); setShowApplicantsModal(true); }} 
            onViewContract={(id) => { setSelectedProjectId(id); setShowContractModal(true); }} // ✅ Pass Contract Handler
        />
      </main>

      {/* APPLICANTS MODAL */}
      {showApplicantsModal && (
          <ApplicantsModalU 
              projectId={selectedProjectId}
              token={token}
              onClose={() => setShowApplicantsModal(false)}
              onAcceptSuccess={() => fetchProjects(token)}
          />
      )}

      {/* ✅ CONTRACT MODAL */}
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