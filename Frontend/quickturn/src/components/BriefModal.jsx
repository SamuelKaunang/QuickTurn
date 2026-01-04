import React, { useState, useEffect } from 'react';
import { X, Paperclip, FileText, Download, Lock, User, Mail } from 'lucide-react';
import { api } from '../utils/apiConfig';
import './BriefModal.css';

const BriefModal = ({ isOpen, onClose, projectId, projectTitle, token }) => {
    const [briefData, setBriefData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && projectId && token) {
            fetchBriefData();
        }
    }, [isOpen, projectId, token]);

    const fetchBriefData = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(api(`/api/projects/${projectId}/brief`), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                setBriefData(data.data);
            } else {
                setError(data.message || 'Failed to fetch brief');
            }
        } catch (err) {
            console.error('Error fetching brief:', err);
            setError('Connection error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getFileIcon = (filename) => {
        if (!filename) return '📄';
        const ext = filename.split('.').pop().toLowerCase();
        const icons = {
            'pdf': '📕',
            'doc': '📘',
            'docx': '📘',
            'xls': '📗',
            'xlsx': '📗',
            'ppt': '📙',
            'pptx': '📙',
            'zip': '🗜️',
            'rar': '🗜️',
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️'
        };
        return icons[ext] || '📄';
    };

    if (!isOpen) return null;

    return (
        <div className="brief-modal-overlay" onClick={onClose}>
            <div className="brief-modal-content" onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="brief-modal-header">
                    <div className="brief-header-title">
                        <Lock size={20} className="lock-icon" />
                        <div>
                            <h2>Project Brief</h2>
                            <p>{projectTitle}</p>
                        </div>
                    </div>
                    <button className="brief-close-btn" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="brief-modal-body">
                    {loading && (
                        <div className="brief-loading">
                            <div className="loading-spinner"></div>
                            <p>Loading brief...</p>
                        </div>
                    )}

                    {error && (
                        <div className="brief-error">
                            <span className="error-icon">⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {!loading && !error && briefData && (
                        <>
                            {/* Client Info */}
                            <div className="brief-section client-info">
                                <h3>Client Information</h3>
                                <div className="client-details">
                                    <div className="client-item">
                                        <User size={16} />
                                        <span>{briefData.ownerName}</span>
                                    </div>
                                    <div className="client-item">
                                        <Mail size={16} />
                                        <a href={`mailto:${briefData.ownerEmail}`}>{briefData.ownerEmail}</a>
                                    </div>
                                </div>
                            </div>

                            {/* Brief Text */}
                            <div className="brief-section">
                                <h3>
                                    <FileText size={18} />
                                    Detailed Brief
                                </h3>
                                {briefData.briefText ? (
                                    <div className="brief-text-content">
                                        {briefData.briefText.split('\n').map((line, idx) => (
                                            <p key={idx}>{line || '\u00A0'}</p>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="brief-empty">
                                        <span>No additional brief provided</span>
                                    </div>
                                )}
                            </div>

                            {/* Attachment */}
                            <div className="brief-section">
                                <h3>
                                    <Paperclip size={18} />
                                    Attachment
                                </h3>
                                {briefData.attachmentUrl ? (
                                    <a
                                        href={briefData.attachmentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="attachment-card"
                                    >
                                        <div className="attachment-icon">
                                            {getFileIcon(briefData.attachmentName)}
                                        </div>
                                        <div className="attachment-info">
                                            <span className="attachment-name">{briefData.attachmentName || 'Download Attachment'}</span>
                                            <span className="attachment-action">
                                                <Download size={14} />
                                                Click to download
                                            </span>
                                        </div>
                                    </a>
                                ) : (
                                    <div className="brief-empty">
                                        <span>No attachment provided</span>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="brief-modal-footer">
                    <p className="footer-note">
                        <Lock size={12} />
                        This content is confidential and only visible to you as the accepted talent.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default BriefModal;
