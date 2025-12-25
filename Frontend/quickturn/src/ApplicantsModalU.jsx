import React, { useState, useEffect } from 'react';
import './ApplicantsModalU.css'; 

const ApplicantsModalU = ({ projectId, onClose, onAcceptSuccess, token }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch data
    const fetchApplicants = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}/applicants`, {
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
        if (!window.confirm("Terima mahasiswa ini? Project akan dimulai.")) return;
        try {
            const response = await fetch(`/api/projects/${projectId}/applicants/${appId}/accept`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                onAcceptSuccess();
                onClose();
            } else {
                alert("Gagal menerima pelamar.");
            }
        } catch (err) { alert("Error koneksi."); }
    };

    // ✅ NEW: HANDLE REJECT
    const handleReject = async (appId) => {
        if (!window.confirm("Yakin ingin menolak pelamar ini?")) return;
        try {
            const response = await fetch(`/api/projects/${projectId}/applicants/${appId}/reject`, {
                method: "POST",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                // Refresh list to show updated status
                fetchApplicants(); 
            } else {
                alert("Gagal menolak pelamar.");
            }
        } catch (err) { alert("Error koneksi."); }
    };

    return (
        <div className="modal-overlay-fixed">
            <div className="modal-box-modern">
                <div className="modal-header-modern">
                    <h3>Daftar Pelamar</h3>
                    <button onClick={onClose} className="btn-close-modern">✖</button>
                </div>

                <div className="modal-body-scroll">
                    {loading ? <p style={{color:'#666', textAlign:'center'}}>Loading...</p> : 
                     applicants.length === 0 ? <p style={{color:'#666', textAlign:'center'}}>Belum ada pelamar.</p> : 
                     applicants.map((app) => (
                        <div className="applicant-item" key={app.id}>
                            <div className="applicant-details">
                                <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                                    <h4>{app.studentName}</h4>
                                    <span style={{fontSize:'12px', background:'rgba(255, 193, 7, 0.2)', color:'#ffc107', padding:'2px 6px', borderRadius:'4px', display:'flex', alignItems:'center', gap:'4px'}}>
                                        ⭐ {app.studentRating ? app.studentRating.toFixed(1) : 'New'}
                                    </span>
                                </div>
                                <p>Tawaran: <span style={{color:'#fff'}}>Rp {app.bidAmount.toLocaleString()}</span></p>
                                <p className="applicant-quote">"{app.proposal}"</p>
                                
                                {/* Status Badge if Rejected */}
                                {app.status === 'REJECTED' && (
                                    <span style={{color:'#e50914', fontSize:'12px', fontWeight:'bold'}}>❌ Ditolak</span>
                                )}
                            </div>

                            {/* Buttons only for PENDING */}
                            {app.status === 'PENDING' && (
                                <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                                    <button onClick={() => handleAccept(app.id)} className="btn-accept-modern">
                                        <i className="fas fa-check"></i> Terima
                                    </button>
                                    {/* ✅ NEW REJECT BUTTON */}
                                    <button onClick={() => handleReject(app.id)} className="btn-reject-modern">
                                        <i className="fas fa-times"></i> Tolak
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApplicantsModalU;