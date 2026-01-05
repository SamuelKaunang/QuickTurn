import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, ChevronRight, Briefcase, DollarSign, Calendar, FileText, Sparkles, Clock, Target, X, Paperclip, Upload, File } from 'lucide-react';
import { useToast } from '../components/Toast';
import { api } from '../utils/apiConfig';
import './PostProject.css';

// Skill suggestions by category
const skillSuggestions = {
  'IT / Web': ['React', 'Node.js', 'JavaScript', 'Python', 'PHP', 'Laravel', 'MySQL', 'MongoDB', 'HTML/CSS', 'Vue.js', 'Flutter', 'TypeScript'],
  'Desain': ['Figma', 'Photoshop', 'Illustrator', 'Corel Draw', 'Canva', 'After Effects', 'Premiere Pro', 'UI/UX', 'Branding'],
  'Marketing': ['SEO', 'Google Ads', 'Facebook Ads', 'Instagram Marketing', 'Content Strategy', 'Email Marketing', 'Analytics', 'Copywriting'],
  'Video': ['Premiere Pro', 'After Effects', 'DaVinci Resolve', 'Final Cut Pro', 'Motion Graphics', 'Color Grading', 'Sound Design', 'Videography'],
  'Writing': ['Copywriting', 'SEO Writing', 'Blog Writing', 'Technical Writing', 'Proofreading', 'Editing', 'Content Strategy', 'Research']
};

const durationOptions = [
  { value: '1-3 days', label: '1-3 Hari' },
  { value: '1 week', label: '1 Minggu' },
  { value: '2 weeks', label: '2 Minggu' },
  { value: '3-4 weeks', label: '3-4 Minggu' },
  { value: '1-2 months', label: '1-2 Bulan' },
  { value: '3+ months', label: '3+ Bulan' }
];

const complexityOptions = [
  { value: 'BEGINNER', label: 'Beginner', description: 'Cocok untuk pemula', color: '#22c55e' },
  { value: 'INTERMEDIATE', label: 'Intermediate', description: 'Butuh pengalaman menengah', color: '#f59e0b' },
  { value: 'EXPERT', label: 'Expert', description: 'Butuh keahlian tinggi', color: '#ef4444' }
];

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
    description: '',
    requiredSkills: [],
    estimatedDuration: '1 week',
    complexity: 'INTERMEDIATE',
    briefText: '' // Detailed instructions for accepted talent
  });

  // Attachment state
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [skillInput, setSkillInput] = useState('');

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

  const addSkill = (skill) => {
    if (skill && !formData.requiredSkills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, skill]
      }));
    }
    setSkillInput('');
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skillToRemove)
    }));
  };

  const handleSkillInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill(skillInput.trim());
    }
  };

  // Handle file attachment
  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) { // 25MB limit
        toast.error('File too large. Maximum size is 25MB.');
        return;
      }
      setAttachment(file);
      setAttachmentPreview({
        name: file.name,
        size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
        type: file.type
      });
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
  };

  // Upload attachment to server
  const uploadAttachment = async (projectId) => {
    if (!attachment) return null;

    const formData = new FormData();
    formData.append('file', attachment);

    const response = await fetch(api(`/api/files/project-attachment/${projectId}`), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to upload attachment');

    return data.data;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    if (!formData.title || !formData.budget || !formData.deadline || !formData.description) {
      toast.warning("Please complete all required fields.");
      setError("Please complete all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Step 1: Create the project
      const payload = {
        ...formData,
        requiredSkills: formData.requiredSkills.join(', ')
      };

      const response = await fetch(api("/api/projects"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // Check for email verification error
      if (response.status === 403 && data.error === 'EMAIL_NOT_VERIFIED') {
        navigate('/email-verification-required', {
          state: {
            action: 'post',
            email: data.email,
            returnPath: '/dashboardu'
          }
        });
        return;
      }

      if (!response.ok) throw new Error(data.message || "Failed to post project");

      const projectId = data.data.id;

      // Step 2: Upload attachment if present
      if (attachment) {
        setIsUploading(true);
        try {
          await uploadAttachment(projectId);
        } catch (uploadErr) {
          console.error("Attachment upload failed:", uploadErr);
          // Project is created, just warn about attachment
          toast.warning('Project created, but attachment upload failed.');
        }
        setIsUploading(false);
      }

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

  const getComplexityColor = (complexity) => {
    const opt = complexityOptions.find(o => o.value === complexity);
    return opt ? opt.color : '#64748b';
  };

  const stepLabels = ['Basics', 'Details', 'Brief', 'Review'];
  const currentSuggestions = skillSuggestions[formData.category] || [];

  return (
    <div className="post-project-page">
      {/* Mobile Floating Back Button */}
      <button className="mobile-floating-back" onClick={() => navigate('/dashboardU')}>
        <ArrowLeft size={22} />
      </button>

      <div className="bg-glow glow-1"></div>
      <div className="bg-glow glow-2"></div>
      <div className="bg-glow glow-3"></div>

      <div className="post-project-container">
        {/* Header */}
        <div className="post-header">
          <div className="post-header-left">
            <button onClick={() => navigate('/dashboardU')} className="btn-back-post hide-on-mobile">
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
            {[1, 2, 3, 4].map((s, index) => (
              <div key={s} className="step">
                <div className={`step-circle ${step >= s ? 'step-completed' : 'step-incomplete'}`}>
                  {s}
                  <span className="step-label">{stepLabels[index]}</span>
                </div>
                {s < 4 && <div className={`step-line ${step > s ? 'step-line-active' : ''}`}></div>}
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

                    {/* NEW: Required Skills */}
                    <div className="form-group-post">
                      <label className="form-label">
                        <Sparkles size={16} style={{ marginRight: '6px', color: '#f59e0b' }} />
                        Required Skills
                      </label>
                      <div className="skills-input-container">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={handleSkillInputKeyDown}
                          placeholder="Type skill and press Enter..."
                          className="form-input"
                        />
                      </div>

                      {/* Skill Tags */}
                      {formData.requiredSkills.length > 0 && (
                        <div className="skill-tags-container">
                          {formData.requiredSkills.map((skill, idx) => (
                            <span key={idx} className="skill-tag">
                              {skill}
                              <button type="button" onClick={() => removeSkill(skill)} className="skill-remove">
                                <X size={12} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Suggested Skills */}
                      <div className="skill-suggestions">
                        <span className="suggestion-label">Suggestions:</span>
                        {currentSuggestions.slice(0, 6).map((skill, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className={`suggestion-chip ${formData.requiredSkills.includes(skill) ? 'selected' : ''}`}
                            disabled={formData.requiredSkills.includes(skill)}
                          >
                            + {skill}
                          </button>
                        ))}
                      </div>
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

                    {/* NEW: Estimated Duration */}
                    <div className="form-row-post">
                      <div className="form-group-post">
                        <label className="form-label">
                          <Clock size={16} style={{ marginRight: '6px', color: '#3b82f6' }} />
                          Estimated Duration
                        </label>
                        <select
                          name="estimatedDuration"
                          value={formData.estimatedDuration}
                          onChange={handleInputChange}
                          className="form-input form-select"
                        >
                          {durationOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>

                      {/* NEW: Complexity */}
                      <div className="form-group-post">
                        <label className="form-label">
                          <Target size={16} style={{ marginRight: '6px', color: '#ef4444' }} />
                          Project Complexity
                        </label>
                        <select
                          name="complexity"
                          value={formData.complexity}
                          onChange={handleInputChange}
                          className="form-input form-select"
                          style={{ borderColor: getComplexityColor(formData.complexity) }}
                        >
                          {complexityOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label} - {opt.description}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button onClick={() => setStep(1)} className="btn-post-secondary">
                        Back
                      </button>
                      <button onClick={() => setStep(3)} className="btn-post-primary">
                        Continue to Brief
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 3: Brief & Attachments */}
              {step === 3 && (
                <>
                  <div className="form-card-header">
                    <h2>
                      <Paperclip size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
                      Brief & Attachments
                    </h2>
                    <p>Add detailed instructions and supporting files (visible to accepted talent only)</p>
                  </div>
                  <div className="form-card-body">
                    {error && <div className="post-error">{error}</div>}

                    {/* Info Box */}
                    <div className="brief-info-box">
                      <div className="info-icon">🔒</div>
                      <div className="info-content">
                        <strong>Private Content</strong>
                        <p>Brief and attachments are only visible to the talent you accept for this project.</p>
                      </div>
                    </div>

                    <div className="form-group-post">
                      <label className="form-label">
                        <FileText size={16} style={{ marginRight: '6px', color: '#3b82f6' }} />
                        Project Brief (Optional)
                      </label>
                      <textarea
                        name="briefText"
                        value={formData.briefText}
                        onChange={handleInputChange}
                        placeholder="Add detailed instructions, design guidelines, technical specifications, or any private information the accepted talent needs to know..."
                        className="form-input form-textarea"
                        rows="6"
                      />
                      <span className="form-hint">This is only visible to the accepted talent after contract initiation.</span>
                    </div>

                    <div className="form-group-post">
                      <label className="form-label">
                        <Paperclip size={16} style={{ marginRight: '6px', color: '#7c3aed' }} />
                        Attachment (Optional)
                      </label>

                      {!attachmentPreview ? (
                        <label className="file-upload-area">
                          <input
                            type="file"
                            onChange={handleAttachmentChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.jpg,.jpeg,.png,.gif"
                            style={{ display: 'none' }}
                          />
                          <Upload size={32} className="upload-icon" />
                          <span className="upload-text">Click to upload file</span>
                          <span className="upload-hint">PDF, DOC, XLS, Images, ZIP (max 25MB)</span>
                        </label>
                      ) : (
                        <div className="attachment-preview">
                          <div className="attachment-info">
                            <File size={24} className="file-icon" />
                            <div>
                              <span className="attachment-name">{attachmentPreview.name}</span>
                              <span className="attachment-size">{attachmentPreview.size}</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={removeAttachment}
                            className="attachment-remove"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="form-actions">
                      <button onClick={() => setStep(2)} className="btn-post-secondary">
                        Back
                      </button>
                      <button onClick={() => setStep(4)} className="btn-post-primary">
                        Review Project
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
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
                      <div className="review-item">
                        <span className="review-item-label">Duration</span>
                        <span className="review-item-value">{formData.estimatedDuration}</span>
                      </div>
                      <div className="review-item">
                        <span className="review-item-label">Complexity</span>
                        <span className="review-item-value" style={{ color: getComplexityColor(formData.complexity) }}>
                          {complexityOptions.find(o => o.value === formData.complexity)?.label}
                        </span>
                      </div>
                      {formData.requiredSkills.length > 0 && (
                        <div className="review-item">
                          <span className="review-item-label">Required Skills</span>
                          <div className="review-skills">
                            {formData.requiredSkills.map((skill, idx) => (
                              <span key={idx} className="skill-tag-small">{skill}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Brief & Attachment Status */}
                      <div className="review-item">
                        <span className="review-item-label">
                          <Paperclip size={14} style={{ marginRight: '6px' }} />
                          Brief
                        </span>
                        <span className="review-item-value">
                          {formData.briefText ? '✓ Added' : 'Not added'}
                        </span>
                      </div>
                      <div className="review-item">
                        <span className="review-item-label">
                          <File size={14} style={{ marginRight: '6px' }} />
                          Attachment
                        </span>
                        <span className="review-item-value">
                          {attachmentPreview ? (
                            <span style={{ fontSize: '0.85rem' }}>
                              ✓ {attachmentPreview.name}
                            </span>
                          ) : 'No file'}
                        </span>
                      </div>
                    </div>

                    <div className="form-actions">
                      <button onClick={() => setStep(3)} className="btn-post-secondary">
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || isUploading}
                        className="btn-post-primary"
                      >
                        {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post Project'}
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
                <span className="preview-complexity-badge" style={{ backgroundColor: getComplexityColor(formData.complexity) }}>
                  {complexityOptions.find(o => o.value === formData.complexity)?.label}
                </span>
              </div>
              <div className="preview-card-body">
                <div className="preview-category">{formData.category}</div>
                <div className="preview-title">{formData.title || "Your Project Title"}</div>

                {/* Skills Preview */}
                {formData.requiredSkills.length > 0 && (
                  <div className="preview-skills">
                    {formData.requiredSkills.slice(0, 4).map((skill, idx) => (
                      <span key={idx} className="preview-skill-tag">{skill}</span>
                    ))}
                    {formData.requiredSkills.length > 4 && (
                      <span className="preview-skill-more">+{formData.requiredSkills.length - 4}</span>
                    )}
                  </div>
                )}

                <p className="preview-description">
                  {formData.description || "Project description will appear here..."}
                </p>

                <div className="preview-meta-row">
                  <span className="preview-duration">
                    <Clock size={14} />
                    {formData.estimatedDuration}
                  </span>
                  <span className="preview-applicants">
                    0 applicants
                  </span>
                </div>

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
