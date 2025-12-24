import React, { useState, useEffect } from 'react';
import './ApplicantsModalU.css'; // Ensure this is imported!

const ApplicantsModalU = ({ projectId, onClose, onAcceptSuccess, token }) => {
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
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
                                <h4>{app.studentName}</h4>
                                <p>Tawaran: <span style={{color:'#fff'}}>Rp {app.bidAmount.toLocaleString()}</span></p>
                                <p className="applicant-quote">"{app.proposal}"</p>
                            </div>
                            {app.status === 'PENDING' && (
                                <button onClick={() => handleAccept(app.id)} className="btn-accept-modern">
                                    <i className="fas fa-check"></i> Terima
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ApplicantsModalU;