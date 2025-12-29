import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileU.css';

const ProfileU = () => {
    const navigate = useNavigate();
    const token = sessionStorage.getItem("token");
    const [formData, setFormData] = useState({ nama: '', bio: '', location: '', portfolioUrl: '', phone: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) navigate('/login');
        const fetchProfile = async () => {
            try {
                const response = await fetch("/api/users/profile", { headers: { "Authorization": `Bearer ${token}` } });
                const data = await response.json();
                if (response.ok) setFormData({
                    nama: data.data.nama || '', bio: data.data.bio || '', location: data.data.location || '',
                    portfolioUrl: data.data.portfolioUrl || '', phone: data.data.phone || ''
                });
            } catch (err) { console.error(err); } finally { setLoading(false); }
        };
        fetchProfile();
    }, [token, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (response.ok) { alert("Profil Bisnis Diperbarui!"); navigate('/dashboardu'); }
            else alert("Error updating.");
        } catch (err) { alert("Connection Error"); }
    };

    const handleLogout = () => {
        if (window.confirm("Yakin ingin logout?")) { sessionStorage.clear(); navigate('/login'); }
    };

    return (
        <div className="profile-page-u">
            <div className="profile-container-u">
                <div className="profile-header-page-u">
                    <button onClick={() => navigate('/dashboardu')} className="btn-back-u">
                        ⬅ Kembali ke Dashboard
                    </button>
                    <h2>Edit Profil UMKM</h2>
                </div>
                {loading ? <p>Loading...</p> : (
                    <form onSubmit={handleSubmit} className="profile-form-page-u">
                        <div className="form-group-u"><label>Nama Bisnis</label><input name="nama" value={formData.nama} onChange={handleChange} /></div>
                        <div className="form-group-u"><label>Deskripsi Bisnis</label><textarea name="bio" value={formData.bio} onChange={handleChange} /></div>
                        <div className="form-group-u"><label>Website / Sosmed</label><input name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} /></div>
                        <div className="form-row-u">
                            <div className="form-group-u half"><label>Lokasi</label><input name="location" value={formData.location} onChange={handleChange} /></div>
                            <div className="form-group-u half"><label>Kontak (WA)</label><input name="phone" value={formData.phone} onChange={handleChange} /></div>
                        </div>
                        <div className="profile-actions-u">
                            <button type="button" onClick={handleLogout} className="btn-logout-page-u">Logout</button>
                            <button type="submit" className="btn-save-page-u">Simpan Profil</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};
export default ProfileU;