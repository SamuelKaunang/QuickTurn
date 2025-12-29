import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileM.css';

const ProfileM = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");

    const [formData, setFormData] = useState({
        nama: '', bio: '', skills: '', portfolioUrl: '', location: '', phone: ''
    });
    const [loading, setLoading] = useState(true);

    // Redirect if not logged in
    useEffect(() => {
        if (!token) navigate('/login');

        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/users/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok) {
                    setFormData({
                        nama: data.data.nama || '',
                        bio: data.data.bio || '',
                        skills: data.data.skills || '',
                        portfolioUrl: data.data.portfolioUrl || '',
                        location: data.data.location || '',
                        phone: data.data.phone || ''
                    });
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };
        fetchProfile();
    }, [token, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                alert("Profil berhasil diperbarui!");
                navigate('/dashboardm'); // Go back to dashboard
            } else {
                alert("Gagal memperbarui profil.");
            }
        } catch (err) { alert("Error koneksi."); }
    };

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin logout?")) {
            sessionStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <div className="profile-header-page">
                    <button onClick={() => navigate('/dashboardm')} className="btn-back">
                        <i className="fas fa-arrow-left"></i> Kembali
                    </button>
                    <h2>Edit Profil Mahasiswa</h2>
                </div>

                {loading ? <p>Loading...</p> : (
                    <form onSubmit={handleSubmit} className="profile-form-page">
                        <div className="form-group">
                            <label>Nama Lengkap</label>
                            <input type="text" name="nama" value={formData.nama} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Bio / Ringkasan Diri</label>
                            <textarea name="bio" value={formData.bio} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Keahlian (Skills)</label>
                            <input type="text" name="skills" value={formData.skills} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Link Portofolio</label>
                            <input type="text" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} />
                        </div>
                        <div className="form-row">
                            <div className="form-group half">
                                <label>Lokasi</label>
                                <input type="text" name="location" value={formData.location} onChange={handleChange} />
                            </div>
                            <div className="form-group half">
                                <label>No. HP</label>
                                <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="profile-actions">
                            <button type="button" onClick={handleLogout} className="btn-logout-page">
                                <i className="fas fa-sign-out-alt"></i> Logout
                            </button>
                            <button type="submit" className="btn-save-page">
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ProfileM;