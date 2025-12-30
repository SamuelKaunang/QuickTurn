import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Briefcase, MessageSquare, Settings,
  LogOut, Search, Users, Plus,
  CheckCircle, FolderOpen, FileText
} from 'lucide-react';
import './DashboardU.css';
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';
import ProjectsU from './ProjectsU';
import ApplicantsModalU from './ApplicantsModalU';
import ContractModal from './ContractModal';
import UserSearchModal from './UserSearchModal';
import SubmissionViewModal from './SubmissionViewModal';

// --- Sub-Components ---
const GlassCard = ({ children, className = "" }) => (
  <div className={`glass-card ${className}`}>{children}</div>
);

const StatCard = ({ label, value, icon: Icon, colorClass }) => (
  <GlassCard className="stat-card">
    <div className="stat-header">
      <div className={`icon-wrapper ${colorClass}`}><Icon size={20} /></div>
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-label">{label}</p>
    </div>
  </GlassCard>
);

const DashboardU = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  // Modals State
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showSubmissionViewModal, setShowSubmissionViewModal] = useState(false);
  const [submissionViewProjectId, setSubmissionViewProjectId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  // Recent Activity
  const [recentActivity] = useState([
    { id: 1, text: "Posted new project", time: "2 hours ago", type: "post" },
    { id: 2, text: "Accepted applicant for project", time: "1 day ago", type: "accept" },
    { id: 3, text: "Project completed", time: "3 days ago", type: "done" },
  ]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role");
    const userName = sessionStorage.getItem("name") || "Client";

    if (!storedToken || role !== "UMKM") {
      navigate("/login");
    } else {
      setToken(storedToken);
      setUser({ name: userName, role: role, profilePicture: null });
      fetchProjects(storedToken);
      fetchUserProfile(storedToken);
      fetchUnreadCount(storedToken);
      fetchAnnouncements(storedToken);
      // Poll for unread messages every 30 seconds
      const interval = setInterval(() => fetchUnreadCount(storedToken), 30000);
      return () => clearInterval(interval);
    }
  }, [navigate]);

  const fetchAnnouncements = async (authToken) => {
    try {
      const res = await fetch("/api/announcements", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await res.json();
      if (res.ok) {
        setAnnouncements(data.data || []);
      }
    } catch (err) { console.error("Failed to fetch announcements", err); }
  };

  const fetchUserProfile = async (authToken) => {
    try {
      const response = await fetch("/api/users/profile", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (response.ok && data.data) {
        setUser(prev => ({
          ...prev,
          name: data.data.nama || prev?.name,
          profilePicture: data.data.profilePictureUrl
        }));
      }
    } catch (err) { console.error("Failed to fetch user profile", err); }
  };

  const fetchUnreadCount = async (authToken) => {
    try {
      const response = await fetch("/api/chat/unread", {
        headers: { "Authorization": `Bearer ${authToken}` }
      });
      const data = await response.json();
      if (response.ok && data.data) {
        setUnreadCount(data.data.unreadCount || 0);
      }
    } catch (err) { console.error("Failed to fetch unread count", err); }
  };

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

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  const handleViewSubmissions = (projectId) => {
    setSubmissionViewProjectId(projectId);
    setShowSubmissionViewModal(true);
  };

  // Stats calculation
  const totalProjects = projects.length;
  const completedProjects = projects.filter(p => p.status === 'CLOSED').length;
  // Only count applicants from OPEN projects (projects that haven't had an applicant accepted yet)
  const totalApplicants = projects
    .filter(p => p.status === 'OPEN')
    .reduce((acc, curr) => acc + (curr.applicantCount || 0), 0);

  const stats = [
    {
      label: 'Total Projects',
      value: totalProjects.toString(),
      icon: FolderOpen,
      colorClass: 'red'
    },
    {
      label: 'Completed',
      value: completedProjects.toString(),
      icon: CheckCircle,
      colorClass: 'green'
    },
    {
      label: 'Total Applicants',
      value: totalApplicants.toString(),
      icon: Users,
      colorClass: 'blue'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Background Blobs */}
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-inner">
          <div className="logo-section">
            <img src={logoQ} alt="QuickTurn" className="logo-icon-img" />
            <div>
              <img src={logoText} alt="QuickTurn" className="logo-text-img" />
              <p className="logo-subtext">Client Portal</p>
            </div>
          </div>

          <nav className="nav-menu">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
            >
              <Briefcase size={20} />
              <span>My Projects</span>
            </button>
            <button
              onClick={() => navigate('/chat')}
              className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
            >
              <div className="nav-item-icon-wrapper">
                <MessageSquare size={20} />
                {unreadCount > 0 && <span className="unread-dot"></span>}
              </div>
              <span>Messages</span>
              {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
            </button>
            <button
              onClick={() => setShowSearchModal(true)}
              className="nav-item"
            >
              <Users size={20} />
              <span>Find Users</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button
              className="nav-item settings-btn"
              onClick={() => navigate('/profile-umkm')}
            >
              <Settings size={18} />
              <span>Settings</span>
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="topbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">

            <div
              className="profile-pill"
              onClick={() => navigate('/profile-umkm')}
              style={{ cursor: 'pointer' }}
            >
              <div className="profile-info">
                <p className="p-name">{user?.name || 'Client'}</p>
                <p className="p-status">Partner</p>
              </div>
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="avatar-img"
                />
              ) : (
                <div className="avatar-placeholder">
                  <Users size={20} />
                </div>
              )}
            </div>
          </div>
        </header>

        <section className="content-body">
          {activeTab === 'dashboard' ? (
            <div className="fade-in">
              <div className="welcome-banner">
                <div className="banner-text">
                  <h2>Welcome back, {user?.name?.split(' ')[0] || 'Client'}!</h2>
                  <p>Manage your projects and find the best talent for your business.</p>
                </div>
                <button className="banner-btn" onClick={() => navigate('/post-project')}>
                  <Plus size={18} />
                  Post Project
                </button>
              </div>

              {/* Announcements Section - Positioned between welcome banner and stats */}
              <div className="announcements-section">
                <h3 className="text-lg font-bold mb-3" style={{ color: 'var(--slate-900)' }}>Latest Announcements</h3>
                <GlassCard className="p-4">
                  {announcements.length === 0 ? (
                    <p className="text-sm text-slate-500">No new announcements.</p>
                  ) : (
                    <div className="space-y-4">
                      {announcements.slice(0, 3).map(a => (
                        <div key={a.id} className="pb-3 border-b border-slate-200 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="w-2 h-2 rounded-full bg-brand"></span>
                            <h4 className="font-semibold text-sm" style={{ color: 'var(--slate-800)' }}>{a.title}</h4>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2">{a.content}</p>
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(a.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </GlassCard>
              </div>

              <div className="stats-grid">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
              </div>

              <div className="grid-layout">
                <div className="projects-section">
                  <div className="section-header">
                    <h3>Your Projects</h3>
                    <button
                      className="text-link"
                      onClick={() => setActiveTab('projects')}
                    >
                      View All
                    </button>
                  </div>
                  <div className="project-list-wrapper">
                    <ProjectsU
                      projects={projects.slice(0, 4)}
                      token={token}
                      onRefresh={() => fetchProjects(token)}
                      onViewApplicants={(id) => { setSelectedProjectId(id); setShowApplicantsModal(true); }}
                      onViewContract={(id) => { setSelectedProjectId(id); setShowContractModal(true); }}
                    />
                  </div>
                </div>

                <div className="activity-section">
                  <h3>Recent Activity</h3>
                  <GlassCard className="activity-card">
                    {recentActivity.map(log => (
                      <div key={log.id} className="activity-item">
                        <div className={`activity-dot ${log.type}`}></div>
                        <div className="activity-info">
                          <p>{log.text}</p>
                          <span>{log.time}</span>
                        </div>
                      </div>
                    ))}
                  </GlassCard>
                </div>
              </div>
            </div>
          ) : activeTab === 'projects' ? (
            <div className="fade-in">
              <div className="page-header">
                <h2>My Projects</h2>
                <p>Manage all your posted projects and applicants</p>
              </div>
              <ProjectsU
                projects={projects}
                token={token}
                onRefresh={() => fetchProjects(token)}
                onViewApplicants={(id) => { setSelectedProjectId(id); setShowApplicantsModal(true); }}
                onViewContract={(id) => { setSelectedProjectId(id); setShowContractModal(true); }}
                onViewSubmissions={handleViewSubmissions}
              />
            </div>
          ) : (
            <div className="under-construction">
              <span className="emoji-icon">Under Construction</span>
              <h3>Module {activeTab} is coming soon!</h3>
            </div>
          )}
        </section>
      </main>

      {/* Modals */}
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

      {/* User Search Modal */}
      <UserSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* Submission View Modal */}
      <SubmissionViewModal
        isOpen={showSubmissionViewModal}
        onClose={() => {
          setShowSubmissionViewModal(false);
          setSubmissionViewProjectId(null);
        }}
        projectId={submissionViewProjectId}
        token={token}
      />
    </div>
  );
};

export default DashboardU;