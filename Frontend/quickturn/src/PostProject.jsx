import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PostProject.css'; // Import CSS file

const PostProject = ({ onNavigate }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [draft, setDraft] = useState({
    title: '',
    category: 'OTHER',
    budget: '',
    deadline: '',
    description: '',
    skills: []
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDraft(prev => ({ ...prev, [name]: value }));
  };

  // Placeholder function to simulate description generation
  const handleGenerateDescription = async () => {
    if (!draft.title) return;
    setIsGenerating(true);
    // Placeholder for AI description generation
    const desc = `Deskripsi project untuk ${draft.title} dalam kategori ${draft.category}`;
    setDraft(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const getHeaderGradient = (cat) => {
    switch (cat) {
      case 'DESIGN': return "from-[#667eea] to-[#764ba2]";
      case 'IT': return "from-[#4facfe] to-[#00f2fe]";
      case 'MARKETING': return "from-[#f093fb] to-[#f5576c]";
      default: return "from-[#e50914] to-[#b20710]";
    }
  };

  // Placeholder icon handling
  const getIcon = (cat) => {
    switch (cat) {
      case 'DESIGN': return '🎨';  // Example icon for DESIGN
      case 'IT': return '💻';     // Example icon for IT
      case 'MARKETING': return '📢'; // Example icon for MARKETING
      case 'VIDEO': return '🎥';  // Example icon for VIDEO
      case 'WRITING': return '✍️'; // Example icon for WRITING
      default: return '👜'; // Default icon
    }
  };

  const PreviewCardIcon = getIcon(draft.category);

  return (
    <div className="container">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboardU')}
        className="back-btn"
      >
        <span className="back-btn-icon">←</span> Kembali ke Dashboard
      </button>

      <div className="main-flex">
        {/* Left Column: Form */}
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
            {step === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <h2 className="text-xl font-semibold border-b border-white/10 pb-4">Dasar Project</h2>
                {/* Form content */}
                <div className="space-y-2">
                  <label className="input-label">Judul Project</label>
                  <input
                    type="text"
                    name="title"
                    value={draft.title}
                    onChange={handleInputChange}
                    placeholder="Contoh: Desain Logo Minimalis untuk Coffee Shop"
                    className="input-field"
                  />
                  <p className="text-helper">Buat judul yang menarik dan spesifik.</p>
                </div>

                <div className="space-y-2">
                  <label className="input-label">Kategori</label>
                  <select
                    name="category"
                    value={draft.category}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    {['DESIGN', 'IT', 'MARKETING', 'VIDEO', 'WRITING'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={!draft.title}
                  className="btn btn-main"
                >
                  Lanjut ke Detail
                </button>
              </div>
            )}
          </div>
        </div>
        {/* Add right column and rest of the content in the same way */}
      </div>
    </div>
  );
};

export default PostProject;
