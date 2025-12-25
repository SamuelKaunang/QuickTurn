import React, { useState } from 'react'; // ✅ Added useState
import './ProjectsU.css'; 
import ReviewModal from './ReviewModal'; // ✅ Import the Review Modal

const ProjectsU = ({ projects, token, onRefresh, onViewApplicants, onViewContract }) => {
    
    // --- Review Modal State (NEW) ---
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewProject, setReviewProject] = useState(null);

    const handleCompleteProject = async (projectId) => {
        if(!window.confirm("Apakah Anda yakin pekerjaan selesai dan sesuai? Project akan ditutup.")) return;

        try {
            const response = await fetch(`/api/projects/${projectId}/finish/confirm`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            const data = await response.json();
            if(response.ok) {
                alert("Project selesai! Status diubah menjadi CLOSED.");
                if(onRefresh) onRefresh(); 
            } else {
                alert(data.message || "Gagal menyelesaikan project");
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan.");
        }
    };

    // --- ✅ SUBMIT REVIEW LOGIC (NEW) ---
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
                alert("Rating & Review berhasil dikirim untuk Mahasiswa!");
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

    const getCategoryClass = (cat) => {
        if (!cat) return "design"; 
        if (cat.includes("IT")) return "it";
        if (cat.includes("Marketing")) return "marketing";
        return "design";
    };

    return (
        <div className="projects-rowU">
            {projects.length === 0 ? (
                <p style={{color: '#888', padding: '20px'}}>Belum ada project.</p>
            ) : (
                projects.map((p) => (
                    <div className="project-cardU" key={p.id}>
                        <div className={`card-headerU ${getCategoryClass(p.category)}`}>
                            <i className="fas fa-briefcase"></i>
                            <span className={`card-statusU ${p.status.toLowerCase()}`}>
                                ● {p.status}
                            </span>
                        </div>
                        <div className="card-bodyU">
                            <div className="card-categoryU">{p.category}</div>
                            <div className="card-titleU">{p.title}</div>
                            <div className="card-metaU">
                                <span className="card-budgetU">Rp {Number(p.budget).toLocaleString()}</span>
                                <span className="card-deadlineU">📅 {p.deadline}</span>
                            </div>

                            <div style={{marginTop: '15px', display:'flex', flexDirection:'column', gap:'10px'}}>
                                
                                {/* 1. OPEN: Show Applicants */}
                                {p.status === 'OPEN' && (
                                    <button 
                                        className="btn-secondaryU"
                                        style={{width: '100%', padding: '8px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)', color:'white', border:'1px solid #555', borderRadius:'5px'}}
                                        onClick={() => onViewApplicants(p.id)}
                                    >
                                        👥 Lihat Pelamar
                                    </button>
                                )}

                                {/* 2. ONGOING: Waiting for Student */}
                                {p.status === 'ONGOING' && (
                                     <div style={{textAlign:'center', color:'#ffc107', fontSize:'13px', background:'rgba(255, 193, 7, 0.1)', padding:'8px', borderRadius:'5px'}}>
                                        ⏳ Menunggu Submit
                                    </div>
                                )}

                                {/* 3. DONE: Student Submitted -> UMKM Can Finish */}
                                {p.status === 'DONE' && (
                                    <button 
                                        className="btn-primaryU" 
                                        style={{width: '100%', fontSize: '14px', justifyContent:'center', background:'#e50914', color:'white', border:'none', padding:'10px', borderRadius:'5px', cursor:'pointer'}}
                                        onClick={() => handleCompleteProject(p.id)}
                                    >
                                        ✅ Approve & Selesaikan
                                    </button>
                                )}
                                
                                {/* 4. CLOSED: Done -> ✅ RATE STUDENT (NEW) */}
                                {p.status === 'CLOSED' && (
                                    <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                        <div style={{textAlign:'center', color:'#46d369', fontWeight:'bold', border:'1px solid #46d369', padding:'8px', borderRadius:'5px', fontSize:'12px'}}>
                                            🎉 Project Selesai
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setReviewProject(p);
                                                setShowReviewModal(true);
                                            }}
                                            style={{
                                                width: '100%', padding: '8px', 
                                                background: 'linear-gradient(45deg, #ffc107, #ffdb58)', 
                                                color: 'black', fontWeight:'bold', border: 'none', 
                                                borderRadius: '5px', cursor: 'pointer'
                                            }}
                                        >
                                            ⭐ Rate Mahasiswa
                                        </button>
                                    </div>
                                )}

                                {/* LIHAT KONTRAK BUTTON */}
                                {(p.status === 'ONGOING' || p.status === 'DONE' || p.status === 'CLOSED') && (
                                    <button 
                                        onClick={() => onViewContract(p.id)}
                                        style={{
                                            width: '100%', padding: '8px', 
                                            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#aaa', 
                                            borderRadius: '5px', cursor: 'pointer', fontSize:'13px', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'
                                        }}
                                        onMouseOver={(e) => {e.target.style.color='white'; e.target.style.borderColor='white'}}
                                        onMouseOut={(e) => {e.target.style.color='#aaa'; e.target.style.borderColor='rgba(255,255,255,0.2)'}}
                                    >
                                        📄 Lihat Kontrak
                                    </button>
                                )}

                            </div>
                        </div>
                    </div>
                ))
            )}

            {/* ✅ MODAL REVIEW */}
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