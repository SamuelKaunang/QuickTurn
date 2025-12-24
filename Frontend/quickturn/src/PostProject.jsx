import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostProject.css';

const PostProject = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'IT', // Default matching backend
    budget: '',
    deadline: '',
    description: ''
  });

  // Load Token on Mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
        navigate("/login");
    }
    setToken(storedToken);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- API SUBMISSION ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    // Basic Validation
    if (!formData.title || !formData.budget || !formData.deadline || !formData.description) {
        setError("Mohon lengkapi semua data.");
        setIsSubmitting(false);
        return;
    }

    try {
        const response = await fetch("/api/projects", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.message || "Gagal memposting project");

        // Success! Redirect to Dashboard
        navigate("/dashboardU");
        
    } catch (err) {
        setError(err.message);
        setIsSubmitting(false);
    }
  };

  // Helper for UI
  const getHeaderGradient = (cat) => {
    if (cat.includes('IT')) return "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)";
    if (cat.includes('Marketing')) return "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)";
    if (cat.includes('Desain')) return "linear-gradient(135deg, #667eea 0%, #764ba2 100%)";
    return "linear-gradient(135deg, #e50914 0%, #b20710 100%)";
  };

  return (
    <div className="container">
      {/* Back Button */}
      <button onClick={() => navigate('/dashboardU')} className="back-btn">
        <span className="back-btn-icon">←</span> Kembali ke Dashboard
      </button>

      <div className="main-flex">
        
        {/* === LEFT COLUMN: FORM WIZARD === */}
        <div className="form-column">
          <h1 className="form-header">Buat Project Baru</h1>
          <p className="form-subheading">Ikuti langkah mudah ini untuk menemukan talent terbaik.</p>

          {/* Progress Steps */}
          <div className="progress-steps">
            {[1, 2, 3].map((s) => (
              <div key={s} className="step">
                <div className={`step-circle ${step >= s ? 'step-completed' : 'step-incomplete'}`}>
                  {s}
                </div>
                {s < 3 && <div className={`step-line ${step > s ? 'step-line-active' : ''}`}></div>}
              </div>
            ))}
          </div>

          <div className="form-content">
            {error && <div className="msg-error" style={{marginBottom: '1rem'}}>{error}</div>}

            {/* STEP 1: BASIC INFO */}
            {step === 1 && (
              <div className="animate-fadeIn space-y-4">
                <h2 className="section-header">Dasar Project</h2>
                
                <div className="form-group">
                  <label className="input-label">Judul Project</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Contoh: Website Katalog Produk UMKM"
                    className="input-field"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Kategori</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="IT / Web">IT / Web</option>
                    <option value="Desain">Desain</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Video">Video</option>
                    <option value="Writing">Penulisan</option>
                  </select>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!formData.title}
                  className={`btn btn-main ${!formData.title ? 'btn-disabled' : ''}`}
                >
                  Lanjut ke Detail
                </button>
              </div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 2 && (
               <div className="animate-fadeIn space-y-4">
                <h2 className="section-header">Detail & Budget</h2>

                <div className="form-group">
                  <label className="input-label">Deskripsi Lengkap</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Jelaskan kebutuhan project Anda secara detail..."
                    className="input-field textarea-field"
                    rows="5"
                  />
                </div>

                <div className="form-row">
                    <div className="form-group half">
                        <label className="input-label">Budget (Rp)</label>
                        <input
                            type="number"
                            name="budget"
                            value={formData.budget}
                            onChange={handleInputChange}
                            className="input-field"
                            placeholder="1000000"
                        />
                    </div>
                    <div className="form-group half">
                        <label className="input-label">Deadline</label>
                        <input
                            type="date"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="input-field"
                        />
                    </div>
                </div>

                <div className="btn-group">
                    <button onClick={() => setStep(1)} className="btn btn-secondary">Kembali</button>
                    <button onClick={() => setStep(3)} className="btn btn-main">Tinjau Project</button>
                </div>
              </div>
            )}

            {/* STEP 3: REVIEW */}
            {step === 3 && (
               <div className="animate-fadeIn space-y-4">
                <h2 className="section-header">Tinjau & Posting</h2>
                <p className="text-helper">Pastikan semua data sudah benar sebelum diposting.</p>
                
                <div className="review-box">
                    <p><strong>Judul:</strong> {formData.title}</p>
                    <p><strong>Kategori:</strong> {formData.category}</p>
                    <p><strong>Budget:</strong> Rp {parseInt(formData.budget).toLocaleString()}</p>
                    <p><strong>Deadline:</strong> {formData.deadline}</p>
                </div>

                <div className="btn-group">
                    <button onClick={() => setStep(2)} className="btn btn-secondary">Kembali</button>
                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="btn btn-main"
                    >
                        {isSubmitting ? "Memposting..." : "🚀 Posting Project Sekarang"}
                    </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === RIGHT COLUMN: LIVE PREVIEW === */}
        <div className="preview-column">
            <h3 className="preview-label">Live Preview</h3>
            <div className="card-preview">
                <div className="card-header" style={{background: getHeaderGradient(formData.category)}}>
                    <i className="fas fa-briefcase" style={{fontSize: '40px', opacity: 0.3}}></i>
                    <span className="card-header-new">NEW</span>
                </div>
                <div className="card-content">
                    <div className="card-category">{formData.category}</div>
                    <div className="card-title">{formData.title || "Judul Project Anda"}</div>
                    <p className="card-description">
                        {formData.description || "Deskripsi project akan muncul di sini..."}
                    </p>
                    <div className="card-footer">
                        <div className="card-budget">
                            {formData.budget ? `Rp ${parseInt(formData.budget).toLocaleString()}` : "Rp -"}
                        </div>
                        <div className="card-deadline">
                            {formData.deadline || "Tgl Deadline"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="preview-note">
                <p>Ini adalah tampilan kartu project Anda yang akan dilihat oleh Mahasiswa.</p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default PostProject;