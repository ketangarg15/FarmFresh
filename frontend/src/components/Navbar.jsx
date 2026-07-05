import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut, Layout, User as UserIcon, AlertTriangle } from 'lucide-react';

export default function Navbar({ user, onLogout, cartCount }) {
  const navigate = useNavigate();

  const handleLogoutClick = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '16px 24px',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-color)' }}>
          <span>🌾</span>
          <span>FarmFresh</span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/" style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Home</Link>
          <Link to="/about" style={{ fontWeight: 500, color: 'var(--text-dark)' }}>About</Link>
          <Link to="/farmers" style={{ fontWeight: 500, color: 'var(--text-dark)' }}>Farmers</Link>
          <Link to="/future-surge" style={{
            fontWeight: 600,
            color: 'var(--secondary-hover)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <AlertTriangle size={16} /> Future Surge
          </Link>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {user ? (
            <>
              <Link to={`/dashboard/${user.role}`} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                <Layout size={16} /> Dashboard
              </Link>
              
              {user.role === 'consumer' && (
                <Link to="/cart" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)' }}>
                  <ShoppingBag size={20} />
                  {cartCount > 0 && (
                    <span style={{
                      backgroundColor: 'var(--secondary-color)',
                      color: 'var(--primary-color)',
                      borderRadius: '50%',
                      padding: '2px 6px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>{cartCount}</span>
                  )}
                </Link>
              )}

              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Hi, <strong>{user.name}</strong></span>
              
              <button onClick={handleLogoutClick} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#c62828' }} title="Log out">
                <LogOut size={20} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Log In</Link>
              <Link to="/signup" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
