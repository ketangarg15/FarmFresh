import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PrivateRoute from './components/PrivateRoute';
import Home from './pages/Home';
import About from './pages/About';
import Farmers from './pages/Farmers';
import FarmerProfile from './pages/FarmerProfile';
import FutureSurge from './pages/FutureSurge';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import ProductForm from './pages/ProductForm';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Deliveries from './pages/Deliveries';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Toast from './components/Toast';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const closeToast = () => {
    setToast({ message: '', type: 'success' });
  };

  useEffect(() => {
    // Check if user is logged in on mount
    fetch('/api/users/current-user')
      .then(res => res.json())
      .then(data => {
        if (data.user) {
          setUser(data.user);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Check current user failed:', err);
        setLoading(false);
      });
  }, []);

  // Sync cart with localStorage for persistence
  useEffect(() => {
    if (user && user.role === 'consumer') {
      const savedCart = localStorage.getItem(`cart_${user._id}`);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.role === 'consumer') {
      localStorage.setItem(`cart_${user._id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const handleLogin = (userData) => {
    setUser(userData);
    showToast(`Welcome back, ${userData.name}!`, 'success');
  };

  const handleSignup = (userData) => {
    setUser(userData);
    showToast(`Account created successfully! Welcome, ${userData.name}!`, 'success');
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/users/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(null);
        setCart([]);
        showToast('Logged out successfully', 'success');
      }
    } catch (err) {
      console.error('Logout failed:', err);
      showToast('Logout failed. Connection error.', 'error');
    }
  };

  const addToCart = (product, quantity) => {
    if (!user) {
      showToast('Please log in to add items to cart', 'error');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.productId === product._id);
      if (existing) {
        return prev.map(item => 
          item.productId === product._id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity,
        farmer: product.farmer
      }];
    });
    showToast(`Added ${quantity}kg of ${product.name} to cart!`, 'success');
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
    showToast('Item removed from cart', 'success');
  };

  const updateCartQuantity = (productId, quantity) => {
    setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-light)' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--primary-color)' }}>
          🌿 Loading FarmFresh...
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} cartCount={cartCount} />
        
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home user={user} showToast={showToast} />} />
            <Route path="/about" element={<About />} />
            <Route path="/farmers" element={<Farmers />} />
            <Route path="/farmers/:id" element={<FarmerProfile />} />
            <Route path="/future-surge" element={<FutureSurge />} />
            <Route path="/products" element={<Products user={user} />} />
            <Route path="/products/:id" element={<ProductDetail user={user} showToast={showToast} onAddToCart={addToCart} />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <Login onLogin={handleLogin} showToast={showToast} />} />
            <Route path="/signup" element={user ? <Navigate to={`/dashboard/${user.role}`} /> : <Signup onSignup={handleSignup} showToast={showToast} />} />

            {/* Protected Routes */}
            <Route path="/dashboard/consumer" element={<PrivateRoute user={user} role="consumer"><Dashboard user={user} showToast={showToast} /></PrivateRoute>} />
            <Route path="/dashboard/farmer" element={<PrivateRoute user={user} role="farmer"><Dashboard user={user} showToast={showToast} /></PrivateRoute>} />
            <Route path="/dashboard/admin" element={<PrivateRoute user={user} role="admin"><Dashboard user={user} showToast={showToast} /></PrivateRoute>} />
            <Route path="/dashboard/delivery_partner" element={<PrivateRoute user={user} role="delivery_partner"><Dashboard user={user} showToast={showToast} /></PrivateRoute>} />
            
            <Route path="/products/new" element={<PrivateRoute user={user} role="farmer"><ProductForm showToast={showToast} /></PrivateRoute>} />
            <Route path="/products/:id/edit" element={<PrivateRoute user={user} role="farmer"><ProductForm showToast={showToast} /></PrivateRoute>} />

            <Route path="/cart" element={<PrivateRoute user={user} role="consumer"><Cart cart={cart} onRemove={removeFromCart} onUpdateQuantity={updateCartQuantity} onCheckout={clearCart} showToast={showToast} /></PrivateRoute>} />
            <Route path="/orders" element={<PrivateRoute user={user} role="consumer"><Orders showToast={showToast} /></PrivateRoute>} />
            <Route path="/orders/:id" element={<PrivateRoute user={user}><OrderDetail user={user} showToast={showToast} /></PrivateRoute>} />
            
            <Route path="/deliveries" element={<PrivateRoute user={user}><Deliveries user={user} showToast={showToast} /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <Footer />
        
        {toast.message && (
          <Toast message={toast.message} type={toast.type} onClose={closeToast} />
        )}
      </div>
    </Router>
  );
}
