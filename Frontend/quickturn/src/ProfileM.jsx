import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, LogOut, Save, User, X, RotateCw, ZoomIn, Briefcase, Phone, Globe, Code, GraduationCap, MapPin } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './canvasUtils';
import { useToast } from './Toast';
import { api } from './utils/apiConfig';
import './ProfileM.css';

const ProfileM = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const token = sessionStorage.getItem("token");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nama: '', bio: '', skills: '', portfolioUrl: '', location: '', phone: '',
        headline: '', university: '', yearsExperience: 0, availability: '', linkedinUrl: '', githubUrl: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState({ projects: 0, rating: '5.0' });

    // Crop State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        if (!token) navigate('/login');

        const fetchProfile = async () => {
            try {
                const response = await fetch(api("/api/users/profile"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok && data.data) {
                    setFormData({
                        nama: data.data.nama || '',
                        bio: data.data.bio || '',
                        skills: data.data.skills || '',
                        portfolioUrl: data.data.portfolioUrl || '',
                        location: data.data.location || '',
                        phone: data.data.phone || '',
                        headline: data.data.headline || '',
                        university: data.data.university || '',
                        yearsExperience: data.data.yearsExperience || 0,
                        availability: data.data.availability || '',
                        linkedinUrl: data.data.linkedinUrl || '',
                        githubUrl: data.data.githubUrl || ''
                    });
                    setProfilePicture(data.data.profilePictureUrl);
                    setStats(prev => ({
                        ...prev,
                        rating: data.data.averageRating?.toFixed(1) || '5.0'
                    }));
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch(api("/api/applications/my-applications"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok && data.data) {
                    const approved = data.data.filter(app =>
                        app.status === 'APPROVED' || app.status === 'COMPLETED'
                    );
                    setStats(prev => ({
                        ...prev,
                        projects: approved.length
                    }));
                }
            } catch (err) { console.error(err); }
        };

        fetchProfile();
        fetchStats();
    }, [token, navigate]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'number' ? parseInt(value) || 0 : value
        });
    };

    const handleProfilePictureClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const MAX_SIZE = 50 * 1024 * 1024;

            if (file.size > MAX_SIZE) {
                toast.error(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max 50MB allowed.`, 'File Too Large');
                return;
            }

            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            const fileExtension = file.name.split('.').pop().toLowerCase();
            const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

            const isValidType = allowedTypes.includes(file.type);
            const isValidExtension = allowedExtensions.includes(fileExtension);

            if (!isValidType && !isValidExtension) {
                toast.error('Invalid file format. Please upload JPG, PNG, GIF, or WEBP.', 'Invalid Format');
                return;
            }

            const reader = new FileReader();
            reader.addEventListener('load', () => setImageSrc(reader.result));
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const uploadCroppedImage = async () => {
        if (!imageSrc || !croppedAreaPixels) {
            toast.warning('Please adjust the crop area first.');
            return;
        }

        try {
            setUploading(true);
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);

            if (!croppedImageBlob) {
                throw new Error("Canvas generation failed - blob is null");
            }

            const file = new File([croppedImageBlob], "profile_cropped.jpg", { type: "image/jpeg" });
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);

            const response = await fetch(api('/api/files/profile-picture'), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataUpload
            });

            const data = await response.json();
            if (response.ok) {
                setProfilePicture(data.data.url);
                setImageSrc(null);
                toast.success('Profile picture updated successfully!', 'Success');
            } else {
                toast.error(data.message || 'Failed to upload profile picture', 'Upload Failed');
            }
        } catch (e) {
            console.error("Crop/Upload Error:", e);
            toast.error('Failed to crop/upload image: ' + e.message, 'Error');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(api("/api/users/profile"), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success("Profile updated successfully!", 'Success');
                setTimeout(() => navigate('/dashboardm'), 1000);
            } else {
                toast.error("Failed to update profile.", 'Error');
            }
        } catch (err) { toast.error("Connection error.", 'Error'); }
    };

    const handleLogout = async () => {
        const confirmed = await toast.confirm({
            title: 'Confirm Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            cancelText: 'Cancel',
            type: 'warning'
        });

        if (confirmed) {
            sessionStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="profile-page">
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="profile-container">
                {/* Left Sidebar */}
                <div className="profile-sidebar">
                    <button onClick={() => navigate('/dashboardm')} className="btn-back">
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {/* Profile Picture */}
                    <div className="profile-picture-section">
                        <div
                            className={`profile-picture-wrapper ${uploading ? 'uploading' : ''}`}
                            onClick={handleProfilePictureClick}
                        >
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="profile-picture" />
                            ) : (
                                <div className="profile-picture-placeholder">
                                    <User size={56} />
                                </div>
                            )}
                            <div className="profile-picture-overlay">
                                <Camera size={28} />
                                <span>{uploading ? 'Uploading...' : 'Change'}</span>
                            </div>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <p className="picture-hint">Click to upload</p>
                    </div>

                    {/* User Info */}
                    <div className="sidebar-user-info">
                        <h3>{formData.nama || 'Your Name'}</h3>
                        <p>{formData.headline || 'Talent Account'}</p>
                    </div>

                    {/* Stats */}
                    <div className="sidebar-stats">
                        <div className="sidebar-stat">
                            <div className="sidebar-stat-value">{stats.projects}</div>
                            <div className="sidebar-stat-label">Projects</div>
                        </div>
                        <div className="sidebar-stat">
                            <div className="sidebar-stat-value">{stats.rating}</div>
                            <div className="sidebar-stat-label">Rating</div>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="sidebar-actions">
                        <button onClick={handleLogout} className="btn-logout-page">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Right Content */}
                <div className="profile-content">
                    <div className="profile-header-page">
                        <h2>Edit Talent Profile</h2>
                        <p>Make your profile stand out to attract more clients</p>
                    </div>

                    {loading ? <p className="loading-text">Loading profile...</p> : (
                        <form onSubmit={handleSubmit} className="profile-form-page">
                            {/* Personal Info */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Briefcase size={20} />
                                    <h3>Personal Information</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                placeholder="Your full name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Professional Headline</label>
                                            <input
                                                type="text"
                                                name="headline"
                                                value={formData.headline}
                                                onChange={handleChange}
                                                placeholder="e.g., Full Stack Developer"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Bio / Summary</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Tell clients about yourself, your experience, and what you can offer"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Education & Experience */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <GraduationCap size={20} />
                                    <h3>Education & Experience</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>University / Institution</label>
                                            <input
                                                type="text"
                                                name="university"
                                                value={formData.university}
                                                onChange={handleChange}
                                                placeholder="Your university or institution"
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Years of Experience</label>
                                            <input
                                                type="number"
                                                name="yearsExperience"
                                                value={formData.yearsExperience}
                                                onChange={handleChange}
                                                placeholder="0"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Availability</label>
                                        <select
                                            name="availability"
                                            value={formData.availability}
                                            onChange={handleChange}
                                        >
                                            <option value="">Select availability</option>
                                            <option value="Full-time">Full-time</option>
                                            <option value="Part-time">Part-time</option>
                                            <option value="Freelance">Freelance</option>
                                            <option value="Contract">Contract</option>
                                            <option value="Not Available">Not Available</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Code size={20} />
                                    <h3>Skills & Expertise</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-group">
                                        <label>Skills (comma separated)</label>
                                        <input
                                            type="text"
                                            name="skills"
                                            value={formData.skills}
                                            onChange={handleChange}
                                            placeholder="e.g., React, Node.js, UI/UX Design, Figma"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Phone size={20} />
                                    <h3>Contact Information</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>Phone Number</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                placeholder="+62 xxx xxxx xxxx"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Portfolio */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Globe size={20} />
                                    <h3>Portfolio & Links</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-group">
                                        <label>Portfolio / Personal Website</label>
                                        <input
                                            type="text"
                                            name="portfolioUrl"
                                            value={formData.portfolioUrl}
                                            onChange={handleChange}
                                            placeholder="https://your-portfolio.com"
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group half">
                                            <label>LinkedIn Profile</label>
                                            <input
                                                type="text"
                                                name="linkedinUrl"
                                                value={formData.linkedinUrl}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div className="form-group half">
                                            <label>GitHub Profile</label>
                                            <input
                                                type="text"
                                                name="githubUrl"
                                                value={formData.githubUrl}
                                                onChange={handleChange}
                                                placeholder="https://github.com/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Save */}
                            <div className="profile-actions">
                                <button type="submit" className="btn-save-page">
                                    <Save size={18} />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* CROP MODAL */}
            {imageSrc && (
                <div className="crop-modal-overlay">
                    <div className="crop-modal-container">
                        <div className="crop-modal-header">
                            <h3>Adjust Photo</h3>
                            <button onClick={() => { setImageSrc(null); fileInputRef.current.value = null; }} className="close-btn-icon">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="crop-container">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                rotation={rotation}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                onRotationChange={setRotation}
                            />
                        </div>
                        <div className="crop-controls">
                            <div className="control-group">
                                <ZoomIn size={16} />
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(e.target.value)}
                                    className="range-input"
                                />
                            </div>
                            <div className="control-group">
                                <RotateCw size={16} />
                                <input
                                    type="range"
                                    value={rotation}
                                    min={0}
                                    max={360}
                                    step={1}
                                    onChange={(e) => setRotation(e.target.value)}
                                    className="range-input"
                                />
                            </div>
                        </div>
                        <div className="crop-actions">
                            <button onClick={() => { setImageSrc(null); fileInputRef.current.value = null; }} className="btn-cancel-crop">
                                Cancel
                            </button>
                            <button onClick={uploadCroppedImage} className="btn-save-crop" disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Save & Upload'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfileM;