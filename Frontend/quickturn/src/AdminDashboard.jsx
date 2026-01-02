import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { performLogout } from './RouteGuards';
import {
    LayoutDashboard, Users, Megaphone, LogOut,
    Shield, Trash2, PlusCircle, Search,
    Bold, Italic, List, Link as LinkIcon, Image as ImageIcon, AlignLeft,
    FileText, Activity, X, Flag
} from 'lucide-react';
import { api } from './utils/apiConfig';
import './DashboardM.css'; // Reusing existing beautiful styles
import logoQ from './assets/logo/logo Q.png';
import logoText from './assets/logo/logo text.png';

// Sub-components can remain in same file for simplicity or split later
const GlassCard = ({ children, className = "" }) => (
    <div className={`glass-card ${className}`}>{children}</div>
);

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('users'); // users, announcements
    const [adminName, setAdminName] = useState("Admin");
    const [token, setToken] = useState("");

    // Data States
    const [users, setUsers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({ totalUsers: 0, totalAnnouncements: 0, totalProjects: 0, pendingReports: 0 });

    // Logs Modal State
    const [showLogsModal, setShowLogsModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [projectLogs, setProjectLogs] = useState([]);

    // Inputs
    const [newAnnouncement, setNewAnnouncement] = useState({ title: "", content: "" });

    useEffect(() => {
        const storedToken = sessionStorage.getItem("token");
        const role = sessionStorage.getItem("role");

        if (!storedToken || role !== "ADMIN") {
            navigate("/login");
            return;
        }

        setToken(storedToken);
        setAdminName(sessionStorage.getItem("name") || "Administrator");

        // Initial Fetch
        fetchUsers(storedToken);
        fetchAnnouncements(storedToken);
        fetchProjects(storedToken);
        fetchPendingReports(storedToken);

    }, [navigate]);

    const fetchPendingReports = async (authToken) => {
        try {
            const res = await fetch(api("/api/reports/admin/pending-count"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setStats(prev => ({ ...prev, pendingReports: data.data.count || 0 }));
            }
        } catch (err) { console.error(err); }
    }

    const fetchUsers = async (authToken) => {
        try {
            const res = await fetch(api("/api/admin/users"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.data || []);
                setStats(prev => ({ ...prev, totalUsers: (data.data || []).length }));
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        }
    };

    const fetchAnnouncements = async (authToken) => {
        try {
            const res = await fetch(api("/api/announcements"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setAnnouncements(data.data || []);
                setStats(prev => ({ ...prev, totalAnnouncements: (data.data || []).length }));
            }
        } catch (err) {
            console.error("Error fetching announcements:", err);
        }
    }

    const fetchProjects = async (authToken) => {
        try {
            const res = await fetch(api("/api/admin/projects"), {
                headers: { "Authorization": `Bearer ${authToken}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProjects(data.data || []);
                setStats(prev => ({ ...prev, totalProjects: (data.data || []).length }));
            }
        } catch (err) {
            console.error("Error fetching projects:", err);
        }
    }

    const handleViewLogs = async (project) => {
        setSelectedProject(project);
        setShowLogsModal(true);
        setProjectLogs([]); // Clear previous
        try {
            const res = await fetch(api(`/api/admin/projects/${project.id}/logs`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setProjectLogs(data.data || []);
            }
        } catch (err) { /* Silently handle error */ }
    }

    const handleDeleteUser = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(api(`/api/admin/users/${userId}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                alert("User deleted");
                fetchUsers(token);
            }
        } catch (err) { /* Silently handle error */ }
    }

    const handleDeleteAnnouncement = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            const res = await fetch(api(`/api/announcements/${id}`), {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchAnnouncements(token);
            }
        } catch (err) { /* Silently handle error */ }
    }

    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(api(`/api/announcements`), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(newAnnouncement)
            });
            if (res.ok) {
                setNewAnnouncement({ title: "", content: "" });
                fetchAnnouncements(token);
                alert("Announcement Posted!");
            }
        } catch (err) { /* Silently handle error */ }
    }

    const handleLogout = () => {
        performLogout(navigate);
    };

    return (
        <div className="dashboard-container">
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <aside className="sidebar">
                <div className="sidebar-inner">
                    <div className="logo-section">
                        <img src={logoQ} alt="QuickTurn" className="logo-icon-img" />
                        <div>
                            <img src={logoText} alt="QuickTurn" className="logo-text-img" />
                            <p className="logo-subtext">Admin Panel</p>
                        </div>
                    </div>

                    <nav className="nav-menu">
                        <button onClick={() => setActiveTab('users')} className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
                            <Users size={20} /> <span>User Management</span>
                        </button>
                        <button onClick={() => setActiveTab('announcements')} className={`nav-item ${activeTab === 'announcements' ? 'active' : ''}`}>
                            <Megaphone size={20} /> <span>Announcements</span>
                        </button>
                        <button onClick={() => setActiveTab('projects')} className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}>
                            <FileText size={20} /> <span>Projects & Logs</span>
                        </button>
                        <button onClick={() => navigate('/admin/reports')} className="nav-item">
                            <Flag size={20} /> <span>User Reports</span>
                        </button>
                    </nav>

                    <div className="sidebar-footer">
                        <button className="logout-btn" onClick={handleLogout}>
                            <LogOut size={18} /> <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <h2 style={{ color: 'var(--slate-900)' }}>Admin Dashboard</h2>
                    <div className="profile-pill">
                        <Shield size={18} className="text-secondary" style={{ color: 'var(--slate-500)' }} />
                        <span style={{ color: 'var(--slate-900)', fontWeight: 'bold' }}>{adminName}</span>
                    </div>
                </header>

                <section className="content-body" style={{ paddingTop: '2rem' }}>
                    <div className="stats-grid mb-6">
                        <GlassCard className="stat-card">
                            <h3 className="stat-value" style={{ color: 'var(--slate-900)' }}>{stats.totalUsers}</h3>
                            <p className="stat-label" style={{ color: 'var(--slate-500)' }}>Total Users</p>
                        </GlassCard>
                        <GlassCard className="stat-card">
                            <h3 className="stat-value" style={{ color: 'var(--slate-900)' }}>{stats.totalProjects}</h3>
                            <p className="stat-label" style={{ color: 'var(--slate-500)' }}>Total Projects</p>
                        </GlassCard>
                        <GlassCard className="stat-card">
                            <h3 className="stat-value" style={{ color: 'var(--slate-900)' }}>{stats.totalAnnouncements}</h3>
                            <p className="stat-label" style={{ color: 'var(--slate-500)' }}>Announcements</p>
                        </GlassCard>
                        <GlassCard
                            className="stat-card pending-reports-card"
                            onClick={() => navigate('/admin/reports')}
                            style={{ cursor: 'pointer', border: '1px solid #feccae', background: '#fff7ed' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <h3 className="stat-value" style={{ color: '#c2410c' }}>{stats.pendingReports}</h3>
                                {stats.pendingReports > 0 && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ea580c' }}></span>}
                            </div>
                            <p className="stat-label" style={{ color: '#9a3412', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <Flag size={14} /> Pending Reports
                            </p>
                        </GlassCard>
                    </div>

                    {activeTab === 'users' && (
                        <div className="fade-in">
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--slate-900)' }}>All Users</h3>
                                <div className="overflow-x-auto">
                                    <table style={{ width: '100%', color: 'var(--slate-900)', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--slate-200)', textAlign: 'left' }}>
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Name</th>
                                                <th className="p-3">Email</th>
                                                <th className="p-3">Role</th>
                                                <th className="p-3">Valid?</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(u => (
                                                <tr key={u.id} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                                                    <td className="p-3 text-sm">{u.id}</td>
                                                    <td className="p-3 font-medium">{u.nama}</td>
                                                    <td className="p-3 text-sm opacity-70">{u.email}</td>
                                                    <td className="p-3"><span className={`badge ${u.role === 'MAHASISWA' ? 'bg-blue-500/20 text-blue-800' : 'bg-green-500/20 text-green-800'} px-2 py-1 rounded text-xs`}>{u.role}</span></td>
                                                    <td className="p-3">{u.enabled ? 'Active' : 'Banned'}</td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => handleDeleteUser(u.id)}
                                                            className="text-red-500 hover:text-red-700 p-2"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === 'announcements' && (
                        <div className="fade-in grid gap-8">
                            <GlassCard className="p-8">
                                <div className="mb-6">
                                    <h3 className="text-xl font-bold" style={{ color: 'var(--slate-900)', marginBottom: '0.25rem' }}>Post New Announcement</h3>
                                    <p className="text-sm" style={{ color: 'var(--slate-500)' }}>Broadcast updates to all users</p>
                                </div>

                                <form onSubmit={handlePostAnnouncement}>
                                    <div className="form-group">
                                        <label>
                                            Announcement Title <span style={{ color: 'var(--brand)' }}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g., System Maintenance"
                                            value={newAnnouncement.title}
                                            onChange={e => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>
                                            Message <span style={{ color: 'var(--brand)' }}>*</span>
                                        </label>
                                        <textarea
                                            placeholder="Write your announcement message here..."
                                            value={newAnnouncement.content}
                                            onChange={e => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            className="btn-brand"
                                        >
                                            <Megaphone size={18} /> Publish Announcement
                                        </button>
                                    </div>
                                </form>
                            </GlassCard>

                            <GlassCard className="p-8">
                                <h3 className="text-xl font-bold mb-6" style={{ color: 'var(--slate-900)' }}>Active Announcements</h3>

                                {announcements.length === 0 ? (
                                    <div className="text-center py-10 opacity-60">
                                        <Megaphone size={48} className="mx-auto mb-3 text-slate-300" />
                                        <p style={{ color: 'var(--slate-500)' }}>No active announcements yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {announcements.map(a => (
                                            <div key={a.id} className="p-5 rounded-xl border relative group transition-all duration-300 hover:shadow-md"
                                                style={{ borderColor: 'var(--slate-200)', background: 'rgba(255,255,255,0.6)' }}>
                                                <button
                                                    onClick={() => handleDeleteAnnouncement(a.id)}
                                                    className="absolute top-4 right-4 text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                                                    title="Delete Announcement"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <h4 className="font-bold text-lg mb-2" style={{ color: 'var(--slate-900)' }}>{a.title}</h4>
                                                <p className="text-sm leading-relaxed" style={{ color: 'var(--slate-700)' }}>{a.content}</p>
                                                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-400">
                                                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    Posted on {new Date(a.createdAt).toLocaleString()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </GlassCard>
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="fade-in">
                            <GlassCard className="p-6">
                                <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--slate-900)' }}>All Projects</h3>
                                <div className="overflow-x-auto">
                                    <table style={{ width: '100%', color: 'var(--slate-900)', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid var(--slate-200)', textAlign: 'left' }}>
                                                <th className="p-3">ID</th>
                                                <th className="p-3">Title</th>
                                                <th className="p-3">Category</th>
                                                <th className="p-3">Owner</th>
                                                <th className="p-3">Status</th>
                                                <th className="p-3">Posted On</th>
                                                <th className="p-3">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {projects.map(p => (
                                                <tr key={p.id} style={{ borderBottom: '1px solid var(--slate-200)' }}>
                                                    <td className="p-3 text-sm">{p.id}</td>
                                                    <td className="p-3 font-medium">{p.title}</td>
                                                    <td className="p-3 text-sm opacity-70">{p.category}</td>
                                                    <td className="p-3 font-medium text-brand">{p.owner ? p.owner.nama : 'Unknown'}</td>
                                                    <td className="p-3"><span className={`badge bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs`}>{p.status}</span></td>
                                                    <td className="p-3 text-sm opacity-70">{new Date(p.createdAt).toLocaleDateString()}</td>
                                                    <td className="p-3">
                                                        <button
                                                            onClick={() => handleViewLogs(p)}
                                                            className="text-blue-500 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                                                        >
                                                            <Activity size={16} /> Logs
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </GlassCard>
                        </div>
                    )}

                    {/* LOGS MODAL */}
                    {showLogsModal && selectedProject && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 fade-in" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                                <div className="p-5 border-b flex justify-between items-center bg-slate-50" style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                                    <div>
                                        <h3 className="font-bold text-lg" style={{ color: '#0f172a', margin: 0 }}>Activity Logs</h3>
                                        <p className="text-sm" style={{ color: '#64748b', marginTop: '4px' }}>Project: {selectedProject.title}</p>
                                    </div>
                                    <button
                                        onClick={() => setShowLogsModal(false)}
                                        className="text-slate-400 hover:text-slate-600"
                                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                                <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50" style={{ backgroundColor: '#f9fafb' }}>
                                    {projectLogs.length === 0 ? (
                                        <div className="text-center py-10 opacity-60" style={{ opacity: 1, color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                            <Activity size={40} className="mx-auto mb-2" style={{ color: '#cbd5e1' }} />
                                            <p style={{ color: '#64748b' }}>No activity logs found for this project.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {projectLogs.map(log => (
                                                <div key={log.id} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100" style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem', padding: '1rem', borderRadius: '0.75rem' }}>
                                                    <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0`}
                                                        style={{
                                                            width: '2rem', height: '2rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                            backgroundColor: log.type === 'PROJECT_POSTED' ? '#dbeafe' : log.type === 'APPLIED' ? '#f3e8ff' : '#dcfce7',
                                                            color: log.type === 'PROJECT_POSTED' ? '#2563eb' : log.type === 'APPLIED' ? '#7c3aed' : '#16a34a'
                                                        }}>
                                                        {log.type === 'PROJECT_POSTED' ? <PlusCircle size={16} /> :
                                                            log.type === 'APPLIED' ? <Users size={16} /> :
                                                                <Activity size={16} />}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium" style={{ color: '#0f172a', fontWeight: 500 }}>
                                                            <span className="font-bold" style={{ fontWeight: 700 }}>{log.type.replace('_', ' ')}</span> by {log.user ? log.user.nama : 'Unknown'}
                                                        </p>
                                                        <p className="text-sm" style={{ color: '#475569', fontSize: '0.875rem', marginTop: '0.25rem' }}>{log.description}</p>
                                                        <p className="text-xs" style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '0.5rem' }}>{new Date(log.createdAt).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t bg-white flex justify-end" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        onClick={() => setShowLogsModal(false)}
                                        className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 font-medium"
                                        style={{ padding: '0.5rem 1rem', backgroundColor: '#e2e8f0', color: '#334155', borderRadius: '0.5rem', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </section>
            </main>

        </div>
    );
};

export default AdminDashboard;
