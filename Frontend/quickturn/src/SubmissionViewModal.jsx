import React, { useState, useEffect } from 'react';
import { X, Download, ExternalLink, FileText, Image, Archive, Check, XCircle } from 'lucide-react';
import { api } from './utils/apiConfig';
import './SubmissionViewModal.css';

const SubmissionViewModal = ({ isOpen, onClose, projectId, token }) => {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [reviewing, setReviewing] = useState(false);

    useEffect(() => {
        if (isOpen && projectId) {
            fetchSubmissions();
        }
    }, [isOpen, projectId]);

    const fetchSubmissions = async () => {
        setLoading(true);
        try {
            const response = await fetch(api(`/api/files/submissions/${projectId}`), {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setSubmissions(data.data || []);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleReview = async (status) => {
        if (!selectedSubmission) return;

        setReviewing(true);
        try {
            const response = await fetch(api(`/api/files/submission/${selectedSubmission.id}/review`), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, feedback })
            });

            if (response.ok) {
                alert(`Submission ${status.toLowerCase()}!`);
                fetchSubmissions();
                setSelectedSubmission(null);
                setFeedback('');
            }
        } catch (err) {
            alert('Failed to review submission');
        } finally {
            setReviewing(false);
        }
    };

    const getFileIcon = (contentType) => {
        if (contentType?.startsWith('image/')) return <Image size={20} />;
        if (contentType?.includes('pdf') || contentType?.includes('word')) return <FileText size={20} />;
        if (contentType?.includes('zip') || contentType?.includes('rar') || contentType?.includes('7z')) return <Archive size={20} />;
        return <FileText size={20} />;
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'APPROVED': return 'status-approved';
            case 'REJECTED': return 'status-rejected';
            default: return 'status-pending';
        }
    };

    if (!isOpen) return null;

    return (
        <div className="view-modal-overlay" onClick={onClose}>
            <div className="view-modal" onClick={(e) => e.stopPropagation()}>
                <div className="view-modal-header">
                    <h2>Work Submissions</h2>
                    <button className="close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="view-modal-body">
                    {loading ? (
                        <div className="loading-state">Loading submissions...</div>
                    ) : submissions.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>No submissions yet</p>
                        </div>
                    ) : (
                        <div className="submissions-list">
                            {submissions.map((sub) => (
                                <div
                                    key={sub.id}
                                    className={`submission-card ${selectedSubmission?.id === sub.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedSubmission(sub)}
                                >
                                    <div className="submission-header">
                                        <div className="submitter-info">
                                            <strong>{sub.submittedBy?.nama || 'Unknown'}</strong>
                                            <span>{formatDate(sub.submittedAt)}</span>
                                        </div>
                                        <span className={`status-badge ${getStatusBadgeClass(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </div>

                                    {sub.description && (
                                        <p className="submission-description">{sub.description}</p>
                                    )}

                                    {/* Links */}
                                    {sub.links && (
                                        <div className="submission-links">
                                            <strong>Links:</strong>
                                            {sub.links.split(/[,\n]/).filter(l => l.trim()).map((link, i) => (
                                                <a
                                                    key={i}
                                                    href={link.trim()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <ExternalLink size={14} />
                                                    {link.trim().length > 40 ? link.trim().substring(0, 40) + '...' : link.trim()}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Files */}
                                    {sub.files && sub.files.length > 0 && (
                                        <div className="submission-files">
                                            <strong>Files ({sub.files.length}):</strong>
                                            {sub.files.map((file, i) => (
                                                <a
                                                    key={i}
                                                    href={file.filePath}
                                                    download
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="file-link"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {getFileIcon(file.contentType)}
                                                    <span>{file.originalFilename}</span>
                                                    <Download size={14} />
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                    {/* Feedback if reviewed */}
                                    {sub.feedback && (
                                        <div className="submission-feedback">
                                            <strong>Feedback:</strong>
                                            <p>{sub.feedback}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Review Section */}
                    {selectedSubmission && selectedSubmission.status === 'PENDING' && (
                        <div className="review-section">
                            <h4>Review This Submission</h4>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                placeholder="Add feedback (optional)..."
                                rows={3}
                            />
                            <div className="review-actions">
                                <button
                                    className="btn-reject"
                                    onClick={() => handleReview('REJECTED')}
                                    disabled={reviewing}
                                >
                                    <XCircle size={18} />
                                    Reject
                                </button>
                                <button
                                    className="btn-approve"
                                    onClick={() => handleReview('APPROVED')}
                                    disabled={reviewing}
                                >
                                    <Check size={18} />
                                    Approve
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SubmissionViewModal;
