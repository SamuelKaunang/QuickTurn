import React, { useState, useEffect } from 'react';
import './ProjectsM.css';

const ActiveProjectsM = ({ token }) => {
    const [activeProjects, setActiveProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submissionLink, setSubmissionLink] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);

    // Fetch Projects where student is accepted/participating
    useEffect(() => {
        const fetchMyActiveProjects = async () => {
            try {
                // ✅ UPDATED ENDPOINT: Use /participating
                const response = await fetch("/api/projects/participating", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    // Filter locally to show only ONGOING (Active) projects
                    const myProjects = (data.data || []).filter(p => p.status === 'ONGOING'); 
                    setActiveProjects(myProjects);
                }
            } catch (err) {
                console.error("Error fetching active projects", err);
            } finally {
                setLoading(false);
            }
        };

        if(token) fetchMyActiveProjects();
    }, [token]);

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        if(!selectedProject) return;

        try {
            const response = await fetch(`/api/projects/${selectedProject.id}/finish`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ finishingLink: submissionLink })
            });

            const data = await response.json();
            if(response.ok) {
                alert("Pekerjaan berhasil dikirim! Menunggu konfirmasi UMKM.");
                setSelectedProject(null);
                setSubmissionLink("");
                // Reload projects
                window.location.reload(); 
            } else {
                alert(data.message || "Gagal mengirim pekerjaan.");
            }
        } catch (err) {
            alert("Error koneksi.");
        }
    };

    return (
        <div className="projects-containerM">
            <h2 className="section-titleM">🚀 Proyek Sedang Berjalan</h2>
            
            {loading ? <p>Loading...</p> : activeProjects.length === 0 ? (
                <div style={{textAlign:'center', marginTop:'50px', color:'#888'}}>
                    <i className="fas fa-box-open" style={{fontSize:'40px', marginBottom:'15px', opacity:0.5}}></i>
                    <p>Belum ada proyek yang sedang dikerjakan.</p>
                </div>
            ) : (
                <div className="projects-rowM">
                    {activeProjects.map(p => (
                        <div className="project-cardM" key={p.id}>
                            <div className="card-headerM it">
                                <i className="fas fa-tools"></i>
                                <span className="card-statusM ongoing">● ONGOING</span>
                            </div>
                            <div className="card-bodyM">
                                <div className="card-titleM">{p.title}</div>
                                <p style={{fontSize:'12px', color:'#ccc', marginBottom:'10px'}}>
                                    Budget: Rp {p.budget.toLocaleString()} <br/>
                                    Deadline: {p.deadline}
                                </p>
                                
                                {p.finishingSubmittedAt ? (
                                    <button className="btn-applyM" disabled style={{background:'rgba(255,255,255,0.1)', cursor:'default'}}>
                                        ⏳ Menunggu Review
                                    </button>
                                ) : (
                                    <button 
                                        className="btn-applyM"
                                        onClick={() => setSelectedProject(p)}
                                    >
                                        📤 Submit Pekerjaan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* MODAL SUBMIT */}
            {selectedProject && (
                <div className="modal-overlayM">
                    <div className="modal-contentM">
                        <div className="modal-headerM">
                            <h3>Submit Pekerjaan</h3>
                            <button onClick={() => setSelectedProject(null)} className="close-btnM">✖</button>
                        </div>
                        <form onSubmit={handleSubmitWork} className="apply-formM">
                            <div className="form-groupM">
                                <label>Link Hasil Pekerjaan (Google Drive/Github)</label>
                                <input 
                                    type="text" 
                                    value={submissionLink}
                                    onChange={(e) => setSubmissionLink(e.target.value)}
                                    placeholder="https://..."
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-submit-applyM">Kirim</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActiveProjectsM;