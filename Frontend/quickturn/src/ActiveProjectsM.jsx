import React, { useState, useEffect } from 'react';
import './ProjectsM.css';
import ReviewModal from './ReviewModal'; 

const ActiveProjectsM = ({ token }) => {
    const [activeProjects, setActiveProjects] = useState([]);
    const [completedProjects, setCompletedProjects] = useState([]);
    const [rejectedProjects, setRejectedProjects] = useState([]); // ✅ New State
    const [loading, setLoading] = useState(true);
    const [submissionLink, setSubmissionLink] = useState("");
    const [selectedProject, setSelectedProject] = useState(null);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProject, setReviewProject] = useState(null);

    useEffect(() => {
        const fetchMyActiveProjects = async () => {
            try {
                const response = await fetch("/api/projects/participating", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                
                if (response.ok) {
                    const allProjects = data.data || [];
                    
                    // ✅ Filter 1: ONGOING (Active & Approved)
                    setActiveProjects(allProjects.filter(p => p.myApplicationStatus === 'APPROVED' && (p.status === 'ONGOING' || p.status === 'DONE')));
                    
                    // ✅ Filter 2: CLOSED (Completed & Approved)
                    setCompletedProjects(allProjects.filter(p => p.myApplicationStatus === 'APPROVED' && p.status === 'CLOSED'));

                    // ✅ Filter 3: REJECTED (New Section)
                    setRejectedProjects(allProjects.filter(p => p.myApplicationStatus === 'REJECTED'));
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
                window.location.reload(); 
            } else {
                alert(data.message || "Gagal mengirim pekerjaan.");
            }
        } catch (err) {
            alert("Error koneksi.");
        }
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
                alert("Review berhasil dikirim! Terima kasih.");
                setShowReviewModal(false);
                setReviewProject(null);
            } else {
                const err = await response.json();
                alert(err.message || "Gagal mengirim review.");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan koneksi.");
        }
    };

    return (
        <div className="projects-containerM">
            
            {/* === SECTION 1: PROYEK SEDANG BERJALAN === */}
            <h2 className="section-titleM">🚀 Proyek Sedang Berjalan</h2>
            {loading ? <p>Loading...</p> : activeProjects.length === 0 ? (
                <p style={{color:'#888', fontStyle:'italic'}}>Belum ada proyek yang sedang dikerjakan.</p>
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
                                    Budget: Rp {p.budget.toLocaleString()}
                                </p>
                                {p.finishingSubmittedAt ? (
                                    <button className="btn-applyM" disabled style={{background:'rgba(255,255,255,0.1)', cursor:'default'}}>
                                        ⏳ Menunggu Review
                                    </button>
                                ) : (
                                    <button className="btn-applyM" onClick={() => setSelectedProject(p)}>
                                        📤 Submit Pekerjaan
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* === SECTION 2: RIWAYAT PROYEK SELESAI === */}
            {completedProjects.length > 0 && (
                <>
                    <h2 className="section-titleM" style={{marginTop:'40px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'20px'}}>
                        ✅ Riwayat Proyek Selesai
                    </h2>
                    <div className="projects-rowM">
                        {completedProjects.map(p => (
                            <div className="project-cardM" key={p.id} style={{opacity: 0.9, borderColor:'#46d369'}}>
                                <div className="card-headerM it" style={{borderLeft:'4px solid #46d369'}}>
                                    <i className="fas fa-check-circle" style={{color:'#46d369'}}></i>
                                    <span className="card-statusM" style={{color:'#46d369', background:'rgba(70,211,105,0.1)'}}>
                                        ● COMPLETED
                                    </span>
                                </div>
                                <div className="card-bodyM">
                                    <div className="card-titleM">{p.title}</div>
                                    <p style={{fontSize:'12px', color:'#ccc', marginBottom:'10px'}}>
                                        Selesai: {p.finishedAt ? new Date(p.finishedAt).toLocaleDateString() : 'Baru saja'}
                                    </p>
                                    <button 
                                        className="btn-applyM" 
                                        style={{background: 'linear-gradient(45deg, #ffc107, #ffdb58)', color:'black', fontWeight:'bold', border:'none'}}
                                        onClick={() => { setReviewProject(p); setShowReviewModal(true); }}
                                    >
                                        ⭐ Beri Review UMKM
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* === ✅ SECTION 3: PROYEK DITOLAK (NEW) === */}
            {rejectedProjects.length > 0 && (
                <>
                    <h2 className="section-titleM" style={{marginTop:'40px', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:'20px', color:'#e50914'}}>
                        ❌ Lamaran Ditolak
                    </h2>
                    <div className="projects-rowM">
                        {rejectedProjects.map(p => (
                            <div className="project-cardM" key={p.id} style={{opacity: 0.7, borderColor:'#e50914'}}>
                                <div className="card-headerM" style={{background: 'linear-gradient(135deg, #333 0%, #000 100%)', filter: 'grayscale(100%)'}}>
                                    <i className="fas fa-times-circle" style={{color:'#e50914'}}></i>
                                    <span className="card-statusM" style={{color:'#e50914', background:'rgba(229, 9, 20, 0.1)'}}>
                                        ● REJECTED
                                    </span>
                                </div>
                                <div className="card-bodyM">
                                    <div className="card-titleM" style={{color:'#aaa', textDecoration:'line-through'}}>{p.title}</div>
                                    <p style={{fontSize:'12px', color:'#666'}}>
                                        Budget: Rp {p.budget.toLocaleString()}
                                    </p>
                                    <div style={{marginTop:'10px', fontSize:'13px', color:'#e50914', border:'1px solid #e50914', padding:'5px', borderRadius:'5px', textAlign:'center'}}>
                                        Maaf, Anda belum terpilih.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* MODALS */}
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
                                <input type="text" value={submissionLink} onChange={(e) => setSubmissionLink(e.target.value)} placeholder="https://..." required />
                            </div>
                            <button type="submit" className="btn-submit-applyM">Kirim</button>
                        </form>
                    </div>
                </div>
            )}

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