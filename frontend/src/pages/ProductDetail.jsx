import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Star, ShieldAlert, ShoppingCart, Pencil, Trash, User, Plus } from 'lucide-react';

export default function ProductDetail({ user, showToast, onAddToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [avgRating, setAvgRating] = useState('0.0');
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProductDetails = () => {
    fetch(`/api/products/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          showToast(data.error, 'error');
          navigate('/products');
        } else {
          setProduct(data.product);
          setAvgRating(data.averageRating);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch product detail failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProductDetails();
  }, [id]);

  const handleAddToCart = () => {
    if (!user) {
      showToast('Please sign in to order!', 'error');
      navigate('/login');
      return;
    }
    if (user.role !== 'consumer') {
      showToast('Only consumers can add to cart!', 'error');
      return;
    }
    onAddToCart(product, quantity);
  };

  const handleDeleteProduct = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      const res = await fetch(`/api/products/${product._id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        showToast('Product listing deleted successfully', 'success');
        navigate('/products');
      } else {
        showToast(data.error || 'Deletion failed', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      showToast('Please write review comment text', 'error');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/products/${product._id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ review: { rating, text } })
      });
      
      setSubmittingReview(false);
      if (res.ok) {
        showToast('Review submitted successfully!', 'success');
        setText('');
        setRating(5);
        fetchProductDetails(); // reload product
      } else {
        showToast('Failed to submit review', 'error');
      }
    } catch (err) {
      setSubmittingReview(false);
      showToast('Connection error', 'error');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading product details...</div>;
  if (!product) return null;

  const isAuthor = user && product.farmer && user._id === product.farmer._id;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)', padding: '40px', marginBottom: '40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          
          {/* Image */}
          <div>
            <img 
              src={product.image?.url || 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80'} 
              alt={product.name} 
              style={{ width: '100%', borderRadius: 'var(--radius-md)', height: '350px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80';
              }}
            />
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span className="badge badge-fresh" style={{ marginBottom: '8px' }}>{product.category || 'Organic'}</span>
                <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.1 }}>{product.name}</h1>
              </div>

              {isAuthor && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link to={`/products/${product._id}/edit`} className="btn btn-outline" style={{ padding: '8px 12px' }} title="Edit product">
                    <Pencil size={16} />
                  </Link>
                  <button onClick={handleDeleteProduct} className="btn btn-outline" style={{ padding: '8px 12px', color: '#c62828', borderColor: '#c62828' }} title="Delete listing">
                    <Trash size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', color: 'var(--secondary-color)' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    size={18} 
                    fill={star <= Math.round(parseFloat(avgRating)) ? 'currentColor' : 'none'} 
                    color="currentColor" 
                  />
                ))}
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>{avgRating} / 5.0</span>
              <span style={{ color: 'var(--text-muted)' }}>({product.reviews?.length || 0} reviews)</span>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-color)', marginBottom: '20px' }}>
              ₹{product.price} <span style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-muted)' }}>/ per kg</span>
            </div>

            <p style={{ color: 'var(--text-dark)', lineHeight: 1.6, marginBottom: '24px', flexGrow: 1 }}>
              {product.description || 'This fresh, local organic produce is harvested and packed with high standards of sanitation.'}
            </p>

            <div style={{ backgroundColor: 'var(--bg-light)', padding: '16px', borderRadius: 'var(--radius-sm)', marginBottom: '30px', border: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
              <p style={{ marginBottom: '8px' }}>📍 Origin: <strong>{product.location || 'Local farm'}</strong></p>
              <p style={{ marginBottom: '8px' }}>🌾 Farmer: <strong>{product.farmer?.name || 'Verified Grower'}</strong></p>
              <p>📦 Availability: <strong style={{ color: product.quantity > 0 ? 'var(--primary-hover)' : '#c62828' }}>{product.quantity > 0 ? `${product.quantity} kg in stock` : 'Out of Stock'}</strong></p>
            </div>

            {/* Buying Action */}
            {(!user || user.role === 'consumer') && product.quantity > 0 && (
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ padding: '10px 14px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                  <span style={{ padding: '10px 20px', fontWeight: 'bold', minWidth: '40px', textAlign: 'center' }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => Math.min(product.quantity, q + 1))} style={{ padding: '10px 14px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                </div>

                <button 
                  onClick={handleAddToCart}
                  className="btn btn-primary" 
                  style={{ flexGrow: 1, padding: '14px' }}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="glass-panel">
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '24px', fontWeight: 800 }}>Reviews & Ratings</h2>
        
        {/* Write Review */}
        {user && user.role === 'consumer' && (
          <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '30px', marginBottom: '30px' }}>
            <h4 style={{ marginBottom: '12px', color: 'var(--primary-color)' }}>Leave a review</h4>
            
            <div className="form-group">
              <label className="form-label" htmlFor="review-rating">Rating</label>
              <select 
                id="review-rating"
                className="form-control" 
                style={{ maxWidth: '150px' }}
                value={rating} 
                onChange={(e) => setRating(parseInt(e.target.value))}
              >
                <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                <option value="3">⭐⭐⭐ 3 Stars</option>
                <option value="2">⭐⭐ 2 Stars</option>
                <option value="1">⭐ 1 Star</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="review-text">Review Comments</label>
              <textarea 
                id="review-text"
                className="form-control" 
                rows="4" 
                placeholder="Share your experience with this harvest..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={submittingReview}>
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        {!product.reviews || product.reviews.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No reviews yet. Be the first to share your feedback!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {product.reviews.map(review => (
              <div key={review._id} style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyCenter: 'center', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      <User size={16} style={{ margin: '0 auto' }} />
                    </div>
                    <strong>{review.author?.name || review.author?.username || 'Verified Customer'}</strong>
                  </div>
                  <div style={{ display: 'flex', color: 'var(--secondary-color)' }}>
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star 
                        key={star} 
                        size={14} 
                        fill={star <= review.rating ? 'currentColor' : 'none'} 
                        color="currentColor" 
                      />
                    ))}
                  </div>
                </div>
                <p style={{ color: 'var(--text-dark)', fontSize: '0.95rem', margin: 0 }}>{review.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
