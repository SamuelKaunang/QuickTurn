import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ChevronRight, Briefcase, DollarSign, Calendar, FileText } from 'lucide-react';
import { useToast } from './Toast';
import './PostProject.css';

const PostProject = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(1);
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: '',
    category: 'IT / Web',
    budget: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    const storedToken = sessionStorage.getItem("token");
    if (!storedToken) {
      navigate("/login");
    }
    setToken(storedToken);
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    if (!formData.title || !formData.budget || !formData.deadline || !formData.description) {
      toast.warning("Please complete all fields.");
      setError("Please complete all fields.");
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

      if (!response.ok) throw new Error(data.message || "Failed to post project");

      toast.success('Project posted successfully!', 'Success');
      navigate("/dashboardU");

    } catch (err) {
      toast.error(err.message, 'Error');
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const getCategoryClass = (cat) => {
    if (cat.includes('IT')) return 'it';
    if (cat.includes('Marketing')) return 'marketing';
    if (cat.includes('Desain')) return 'design';
    if (cat.includes('Video')) return 'video';
    if (cat.includes('Writing') || cat.includes('Penulisan')) return 'writing';
    return 'default';
  };

  const stepLabels = ['Basics', 'Details', 'Review'];

  return (
    <div className="post-project-page">
      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>

      <div className="post-project-container">
        {/* Header */}
        <div className="post-header">
          <div className="post-header-left">
            <button onClick={() => navigate('/dashboardU')} className="btn-back-post">
              <ArrowLeft size={18} />
              Back
            </button>
            <div>
              <h1>Create New Project</h1>
              <p>Find the perfect talent for your project</p>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps-container">
          <div className="progress-steps">
            {[1, 2, 3].map((s, index) => (
              <div key={s} className="step">
                <div className={`step-circle ${step >= s ? 'step-completed' : 'step-incomplete'}`}>
                  {s}
                  <span className="step-label">{stepLabels[index]}</span>
                </div>
                {s < 3 && <div className={`step-line ${step > s ? 'step-line-active' : ''}`}></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Main Layout */}
        <div className="post-main-layout">
          {/* Form Section */}
          <div className="form-section">
            <div className="form-card">
              {/* Step 1: Basics */}
              {step === 1 && (
                <>
                  <div className="form-card-header">
                    <h2>Project Basics</h2>
                    <p>Start with the essential information</p>
                  </div>
                  <div className="form-card-body">
                    {error && <div className="post-error">{error}</div>}

                    <div className="form-group-post">
                      <label className="form-label">
                        Project Title <span>*</span>
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="e.g., E-commerce Website Development"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group-post">
                      <label className="form-label">
                        Category <span>*</span>
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="form-input form-select"
                      >
                        <option value="IT / Web">IT / Web Development</option>
                        <option value="Desain">Design & Creative</option>
                        <option value="Marketing">Digital Marketing</option>
                        <option value="Video">Video Production</option>
                        <option value="Writing">Content Writing</option>
                      </select>
                    </div>

                    <div className="form-actions">
                      <button
                        onClick={() => setStep(2)}
                        disabled={!formData.title}
                        className="btn-post-primary"
                      >
                        Continue to Details
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 2: Details */}
              {step === 2 && (
                <>
                  <div className="form-card-header">
                    <h2>Project Details</h2>
                    <p>Provide more information about your project</p>
                  </div>
                  <div className="form-card-body">
                    {error && <div className="post-error">{error}</div>}

                    <div className="form-group-post">
                      <label className="form-label">
                        Description <span>*</span>
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Describe your project requirements in detail..."
                        className="form-input form-textarea"
                        rows="5"
                      />
                    </div>

                    <div className="form-row-post">
                      <div className="form-group-post">
                        <label className="form-label">
                          Budget (Rp) <span>*</span>
                        </label>
                        <input
                          type="number"
                          name="budget"
                          value={formData.budget}
                          onChange={handleInputChange}
                          placeholder="e.g., 5000000"
                          className="form-input"
                        />
                      </div>
                      <div className="form-group-post">
                        <label className="form-label">
                          Deadline <span>*</span>
                        </label>
                        <input
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-actions">
                      <button onClick={() => setStep(1)} className="btn-post-secondary">
                        Back
                      </button>
                      <button onClick={() => setStep(3)} className="btn-post-primary">
                        Review Project
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Review */}
              {step === 3 && (
                <>
                  <div className="form-card-header">
                    <h2>Review & Post</h2>
                    <p>Make sure everything looks correct</p>
                  </div>
                  <div className="form-card-body">
                    {error && <div className="post-error">{error}</div>}

                    <div className="review-summary">
                      <div className="review-item">
                        <span className="review-item-label">Title</span>
                        <span className="review-item-value">{formData.title}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-item-label">Category</span>
                        <span className="review-item-value">{formData.category}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-item-label">Budget</span>
                        <span className="review-item-value highlight">
                          Rp {parseInt(formData.budget || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="review-item">
                        <span className="review-item-label">Deadline</span>
                        <span className="review-item-value">{formData.deadline}</span>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button onClick={() => setStep(2)} className="btn-post-secondary">
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="btn-post-primary"
                      >
                        {isSubmitting ? 'Posting...' : 'Post Project'}
                        <Send size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="preview-section">
            <div className="preview-label">Live Preview</div>
            <div className="preview-card">
              <div className={`preview-card-header ${getCategoryClass(formData.category)}`}>
                <span className="preview-badge">NEW</span>
              </div>
              <div className="preview-card-body">
                <div className="preview-category">{formData.category}</div>
                <div className="preview-title">{formData.title || "Your Project Title"}</div>
                <p className="preview-description">
                  {formData.description || "Project description will appear here..."}
                </p>
                <div className="preview-footer">
                  <span className="preview-budget">
                    {formData.budget ? `Rp ${parseInt(formData.budget).toLocaleString()}` : "Rp -"}
                  </span>
                  <span className="preview-deadline">
                    {formData.deadline || "Deadline"}
                  </span>
                </div>
              </div>
            </div>
            <div className="preview-note">
              <p>This is how talents will see your project</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProject;