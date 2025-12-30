import React, { useState, useEffect } from 'react';
import './ProjectsM.css';
import ReviewModal from './ReviewModal';
import WorkSubmissionModal from './WorkSubmissionModal';

const ActiveProjectsM = ({ token }) => {
    const [activeProjects, setActiveProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [rejectedProjects, setRejectedProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showSubmissionModal, setShowSubmissionModal] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProject, setReviewProject] = useState(null);

    // --- Track reviewed projects: { projectId: { hasReviewed, rating, comment } }
    const [reviewedProjects, setReviewedProjects] = useState({});

    const fetchMyActiveProjects = async () => {
        try {
            const response = await fetch("/api/projects/participating", {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                const allProjects = data.data || [];

                // Filter 1: ONGOING (Active & Approved)
                setActiveProjects(allProjects.filter(p => p.myApplicationStatus === 'APPROVED' && (p.status === 'ONGOING' || p.status === 'DONE')));

                // Filter 2: CLOSED (Completed & Approved)
                setCompletedProjects(allProjects.filter(p => p.myApplicationStatus === 'APPROVED' && p.status === 'CLOSED'));

                // Filter 3: REJECTED
                setRejectedProjects(allProjects.filter(p => p.myApplicationStatus === 'REJECTED'));
            }
        } catch (err) {
            console.error("Error fetching active projects", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchMyActiveProjects();
    }, [token]);

    // Fetch review status for completed projects
    useEffect(() => {
        const fetchReviewStatuses = async () => {
            for (const project of completedProjects) {
                // Skip if we already fetched this one
                if (reviewedProjects[project.id] !== undefined) continue;

                try {
                    const response = await fetch(`/api/projects/${project.id}/my-review`, {
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

        if (token && completedProjects.length > 0) {
            fetchReviewStatuses();
        }
    }, [completedProjects, token]);

    const handleOpenSubmission = (project) => {
        setSelectedProject(project);
        setShowSubmissionModal(true);
    };

    const handleSubmissionSuccess = () => {
        fetchMyActiveProjects();
    };

    const handleSubmitReview = async (rating, comment) => {
        if (!reviewProject) return;
        try {
            const response = await fetch(`/api/projects/${reviewProject.id}/review`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ rating, comment })
            });
            if (response.ok) {
                alert("Review submitted successfully! Thank you.");
                // Update local state to reflect the review
                setReviewedProjects(prev => ({
                    ...prev,
                    [reviewProject.id]: { hasReviewed: true, rating, comment }
                }));
                setShowReviewModal(false);
                setReviewProject(null);
            } else {
                const err = await response.json();
                alert(err.message || "Failed to submit review.");
            }
        } catch (error) {
            console.error(error);
            alert("Connection error.");
        }
    };

    return (
        <div className="projects-containerM">

            {/* === SECTION 1: ONGOING PROJECTS === */}
            <h2 className="section-titleM">Ongoing Projects</h2>
            {loading ? <p>Loading...</p> : activeProjects.length === 0 ? (
                <p style={{ color: '#888', fontStyle: 'italic' }}>No ongoing projects.</p>
            ) : (
                <div className="projects-rowM">
                    {activeProjects.map(p => (
                        <div className="project-cardM" key={p.id}>
                            <div className="card-headerM it">
                                <i className="fas fa-tools"></i>
                                <span className="card-statusM ongoing">ONGOING</span>
                            </div>
                            <div className="card-bodyM">
                                <div className="card-titleM">{p.title}</div>
                                <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '10px' }}>
                                    Budget: Rp {p.budget.toLocaleString()}
                                </p>

                                {/* Show rejection feedback if last submission was rejected */}
                                {p.latestSubmissionStatus === 'REJECTED' && (
                                    <div style={{
                                        background: 'rgba(229, 9, 20, 0.15)',
                                        border: '1px solid #e50914',
                                        borderRadius: '8px',
                                        padding: '10px',
                                        marginBottom: '10px'
                                    }}>
                                        <p style={{ color: '#ff6b6b', fontSize: '12px', margin: 0 }}>
                                            <strong>⚠️ Previous submission was rejected</strong>
                                        </p>
                                        {p.latestSubmissionFeedback && (
                                            <p style={{ color: '#ccc', fontSize: '11px', margin: '5px 0 0 0', fontStyle: 'italic' }}>
                                                "{p.latestSubmissionFeedback}"
                                            </p>
                                        )}
                                    </div>
                                )}

                                {p.finishingSubmittedAt ? (
                                    <button className="btn-applyM" disabled style={{ background: 'rgba(255,255,255,0.1)', cursor: 'default' }}>
                                        Waiting for Review
                                    </button>
                                ) : (
                                    <button className="btn-applyM" onClick={() => handleOpenSubmission(p)}>
                                        {p.latestSubmissionStatus === 'REJECTED' ? 'Resubmit Work' : 'Submit Work'}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === SECTION 2: COMPLETED PROJECTS === */}
            {completedProjects.length > 0 && (
                <>
                    <h2 className="section-titleM" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                        Completed Projects
                    </h2>
                    <div className="projects-rowM">
                        {completedProjects.map(p => (
                            <div className="project-cardM" key={p.id} style={{ opacity: 0.9, borderColor: '#46d369' }}>
                                <div className="card-headerM it" style={{ borderLeft: '4px solid #46d369' }}>
                                    <i className="fas fa-check-circle" style={{ color: '#46d369' }}></i>
                                    <span className="card-statusM" style={{ color: '#46d369', background: 'rgba(70,211,105,0.1)' }}>
                                        COMPLETED
                                    </span>
                                </div>
                                <div className="card-bodyM">
                                    <div className="card-titleM">{p.title}</div>
                                    <p style={{ fontSize: '12px', color: '#ccc', marginBottom: '10px' }}>
                                        Completed: {p.finishedAt ? new Date(p.finishedAt).toLocaleDateString() : 'Recently'}
                                    </p>

                                    {/* Check if already reviewed */}
                                    {reviewedProjects[p.id]?.hasReviewed ? (
                                        <div style={{
                                            padding: '10px',
                                            background: 'rgba(255, 193, 7, 0.15)',
                                            border: '1px solid #ffc107',
                                            borderRadius: '5px',
                                            textAlign: 'center'
                                        }}>
                                            <p style={{ margin: 0, color: '#ffc107', fontWeight: 'bold', fontSize: '13px' }}>
                                                ✅ You rated this client
                                            </p>
                                            <p style={{ margin: '5px 0 0 0', color: '#ffdb58', fontSize: '18px' }}>
                                                {'★'.repeat(reviewedProjects[p.id].rating)}{'☆'.repeat(5 - reviewedProjects[p.id].rating)}
                                            </p>
                                        </div>
                                    ) : (
                                        <button
                                            className="btn-applyM"
                                            style={{ background: 'linear-gradient(45deg, #ffc107, #ffdb58)', color: 'black', fontWeight: 'bold', border: 'none' }}
                                            onClick={() => { setReviewProject(p); setShowReviewModal(true); }}
                                        >
                                            Leave Review
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* === SECTION 3: REJECTED APPLICATIONS === */}
            {rejectedProjects.length > 0 && (
                <>
                    <h2 className="section-titleM" style={{ marginTop: '40px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', color: '#e50914' }}>
                        Rejected Applications
                    </h2>
                    <div className="projects-rowM">
                        {rejectedProjects.map(p => (
                            <div className="project-cardM" key={p.id} style={{ opacity: 0.7, borderColor: '#e50914' }}>
                                <div className="card-headerM" style={{ background: 'linear-gradient(135deg, #333 0%, #000 100%)', filter: 'grayscale(100%)' }}>
                                    <i className="fas fa-times-circle" style={{ color: '#e50914' }}></i>
                                    <span className="card-statusM" style={{ color: '#e50914', background: 'rgba(229, 9, 20, 0.1)' }}>
                                        REJECTED
                                    </span>
                                </div>
                                <div className="card-bodyM">
                                    <div className="card-titleM" style={{ color: '#aaa', textDecoration: 'line-through' }}>{p.title}</div>
                                    <p style={{ fontSize: '12px', color: '#666' }}>
                                        Budget: Rp {p.budget.toLocaleString()}
                                    </p>
                                    <div style={{ marginTop: '10px', fontSize: '13px', color: '#e50914', border: '1px solid #e50914', padding: '5px', borderRadius: '5px', textAlign: 'center' }}>
                                        Application not selected.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Work Submission Modal */}
            <WorkSubmissionModal
                isOpen={showSubmissionModal}
                onClose={() => {
                    setShowSubmissionModal(false);
                    setSelectedProject(null);
                }}
                projectId={selectedProject?.id}
                token={token}
                onSubmitSuccess={handleSubmissionSuccess}
            />

            <ReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
                onSubmit={handleSubmitReview}
                projectTitle={reviewProject?.title}
            />
        </div>
    );
};

export default ActiveProjectsM;