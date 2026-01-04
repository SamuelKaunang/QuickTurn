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

    return (
        <div className="projects-rowU">
            {projects.length === 0 ? (
                <p style={{ color: '#64748b', padding: '20px' }}>No projects yet.</p>
            ) : (
                projects.map((p) => (
                    <div className="project-cardU" key={p.id}>
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
                                        onClick={() => onViewApplicants(p.id)}
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
                                            onClick={() => onViewSubmissions && onViewSubmissions(p.id)}
                                        >
                                            View Submissions
                                        </button>
                                        <button
                                            className="btn-primaryU"
                                            onClick={() => handleCompleteProject(p.id)}
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
                                                onClick={() => {
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

                                {/* VIEW CONTRACT BUTTON */}
                                {(p.status === 'ONGOING' || p.status === 'DONE' || p.status === 'CLOSED') && (
                                    <button
                                        onClick={() => onViewContract(p.id)}
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
