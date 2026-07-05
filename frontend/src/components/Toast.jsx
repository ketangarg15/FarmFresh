import React, { useEffect } from 'react';

export default function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  if (!message) return null;

  const bgStyles = type === 'error' ? 'rgba(239, 83, 80, 0.95)' : 'rgba(30, 63, 32, 0.95)';

  return (
    <div className="toast-banner" style={{ backgroundColor: bgStyles, border: '1px solid rgba(255,255,255,0.2)' }}>
      <span>{type === 'error' ? '❌' : '🌿'}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold', marginLeft: '8px' }}>×</button>
    </div>
  );
}
