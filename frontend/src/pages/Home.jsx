import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingCart, Star } from 'lucide-react';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // Sort by newest and limit to 8
        const sorted = (Array.isArray(data) ? data : [])
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 8);
        setProducts(sorted);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch home products:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        background: 'linear-gradient(135deg, #1e3f20 0%, #122814 100%)',
        color: '#fff',
        borderRadius: 'var(--radius-lg)',
        padding: '80px 40px',
        textAlign: 'center',
        marginBottom: '60px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50%',
          left: '-30%',
          width: '80%',
          height: '200%',
          background: 'radial-gradient(circle, rgba(46,125,50,0.15) 0%, transparent 60%)',
          pointerEvents: 'none'
        }} />
        
        <div style={{ maxWidth: '800px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{
            display: 'inline-block',
            backgroundColor: 'rgba(255,255,255,0.1)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '0.9rem',
            fontWeight: 600,
            marginBottom: '20px',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>🧑‍🌾 100% Organic & Direct from Farmers</span>
          
          <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px' }}>
            Fresh Harvests, Delivered <span style={{ color: 'var(--secondary-color)' }}>Directly</span> to Your Door
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: '#b2dfdb', marginBottom: '40px', lineHeight: 1.6 }}>
            Discover the finest quality fresh fruits, organic vegetables, and local farm specialties. Support local growers and live healthy.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/products" className="btn btn-secondary" style={{ padding: '14px 28px', fontSize: '1.05rem' }}>
              Shop Fresh Harvests <ArrowRight size={18} />
            </Link>
            <Link to="/farmers" className="btn btn-outline" style={{ borderColor: '#fff', color: '#fff', padding: '14px 28px', fontSize: '1.05rem' }}>
              Meet Our Farmers
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={{ marginBottom: '60px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--primary-color)', fontWeight: 800 }}>Featured Products</h2>
            <p style={{ color: 'var(--text-muted)' }}>Top picks recently harvested by our partnering farmers</p>
          </div>
          <Link to="/products" style={{ fontWeight: 600, color: 'var(--primary-hover)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Catalog <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>Loading fresh items...</div>
        ) : products.length === 0 ? (
          <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
            <p style={{ color: 'var(--text-muted)' }}>No products are currently available. Check back soon!</p>
          </div>
        ) : (
          <div className="grid-responsive">
            {products.map(product => (
              <div key={product._id} className="food-card">
                <Link to={`/products/${product._id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden' }}>
                  <img 
                    className="food-card-img"
                    src={product.image?.url || 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80'} 
                    alt={product.name} 
                  />
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: 'rgba(30, 63, 32, 0.9)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    ₹{product.price} / kg
                  </div>
                </Link>
                <div className="food-card-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: 700 }}>{product.name}</h3>
                    {product.averageRating > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary-hover)' }}>
                        <Star size={14} fill="currentColor" /> {product.averageRating}
                      </span>
                    )}
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', flexGrow: 1 }}>
                    {product.description ? `${product.description.substring(0, 75)}...` : 'Fresh, local, and sustainably harvested organic produce.'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Farmer: <strong>{product.farmer?.name || 'Local Farm'}</strong>
                    </span>
                    <Link to={`/products/${product._id}`} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                      <ShoppingCart size={14} /> Buy
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
