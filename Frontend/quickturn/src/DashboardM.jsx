import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from './RouteGuards';
import {
    LayoutDashboard, Briefcase, MessageSquare, Settings,
    LogOut, Search, ArrowUpRight, ArrowDownRight, Users,
    CheckCircle, Send, UserSearch
} from 'lucide-react';
import { api } from './utils/apiConfig';
import { useSettings } from './SettingsContext';
import './DashboardM.css';
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';
import ProjectsM from './ProjectsM';
import ActiveProjectsM from './ActiveProjectsM';
import UserSearchModal from './UserSearchModal';
import SettingsModal from './SettingsModal';
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
    const [announcements, setAnnouncements] = useState([]);

    // Stats from backend
    const [availableProjectsCount, setAvailableProjectsCount] = useState(0);
    const [myApplicationsCount, setMyApplicationsCount] = useState(0);
    const [userCategory, setUserCategory] = useState("");
    const [projectsDoneCount, setProjectsDoneCount] = useState(0);

    // Search Modal
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showSettingsModal, setShowSettingsModal] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { t } = useSettings();



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
        performLogout(navigate);
    };

    const stats = [
        {
            label: t('availableProjects'),
            value: availableProjectsCount.toString(),
            change: null,
            positive: true,
            icon: Briefcase,
            colorClass: 'red'
        },
        {
            label: t('projectsCompleted'),
            value: projectsDoneCount.toString(),
            change: null,
            positive: true,
            icon: CheckCircle,
            colorClass: 'green'
        },
        {
            label: t('applicationsSent'),
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
                            <p className="logo-subtext">{t('microInternships')}</p>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                        >
                            <LayoutDashboard size={20} />
                            <span>{t('dashboard')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
                        >
                            <Search size={20} />
                            <span>{t('browseProjects')}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`nav-item ${activeTab === 'active' ? 'active' : ''}`}
                        >
                            <Briefcase size={20} />
                            <span>{t('myProjects')}</span>
                        </button>
                        <button
                            onClick={() => navigate('/chat')}
                            className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                        >
                            <div className="nav-item-icon-wrapper">
                                <MessageSquare size={20} />
                                {unreadCount > 0 && <span className="unread-dot"></span>}
                            </div>
                            <span>{t('messages')}</span>
                            {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
                        </button>
                        <button
                            onClick={() => navigate('/search-users')}
                            className={`nav-item ${activeTab === 'search-users' ? 'active' : ''}`}
                        >
                            <Users size={20} />
                            <span>{t('findUsers')}</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button
                            className="nav-item settings-nav"
                            onClick={() => setShowSettingsModal(true)}
                        >
                            <Settings size={18} />
                            <span>{t('settings')}</span>
                        </button>
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                <header className="topbar">
                    {/* Left side - Greeting/Branding */}
                    <div className="topbar-greeting">
                        <span className="greeting-text">{t('welcomeToQuickTurn')}</span>
                        <span className="greeting-divider">|</span>
                        <span className="greeting-role">{t('talentDashboard')}</span>
                    </div>

                    {/* Right side - Profile */}
                    <div className="topbar-actions">
                        <div
                            className="profile-pill"
                            onClick={() => navigate('/profile-mahasiswa')}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className="profile-info">
                                <p className="p-name">{user?.name || t('talent')}</p>
                                <p className="p-status">{t('proLevel')}</p>
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
                                    <h2>{t('welcomeBack')}, {user?.name?.split(' ')[0] || t('talent')}!</h2>
                                    <p>{t('buildPortfolio')}</p>
                                </div>
                                <button className="banner-btn" onClick={scrollToProjects}>
                                    <Search size={18} />
                                    {t('findWork')}
                                </button>
                            </div>

                            {/* Top Row: Announcements (Left) + Recent Activity (Right) */}
                            <div className="top-info-grid">
                                {/* Announcements Section */}
                                <div className="announcements-section">
                                    <div className="section-header-alt">
                                        <div className="section-icon announcement-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                                            </svg>
                                        </div>
                                        <h3>{t('latestAnnouncements')}</h3>
                                    </div>
                                    <div className="glass-card announcement-card">
                                        {announcements.length === 0 ? (
                                            <div className="empty-state">
                                                <p>{t('noAnnouncements')}</p>
                                            </div>
                                        ) : (
                                            <div className="announcement-list">
                                                {announcements.slice(0, 3).map((a, index) => (
                                                    <div key={a.id} className={`announcement-item ${index === 0 ? 'featured' : ''}`}>
                                                        <div className="announcement-dot"></div>
                                                        <div className="announcement-content">
                                                            <h4>{a.title}</h4>
                                                            <p>{a.content}</p>
                                                            <span className="announcement-date">
                                                                {new Date(a.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Recent Activity Section */}
                                <div className="activity-section-top">
                                    <div className="section-header-alt">
                                        <div className="section-icon activity-icon">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                                            </svg>
                                        </div>
                                        <h3>{t('recentActivity')}</h3>
                                    </div>
                                    <div className="glass-card activity-card-top">
                                        <RecentActivities />
                                    </div>
                                </div>
                            </div>

                            <div className="stats-grid">
                                {stats.map((s, i) => <StatCard key={i} {...s} />)}
                            </div>

                            {/* Full Width Projects Section */}
                            <div className="projects-section-full">
                                <div className="section-header">
                                    <h3>{t('recommendedProjects')}</h3>
                                    <button
                                        className="text-link"
                                        onClick={() => setActiveTab('browse')}
                                    >
                                        {t('viewAll')}
                                    </button>
                                </div>
                                <div className="project-grid-wrapper">
                                    <ProjectsM token={token} limit={6} userCategory={userCategory} />
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

            {/* Settings Modal */}
            <SettingsModal
                isOpen={showSettingsModal}
                onClose={() => setShowSettingsModal(false)}
            />
        </div>
    );
};

export default DashboardM;