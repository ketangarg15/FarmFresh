import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash, ShoppingBag, ArrowLeft, ShieldCheck } from 'lucide-react';
import PaymentModal from '../components/PaymentModal';

export default function Cart({ cart, onRemove, onUpdateQuantity, onCheckout, showToast }) {
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    setShowPayment(true);
  };

  const handlePaymentSuccess = async () => {
    try {
      const itemsPayload = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsPayload })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('All items ordered successfully!', 'success');
        onCheckout(); // clear cart
        navigate(`/orders/${data.order._id}`);
      } else {
        showToast(data.error || 'Failed to place order', 'error');
        setShowPayment(false);
      }
    } catch (err) {
      showToast('Connection error. Try again.', 'error');
      setShowPayment(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 600, marginBottom: '16px' }}>
          <ArrowLeft size={16} /> Continue Shopping
        </Link>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>Your Shopping Cart</h1>
        <p style={{ color: 'var(--text-muted)' }}>Fresh farm harvests ready for delivery</p>
      </div>

      {cart.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🛒</div>
          <h2>Your cart is empty</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Explore our marketplace for fresh organic vegetables and fruits!</p>
          <Link to="/products" className="btn btn-primary">Shop Fresh Harvests</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px', alignItems: 'flex-start' }}>
          {/* Cart Items List */}
          <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingBottom: '20px', borderBottom: idx < cart.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80'} 
                  alt={item.name} 
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
                
                <div style={{ flexGrow: 1 }}>
                  <h4 style={{ color: 'var(--primary-color)', fontSize: '1.05rem', fontWeight: 700 }}>{item.name}</h4>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>₹{item.price} / kg</span>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden', height: '30px' }}>
                      <button onClick={() => onUpdateQuantity(item.productId, Math.max(1, item.quantity - 1))} style={{ padding: '0 10px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>-</button>
                      <span style={{ padding: '0 12px', fontWeight: 'bold', fontSize: '0.85rem' }}>{item.quantity}</span>
                      <button onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)} style={{ padding: '0 10px', border: 'none', background: '#fff', cursor: 'pointer', fontWeight: 'bold' }}>+</button>
                    </div>
                    
                    <button onClick={() => onRemove(item.productId)} style={{ background: 'none', border: 'none', color: '#c62828', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Remove item">
                      <Trash size={16} />
                    </button>
                  </div>
                </div>

                <strong style={{ color: 'var(--text-dark)' }}>₹{(item.price * item.quantity).toFixed(2)}</strong>
              </div>
            ))}
          </div>

          {/* Cart Summary */}
          <div className="glass-panel" style={{ padding: '30px', position: 'sticky', top: '100px' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 800 }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Items Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              <span>Delivery Charges:</span>
              <span style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>FREE</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '16px', marginBottom: '24px' }}>
              <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Grand Total:</span>
              <strong style={{ fontSize: '1.5rem', color: 'var(--primary-color)' }}>₹{total.toFixed(2)}</strong>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', backgroundColor: 'var(--bg-light)', padding: '10px', borderRadius: '8px', marginBottom: '20px', border: '1px solid var(--border-color)' }}>
              <ShieldCheck size={16} style={{ color: 'var(--primary-hover)' }} /> Complete security guarantee.
            </div>

            <button 
              onClick={handleCheckoutClick}
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', borderRadius: '12px' }}
            >
              Place Order & Pay
            </button>
          </div>
        </div>
      )}

      {showPayment && (
        <PaymentModal 
          amount={total} 
          onClose={() => setShowPayment(false)} 
          onSuccess={handlePaymentSuccess} 
        />
      )}
    </div>
  );
}
