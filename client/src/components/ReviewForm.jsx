import React, { useState, useContext } from 'react';
import UserContext from '../contexts/UserContext';

export default function ReviewForm({ initialData = {}, onSave, onCancel }) {
    const { user } = useContext(UserContext);
    const [text, setText] = useState(initialData.text || '');
    const [rating, setRating] = useState(initialData.rating || 5);

    const handleSubmit = e => {
        e.preventDefault();
        if (!text) return;

        const review = {
            id: initialData.id,
            name: user.name,
            rating,
            text,
            createdAt: new Date().toISOString(),
        };
        onSave(review);
    };

    return (
        <form className="review-form" onSubmit={handleSubmit}>
            <h3>{initialData.id ? 'Edit Review' : 'Add Review'}</h3>
            <label>
                Rating:
                <select value={rating} onChange={e => setRating(+e.target.value)}>
                    {[5, 4, 3, 2, 1].map(n => (
                        <option key={n} value={n}>{n} Star{n > 1 && 's'}</option>
                    ))}
                </select>
            </label>
            <label>
                Your Review:
                <textarea
                    name="text"
                    defaultValue={editingReview?.text || ""}
                    placeholder="Write your review here (min 10 characters)..."
                    minLength={10}
                    required
                />

            </label>
            <div className="review-buttons">
                <button type="submit">Save</button>
                <button type="button" onClick={onCancel}>Cancel</button>
            </div>
        </form>
    );
}
