import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, User } from 'lucide-react';

export default function Deliveries({ user, showToast }) {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = () => {
    fetch('/api/deliveries')
      .then(res => res.json())
      .then(data => {
        setDeliveries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch deliveries failed:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`/api/deliveries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Delivery status updated successfully!', 'success');
        setDeliveries(prev => prev.map(d => d._id === id ? { ...d, status: newStatus } : d));
      } else {
        showToast(data.error || 'Failed to update delivery status', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>Delivery Log Monitor</h1>
        <p style={{ color: 'var(--text-muted)' }}>Manage dispatch, logistics, and delivery status updates</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading dispatches...</div>
      ) : deliveries.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)' }}>No dispatches or deliveries logged in the system yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {deliveries.map(d => (
            <div key={d._id} className="food-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-color)', fontWeight: 700 }}>Dispatch ID: #{d._id}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order Reference: #{d.order?._id}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`badge ${d.status === 'delivered' ? 'badge-fresh' : 'badge-scarcity'}`}>
                    {d.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px', fontSize: '0.95rem' }}>
                <div>
                  <strong style={{ color: 'var(--primary-color)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Delivery Partner</strong>
                  <span>🚚 {d.partnerName || 'Fresh Express Cargo'}</span>
                </div>
                <div>
                  <strong style={{ color: 'var(--primary-color)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Grand Total</strong>
                  <strong>₹{d.order?.totalAmount || 0}</strong>
                </div>
                <div>
                  <strong style={{ color: 'var(--primary-color)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px' }}>Last Updated</strong>
                  <span style={{ color: 'var(--text-muted)' }}>{new Date(d.updatedAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Status Update Options (Only if logged in user is admin/farmer and not already delivered) */}
              {d.status !== 'delivered' && (
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--primary-color)' }}>Update Logistics Status:</span>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {['pending', 'picked_up', 'in_transit', 'delivered'].map(opt => (
                      <button
                        key={opt}
                        onClick={() => handleUpdateStatus(d._id, opt)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: d.status === opt ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                          backgroundColor: d.status === opt ? 'var(--mint-light)' : '#fff',
                          color: 'var(--primary-color)',
                          fontWeight: 600,
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'var(--transition)'
                        }}
                      >
                        {opt.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
