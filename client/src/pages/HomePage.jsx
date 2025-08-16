import { http } from '../https';
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';  // Importing useNavigate from React Router
import { InputBase, Box, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { styled, alpha } from '@mui/material/styles'; // For styling the search bar
import toast from 'react-hot-toast'; // For notifications
import UserContext from '../contexts/UserContext';
import axios from 'axios';
import { CartContext } from '../contexts/CartContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 8,
  backgroundColor: alpha('#ffffff', 0.15),
  '&:hover': {
    backgroundColor: alpha('#ffffff', 0.25),
  },
  marginLeft: theme.spacing(2),
  marginRight: theme.spacing(2),
  width: '100%',
  maxWidth: 300,
  border: '1px solid #ccc',
  color: 'white'
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'white',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
  },
}));


const HomePage = () => {

  // Add single frequently bought part to cart
  function handleAddSingleProduct(product, e) {
    e.stopPropagation();
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      remarks: ""
    });
    toast.success(`${product.name} added to cart!`);
  }

  // Helper to calculate average rating
  function averageRating(reviews) {
    if (!reviews || reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }

  // AI Recommendations state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiRecs, setAiRecs] = useState([]);

  // Fetch reviews on mount
  React.useEffect(() => {
  fetch("http://localhost:3001/review")
      .then(res => res.json())
      .then(data => setReviews(data))
      .catch(() => setReviews([]));
  }, []);

  const { user } = useContext(UserContext);
  const { cart, addToCart } = useContext(CartContext);
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");


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
  const res = await fetch(`http://localhost:3001/review/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete review");
      toast.success("Review deleted!");
  // Removed stray await outside of async function
  const refreshed = await fetch("http://localhost:3001/review");
  const refreshedJson = await refreshed.json();
  setReviews(refreshedJson);
    } catch (err) {
      toast.error("Delete failed");
    }
  }
  // Removed stray await outside of async function



  // Search
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Fetch AI recommendations on mount or when user/cart changes
  React.useEffect(() => {
    setAiLoading(true);
    setAiError("");
    http.post('/ai/recommend', { user, cart })
      .then(res => {
        setAiRecs(res.data.recommendations || []);
        setAiLoading(false);
      })
      .catch(err => {
        setAiError("AI recommendations unavailable");
        setAiLoading(false);
      });
  }, [user, cart]);

  // Product click
  const handleProductClick = (product, event) => {
    if (event.target.type === 'checkbox' || event.target.tagName === 'BUTTON') return;
    const prodId = product.productId || product.id;
    if (prodId) {
      navigate(`/product/${prodId}`);
    }
  };

  return (
    <div className="HomePage">


      {/* Brands Section */}
      <div className="brand-section">
        <div className="brand-box clickable-brand" onClick={() => navigate('/brand/yamaha')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '2px solid transparent', borderRadius: '10px', padding: '20px' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 102, 204, 0.3)'; e.currentTarget.style.borderColor = '#0066cc'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
          <h2>YAMAHA <img src="/images/Yamaha-Logo.png" className="brand-logo" alt="Yamaha Logo" /></h2>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Click to view all Yamaha products</p>
        </div>
        <div className="brand-box clickable-brand" onClick={() => navigate('/brand/honda')}
          style={{ cursor: 'pointer', transition: 'transform 0.3s ease, boxShadow 0.3s ease', border: '2px solid transparent', borderRadius: '10px', padding: '20px' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(204, 0, 0, 0.3)'; e.currentTarget.style.borderColor = '#cc0000'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = 'transparent'; }}>
          <h2>HONDA <img src="/images/hondaa.png" className="brand-logo" alt="Honda Logo" /></h2>
          <p style={{ fontSize: '14px', color: '#666', marginTop: '10px' }}>Click to view all Honda products</p>
        </div>
      </div>

      {/* Frequently Bought Section */}
      <div className="frequently-bought-section">
        <h2 className="section-title">Frequently Bought Parts</h2>
        <div className="parts-grid">
          <div className="part-card clickable-product" onClick={e => handleProductClick({ id: 'freq-001', name: 'Yamaha BYSON Exhaust', price: 45, image: '/images/part1.png', category: 'exhaust' }, e)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/images/part1.png" alt="Part 1" />
            <p>Yamaha BYSON Exhaust</p>
            <div className="product-price">$45.00</div>
            <button className="add-single-btn" onClick={e => handleAddSingleProduct({ id: 'freq-001', name: 'Yamaha BYSON Exhaust', price: 45, image: '/images/part1.png' }, e)}>Add to Cart</button>
            <input type="checkbox" onClick={e => e.stopPropagation()} />
          </div>
          <div className="part-card clickable-product" onClick={e => handleProductClick({ id: 'freq-002', name: 'RACING Honda CBR500R Tail Tidy', price: 65, image: '/images/part2.png', category: 'body' }, e)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/images/part2.png" alt="Part 2" />
            <p>RACING Honda CBR500R Tail Tidy</p>
            <div className="product-price">$65.00</div>
            <button className="add-single-btn" onClick={e => handleAddSingleProduct({ id: 'freq-002', name: 'RACING Honda CBR500R Tail Tidy', price: 65, image: '/images/part2.png' }, e)}>Add to Cart</button>
            <input type="checkbox" onClick={e => e.stopPropagation()} />
          </div>
          <div className="part-card clickable-product" onClick={e => handleProductClick({ id: 'freq-003', name: 'Yamaha Aerox GDR155 Oil Pump', price: 40, image: '/images/part3.png', category: 'engine' }, e)}
            style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
            <img src="/images/part3.png" alt="Part 3" />
            <p>Yamaha Aerox GDR155 Oil Pump</p>
            <div className="product-price">$40.00</div>
            <button className="add-single-btn" onClick={e => handleAddSingleProduct({ id: 'freq-003', name: 'Yamaha Aerox GDR155 Oil Pump', price: 40, image: '/images/part3.png' }, e)}>Add to Cart</button>
            <input type="checkbox" onClick={e => e.stopPropagation()} />
          </div>
  </div>
        <div className="cart-summary">
          <span>Total $150</span>
          <button onClick={() => {
            addToCart({ productId: 1, name: "Yamaha BYSON Exhaust", quantity: 1, remarks: "" });
            addToCart({ productId: 2, name: "RACING Honda CBR500R Tail Tidy", quantity: 1, remarks: "" });
            addToCart({ productId: 3, name: "Yamaha Aerox GDR155 Oil Pump", quantity: 1, remarks: "" });
            toast.success("All frequently bought parts added to cart!");
          }}>Add All to Cart</button>
        </div>
      </div>

      {/* Promo Bundles */}
      <div className="promo-bundles-section">
        <h2 className="section-title">Promo Bundles</h2>
        <div className="bundle-grid">
          <div className="bundle-card" style={{ cursor: 'pointer' }}
            onClick={() => navigate('/product/101')}>
            <h3>YAMAHA</h3>
            <p className="bundle-desc">Service Parts for Yamaha Aerox 50</p>
            <div className="bundle-parts">
              <div className="bundle-item"><img src="/images/part4.png" alt="Part A" /><p>Oil Filter</p></div>
              <div className="bundle-item"><img src="/images/part5.jpg" alt="Part B" /><p>Frame</p></div>
              <div className="bundle-item"><img src="/images/part6.jpeg" alt="Part C" /><p>Brake Pad</p></div>
              <div className="bundle-item"><img src="/images/part7.jpeg" alt="Part D" /><p>Spark Plug</p></div>
            </div>
            <p className="bundle-price">$300 Bundle</p>
            <button onClick={e => {
              e.stopPropagation();
              addToCart({ productId: 101, name: "YAMAHA Aerox 50 Service Bundle", quantity: 1, remarks: "" });
              toast.success("YAMAHA bundle added to cart!");
            }}>Add Bundle to Cart</button>
          </div>
          <div className="bundle-card" style={{ cursor: 'pointer' }}
            onClick={() => navigate('/product/102')}>
            <h3>HONDA</h3>
            <p className="bundle-desc">Touring Essentials for Honda</p>
            <div className="bundle-parts">
              <div className="bundle-item"><img src="/images/part8.png" alt="Part E" /><p>Honda Front Fender CB125F</p></div>
              <div className="bundle-item"><img src="/images/part9.png" alt="Part F" /><p>Gearshift Drum CB125F</p></div>
              <div className="bundle-item"><img src="/images/part10.png" alt="Part G" /><p>L Crankcase Cover</p></div>
              <div className="bundle-item"><img src="/images/part11.jpeg" alt="Part H" /><p>Air Filter</p></div>
            </div>
            <p className="bundle-price">$275 Bundle</p>
            <button onClick={e => {
              e.stopPropagation();
              addToCart({ productId: 102, name: "HONDA Touring Essentials Bundle", quantity: 1, remarks: "" });
              toast.success("HONDA bundle added to cart!");
            }}>Add Bundle to Cart</button>
          </div>
        </div>
      </div>

      {/* Recommended Section (AI) */}
      <div className="recommended-section">
        <h2 className="section-title">Recommended For You</h2>
        {aiLoading ? (
          <div>Loading recommendations...</div>
        ) : aiError ? (
          <div style={{ color: 'red' }}>{aiError}</div>
        ) : (
          <div className="parts-grid">
            {aiRecs && aiRecs.length > 0 ? aiRecs.map((rec, idx) => (
              <div key={rec.productId || rec.id || idx} className="part-card clickable-product"
                onClick={e => handleProductClick(rec, e)}
                style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                <img
                  src={
                    rec.imageUrl
                      ? rec.imageUrl.startsWith('/images/')
                        ? rec.imageUrl
                        : `http://localhost:3001/images/${rec.imageUrl}`
                      : rec.image && (rec.image.startsWith('/images/') || rec.image.startsWith('http'))
                        ? rec.image
                        : '/images/no-image.png'
                  }
                  alt={rec.productName || rec.name}
                />
                <p>{rec.productName || rec.name}</p>
                <div className="product-price">${rec.price?.toFixed ? rec.price.toFixed(2) : rec.price}</div>
                <button className="add-single-btn" onClick={e => handleAddSingleProduct(rec, e)}>Add to Cart</button>
                <br />
                <small className="added-time">AI Recommended</small>
              </div>
            )) : (
              <div>No recommendations available.</div>
            )}
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2 className="section-title">User Reviews <span style={{ fontSize: "16px", color: "#ccc" }}>({reviews.length} reviews, avg {averageRating(reviews)}/5)</span></h2>
        <div className="reviews-grid">
          {(showAll ? reviews : reviews.slice(0, 4)).map((rev, idx) => (
            <div key={rev.id} className="review-card">
              <p><strong>{rev.name}</strong> ({rev.rating}★)</p>
              <small style={{ color: "#999" }}>{rev.createdAt ? `Posted on ${new Date(rev.createdAt).toLocaleString()}` : ""}</small>
              <p>{rev.text}</p>
              {user && rev.email === user.email && (
                <div className="review-actions">
                  <button onClick={() => { setEditingReview(rev); setShowForm(true); }}>Edit</button>
                  <button onClick={() => handleDeleteReview(rev.id)}>Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
        {user && (
          <div className="add-review-button">
            <button onClick={() => { setShowForm(true); setEditingReview(null); }} className="add-review-btn">
              + Add Review as {user.name}
            </button>
          </div>
        )}
        {reviews.length > 4 && (
          <button onClick={() => setShowAll(!showAll)}>{showAll ? "Show Less" : "Show All"}</button>
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
              if (reviewData.text.length < 5) {
                toast.error("Review must be 5 characters.");
                return;
              }
              if (!['1', '2', '3', '4', '5'].includes(reviewData.rating)) {
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
            <textarea name="text" defaultValue={editingReview?.text || ""} placeholder="Write your review here..." required />
            <select name="rating" defaultValue={editingReview?.rating || "5"}>
              <option value="5">★★★★★ (5)</option>
              <option value="4">★★★★☆ (4)</option>
              <option value="3">★★★☆☆ (3)</option>
              <option value="2">★★☆☆☆ (2)</option>
              <option value="1">★☆☆☆☆ (1)</option>
            </select>
            <div className="review-form-actions">
              <button type="submit">{editingReview ? "Update" : "Submit"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditingReview(null); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );




}
export default HomePage;