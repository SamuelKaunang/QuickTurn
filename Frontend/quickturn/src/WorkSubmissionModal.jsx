import React, { useState, useRef } from 'react';
import { X, Upload, Link, FileText, Image, Archive, Trash2 } from 'lucide-react';
import { useToast } from './Toast';
import { api } from './utils/apiConfig';
import './WorkSubmissionModal.css';

const WorkSubmissionModal = ({ isOpen, onClose, projectId, token, onSubmitSuccess }) => {
    const toast = useToast();
    const [description, setDescription] = useState('');
    const [links, setLinks] = useState('');
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef(null);

    // Allowed file types
    const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed'
    ];

    const maxFileSize = 100 * 1024 * 1024; // 100MB
    const maxFiles = 10;

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files || []);
        setError('');

        // Validate file count
        if (files.length + selectedFiles.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        // Validate each file
        const validFiles = [];
        for (const file of selectedFiles) {
            if (!allowedTypes.includes(file.type)) {
                setError(`Invalid file type: ${file.name}. Allowed: Images, PDF, Word, ZIP`);
                continue;
            }
            if (file.size > maxFileSize) {
                setError(`File too large: ${file.name}. Max 100MB per file`);
                continue;
            }
            validFiles.push(file);
        }

        setFiles([...files, ...validFiles]);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const getFileIcon = (file) => {
        if (file.type.startsWith('image/')) return <Image size={20} />;
        if (file.type.includes('pdf') || file.type.includes('word')) return <FileText size={20} />;
        if (file.type.includes('zip') || file.type.includes('rar') || file.type.includes('7z')) return <Archive size={20} />;
        return <FileText size={20} />;
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!description.trim() && !links.trim() && files.length === 0) {
            setError('Please provide at least a description, link, or file');
            return;
        }

        setUploading(true);
        setError('');

        const formData = new FormData();
        formData.append('description', description);
        formData.append('links', links);
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(api(`/api/files/submission/${projectId}`), {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Work submitted successfully!', 'Success');
                onSubmitSuccess?.();
                onClose();
                // Reset form
                setDescription('');
                setLinks('');
                setFiles([]);
            } else {
                setError(data.message || 'Failed to submit work');
            }
        } catch (err) {
            setError('Connection error. Please try again.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            setDescription('');
            setLinks('');
            setFiles([]);
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="submission-modal-overlay" onClick={handleClose}>
            <div className="submission-modal" onClick={(e) => e.stopPropagation()}>
                <div className="submission-modal-header">
                    <h2>Submit Your Work</h2>
                    <button className="close-btn" onClick={handleClose} disabled={uploading}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="submission-modal-body">
                    {error && <div className="error-message">{error}</div>}

                    {/* Description */}
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe your work submission..."
                            rows={4}
                        />
                    </div>

                    {/* Links */}
                    <div className="form-group">
                        <label>
                            <Link size={16} /> External Links
                        </label>
                        <textarea
                            value={links}
                            onChange={(e) => setLinks(e.target.value)}
                            placeholder="Add links separated by comma or new line (e.g., Google Drive, GitHub...)"
                            rows={2}
                        />
                    </div>

                    {/* File Upload */}
                    <div className="form-group">
                        <label>
                            <Upload size={16} /> Upload Files ({files.length}/{maxFiles})
                        </label>
                        <div
                            className="file-drop-zone"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload size={32} />
                            <p>Click to upload or drag and drop</p>
                            <span>Images, PDF, Word, ZIP (Max 100MB each)</span>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.zip,.rar,.7z"
                            onChange={handleFileSelect}
                            style={{ display: 'none' }}
                        />
                    </div>

                    {/* Selected Files List */}
                    {files.length > 0 && (
                        <div className="selected-files">
                            {files.map((file, index) => (
                                <div key={index} className="file-item">
                                    <div className="file-icon">{getFileIcon(file)}</div>
                                    <div className="file-info">
                                        <span className="file-name">{file.name}</span>
                                        <span className="file-size">{formatFileSize(file.size)}</span>
                                    </div>
                                    <button
                                        type="button"
                                        className="remove-file-btn"
                                        onClick={() => removeFile(index)}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Submit Button */}
                    <div className="submission-actions">
                        <button type="button" className="btn-cancel" onClick={handleClose} disabled={uploading}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-submit" disabled={uploading}>
                            {uploading ? 'Submitting...' : 'Submit Work'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WorkSubmissionModal;
