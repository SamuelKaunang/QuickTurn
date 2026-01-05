import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { api } from '../utils/apiConfig';
import { SkeletonProjectCard } from '../components/Skeleton';
import { Clock, Users, Target, Sparkles, Star, DollarSign, Calendar } from 'lucide-react';
import './ProjectsM.css';

const ProjectsM = ({ token, limit, userCategory }) => {
    const navigate = useNavigate();
    const toast = useToast();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SEARCH & FILTER STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // --- DETAIL MODAL STATE ---
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailProject, setDetailProject] = useState(null);

    // --- APPLY MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applyForm, setApplyForm] = useState({ proposal: "", bidAmount: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FETCH DATA ---
    const fetchProjects = async () => {
        try {
            const response = await fetch(api("/api/projects"), {
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setProjects(data.data || []);
            }
        } catch (err) {
            // Silently handle
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchProjects();
    }, [token]);

    // --- FILTERING LOGIC ---
    const filteredProjects = (projects || []).filter((project) => {
        const matchesSearch = project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            project?.description?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || project?.category === selectedCategory;
        const matchesUserCategory = !userCategory || project?.category === userCategory || selectedCategory !== "All";
        return matchesSearch && matchesCategory && matchesUserCategory;
    });

    // NEW: Sort by Most Appliers first, then by date (newest)
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        // First sort by applicant count (descending)
        const applierDiff = (b?.applicantCount || 0) - (a?.applicantCount || 0);
        if (applierDiff !== 0) return applierDiff;

        // If same applier count, sort by creation date (newest first)
        const dateA = new Date(a?.createdAt || 0);
        const dateB = new Date(b?.createdAt || 0);
        return dateB - dateA;
    });

    // Apply limit if specified (for dashboard view)
    const displayProjects = limit ? sortedProjects.slice(0, limit) : sortedProjects;

    // Navigate to client profile
    const handleClientClick = (e, ownerId) => {
        e.stopPropagation();
        if (ownerId) {
            navigate(`/profile/${ownerId}`);
        }
    };

    const getCategoryClass = (cat) => {
        if (!cat) return "design";
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        if (cat.includes("Video")) return "video";
        if (cat.includes("Writing")) return "writing";
        return "design";
    };

    const getComplexityInfo = (complexity) => {
        switch (complexity) {
            case 'BEGINNER':
                return { label: 'Beginner', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
            case 'EXPERT':
                return { label: 'Expert', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
            default:
                return { label: 'Intermediate', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' };
        }
    };

    // Parse skills from comma-separated string
    const parseSkills = (skillsStr) => {
        if (!skillsStr) return [];
        return skillsStr.split(',').map(s => s.trim()).filter(s => s);
    };

    // --- VIEW DETAIL ---
    const handleCardClick = (project) => {
        setDetailProject(project);
        setIsDetailOpen(true);
    };

    // --- APPLY ACTIONS ---
    const handleApplyClick = (project) => {
        setIsDetailOpen(false);
        setSelectedProject(project);
        setApplyForm({ proposal: "", bidAmount: "" });
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!applyForm.proposal || !applyForm.bidAmount) {
            toast.warning("Please fill in both Proposal and Bid Amount!");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(api(`/api/projects/${selectedProject.id}/apply`), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    proposal: applyForm.proposal,
                    bidAmount: parseInt(applyForm.bidAmount)
                })
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Application submitted successfully!", "Success");
                setIsModalOpen(false);
                fetchProjects();
            } else if (response.status === 403 && data.error === 'EMAIL_NOT_VERIFIED') {
                // Email not verified - redirect to verification page
                setIsModalOpen(false);
                navigate('/email-verification-required', {
                    state: {
                        action: 'apply',
                        email: data.email,
                        returnPath: '/dashboardm'
                    }
                });
            } else {
                toast.error(data.message || "Failed to submit application.", "Error");
            }
        } catch (err) {
            toast.error("Connection error.", "Error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStars = (rating) => {
        const score = rating || 0;
        return (
            <span style={{ color: '#f59e0b', fontWeight: 'bold', marginLeft: '5px', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                <Star size={14} fill="#f59e0b" strokeWidth={0} />
                {score > 0 ? score.toFixed(1) : "New"}
            </span>
        );
    };

    // --- RENDER BUTTON BASED ON STATUS ---
    const renderActionButton = (project, inModal = false) => {
        if (project.myApplicationStatus === 'PENDING') {
            return (
                <div className="btn-status-pending">
                    Application Pending
                </div>
            );
        }
        else if (project.myApplicationStatus === 'REJECTED') {
            return (
                <div className="btn-status-rejected">
                    Application Rejected
                </div>
            );
        }
        else if (project.myApplicationStatus === 'APPROVED') {
            return (
                <div className="btn-status-accepted">
                    Application Accepted
                </div>
            );
        }
        else {
            return (
                <button
                    className="btn-applyM"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleApplyClick(project);
                    }}
                >
                    Apply Now
                </button>
            );
        }
    };

    return (
        <div className="projects-containerM">
            {/* SEARCH & FILTER */}
            <div className="search-filter-container">
                <div className="search-bar-wrapper">
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input-main"
                    />
                </div>
                <div className="filter-wrapper">
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="filter-select"
                    >
                        <option value="All">All Categories</option>
                        <option value="IT / Web">IT / Web Development</option>
                        <option value="Desain">Design & Creative</option>
                        <option value="Marketing">Digital Marketing</option>
                        <option value="Video">Video Production</option>
                        <option value="Writing">Content Writing</option>
                    </select>
                </div>
            </div>

            {/* PROJECT LIST */}
            <div className="section-titleM">
                <span>•</span> Search Results ({displayProjects.length})
            </div>

            <div className="projects-rowM">
                {loading ? (
                    <>
                        <SkeletonProjectCard />
                        <SkeletonProjectCard />
                        <SkeletonProjectCard />
                        <SkeletonProjectCard />
                    </>
                ) : !displayProjects || displayProjects.length === 0 ? (
                    <p style={{ color: '#64748b', padding: '20px' }}>No matching projects found.</p>
                ) : (
                    displayProjects.map((p) => {
                        const skills = parseSkills(p.requiredSkills);
                        const complexityInfo = getComplexityInfo(p.complexity);
                        const ownerAvatar = p.owner?.profilePictureUrl;
                        const ownerInitial = p.owner?.nama?.charAt(0)?.toUpperCase() || '?';

                        // === COMPACT CARD for Dashboard (when limit is set) ===
                        if (limit) {
                            return (
                                <div
                                    className="project-cardM"
                                    key={p.id}
                                    onClick={() => handleCardClick(p)}
                                >
                                    <div className={`card-headerM ${getCategoryClass(p.category)}`}>
                                        <span className="card-statusM open">{p.status}</span>
                                        <span
                                            className="card-complexity-badge"
                                            style={{ backgroundColor: complexityInfo.color }}
                                        >
                                            {complexityInfo.label}
                                        </span>
                                    </div>
                                    <div className="card-bodyM">
                                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{p.owner ? p.owner.nama : 'Unknown'}</span>
                                            <span style={{ color: '#f59e0b', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                                <Star size={12} fill="#f59e0b" strokeWidth={0} />
                                                {p.owner?.averageRating > 0 ? p.owner.averageRating.toFixed(1) : 'New'}
                                            </span>
                                        </div>

                                        <div className="card-categoryM">{p.category}</div>
                                        <div className="card-titleM">{p.title}</div>

                                        {skills.length > 0 && (
                                            <div className="card-skills">
                                                {skills.slice(0, 3).map((skill, idx) => (
                                                    <span key={idx} className={`skill-badge skill-${idx % 4}`}>{skill}</span>
                                                ))}
                                                {skills.length > 3 && (
                                                    <span className="skill-badge-more">+{skills.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        <div className="card-info-row">
                                            {p.estimatedDuration && (
                                                <span className="card-duration">
                                                    <Clock size={12} />
                                                    {p.estimatedDuration}
                                                </span>
                                            )}
                                            <span className="card-applicants">
                                                <Users size={12} />
                                                {p.applicantCount || 0} applied
                                            </span>
                                        </div>

                                        <div className="card-metaM">
                                            <span className="card-budgetM">Rp {p.budget?.toLocaleString()}</span>
                                            <span className="card-deadlineM">{p.deadline}</span>
                                        </div>

                                        {renderActionButton(p)}
                                    </div>
                                </div>
                            );
                        }

                        // === LANDSCAPE CARD for Browse Projects (no limit) ===
                        return (
                            <div
                                className="project-card-landscape"
                                key={p.id}
                                onClick={() => handleCardClick(p)}
                            >
                                {/* Category Color Strip */}
                                <div className={`card-category-strip ${getCategoryClass(p.category)}`}>
                                    <span className="category-label-vertical">{p.category}</span>
                                </div>

                                {/* Main Content */}
                                <div className="card-content-landscape">
                                    {/* Header Row */}
                                    <div className="card-header-landscape">
                                        {/* Client Info */}
                                        <div
                                            className="client-info-landscape"
                                            onClick={(e) => handleClientClick(e, p.owner?.id)}
                                        >
                                            {ownerAvatar ? (
                                                <img
                                                    src={ownerAvatar}
                                                    alt={p.owner?.nama}
                                                    className="client-avatar"
                                                />
                                            ) : (
                                                <div className="client-avatar-placeholder">
                                                    {ownerInitial}
                                                </div>
                                            )}
                                            <div className="client-details">
                                                <span className="client-name">{p.owner?.nama || 'Unknown'}</span>
                                                <span className="client-rating">
                                                    <Star size={12} fill="#f59e0b" strokeWidth={0} />
                                                    {p.owner?.averageRating > 0 ? p.owner.averageRating.toFixed(1) : 'New'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="card-header-badges">
                                            <span
                                                className="complexity-pill"
                                                style={{ backgroundColor: complexityInfo.bg, color: complexityInfo.color }}
                                            >
                                                <Target size={12} />
                                                {complexityInfo.label}
                                            </span>
                                            <span className="status-pill open">{p.status}</span>
                                        </div>
                                    </div>

                                    {/* Title + Description */}
                                    <div className="card-body-landscape">
                                        <h3 className="card-title-landscape">{p.title}</h3>
                                        <p className="card-desc-landscape">
                                            {p.description?.length > 150
                                                ? p.description.substring(0, 150) + '...'
                                                : p.description}
                                        </p>
                                    </div>

                                    {/* Skills + Meta Row */}
                                    <div className="card-footer-landscape">
                                        {/* Skills */}
                                        <div className="skills-section">
                                            {skills.slice(0, 4).map((skill, idx) => (
                                                <span key={idx} className={`skill-chip skill-${idx % 4}`}>{skill}</span>
                                            ))}
                                            {skills.length > 4 && (
                                                <span className="skill-chip-more">+{skills.length - 4}</span>
                                            )}
                                        </div>

                                        {/* Meta Info */}
                                        <div className="meta-section">
                                            <div className="meta-pill budget">
                                                <DollarSign size={14} />
                                                Rp {p.budget?.toLocaleString()}
                                            </div>
                                            <div className="meta-pill">
                                                <Calendar size={14} />
                                                {p.deadline}
                                            </div>
                                            {p.estimatedDuration && (
                                                <div className="meta-pill">
                                                    <Clock size={14} />
                                                    {p.estimatedDuration}
                                                </div>
                                            )}
                                            <div className="meta-pill appliers">
                                                <Users size={14} />
                                                {p.applicantCount || 0} appliers
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="card-action-landscape">
                                    {renderActionButton(p)}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* PROJECT DETAIL MODAL */}
            {isDetailOpen && detailProject && (
                <div className="detail-modal-overlay" onClick={() => setIsDetailOpen(false)}>
                    <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="detail-modal-header">
                            <h2>{detailProject.title}</h2>
                            <button
                                onClick={() => setIsDetailOpen(false)}
                                className="close-btnM"
                            >
                                ×
                            </button>
                        </div>
                        <div className="detail-modal-body">
                            <div className="detail-meta-row">
                                <div className="detail-meta-item">
                                    <div className="detail-label">Budget</div>
                                    <div className="detail-budget">Rp {detailProject.budget.toLocaleString()}</div>
                                </div>
                                <div className="detail-meta-item">
                                    <div className="detail-label">Deadline</div>
                                    <div className="detail-value">{detailProject.deadline}</div>
                                </div>
                            </div>

                            {/* NEW: Duration & Complexity Row */}
                            <div className="detail-meta-row">
                                <div className="detail-meta-item">
                                    <div className="detail-label">
                                        <Clock size={14} style={{ marginRight: '6px' }} />
                                        Duration
                                    </div>
                                    <div className="detail-value">{detailProject.estimatedDuration || 'Not specified'}</div>
                                </div>
                                <div className="detail-meta-item">
                                    <div className="detail-label">
                                        <Target size={14} style={{ marginRight: '6px' }} />
                                        Complexity
                                    </div>
                                    <div
                                        className="detail-complexity-badge"
                                        style={{
                                            color: getComplexityInfo(detailProject.complexity).color,
                                            backgroundColor: getComplexityInfo(detailProject.complexity).bg
                                        }}
                                    >
                                        {getComplexityInfo(detailProject.complexity).label}
                                    </div>
                                </div>
                            </div>

                            {/* Social Proof - Applicant Count */}
                            <div className="detail-social-proof">
                                <Users size={16} />
                                <span>
                                    <strong>{detailProject.applicantCount || 0}</strong> people have applied for this project
                                </span>
                            </div>

                            <div className="detail-section">
                                <div className="detail-label">Category</div>
                                <div className="detail-value">{detailProject.category}</div>
                            </div>

                            <div className="detail-section">
                                <div className="detail-label">Client</div>
                                <div className="detail-value">
                                    {detailProject.owner?.nama || 'Unknown'}
                                    {detailProject.owner && renderStars(detailProject.owner.averageRating)}
                                </div>
                            </div>

                            {/* NEW: Required Skills */}
                            {detailProject.requiredSkills && (
                                <div className="detail-section">
                                    <div className="detail-label">
                                        <Sparkles size={14} style={{ marginRight: '6px', color: '#f59e0b' }} />
                                        Required Skills
                                    </div>
                                    <div className="detail-skills">
                                        {parseSkills(detailProject.requiredSkills).map((skill, idx) => (
                                            <span key={idx} className={`detail-skill-badge skill-${idx % 4}`}>{skill}</span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="detail-section">
                                <div className="detail-label">Description</div>
                                <div className="detail-value">{detailProject.description}</div>
                            </div>
                        </div>
                        <div className="detail-modal-footer">
                            {renderActionButton(detailProject, true)}
                        </div>
                    </div>
                </div>
            )}

            {/* APPLY MODAL */}
            {isModalOpen && selectedProject && (
                <div className="modal-overlayM">
                    <div className="modal-contentM">
                        <div className="modal-headerM">
                            <h3>Submit Application</h3>
                            <button onClick={() => setIsModalOpen(false)} className="close-btnM">×</button>
                        </div>

                        <div className="project-summaryM">
                            <strong>{selectedProject.title}</strong>
                            <p>Original Budget: Rp {selectedProject.budget.toLocaleString()}</p>
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                                Client: <span style={{ color: '#0f172a', fontWeight: '500' }}>{selectedProject.owner.nama}</span>
                                <br />
                                Rating: {renderStars(selectedProject.owner.averageRating)}
                            </div>
                        </div>

                        <form onSubmit={submitApplication} className="apply-formM">
                            <div className="form-groupM">
                                <label>Your Proposal</label>
                                <textarea
                                    name="proposal"
                                    value={applyForm.proposal}
                                    onChange={handleFormChange}
                                    placeholder="Explain why you're the right fit for this project..."
                                    required
                                />
                            </div>
                            <div className="form-groupM">
                                <label>Your Bid Amount (Rp)</label>
                                <input
                                    type="number"
                                    name="bidAmount"
                                    value={applyForm.bidAmount}
                                    onChange={handleFormChange}
                                    placeholder={selectedProject.budget}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-submit-applyM" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting..." : "Submit Application"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsM;
