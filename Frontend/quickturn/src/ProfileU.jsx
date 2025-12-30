import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ArrowLeft, LogOut, Save, Users, X, RotateCw, ZoomIn, Building2, Phone, Globe, MapPin } from 'lucide-react';
import Cropper from 'react-easy-crop';
import getCroppedImg from './canvasUtils';
import { useToast } from './Toast';
import './ProfileU.css';

const ProfileU = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const token = sessionStorage.getItem("token");
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        nama: '', bio: '', location: '', portfolioUrl: '', phone: '',
        headline: '', university: '', address: '', linkedinUrl: '', githubUrl: ''
    });
    const [profilePicture, setProfilePicture] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [stats, setStats] = useState({ projects: 0, hires: 0 });

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
                const response = await fetch("/api/users/profile", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok && data.data) {
                    setFormData({
                        nama: data.data.nama || '',
                        bio: data.data.bio || '',
                        location: data.data.location || '',
                        portfolioUrl: data.data.portfolioUrl || '',
                        phone: data.data.phone || '',
                        headline: data.data.headline || '',
                        university: data.data.university || '',
                        address: data.data.address || '',
                        linkedinUrl: data.data.linkedinUrl || '',
                        githubUrl: data.data.githubUrl || ''
                    });
                    setProfilePicture(data.data.profilePictureUrl);
                }
            } catch (err) { console.error(err); }
            finally { setLoading(false); }
        };

        const fetchStats = async () => {
            try {
                const response = await fetch("/api/projects/my-projects", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (response.ok && data.data) {
                    const projects = data.data;
                    setStats({
                        projects: projects.length,
                        hires: projects.filter(p => p.status === 'IN_PROGRESS' || p.status === 'CLOSED').length
                    });
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

            const response = await fetch('/api/files/profile-picture', {
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
            const response = await fetch("/api/users/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                toast.success("Business profile updated!", 'Success');
                setTimeout(() => navigate('/dashboardu'), 1000);
            } else {
                toast.error("Error updating profile.", 'Error');
            }
        } catch (err) { toast.error("Connection Error", 'Error'); }
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
        <div className="profile-page-u">
            <div className="bg-glow glow-1"></div>
            <div className="bg-glow glow-2"></div>

            <div className="profile-container-u">
                {/* Left Sidebar */}
                <div className="profile-sidebar-u">
                    <button onClick={() => navigate('/dashboardu')} className="btn-back-u">
                        <ArrowLeft size={16} />
                        Back
                    </button>

                    {/* Profile Picture */}
                    <div className="profile-picture-section-u">
                        <div
                            className={`profile-picture-wrapper-u ${uploading ? 'uploading' : ''}`}
                            onClick={handleProfilePictureClick}
                        >
                            {profilePicture ? (
                                <img src={profilePicture} alt="Profile" className="profile-picture-u" />
                            ) : (
                                <div className="profile-picture-placeholder-u">
                                    <Users size={56} />
                                </div>
                            )}
                            <div className="profile-picture-overlay-u">
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
                        <p className="picture-hint-u">Click to upload</p>
                    </div>

                    {/* User Info */}
                    <div className="sidebar-user-info">
                        <h3>{formData.nama || 'Your Business'}</h3>
                        <p>{formData.headline || 'Client Account'}</p>
                    </div>

                    {/* Stats */}
                    <div className="sidebar-stats">
                        <div className="sidebar-stat">
                            <div className="sidebar-stat-value">{stats.projects}</div>
                            <div className="sidebar-stat-label">Projects</div>
                        </div>
                        <div className="sidebar-stat">
                            <div className="sidebar-stat-value">{stats.hires}</div>
                            <div className="sidebar-stat-label">Hires</div>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <div className="sidebar-actions">
                        <button onClick={handleLogout} className="btn-logout-page-u">
                            <LogOut size={18} />
                            Logout
                        </button>
                    </div>
                </div>

                {/* Right Content */}
                <div className="profile-content-u">
                    <div className="profile-header-page-u">
                        <h2>Edit Business Profile</h2>
                        <p>Update your business information to attract more talents</p>
                    </div>

                    {loading ? <p className="loading-text">Loading profile...</p> : (
                        <form onSubmit={handleSubmit} className="profile-form-page-u">
                            {/* Business Info Section */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Building2 size={20} />
                                    <h3>Business Information</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-row-u">
                                        <div className="form-group-u half">
                                            <label>Business Name *</label>
                                            <input
                                                type="text"
                                                name="nama"
                                                value={formData.nama}
                                                onChange={handleChange}
                                                placeholder="Your company or business name"
                                                required
                                            />
                                        </div>
                                        <div className="form-group-u half">
                                            <label>Headline / Tagline</label>
                                            <input
                                                type="text"
                                                name="headline"
                                                value={formData.headline}
                                                onChange={handleChange}
                                                placeholder="e.g., Local Coffee Shop Owner"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group-u">
                                        <label>About Your Business</label>
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            rows={4}
                                            placeholder="Tell talents about your business, what you do, and what projects you typically need help with"
                                        />
                                    </div>
                                    <div className="form-group-u">
                                        <label>Company / Organization</label>
                                        <input
                                            type="text"
                                            name="university"
                                            value={formData.university}
                                            onChange={handleChange}
                                            placeholder="Your company or organization name"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info Section */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Phone size={20} />
                                    <h3>Contact Information</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-row-u">
                                        <div className="form-group-u half">
                                            <label>Location</label>
                                            <input
                                                type="text"
                                                name="location"
                                                value={formData.location}
                                                onChange={handleChange}
                                                placeholder="City, Country"
                                            />
                                        </div>
                                        <div className="form-group-u half">
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
                                    <div className="form-group-u">
                                        <label>Business Address</label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={2}
                                            placeholder="Enter your complete business address"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Online Presence Section */}
                            <div className="form-section-card">
                                <div className="form-section-header">
                                    <Globe size={20} />
                                    <h3>Online Presence</h3>
                                </div>
                                <div className="form-section-body">
                                    <div className="form-group-u">
                                        <label>Website / Portfolio</label>
                                        <input
                                            type="text"
                                            name="portfolioUrl"
                                            value={formData.portfolioUrl}
                                            onChange={handleChange}
                                            placeholder="https://your-business.com"
                                        />
                                    </div>
                                    <div className="form-row-u">
                                        <div className="form-group-u half">
                                            <label>LinkedIn Profile</label>
                                            <input
                                                type="text"
                                                name="linkedinUrl"
                                                value={formData.linkedinUrl}
                                                onChange={handleChange}
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                        </div>
                                        <div className="form-group-u half">
                                            <label>GitHub / Other</label>
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

                            {/* Save Button */}
                            <div className="profile-actions-u">
                                <button type="submit" className="btn-save-page-u">
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
                            <h3>Adjust Your Photo</h3>
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

export default ProfileU;