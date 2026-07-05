import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, ShieldCheck, Truck, XCircle, ShoppingBag, MapPin, Printer } from 'lucide-react';

export default function OrderDetail({ user, showToast }) {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setOrder(data);
        } else {
          showToast(data.error, 'error');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch order detail failed:', err);
        setLoading(false);
      });
  }, [id]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
      const data = await res.json();
      setCancelling(false);

      if (data.success) {
        showToast('Order cancelled successfully!', 'success');
        setOrder(prev => ({ ...prev, status: 'cancelled' }));
      } else {
        showToast(data.message || 'Cancellation failed.', 'error');
      }
    } catch (err) {
      setCancelling(false);
      showToast('Connection error', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading order details...</div>;
  if (!order) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Order Not Found</h2>
        <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Orders</Link>
      </div>
    );
  }

  // Determine active steps for progress indicator
  const steps = ['pending', 'confirmed', 'dispatched', 'delivered'];
  const currentStepIndex = steps.indexOf(order.status);

  // Checkpoints for our Real-time Progression Map
  const checkpoints = [
    { name: 'Farm Harvest Depot', desc: 'Crop harvested & sorted', statusKey: 'pending' },
    { name: 'Logistics Hub', desc: 'Packed & ready for dispatch', statusKey: 'confirmed' },
    { name: 'In Transit', desc: 'Out for delivery via Courier', statusKey: 'dispatched' },
    { name: 'Doorstep', desc: 'Successfully delivered', statusKey: 'delivered' }
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Print Friendly Style Override */}
      <style>{`
        @media print {
          /* Hide non-print parts of the site */
          .no-print, header, footer, nav, aside, button, .btn {
            display: none !important;
          }
          
          /* Set print page styles */
          body, html, main, .app-container {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 11pt !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          /* Force invoice container to be fully visible and fill width */
          #invoice-print-container {
            display: block !important;
            border: none !important;
            box-shadow: none !important;
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }

          .badge {
            border: 1px solid #000000 !important;
            color: #000000 !important;
            background: transparent !important;
          }
        }
      `}</style>

      <div id="order-detail-page">
        <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Link to="/orders" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', fontWeight: 600 }}>
            <ArrowLeft size={16} /> Back to My Orders
          </Link>
          <button onClick={handlePrint} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}>
            <Printer size={16} /> Print Invoice
          </button>
        </div>

        {/* Real-time Tracking progression map (only if not cancelled) */}
        {order.status !== 'cancelled' && (
          <div className="no-print" style={{ marginBottom: '40px', backgroundColor: 'var(--bg-light)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={18} /> Real-Time Progression Map
            </h3>
            
            {/* Visual Route Line */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', padding: '0 20px', margin: '40px 0' }}>
              
              {/* Grey Route Line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '40px',
                right: '40px',
                height: '4px',
                backgroundColor: 'var(--border-color)',
                zIndex: 1
              }} />
              
              {/* Active Green Route Line */}
              <div style={{
                position: 'absolute',
                top: '12px',
                left: '40px',
                width: `${(currentStepIndex / 3) * 100}%`,
                height: '4px',
                backgroundColor: 'var(--primary-hover)',
                zIndex: 1,
                transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />

              {checkpoints.map((cp, idx) => {
                const isActive = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                
                return (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                    
                    {/* Checkpoint Dot / Moving Truck */}
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: isActive ? 'var(--primary-color)' : '#fff',
                      border: isActive ? 'none' : '3px solid var(--border-color)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      transform: isCurrent ? 'scale(1.2)' : 'none',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                      {isCurrent ? (
                        <div style={{ position: 'absolute', top: '-34px', backgroundColor: 'var(--primary-color)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                          🚚 Courier Partner Active
                        </div>
                      ) : null}
                      
                      {isActive && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fff' }} />}
                    </div>

                    <span style={{ fontSize: '0.85rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--primary-color)' : 'var(--text-muted)', marginTop: '12px' }}>
                      {cp.name}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '2px', maxWidth: '100px' }}>
                      {cp.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PRINTABLE REAL INVOICE CARD */}
        <div id="invoice-print-container" className="glass-panel" style={{ padding: '40px', borderTop: '4px solid var(--primary-color)' }}>
          
          {/* Invoice Header details */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid var(--border-color)', paddingBottom: '24px', marginBottom: '30px' }}>
            <div>
              <h2 style={{ color: 'var(--primary-color)', fontWeight: 800, fontSize: '2rem', margin: 0 }}>FARMFRESH Ltd.</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>100% Organic Field Direct Deliveries</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Support: logistics@farmfresh.org</p>
            </div>
            
            <div style={{ textAlign: 'right' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, color: 'var(--primary-color)' }}>TAX INVOICE</h1>
              <p style={{ fontSize: '0.9rem', margin: '4px 0' }}>Invoice No: <strong>#INV-{order._id.substring(16).toUpperCase()}</strong></p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Billing & Shipment columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '32px' }}>
            <div>
              <h4 style={{ color: 'var(--primary-color)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Billed To (Consumer):</h4>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', margin: 0 }}>{order.consumer?.name || order.consumer?.username}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0' }}>Address: {order.consumer?.address || 'Customer Handover Depot'}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact: {order.consumer?.contactNumber || 'N/A'}</p>
            </div>

            <div>
              <h4 style={{ color: 'var(--primary-color)', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '8px', fontWeight: 700 }}>Dispatch Details:</h4>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>Logistics Status: <strong style={{ textTransform: 'uppercase' }}>{order.status}</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '4px 0' }}>Payment Mode: <strong>Simulated Secured Gateway</strong></p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Courier: <strong>Fresh Express Cargo</strong></p>
            </div>
          </div>

          {/* Items Table */}
          <div style={{ marginBottom: '30px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--primary-color)', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px' }}>Product Description</th>
                  <th style={{ padding: '12px 8px', textAlign: 'center' }}>Quantity</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Price per kg</th>
                  <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.products?.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{item.product?.name || 'Organic Farm Produce'}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>{item.quantity} kg</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right' }}>₹{item.price || item.product?.price || 0}</td>
                    <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>₹{((item.price || item.product?.price || 0) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Totals */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '30px', borderTop: '2px solid var(--border-color)', paddingTop: '24px' }}>
            <div style={{ maxWidth: '380px' }}>
              <h4 style={{ color: 'var(--primary-color)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '6px' }}>Declaration:</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                This is a computer-generated tax invoice for organic farm harvests direct sales. No physical signature is required. All vegetables are sorted and weighed under clean sanitation standards.
              </p>
            </div>
            
            <div style={{ textAlign: 'right', minWidth: '220px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span>₹{order.totalAmount.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IGST (0% - Exempt):</span>
                <span>₹0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Courier Charges:</span>
                <span style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>FREE</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '12px', marginTop: '12px' }}>
                <strong style={{ color: 'var(--primary-color)', fontSize: '1.1rem' }}>Total Payable:</strong>
                <strong style={{ color: 'var(--primary-color)', fontSize: '1.5rem' }}>₹{order.totalAmount.toFixed(2)}</strong>
              </div>
            </div>
          </div>

        </div>

        {/* Consumer Action buttons */}
        {order.status === 'pending' && user.role === 'consumer' && (
          <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '30px' }}>
            <button 
              onClick={handleCancelOrder}
              className="btn btn-outline"
              style={{ color: '#c62828', borderColor: '#c62828', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
              disabled={cancelling}
            >
              <XCircle size={18} /> {cancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          </div>
        )}
      </div>

    </div>
  );
}
