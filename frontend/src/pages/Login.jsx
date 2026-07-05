import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Login({ onLogin, showToast }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Please enter both username and password', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      setLoading(false);
      
      if (data.success) {
        onLogin(data.user);
        navigate(`/dashboard/${data.user.role}`);
      } else {
        showToast(data.message || 'Login failed. Please check your credentials.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Connection error. Please try again later.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '40px auto', width: '100%' }}>
      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '10px', fontSize: '2rem' }}>Welcome Back</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Sign in to order fresh farm harvest</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              className="form-control" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              className="form-control" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '14px', fontSize: '1rem', marginBottom: '20px' }}
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/signup" style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}
