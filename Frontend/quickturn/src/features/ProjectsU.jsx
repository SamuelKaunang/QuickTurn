import React, { useState, useEffect } from 'react';
import './ProjectsU.css';
import ReviewModal from '../components/ReviewModal';
import { useToast } from '../components/Toast';
import { api } from '../utils/apiConfig';

const ProjectsU = ({ projects, token, onRefresh, onViewApplicants, onViewContract, onViewSubmissions }) => {
    const toast = useToast();

    // --- Review Modal State ---
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProject, setReviewProject] = useState(null);

    // --- Detail Modal State (for OVERDUE projects) ---
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailProject, setDetailProject] = useState(null);

    // --- Track reviewed projects: { projectId: { hasReviewed, rating, comment } }
    const [reviewedProjects, setReviewedProjects] = useState({});

    // Fetch review status for all CLOSED projects
    useEffect(() => {
        const fetchReviewStatuses = async () => {
            const closedProjects = projects.filter(p => p.status === 'CLOSED');

            for (const project of closedProjects) {
                // Skip if we already fetched this one
                if (reviewedProjects[project.id] !== undefined) continue;

                try {
                    const response = await fetch(api(`/api/projects/${project.id}/my-review`), {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    const data = await response.json();
                    if (response.ok && data.data) {
                        setReviewedProjects(prev => ({
                            ...prev,
                            [project.id]: data.data
                        }));
                    }
                } catch (err) {
                    console.error("Failed to fetch review status for project", project.id, err);
                }
            }
        };

        if (token && projects.length > 0) {
            fetchReviewStatuses();
        }
    }, [projects, token]);

    const handleCompleteProject = async (projectId) => {
        const confirmed = await toast.confirm({
            title: 'Complete Project',
            message: 'Are you sure the work is complete? This will close the project.',
            confirmText: 'Complete',
            cancelText: 'Cancel',
            type: 'default'
        });

        if (!confirmed) return;

        try {
            const response = await fetch(api(`/api/projects/${projectId}/finish/confirm`), {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                toast.success("Project completed! Status changed to CLOSED.", "Success");
                if (onRefresh) onRefresh();
            } else {
                toast.error(data.message || "Failed to complete project", "Error");
            }
        } catch (err) {
            console.error(err);
            toast.error("An error occurred.", "Error");
        }
    };

    // --- SUBMIT REVIEW LOGIC ---
    const handleSubmitReview = async (rating, comment) => {
        if (!reviewProject) return;

        try {
            const response = await fetch(api(`/api/projects/${reviewProject.id}/review`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });

            if (response.ok) {
                toast.success("Review submitted successfully!", "Success");
                // Update local state to reflect the review
                setReviewedProjects(prev => ({
                    ...prev,
                    [reviewProject.id]: { hasReviewed: true, rating, comment }
                }));
                setShowReviewModal(false);
                setReviewProject(null);
            } else {
                const err = await response.json();
                toast.error(err.message || "Failed to submit review.", "Error");
            }
        } catch (error) {
            console.error(error);
            toast.error("Connection error.", "Error");
        }
    };

    const getCategoryClass = (cat) => {
        if (!cat) return "design";
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        return "design";
    };

    // --- HANDLE CARD CLICK (only for OVERDUE) ---
    const handleCardClick = (project) => {
        if (project.status === 'OVERDUE') {
            setDetailProject(project);
            setIsDetailOpen(true);
        }
    };

    return (
        <div className="projects-rowU">
            {projects.length === 0 ? (
                <p style={{ color: '#64748b', padding: '20px' }}>No projects yet.</p>
            ) : (
                projects.map((p) => (
                    <div
                        className={`project-cardU ${p.status === 'OVERDUE' ? 'overdue-clickable' : ''}`}
                        key={p.id}
                        onClick={() => handleCardClick(p)}
                    >
                        <div className={`card-headerU ${getCategoryClass(p.category)}`}>
                            <span className={`card-statusU ${p.status.toLowerCase()}`}>
                                {p.status}
                            </span>
                        </div>
                        <div className="card-bodyU">
                            <div className="card-categoryU">{p.category}</div>
                            <div className="card-titleU">{p.title}</div>
                            <div className="card-metaU">
                                <span className="card-budgetU">Rp {Number(p.budget).toLocaleString()}</span>
                                <span className="card-deadlineU">{p.deadline}</span>
                            </div>

                            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

                                {/* 1. OPEN: Show Applicants */}
                                {p.status === 'OPEN' && (
                                    <button
                                        className="btn-secondaryU"
                                        onClick={(e) => { e.stopPropagation(); onViewApplicants(p.id); }}
                                    >
                                        View Applicants
                                    </button>
                                )}

                                {/* 2. ONGOING: Waiting for Student */}
                                {p.status === 'ONGOING' && (
                                    <div className="status-waiting">
                                        Waiting for Submission
                                    </div>
                                )}

                                {/* 3. DONE: Student Submitted -> UMKM Can view submissions and Finish */}
                                {p.status === 'DONE' && (
                                    <>
                                        <button
                                            className="btn-secondaryU"
                                            onClick={(e) => { e.stopPropagation(); onViewSubmissions && onViewSubmissions(p.id); }}
                                        >
                                            View Submissions
                                        </button>
                                        <button
                                            className="btn-primaryU"
                                            onClick={(e) => { e.stopPropagation(); handleCompleteProject(p.id); }}
                                        >
                                            Approve and Complete
                                        </button>
                                    </>
                                )}

                                {/* 4. CLOSED: Done -> RATE TALENT */}
                                {p.status === 'CLOSED' && (
                                    <>
                                        <div className="status-complete">
                                            Project Completed
                                        </div>

                                        {/* Check if already reviewed */}
                                        {reviewedProjects[p.id]?.hasReviewed ? (
                                            <div className="rating-display">
                                                <p className="rating-label">Your Rating</p>
                                                <p className="rating-stars">
                                                    {'★'.repeat(reviewedProjects[p.id].rating)}{'☆'.repeat(5 - reviewedProjects[p.id].rating)}
                                                </p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setReviewProject(p);
                                                    setShowReviewModal(true);
                                                }}
                                                className="btn-rate"
                                            >
                                                Rate Talent
                                            </button>
                                        )}
                                    </>
                                )}

                                {/* 5. OVERDUE: Show overdue indicator, no actions on card */}
                                {p.status === 'OVERDUE' && (
                                    <div className="status-overdue">
                                        Project Overdue — Tap to view details
                                    </div>
                                )}

                                {/* VIEW CONTRACT BUTTON (not for OVERDUE) */}
                                {(p.status === 'ONGOING' || p.status === 'DONE' || p.status === 'CLOSED') && (
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onViewContract(p.id); }}
                                        className="btn-outlineU"
                                    >
                                        View Contract
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* DETAIL MODAL for OVERDUE projects */}
            {isDetailOpen && detailProject && (
                <div className="detail-modal-overlayU" onClick={() => setIsDetailOpen(false)}>
                    <div className="detail-modal-contentU" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-headerU">
                            <h2>{detailProject.title}</h2>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="close-btnU"
                            >
                                ×
                            </button>
                        </div>
                        <div className="detail-modal-bodyU">
                            <div className="detail-meta-rowU">
                                <div className="detail-meta-itemU">
                                    <div className="detail-labelU">Budget</div>
                                    <div className="detail-budgetU">Rp {Number(detailProject.budget).toLocaleString()}</div>
                                </div>
                                <div className="detail-meta-itemU">
                                    <div className="detail-labelU">Deadline</div>
                                    <div className="detail-valueU">{detailProject.deadline}</div>
                                </div>
                            </div>

                            <div className="detail-sectionU">
                                <div className="detail-labelU">Status</div>
                                <div className="detail-status-badgeU overdue">
                                    {detailProject.status}
                                </div>
                            </div>

                            <div className="detail-sectionU">
                                <div className="detail-labelU">Category</div>
                                <div className="detail-valueU">{detailProject.category}</div>
                            </div>

                            <div className="detail-sectionU">
                                <div className="detail-labelU">Description</div>
                                <div className="detail-valueU detail-descriptionU">
                                    {detailProject.description || 'No description provided.'}
                                </div>
                            </div>
                        </div>

                        {/* No action buttons for overdue */}
                        <div className="detail-modal-footerU">
                            <div className="status-overdue" style={{ width: '100%' }}>
                                This project is overdue. No further actions available.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL REVIEW */}
            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleSubmitReview}
                projectTitle={reviewProject?.title}
            />
        </div>
    );
};

export default ProjectsU;
