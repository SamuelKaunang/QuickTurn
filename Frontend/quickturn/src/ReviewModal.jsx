import React, { useState } from 'react';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, projectTitle }) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            alert("Please give a star rating!");
            return;
        }
        // Send data back to the parent page
        onSubmit(rating, comment);
        
        // Reset form
        setRating(0);
        setComment("");
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Rate Project</h2>
                <p style={{color: '#666', marginBottom: '10px'}}>
                    {projectTitle}
                </p>

                <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            className={`star ${star <= rating ? 'filled' : ''}`}
                            onClick={() => setRating(star)}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea
                    className="review-input"
                    placeholder="Write your review here... (e.g. Great work, very professional!)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-submit" onClick={handleSubmit}>Submit Review</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;