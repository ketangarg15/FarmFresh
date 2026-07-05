import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MapPin, Calendar, Heart } from 'lucide-react';

export default function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/farmers')
      .then(res => res.json())
      .then(data => {
        setFarmers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch farmers:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>Meet Our Farmers</h1>
        <p style={{ color: 'var(--text-muted)' }}>The dedicated individuals growing healthy, organic produce for you</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading profiles...</div>
      ) : farmers.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No farmers registered on the platform yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
          {farmers.map(farmer => (
            <div key={farmer._id} className="food-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--mint-light)',
                  color: 'var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.8rem',
                  fontWeight: 'bold',
                  boxShadow: 'var(--shadow-sm)'
                }}>
                  {farmer.name ? farmer.name.charAt(0) : 'F'}
                </div>
                <div>
                  <h3 style={{ color: 'var(--primary-color)', fontSize: '1.25rem', fontWeight: 700 }}>{farmer.name || farmer.username}</h3>
                  <span className="badge badge-fresh" style={{ marginTop: '4px' }}>Verified Organic</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={16} /> {farmer.location || 'Maharashtra, India'}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} /> 10+ years experience
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-dark)', marginBottom: '20px', flexGrow: 1 }}>
                Growing with natural methods, protecting surrounding bio-networks, and providing pure wellness.
              </p>

              <Link to={`/farmers/${farmer._id}`} className="btn btn-outline" style={{ width: '100%', padding: '10px' }}>
                View Farm Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
