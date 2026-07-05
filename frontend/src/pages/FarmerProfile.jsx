import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Mail, Phone, ShieldCheck, Heart } from 'lucide-react';

export default function FarmerProfile() {
  const { id } = useParams();
  const [farmer, setFarmer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/farmers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setFarmer(data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch farmer profile:', err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading story...</div>;
  if (!farmer) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Farmer Profile Not Found</h2>
        <Link to="/farmers" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Farmers</Link>
      </div>
    );
  }

  // Predefined stories mapping or random fallback
  const farmerStory = farmer.story || `${farmer.name} began with just one acre of land and faced many challenges including droughts and low yields. Through perseverance and innovation, they adopted organic farming and now mentor other farmers in the region.`;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/farmers" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Meet Our Farmers
      </Link>

      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)', padding: '40px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'var(--mint-light)',
            color: 'var(--primary-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '3rem',
            fontWeight: 'bold',
            boxShadow: 'var(--shadow-md)'
          }}>
            {farmer.name ? farmer.name.charAt(0) : 'F'}
          </div>

          <div>
            <h1 style={{ color: 'var(--primary-color)', fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>{farmer.name}</h1>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span className="badge badge-fresh" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={14} /> Certified Organic Grower
              </span>
              <span className="badge badge-scarcity">Soil Friendly</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', borderBottom: '1px solid var(--border-color)', pb: '20px', mb: '20px', paddingBottom: '20px', marginBottom: '30px' }}>
          <div>
            <strong style={{ color: 'var(--primary-color)', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Location</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <MapPin size={16} /> {farmer.location || 'Maharashtra, India'}
            </span>
          </div>
          <div>
            <strong style={{ color: 'var(--primary-color)', display: 'block', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Contact Email</strong>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
              <Mail size={16} /> {farmer.email}
            </span>
          </div>
        </div>

        <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px', fontWeight: 700 }}>Our Farm Story</h3>
        <p style={{ color: 'var(--text-dark)', lineHeight: 1.8, fontSize: '1.05rem', marginBottom: '24px' }}>
          {farmerStory}
        </p>

        <blockquote style={{
          borderLeft: '4px solid var(--primary-color)',
          paddingLeft: '20px',
          fontStyle: 'italic',
          color: 'var(--text-muted)',
          margin: '30px 0',
          fontSize: '1.1rem'
        }}>
          "Farming is not just a job; it is a commitment to the health of the earth and the communities who eat our food."
        </blockquote>
      </div>
    </div>
  );
}
