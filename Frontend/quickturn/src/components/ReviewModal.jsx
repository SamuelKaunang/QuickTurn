import React, { useState } from 'react';
import { useToast } from './Toast';
import './ReviewModal.css';

const ReviewModal = ({ isOpen, onClose, onSubmit, projectTitle }) => {
    const toast = useToast();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (rating === 0) {
            toast.warning("Please give a star rating!");
            return;
        }
        // Send data back to the parent page
        onSubmit(rating, comment);

        // Reset form
        setRating(0);
        setComment("");
    };

    return (
        <div className="review-modal-overlay">
            <div className="review-modal-content">
                <div className="review-modal-header">
                    <h3>Rate Talent</h3>
                    <button onClick={onClose} className="review-close-btn">×</button>
                </div>

                <div className="review-modal-body">
                    <p className="review-project-title">{projectTitle}</p>

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
                        className="review-textarea"
                        placeholder="Write your review here... (e.g. Great work, very professional!)"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="review-modal-actions">
                    <button className="review-btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="review-btn-submit" onClick={handleSubmit}>Submit Review</button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;
