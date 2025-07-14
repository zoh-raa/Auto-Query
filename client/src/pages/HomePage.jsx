import React, { useEffect, useState, useContext } from 'react';
import ReviewForm from '../components/ReviewForm';
import UserContext from '../contexts/UserContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const HomePage = () => {
    const { user } = useContext(UserContext);
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        axios.get('http://localhost:3001/review')
            .then(res => setReviews(res.data))
            .catch(err => {
                console.error(err);
                toast.error("Failed to load reviews");
            });
    }, []);

    const handleSubmitReview = (review) => {
        if (editingReview) {
            axios.put(`http://localhost:3001/review/${editingReview.id}`, review)
                .then(res => {
                    toast.success("Review updated!");
                    setEditingReview(null);
                    setShowForm(false);
                    // Reload reviews
                    return axios.get('http://localhost:3001/review');
                })
                .then(res => setReviews(res.data))
                .catch(() => toast.error("Something went wrong. Please try again."));
        } else {
            axios.post('http://localhost:3001/review', review)
                .then(res => {
                    toast.success("Review submitted!");
                    setShowForm(false);
                    // Reload reviews
                    return axios.get('http://localhost:3001/review');
                })
                .then(res => setReviews(res.data))
                .catch(() => toast.error("Something went wrong. Please try again."));
        }
    };


    const handleDeleteReview = async (id) => {
        try {
            await fetch(`http://localhost:3001/review/${id}`, {
                method: 'DELETE'
            });

            const res = await fetch('http://localhost:3001/review');
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error('Error deleting review:', err);
        }
    };

    const averageRating = (list) => {
        if (list.length === 0) return 0;
        const total = list.reduce((sum, r) => sum + parseFloat(r.rating), 0);
        return (total / list.length).toFixed(1);
    };

    return (
        <div className="HomePage">
            <h1>Online Parts Store</h1>
            <p>Genuine Parts Store with Worldwide Delivery</p>

            {/* Brands Section */}
            <div className="brand-section">
                <div className="brand-box">
                    <h2>YAMAHA <img src="/images/yamaha-logo.png" className="brand-logo" /></h2>
                </div>
                <div className="brand-box">
                    <h2>HONDA <img src="/images/honda-logo.jpg" className="brand-logo" /></h2>
                </div>
            </div>

            {/* Frequently Bought Section */}
            <div className="frequently-bought-section">
                <h2 className="section-title">Frequently Bought Parts</h2>
                <div className="parts-grid">
                    <div className="part-card">
                        <img src="/images/part1.png" alt="Part 1" />
                        <p>Yamaha BYSON Exhaust</p>
                        <input type="checkbox" />
                    </div>
                    <div className="part-card">
                        <img src="/images/part2.png" alt="Part 2" />
                        <p>RACING Honda CBR500R Tail Tidy</p>
                        <input type="checkbox" />
                    </div>
                    <div className="part-card">
                        <img src="/images/part3.png" alt="Part 3" />
                        <p>Yamaha Aerox GDR155 Oil Pump</p>
                        <input type="checkbox" />
                    </div>
                </div>
                <div className="cart-summary">
                    <span>Total $150</span>
                    <button>Add All to Cart</button>
                </div>
            </div>

            {/* Promo Bundles */}
            <div className="promo-bundles-section">
                <h2 className="section-title">Promo Bundles</h2>
                <div className="bundle-grid">
                    <div className="bundle-card">
                        <h3>YAMAHA</h3>
                        <p className="bundle-desc">Service Parts for Yamaha Aerox 50</p>
                        <div className="bundle-parts">
                            <div className="bundle-item"><img src="/images/part4.png" alt="Part A" /><p>Oil Filter</p></div>
                            <div className="bundle-item"><img src="/images/part5.jpg" alt="Part B" /><p>Frame</p></div>
                            <div className="bundle-item"><img src="/images/part6.jpeg" alt="Part C" /><p>Brake Pad</p></div>
                            <div className="bundle-item"><img src="/images/part7.jpeg" alt="Part D" /><p>Spark Plug</p></div>
                        </div>
                        <p className="bundle-price">$300 Bundle</p>
                        <button>Add Bundle to Cart</button>
                    </div>

                    <div className="bundle-card">
                        <h3>HONDA</h3>
                        <p className="bundle-desc">Touring Essentials for Honda</p>
                        <div className="bundle-parts">
                            <div className="bundle-item"><img src="/images/part8.png" alt="Part E" /><p>Honda Front Fender CB125F</p></div>
                            <div className="bundle-item"><img src="/images/part9.png" alt="Part F" /><p>Gearshift Drum CB125F</p></div>
                            <div className="bundle-item"><img src="/images/part10.png" alt="Part G" /><p>L Crankcase Cover</p></div>
                            <div className="bundle-item"><img src="/images/part11.jpeg" alt="Part H" /><p>Air Filter</p></div>
                        </div>
                        <p className="bundle-price">$275 Bundle</p>
                        <button>Add Bundle to Cart</button>
                    </div>
                </div>
            </div>

            {/* Recommended */}
            <div className="recommended-section">
                <h2 className="section-title">Recommended For You</h2>
                <div className="parts-grid">
                    <div className="part-card"><img src="/images/part12.png" alt="Part 12" /><p>Honda Chain Sprocket Kit</p><small className="added-time">Added 1 day ago</small></div>
                    <div className="part-card"><img src="/images/part13.jpg" alt="Part 13" /><p>Yamaha MT 15 Headlight</p><small className="added-time">Added 5 days ago</small></div>
                    <div className="part-card"><img src="/images/part14.jpg" alt="Part 14" /><p>Honda Genuine Engine Cleaner</p><small className="added-time">Added 7 days ago</small></div>
                </div>
            </div>

            {/* Contact */}
            <div className="contact-section">
                <h2 className="section-title">Contact Us</h2>
                <div className="contact-box">
                    <div className="contact-left">
                        <h3>Auto Machinery Supply PTE LTD</h3>
                        <p>41 Rowell Road<br />#04-56 AutoTech Building<br />Singapore 207992</p>
                        <p>Email: online@amsmotor.com.sg</p>
                        <p>Phone: +65 6292-9452 +65 6292-9093</p>
                    </div>
                    <div className="contact-right">
                        <img src="/images/map.png" alt="Map" className="contact-map" />
                    </div>
                </div>
            </div>

            {/* ✅ Reviews */}
            <div className="reviews-section">
                <h2 className="section-title">User Reviews <span style={{ fontSize: "16px", color: "#ccc" }}>({reviews.length} reviews, avg {averageRating(reviews)}/5)</span></h2>

                <div className="reviews-grid">
                    {(showAll ? reviews : reviews.slice(0, 4)).map((rev, idx) => (
                        <div key={rev.id} className="review-card">
                            <p><strong>{rev.name}</strong> ({rev.rating}★)</p>
                            <small style={{ color: "#999" }}>
                                {rev.createdAt ? `Posted on ${new Date(rev.createdAt).toLocaleString()}` : ""}
                            </small>

                            <p>{rev.text}</p>
                            {user && rev.email === user.email && (
                                <div className="review-actions">
                                    <button onClick={() => {
                                        setEditingReview(rev);
                                        setShowForm(true);
                                    }}>Edit</button>
                                    <button onClick={() => handleDeleteReview(rev.id)}>Delete</button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {user && (
                    <div className="add-review-button">
                        <button
                            onClick={() => { setShowForm(true); setEditingReview(null); }}
                            className="add-review-btn"
                        >
                            + Add Review as {user.name}
                        </button>
                    </div>
                )}

                {reviews.length > 4 && (
                    <button onClick={() => setShowAll(!showAll)}>
                        {showAll ? "Show Less" : "Show All"}
                    </button>
                )}
            </div>

            {showForm && (
                <div className="review-form-box">
                    <h3>{editingReview ? "Edit Review" : "Add Review"}</h3>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();

                            const reviewData = {
                                name: user?.name,
                                email: user?.email,
                                text: e.target.text.value,
                                rating: e.target.rating.value,
                                updatedAt: new Date().toISOString(),
                            };

                            if (!reviewData.name || !reviewData.email) {
                                toast.error("Please log in before submitting a review.");
                                return;
                            }

                            if (reviewData.text.length < 5 ){
                                toast.error("Review must be 5 characters.");
                                return;
                            }

                            if (!['1','2','3','4','5'].includes(reviewData.rating)){
                                toast.error("Rating must be 1 - 5 stars");
                                return;
                            }
                            
                            try {
                                if (editingReview) {
                                    // 🛠 UPDATE existing review
                                    const res = await fetch(`http://localhost:3001/review/${editingReview.id}`, {
                                        method: "PUT",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(reviewData),
                                    });

                                    if (!res.ok) throw new Error("Failed to update review");

                                    toast.success("Review updated!");
                                } else {
                                    // ➕ CREATE new review
                                    const res = await fetch("http://localhost:3001/review", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify(reviewData),
                                    });

                                    if (!res.ok) throw new Error("Failed to submit review");

                                    toast.success("Review submitted!");
                                }

                                // ✅ Refresh and reset
                                const res = await fetch("http://localhost:3001/review");
                                const data = await res.json();
                                setReviews(data);
                                setShowForm(false);
                                setEditingReview(null);
                            } catch (error) {
                                console.error("Review failed:", error);
                                toast.error("Something went wrong. Please try again.");
                            }
                        }}
                    >
                        <textarea
                            name="text"
                            defaultValue={editingReview?.text || ""}
                            placeholder="Write your review here..."
                            required
                        />
                        <select name="rating" defaultValue={editingReview?.rating || "5"}>
                            <option value="5">★★★★★ (5)</option>
                            <option value="4">★★★★☆ (4)</option>
                            <option value="3">★★★☆☆ (3)</option>
                            <option value="2">★★☆☆☆ (2)</option>
                            <option value="1">★☆☆☆☆ (1)</option>
                        </select>
                        <div className="review-form-actions">
                            <button type="submit">{editingReview ? "Update" : "Submit"}</button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowForm(false);
                                    setEditingReview(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>

                </div>
            )}
        </div>
    );
};

export default HomePage;
