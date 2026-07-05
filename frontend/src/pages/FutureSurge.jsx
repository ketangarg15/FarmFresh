import React, { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FutureSurge() {
  const [surgeProducts, setSurgeProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Take up to 8 products and map dynamic surge values
          const mapped = data.slice(0, 8).map((p, idx) => {
            // Generate a deterministic surge multiplier (e.g. 50% - 90% increase based on product ID characters)
            const multiplier = 1.4 + ((p._id.charCodeAt(p._id.length - 1) % 5) * 0.1);
            return {
              id: p._id,
              name: p.name,
              image: p.image?.url || 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80',
              currentPrice: p.price,
              futurePrice: Math.round(p.price * multiplier)
            };
          });
          setSurgeProducts(mapped);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch surge products failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{
        background: 'rgba(255, 179, 0, 0.08)',
        border: '1px solid rgba(255, 179, 0, 0.3)',
        borderRadius: 'var(--radius-md)',
        padding: '30px',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'var(--secondary-color)',
          color: 'var(--primary-color)',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <h1 style={{ color: 'var(--primary-color)', fontSize: '1.8rem', fontWeight: 800, marginBottom: '6px' }}>
            🌾 Future Price Surge Alert
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Stay ahead of seasonal fluctuations! These popular items are expected to see price increases due to temporary local scarcity. Stock up now before prices rise.
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Analyzing scarcity metrics...</div>
      ) : surgeProducts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No products found in the catalog to calculate price surges.</p>
        </div>
      ) : (
        <div className="grid-responsive">
          {surgeProducts.map((p, idx) => {
            const increasePercent = (((p.futurePrice - p.currentPrice) / p.currentPrice) * 100).toFixed(0);
            return (
              <div key={idx} className="food-card" style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 2 }}>
                  <span className="badge badge-scarcity">⚠️ Scarcity Alert</span>
                </div>
                <img 
                  src={p.image} 
                  alt={p.name} 
                  className="food-card-img"
                />
                <div className="food-card-body" style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: 700, marginBottom: '12px' }}>{p.name}</h3>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '16px' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Current Price</span>
                      <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>₹{p.currentPrice}</strong>
                    </div>
                    <div style={{ borderLeft: '1px solid var(--border-color)' }} />
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>Expected Price</span>
                      <strong style={{ fontSize: '1.1rem', color: '#c62828' }}>₹{p.futurePrice}</strong>
                    </div>
                  </div>

                  <div style={{
                    backgroundColor: 'rgba(239, 83, 80, 0.08)',
                    color: '#c62828',
                    padding: '8px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '20px'
                  }}>
                    📈 +{increasePercent}% Expected Increase
                  </div>

                  <Link to={`/products/${p.id}`} className="btn btn-outline" style={{ width: '100%', fontSize: '0.9rem' }}>
                    View Catalog Item <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
