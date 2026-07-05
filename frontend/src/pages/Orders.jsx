import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, AlertTriangle, ArrowRight } from 'lucide-react';

export default function Orders({ showToast }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then(res => res.json())
      .then(data => {
        setOrders(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch orders failed:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>My Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor status of your fresh harvests purchases</p>
        </div>
        <Link to="/products" className="btn btn-primary">Order More Harvests</Link>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading order history...</div>
      ) : orders.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">Browse Marketplace</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {orders.map(order => (
            <div key={order._id} className="food-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Order ID</span>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-color)', fontWeight: 700 }}>#{order._id}</h3>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span className={`badge ${order.status === 'delivered' ? 'badge-fresh' : order.status === 'cancelled' ? 'badge-danger' : 'badge-scarcity'}`}>
                    {order.status}
                  </span>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                    View Status Log <ArrowRight size={14} />
                  </Link>
                </div>
              </div>

              <div>
                <strong style={{ color: 'var(--primary-color)', fontSize: '0.9rem', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Items</strong>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.products?.map((item, idx) => (
                    <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span>🌿 {item.product?.name || 'Organic item'} x <strong>{item.quantity} kg</strong></span>
                      <span style={{ color: 'var(--text-muted)' }}>₹{item.price || item.product?.price} / kg</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px' }}>
                <span style={{ color: 'var(--text-muted)' }}>Grand Total Amount:</span>
                <strong style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}>₹{order.totalAmount}</strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
