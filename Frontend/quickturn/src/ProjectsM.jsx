import React, { useState, useEffect } from 'react';
import './ProjectsM.css';

const ProjectsM = ({ token }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- SEARCH & FILTER STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [minBudget, setMinBudget] = useState("");

    // --- APPLY MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [applyForm, setApplyForm] = useState({ proposal: "", bidAmount: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch("/api/projects", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    const openProjects = (data.data || []).filter(p => p.status === 'OPEN');
                    setProjects(openProjects);
                }
            } catch (err) {
                console.error("Failed to fetch projects", err);
            } finally {
                setLoading(false);
            }
        };

        if (token) fetchProjects();
    }, [token]);

    // --- FILTERING LOGIC ---
    const filteredProjects = projects.filter((project) => {
        const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              project.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === "All" || project.category === selectedCategory;
        const matchesBudget = minBudget === "" || project.budget >= parseInt(minBudget);
        return matchesSearch && matchesCategory && matchesBudget;
    });

    const getCategoryClass = (cat) => {
        if (!cat) return "design";
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        return "design";
    };

    // --- APPLY ACTIONS ---
    const handleApplyClick = (project) => {
        setSelectedProject(project);
        setApplyForm({ proposal: "", bidAmount: "" }); // Reset form
        setIsModalOpen(true);
    };

    const handleFormChange = (e) => {
        setApplyForm({ ...applyForm, [e.target.name]: e.target.value });
    };

    const submitApplication = async (e) => {
        e.preventDefault();
        if (!applyForm.proposal || !applyForm.bidAmount) {
            alert("Harap isi Proposal dan Bid Amount!");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/projects/${selectedProject.id}/apply`, {
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
                alert("Berhasil mengajukan proposal! Tunggu kabar dari UMKM.");
                setIsModalOpen(false);
            } else {
                alert(data.message || "Gagal mengajukan proposal.");
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="projects-containerM">
            {/* SEARCH & FILTER */}
            <div className="search-filter-container">
                <div className="search-bar-wrapper">
                    <i className="fas fa-search search-icon"></i>
                    <input 
                        type="text" 
                        placeholder="Cari project..." 
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
                        <option value="All">Semua Kategori</option>
                        <option value="IT / Web">IT / Web</option>
                        <option value="Desain">Desain</option>
                        <option value="Marketing">Marketing</option>
                        <option value="Writing">Writing</option>
                    </select>
                    <input 
                        type="number" 
                        placeholder="Min Budget" 
                        value={minBudget}
                        onChange={(e) => setMinBudget(e.target.value)}
                        className="filter-input"
                    />
                </div>
            </div>

            {/* PROJECT LIST */}
            <div className="section-titleM">
                <span>●</span> Hasil Pencarian ({filteredProjects.length})
            </div>

            <div className="projects-rowM">
                {loading ? (
                    <p style={{color:'#888', padding:'20px'}}>Loading projects...</p>
                ) : filteredProjects.length === 0 ? (
                    <p style={{color:'#888', padding:'20px'}}>Tidak ada project yang cocok.</p>
                ) : (
                    filteredProjects.map((p) => (
                        <div className="project-cardM" key={p.id}>
                            <div className={`card-headerM ${getCategoryClass(p.category)}`}>
                                <i className="fas fa-briefcase"></i>
                                <span className="card-statusM open">● {p.status}</span>
                            </div>
                            <div className="card-bodyM">
                                <div className="card-categoryM">{p.category}</div>
                                <div className="card-titleM">{p.title}</div>
                                <div className="card-metaM">
                                    <span className="card-budgetM">Rp {p.budget.toLocaleString()}</span>
                                    <span className="card-deadlineM">📅 {p.deadline}</span>
                                </div>
                                {/* BUTTON NOW OPENS MODAL */}
                                <button 
                                    className="btn-applyM"
                                    onClick={() => handleApplyClick(p)}
                                >
                                    Apply Now
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* --- APPLY MODAL --- */}
            {isModalOpen && selectedProject && (
                <div className="modal-overlayM">
                    <div className="modal-contentM">
                        <div className="modal-headerM">
                            <h3>Ajukan Proposal</h3>
                            <button onClick={() => setIsModalOpen(false)} className="close-btnM">✖</button>
                        </div>
                        
                        <div className="project-summaryM">
                            <strong>{selectedProject.title}</strong>
                            <p>Budget Asli: Rp {selectedProject.budget.toLocaleString()}</p>
                        </div>

                        <form onSubmit={submitApplication} className="apply-formM">
                            <div className="form-groupM">
                                <label>Proposal / Pitch Anda</label>
                                <textarea 
                                    name="proposal"
                                    value={applyForm.proposal}
                                    onChange={handleFormChange}
                                    placeholder="Jelaskan kenapa Anda cocok untuk project ini..."
                                    required
                                />
                            </div>
                            <div className="form-groupM">
                                <label>Tawaran Harga (Bid Amount)</label>
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
                                {isSubmitting ? "Mengirim..." : "Kirim Lamaran"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectsM;