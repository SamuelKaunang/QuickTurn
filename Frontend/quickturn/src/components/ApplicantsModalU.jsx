import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from './Toast';
import { api } from '../utils/apiConfig';
import './ApplicantsModalU.css';

const ApplicantsModalU = ({ projectId, onClose, onAcceptSuccess, token }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data
    const fetchApplicants = async () => {
        try {
            const response = await fetch(api(`/api/projects/${projectId}/applicants`), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) setApplicants(data.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchApplicants();
    }, [projectId, token]);

    const handleAccept = async (appId) => {
        const confirmed = await toast.confirm({
            title: 'Accept Applicant',
            message: 'Accept this applicant? The project will begin.',
            confirmText: 'Accept',
            cancelText: 'Cancel',
            type: 'default'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(api(`/api/projects/${projectId}/applicants/${appId}/accept`), {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                toast.success("Applicant accepted! Project has started.", "Success");
                onAcceptSuccess();
                onClose();
            } else {
                toast.error("Failed to accept applicant.", "Error");
            }
        } catch (err) { toast.error("Connection error.", "Error"); }
    };

    const handleReject = async (appId) => {
        const confirmed = await toast.confirm({
            title: 'Reject Applicant',
            message: 'Are you sure you want to reject this applicant?',
            confirmText: 'Reject',
            cancelText: 'Cancel',
            type: 'danger'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(api(`/api/projects/${projectId}/applicants/${appId}/reject`), {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                toast.info("Applicant rejected.");
                fetchApplicants();
            } else {
                toast.error("Failed to reject applicant.", "Error");
            }
        } catch (err) { toast.error("Connection error.", "Error"); }
    };

    const handleViewProfile = (studentId) => {
        // Navigate to view the student's profile
        navigate(`/profile/${studentId}`);
    };

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box-modern">
                <div className="modal-header-modern">
                    <h3>Applicants</h3>
                    <button onClick={onClose} className="btn-close-modern">×</button>
                </div>

                <div className="modal-body-scroll">
                    {loading ? (
                        <p className="empty-state">Loading...</p>
                    ) : applicants.length === 0 ? (
                        <p className="empty-state">No applicants yet.</p>
                    ) : (
                        applicants.map((app) => (
                            <div className="applicant-item" key={app.id}>
                                <div className="applicant-details">
                                    <div className="applicant-header">
                                        <h4
                                            className="applicant-name"
                                            onClick={() => handleViewProfile(app.studentId)}
                                        >
                                            {app.studentName}
                                        </h4>
                                        <span className="rating-badge">
                                            {app.studentRating ? app.studentRating.toFixed(1) : 'New'}
                                        </span>
                                    </div>
                                    <p className="applicant-bid">
                                        Bid: <span>Rp {app.bidAmount.toLocaleString()}</span>
                                    </p>
                                    <p className="applicant-quote">"{app.proposal}"</p>

                                    {/* Status Badge if Rejected */}
                                    {app.status === 'REJECTED' && (
                                        <span className="status-rejected">Rejected</span>
                                    )}
                                </div>

                                {/* Buttons only for PENDING */}
                                {app.status === 'PENDING' && (
                                    <div className="applicant-actions">
                                        <button
                                            onClick={() => handleAccept(app.id)}
                                            className="btn-accept-modern"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleReject(app.id)}
                                            className="btn-reject-modern"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ApplicantsModalU;
