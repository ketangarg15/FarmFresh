import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, Shield, X, Landmark, AlertCircle } from 'lucide-react';

export default function PaymentModal({ amount, onClose, onSuccess }) {
  const [method, setMethod] = useState('card'); // 'card', 'upi', 'netbanking'
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [cardNo, setCardNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNoChange = (e) => {
    const value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = value.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNo(parts.join(' '));
    } else {
      setCardNo(value);
    }
    setError('');
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setExpiry(value);
    setError('');
  };

  const validateCard = () => {
    const rawCardNo = cardNo.replace(/\s+/g, '');
    if (rawCardNo.length !== 16) {
      return 'Card number must be exactly 16 digits.';
    }

    // Expiry validation
    const expiryParts = expiry.split('/');
    if (expiryParts.length !== 2 || expiryParts[0].length !== 2 || expiryParts[1].length !== 2) {
      return 'Expiry date must be in MM/YY format.';
    }
    const month = parseInt(expiryParts[0], 10);
    const year = parseInt('20' + expiryParts[1], 10);
    if (month < 1 || month > 12) {
      return 'Invalid expiry month (must be 01-12).';
    }
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return 'Card has expired.';
    }

    // CVV validation
    if (cvv.length !== 3 || !/^\d{3}$/.test(cvv)) {
      return 'CVV must be exactly 3 digits.';
    }

    if (!cardName.trim()) {
      return 'Cardholder name is required.';
    }

    return null;
  };

  const validateUPI = () => {
    const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    if (!upiPattern.test(upiId)) {
      return 'Please enter a valid UPI ID (e.g. name@bank).';
    }
    return null;
  };

  const handlePayment = (e) => {
    e.preventDefault();
    setError('');

    let validationError = null;
    if (method === 'card') {
      validationError = validateCard();
    } else if (method === 'upi') {
      validationError = validateUPI();
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    setProcessing(true);
    
    // Simulate processing payment for 2.5 seconds
    setTimeout(() => {
      setProcessing(false);
      setDone(true);
      
      // Complete order checkout after showing success receipt for 1.5 seconds
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }, 2500);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(30, 63, 32, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '480px',
        width: '100%',
        position: 'relative',
        animation: 'slideIn 0.3s ease-out',
        padding: '30px',
        borderTop: '4px solid var(--primary-color)'
      }}>
        
        {/* Close Button */}
        {!processing && !done && (
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}>
            <X size={20} />
          </button>
        )}

        {/* Processing State */}
        {processing && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: '4px solid var(--mint-accent)',
              borderTopColor: 'var(--primary-color)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px auto'
            }} />
            <h3 style={{ color: 'var(--primary-color)' }}>Securing Payment Transaction...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '6px' }}>Do not refresh this page or click back button</p>
          </div>
        )}

        {/* Success State */}
        {done && (
          <div style={{ textAlign: 'center', padding: '30px 0' }}>
            <div style={{ color: 'var(--primary-hover)', display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <CheckCircle size={60} />
            </div>
            <h3 style={{ color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 800 }}>Payment Successful!</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '6px' }}>Preparing your fresh harvest dispatches...</p>
          </div>
        )}

        {/* Payment Selection & Checkout Form */}
        {!processing && !done && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '16px' }}>
              <Shield size={20} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Secure Checkout</h2>
            </div>
            
            <div style={{
              backgroundColor: 'var(--bg-light)',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-color)',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>Amount Payable:</span>
              <strong style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }}>₹{amount.toFixed(2)}</strong>
            </div>

            {error && (
              <div style={{
                backgroundColor: '#f8d7da',
                color: '#721c24',
                padding: '12px 16px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
                border: '1px solid #f5c6cb'
              }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Methods Selection Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button onClick={() => { setMethod('card'); setError(''); }} style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: method === 'card' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: method === 'card' ? 'var(--mint-light)' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}>
                <CreditCard size={16} /> Card
              </button>

              <button onClick={() => { setMethod('upi'); setError(''); }} style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: method === 'upi' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: method === 'upi' ? 'var(--mint-light)' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}>
                <Smartphone size={16} /> UPI
              </button>

              <button onClick={() => { setMethod('netbanking'); setError(''); }} style={{
                flex: 1,
                padding: '10px 8px',
                borderRadius: '8px',
                border: method === 'netbanking' ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                backgroundColor: method === 'netbanking' ? 'var(--mint-light)' : '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.85rem'
              }}>
                <Landmark size={16} /> Bank
              </button>
            </div>

            {/* Forms */}
            <form onSubmit={handlePayment}>
              {method === 'card' && (
                <div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Cardholder Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Ramesh Kumar" 
                      value={cardName} 
                      onChange={(e) => setCardName(e.target.value)} 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontSize: '0.85rem' }}>Card Number</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="XXXX XXXX XXXX XXXX" 
                      maxLength="19"
                      value={cardNo} 
                      onChange={handleCardNoChange} 
                      required 
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>Expiry Date</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="MM/YY" 
                        maxLength="5"
                        value={expiry} 
                        onChange={handleExpiryChange} 
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.85rem' }}>CVV</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        placeholder="***" 
                        maxLength="3"
                        value={cvv} 
                        onChange={(e) => setCvv(e.target.value.replace(/[^0-9]/g, ''))} 
                        required 
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === 'upi' && (
                <div className="form-group">
                  <label className="form-label">UPI ID</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="username@bank" 
                    value={upiId} 
                    onChange={(e) => { setUpiId(e.target.value); setError(''); }} 
                    required 
                  />
                </div>
              )}

              {method === 'netbanking' && (
                <div className="form-group">
                  <label className="form-label">Select Bank</label>
                  <select className="form-control">
                    <option>State Bank of India (SBI)</option>
                    <option>HDFC Bank</option>
                    <option>ICICI Bank</option>
                    <option>Axis Bank</option>
                  </select>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px', borderRadius: '12px', marginTop: '10px' }}>
                Pay ₹{amount.toFixed(2)} Securely
              </button>
            </form>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
