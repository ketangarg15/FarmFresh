import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Signup({ onSignup, showToast }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('consumer');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !name || !email || !password || !role) {
      showToast('Please fill out all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, email, password, role })
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        onSignup(data.user);
        navigate(`/dashboard/${data.user.role}`);
      } else {
        showToast(data.message || 'Signup failed.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Connection error. Please try again.', 'error');
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto', width: '100%' }}>
      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)' }}>
        <h2 style={{ textAlign: 'center', color: 'var(--primary-color)', marginBottom: '10px', fontSize: '2rem' }}>Join FarmFresh</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '30px' }}>Access fresh products directly from local fields</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="role">I am a:</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="consumer">Consumer</option>
              <option value="farmer">Farmer</option>
              <option value="delivery_partner">Delivery Partner</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input 
              type="text" 
              id="name"
              className="form-control" 
              placeholder="e.g. Ramesh Kumar"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username"
              className="form-control" 
              placeholder="Pick a unique username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              type="email" 
              id="email"
              className="form-control" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input 
              type="password" 
              id="password"
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-color)', fontWeight: 600 }}>Log In</Link>
        </p>
      </div>
    </div>
  );
}
