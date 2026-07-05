import React from 'react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--primary-color)',
      color: 'rgba(255,255,255,0.8)',
      padding: '40px 20px',
      marginTop: '60px',
      borderTop: '1px solid var(--border-color)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: '30px'
      }}>
        <div style={{ minWidth: '250px' }}>
          <h3 style={{ color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🌿</span> FarmFresh
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
            Connecting local organic farmers directly to your kitchen. Get fresh harvests, sustainable produce, and support farmers' communities directly.
          </p>
        </div>
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px' }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li><a href="/" style={{ color: 'rgba(255,255,255,0.8)' }}>Home</a></li>
            <li><a href="/about" style={{ color: 'rgba(255,255,255,0.8)' }}>About Us</a></li>
            <li><a href="/farmers" style={{ color: 'rgba(255,255,255,0.8)' }}>Meet Our Farmers</a></li>
            <li><a href="/future-surge" style={{ color: 'rgba(255,255,255,0.8)' }}>Price Surge Scarcity Alerts</a></li>
          </ul>
        </div>
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px' }}>Contact Info</h4>
          <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>📍 123 Organic Lane, Green Field</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '8px' }}>📞 +91 98765 43210</p>
          <p style={{ fontSize: '0.9rem' }}>✉️ support@farmfresh.com</p>
        </div>
      </div>
      <div style={{
        maxWidth: '1200px',
        margin: '40px auto 0 auto',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        paddingTop: '20px',
        textAlign: 'center',
        fontSize: '0.85rem'
      }}>
        <p>&copy; {new Date().getFullYear()} FarmFresh. Made with love for nature & healthy living.</p>
      </div>
    </footer>
  );
}
