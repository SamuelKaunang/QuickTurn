import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Briefcase, MessageSquare, Settings,
    LogOut, Search, Bell, ArrowUpRight, ArrowDownRight, Users,
    CheckCircle, Send, UserSearch
} from 'lucide-react';
import { api } from './utils/apiConfig';
import './DashboardM.css';
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';
import ProjectsM from './ProjectsM';
import ActiveProjectsM from './ActiveProjectsM';
import UserSearchModal from './UserSearchModal';
import RecentActivities from './RecentActivities';

// --- Sub-Components ---
const GlassCard = ({ children, className = "" }) => (
    <div className={`glass-card ${className}`}>{children}</div>
);

const StatCard = ({ label, value, change, positive, icon: Icon, colorClass }) => (
    <GlassCard className="stat-card">
        <div className="stat-header">
            <div className={`icon-wrapper ${colorClass}`}><Icon size={20} /></div>
            {change && (
                <span className={`stat-badge ${positive ? 'pos' : 'neg'}`}>
                    {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />} {change}
                </span>
            )}
        </div>
        <div className="stat-content">
            <h3 className="stat-value">{value}</h3>
            <p className="stat-label">{label}</p>
        </div>
    </GlassCard>
);

const DashboardM = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const projectsRef = useRef(null);

    const [user, setUser] = useState(null);
    const [token, setToken] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Stats from backend
    const [availableProjectsCount, setAvailableProjectsCount] = useState(0);
    const [myApplicationsCount, setMyApplicationsCount] = useState(0);
    const [userCategory, setUserCategory] = useState("");
    const [projectsDoneCount, setProjectsDoneCount] = useState(0);

    // Search Modal
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);



    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        const role = sessionStorage.getItem("role");
        const storedCategory = sessionStorage.getItem("bidang") || sessionStorage.getItem("category") || "";
        const userName = sessionStorage.getItem("name") || "Talent";

        if (!storedToken || role !== "MAHASISWA") {
            navigate("/login");
        } else {
            setToken(storedToken);
            setUser({ name: userName, role: role, profilePicture: null });
            setUserCategory(storedCategory);

            fetchAvailableProjects(storedToken);
            fetchStudentStats(storedToken);
            fetchUserProfile(storedToken);
            fetchUnreadCount(storedToken);
            // Poll for unread messages every 30 seconds
            const interval = setInterval(() => fetchUnreadCount(storedToken), 30000);
            return () => clearInterval(interval);
        }
    }, [navigate]);

    const fetchUserProfile = async (authToken) => {
        try {
            const response = await fetch(api("/api/users/profile"), {
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
            const response = await fetch(api("/api/chat/unread"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setUnreadCount(data.data.unreadCount || 0);
            }
        } catch (err) { console.error("Failed to fetch unread count", err); }
    };

    const fetchAvailableProjects = async (authToken) => {
        try {
            const response = await fetch(api("/api/projects"), {
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
            const response = await fetch(api("/api/projects/participating"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await response.json();

            if (response.ok) {
                const myProjects = data.data || [];
                setMyApplicationsCount(myProjects.length);

                const doneProjects = myProjects.filter(p => p.status === 'CLOSED');
                setProjectsDoneCount(doneProjects.length);
            }
        } catch (err) { console.error(err); }
    };

    const scrollToProjects = () => {
        if (activeTab !== 'browse') setActiveTab('browse');
        setTimeout(() => {
            projectsRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate("/login");
    };

    const stats = [
        {
            label: 'Available Projects',
            value: availableProjectsCount.toString(),
            change: null,
            positive: true,
            icon: Briefcase,
            colorClass: 'red'
        },
        {
            label: 'Projects Completed',
            value: projectsDoneCount.toString(),
            change: null,
            positive: true,
            icon: CheckCircle,
            colorClass: 'green'
        },
        {
            label: 'Applications Sent',
            value: myApplicationsCount.toString(),
            change: null,
            positive: true,
            icon: Send,
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
                            <p className="logo-subtext">Micro-Internships</p>
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
                            onClick={() => setActiveTab('browse')}
                            className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
                        >
                            <Search size={20} />
                            <span>Browse Projects</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`nav-item ${activeTab === 'active' ? 'active' : ''}`}
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
                            onClick={() => navigate('/profile-mahasiswa')}
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
                        <button className="notif-btn">
                            <Bell size={20} />
                            <span className="dot"></span>
                        </button>
                        <div
                            className="profile-pill"
                            onClick={() => navigate('/profile-mahasiswa')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="profile-info">
                                <p className="p-name">{user?.name || 'Talent'}</p>
                                <p className="p-status">Pro Level</p>
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
                                    <h2>Welcome back, {user?.name?.split(' ')[0] || 'Talent'}!</h2>
                                    <p>Time to build your portfolio and find your next opportunity.</p>
                                </div>
                                <button className="banner-btn" onClick={scrollToProjects}>
                                    <Search size={18} />
                                    Find Work
                                </button>
                            </div>

                            <div className="stats-grid">
                                {stats.map((s, i) => <StatCard key={i} {...s} />)}
                            </div>

                            <div className="grid-layout">
                                <div className="projects-section">
                                    <div className="section-header">
                                        <h3>Recommended Projects</h3>
                                        <button
                                            className="text-link"
                                            onClick={() => setActiveTab('browse')}
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="project-list-wrapper">
                                        <ProjectsM token={token} limit={4} userCategory={userCategory} />
                                    </div>
                                </div>

                                <div className="activity-section">
                                    <h3>Recent Activity</h3>
                                    <div className="activity-card-wrapper">
                                        <RecentActivities />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : activeTab === 'browse' ? (
                        <div className="fade-in" ref={projectsRef}>
                            <div className="page-header">
                                <h2>Browse Available Projects</h2>
                                <p>Find the perfect opportunity that matches your skills</p>
                            </div>
                            <ProjectsM token={token} userCategory={userCategory} />
                        </div>
                    ) : activeTab === 'active' ? (
                        <div className="fade-in">
                            <div className="page-header">
                                <h2>My Active Projects</h2>
                                <p>Track your ongoing work and submissions</p>
                            </div>
                            <ActiveProjectsM token={token} />
                        </div>
                    ) : (
                        <div className="under-construction">
                            <span className="emoji-icon">Under Construction</span>
                            <h3>Module {activeTab} is coming soon!</h3>
                        </div>
                    )}
                </section>
            </main>

            {/* User Search Modal */}
            <UserSearchModal
                isOpen={showSearchModal}
                onClose={() => setShowSearchModal(false)}
            />
        </div>
    );
};

export default DashboardM;