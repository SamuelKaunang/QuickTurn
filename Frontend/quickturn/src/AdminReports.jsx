import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Flag, AlertTriangle, Bug, FileWarning, Users, CreditCard,
    HelpCircle, Clock, CheckCircle, XCircle, Eye, Search, Filter,
    ChevronDown, MessageSquare, ExternalLink, Image
} from 'lucide-react';
import { useToast } from './Toast';
import { api } from './utils/apiConfig';
import './AdminReports.css';

const AdminReports = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const token = sessionStorage.getItem("token");
    const userRole = sessionStorage.getItem("role");

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterType, setFilterType] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [pendingCount, setPendingCount] = useState(0);

    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        if (userRole !== 'ADMIN') {
            toast.error('Access denied. Admin only.', 'Unauthorized');
            navigate('/');
            return;
        }
        fetchReports();
        fetchPendingCount();
    }, [token, userRole, navigate]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await fetch(api("/api/reports/admin/all"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setReports(data.data);
            } else {
                toast.error(data.message || 'Failed to fetch reports', 'Error');
            }
        } catch (err) {
            toast.error('Connection error', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingCount = async () => {
        try {
            const response = await fetch(api("/api/reports/admin/pending-count"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok && data.data) {
                setPendingCount(data.data.count);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUpdateStatus = async (reportId, status) => {
        try {
            setUpdating(true);
            const response = await fetch(api(`/api/reports/admin/${reportId}/status`), {
                method: 'PUT',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status, adminNotes })
            });
            const data = await response.json();
            if (response.ok) {
                toast.success(`Report marked as ${status}`, 'Success');
                fetchReports();
                fetchPendingCount();
                setShowDetailModal(false);
                setSelectedReport(null);
                setAdminNotes('');
            } else {
                toast.error(data.message || 'Failed to update status', 'Error');
            }
        } catch (err) {
            toast.error('Connection error', 'Error');
        } finally {
            setUpdating(false);
        }
    };

    const openDetailModal = (report) => {
        setSelectedReport(report);
        setAdminNotes(report.adminNotes || '');
        setShowDetailModal(true);
    };

    // Filter logic
    const filteredReports = reports.filter(report => {
        const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
        const matchesType = filterType === 'ALL' || report.type === filterType;
        const matchesSearch = searchTerm === '' ||
            report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporterEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporterName?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesSearch;
    });

    const getTypeIcon = (type) => {
        switch (type) {
            case 'BUG': return <Bug size={16} />;
            case 'CONTRACT_ISSUE': return <FileWarning size={16} />;
            case 'USER_COMPLAINT': return <Users size={16} />;
            case 'PAYMENT_ISSUE': return <CreditCard size={16} />;
            default: return <HelpCircle size={16} />;
        }
    };

    const getTypeLabel = (type) => {
        switch (type) {
            case 'BUG': return 'Bug / Technical';
            case 'CONTRACT_ISSUE': return 'Contract Issue';
            case 'USER_COMPLAINT': return 'User Complaint';
            case 'PAYMENT_ISSUE': return 'Payment Issue';
            case 'OTHER': return 'Other';
            default: return type;
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'PENDING': return <span className="status-badge pending"><Clock size={12} /> Pending</span>;
            case 'IN_REVIEW': return <span className="status-badge in-review"><Eye size={12} /> In Review</span>;
            case 'RESOLVED': return <span className="status-badge resolved"><CheckCircle size={12} /> Resolved</span>;
            case 'CLOSED': return <span className="status-badge closed"><XCircle size={12} /> Closed</span>;
            default: return <span className="status-badge">{status}</span>;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-reports-page">
            <div className="admin-bg-glow glow-1"></div>
            <div className="admin-bg-glow glow-2"></div>

            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <button onClick={() => navigate(-1)} className="btn-back-admin">
                        <ArrowLeft size={18} />
                        Back
                    </button>
                    <div className="header-title">
                        <Flag size={28} />
                        <div>
                            <h1>User Reports</h1>
                            <p>Manage and respond to user reports</p>
                        </div>
                    </div>
                </div>
                <div className="header-stats">
                    <div className="stat-card pending-stat">
                        <AlertTriangle size={20} />
                        <div>
                            <span className="stat-value">{pendingCount}</span>
                            <span className="stat-label">Pending</span>
                        </div>
                    </div>
                    <div className="stat-card total-stat">
                        <Flag size={20} />
                        <div>
                            <span className="stat-value">{reports.length}</span>
                            <span className="stat-label">Total Reports</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Search by subject, email, or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="ALL">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="RESOLVED">Resolved</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                </div>
                <div className="filter-group">
                    <Flag size={16} />
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="ALL">All Types</option>
                        <option value="BUG">Bug / Technical</option>
                        <option value="CONTRACT_ISSUE">Contract Issue</option>
                        <option value="USER_COMPLAINT">User Complaint</option>
                        <option value="PAYMENT_ISSUE">Payment Issue</option>
                        <option value="OTHER">Other</option>
                    </select>
                    <ChevronDown size={14} className="select-arrow" />
                </div>
            </div>

            {/* Reports Table */}
            <div className="reports-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Loading reports...</p>
                    </div>
                ) : filteredReports.length === 0 ? (
                    <div className="empty-state">
                        <Flag size={48} />
                        <h3>No Reports Found</h3>
                        <p>No reports match your current filters.</p>
                    </div>
                ) : (
                    <table className="reports-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Type</th>
                                <th>Subject</th>
                                <th>Reporter</th>
                                <th>Status</th>
                                <th>Created</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredReports.map(report => (
                                <tr key={report.id} className={report.status === 'PENDING' ? 'pending-row' : ''}>
                                    <td className="id-cell">#{report.id}</td>
                                    <td className="type-cell">
                                        <div className={`type-badge type-${report.type.toLowerCase()}`}>
                                            {getTypeIcon(report.type)}
                                            <span>{getTypeLabel(report.type)}</span>
                                        </div>
                                    </td>
                                    <td className="subject-cell">
                                        <span className="subject-text">{report.subject}</span>
                                        {report.evidenceUrl && (
                                            <span className="has-evidence" title="Has evidence attached">
                                                <Image size={14} />
                                            </span>
                                        )}
                                    </td>
                                    <td className="reporter-cell">
                                        <div className="reporter-info">
                                            <span className="reporter-name">{report.reporterName}</span>
                                            <span className="reporter-email">{report.reporterEmail}</span>
                                        </div>
                                    </td>
                                    <td className="status-cell">{getStatusBadge(report.status)}</td>
                                    <td className="date-cell">{formatDate(report.createdAt)}</td>
                                    <td className="actions-cell">
                                        <button
                                            className="btn-view"
                                            onClick={() => openDetailModal(report)}
                                        >
                                            <Eye size={16} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedReport && (
                <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
                    <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <Flag size={24} />
                                <div>
                                    <h2>Report #{selectedReport.id}</h2>
                                    <div className={`type-badge type-${selectedReport.type.toLowerCase()}`}>
                                        {getTypeIcon(selectedReport.type)}
                                        <span>{getTypeLabel(selectedReport.type)}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-close-modal" onClick={() => setShowDetailModal(false)}>
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Status */}
                            <div className="detail-row">
                                <label>Current Status</label>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            {/* Subject */}
                            <div className="detail-row">
                                <label>Subject</label>
                                <p className="detail-value">{selectedReport.subject}</p>
                            </div>

                            {/* Description */}
                            <div className="detail-row">
                                <label>Description</label>
                                <div className="description-box">
                                    {selectedReport.description}
                                </div>
                            </div>

                            {/* Reporter Info */}
                            <div className="detail-row">
                                <label>Reported By</label>
                                <div className="reporter-detail">
                                    <span className="name">{selectedReport.reporterName}</span>
                                    <span className="email">{selectedReport.reporterEmail}</span>
                                    <span className="id">ID: {selectedReport.reporterId}</span>
                                </div>
                            </div>

                            {/* Related Project */}
                            {selectedReport.relatedProjectId && (
                                <div className="detail-row">
                                    <label>Related Project</label>
                                    <div className="related-info">
                                        <span>#{selectedReport.relatedProjectId}</span>
                                        <span>{selectedReport.relatedProjectTitle}</span>
                                    </div>
                                </div>
                            )}

                            {/* Reported User */}
                            {selectedReport.reportedUserId && (
                                <div className="detail-row">
                                    <label>Reported User</label>
                                    <div className="related-info">
                                        <span>#{selectedReport.reportedUserId}</span>
                                        <span>{selectedReport.reportedUserName}</span>
                                    </div>
                                </div>
                            )}

                            {/* Evidence */}
                            {selectedReport.evidenceUrl && (
                                <div className="detail-row">
                                    <label>Evidence</label>
                                    <div className="evidence-preview">
                                        <a
                                            href={selectedReport.evidenceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="evidence-link"
                                        >
                                            <Image size={16} />
                                            {selectedReport.evidenceFilename || 'View Evidence'}
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Timestamps */}
                            <div className="detail-row timestamps">
                                <div>
                                    <label>Created</label>
                                    <span>{formatDate(selectedReport.createdAt)}</span>
                                </div>
                                {selectedReport.handledAt && (
                                    <div>
                                        <label>Handled</label>
                                        <span>{formatDate(selectedReport.handledAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Admin Notes */}
                            <div className="detail-row">
                                <label>
                                    <MessageSquare size={16} />
                                    Admin Notes
                                </label>
                                <textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add notes for this report (visible to admin only)..."
                                    rows={4}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="modal-actions">
                            {selectedReport.status === 'PENDING' && (
                                <button
                                    className="btn-action in-review"
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'IN_REVIEW')}
                                    disabled={updating}
                                >
                                    <Eye size={16} />
                                    Mark In Review
                                </button>
                            )}
                            {(selectedReport.status === 'PENDING' || selectedReport.status === 'IN_REVIEW') && (
                                <>
                                    <button
                                        className="btn-action resolved"
                                        onClick={() => handleUpdateStatus(selectedReport.id, 'RESOLVED')}
                                        disabled={updating}
                                    >
                                        <CheckCircle size={16} />
                                        Mark Resolved
                                    </button>
                                    <button
                                        className="btn-action closed"
                                        onClick={() => handleUpdateStatus(selectedReport.id, 'CLOSED')}
                                        disabled={updating}
                                    >
                                        <XCircle size={16} />
                                        Close (Invalid)
                                    </button>
                                </>
                            )}
                            {(selectedReport.status === 'RESOLVED' || selectedReport.status === 'CLOSED') && (
                                <button
                                    className="btn-action reopen"
                                    onClick={() => handleUpdateStatus(selectedReport.id, 'IN_REVIEW')}
                                    disabled={updating}
                                >
                                    <Eye size={16} />
                                    Reopen
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminReports;
