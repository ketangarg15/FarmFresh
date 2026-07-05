import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Tag, Star, Sliders } from 'lucide-react';

export default function Products({ user }) {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Advanced Filter states
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [maxPrice, setMaxPrice] = useState(1500);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-asc', 'price-desc', 'rating'

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(Array.isArray(data) ? data : []);
        setFilteredProducts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products:', err);
        setLoading(false);
      });
  }, []);

  const categoryMatches = (prodCat, selectedCat) => {
    if (!prodCat) return false;
    const p = prodCat.toLowerCase().trim();
    const s = selectedCat.toLowerCase().trim();
    
    if (p === s) return true;
    if (p.includes('vegetable') && s.includes('vegetable')) return true;
    if (p.includes('fruit') && s.includes('fruit')) return true;
    if (p.includes('grain') && s.includes('grain')) return true;
    if (p.includes('dairy') && s.includes('dairy')) return true;
    if (p.includes('egg') && s.includes('egg')) return true;
    if (p.includes('spice') && s.includes('spice')) return true;
    if (p.includes('oil') && s.includes('oil')) return true;
    if (p.includes('honey') && s.includes('honey')) return true;
    
    return false;
  };

  useEffect(() => {
    let result = [...products];
    
    // Category Filter
    if (category !== 'All') {
      result = result.filter(p => categoryMatches(p.category, category));
    }

    // Name Search
    if (search.trim() !== '') {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Price Filter
    result = result.filter(p => p.price <= maxPrice);

    // Rating Filter
    if (minRating > 0) {
      result = result.filter(p => {
        const ratingVal = parseFloat(p.averageRating || 0);
        return ratingVal >= minRating;
      });
    }

    // Sort operations
    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => parseFloat(b.averageRating || 0) - parseFloat(a.averageRating || 0));
    }

    setFilteredProducts(result);
  }, [search, category, maxPrice, minRating, sortBy, products]);

  const categories = ['All', 'Vegetables', 'Fruits', 'Grains & Pulses', 'Dairy & Eggs', 'Spices & Oils', 'Honey & Sweeteners'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800 }}>Organic Marketplace</h1>
          <p style={{ color: 'var(--text-muted)' }}>Fresh farm harvests from verified growers</p>
        </div>

        {user && user.role === 'farmer' && (
          <Link to="/products/new" className="btn btn-primary">
            <Plus size={18} /> Add New Product
          </Link>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* Advanced Filters Sidebar (3 columns) */}
        <aside className="glass-panel" style={{ gridColumn: 'span 3', padding: '24px', position: 'sticky', top: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-color)', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Sliders size={18} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Search & Filters</h3>
          </div>

          {/* Text Search */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Keyword</label>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-control"
                placeholder="Search..."
                style={{ paddingLeft: '36px', paddingRight: '12px', paddingVertical: '8px', fontSize: '0.9rem' }}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Sort By */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Sort By</label>
            <select className="form-control" style={{ fontSize: '0.9rem' }} value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest Harvests</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating: High to Low</option>
            </select>
          </div>

          {/* Price Range Slider */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '0.85rem', marginBottom: 0 }}>Max Price</label>
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-hover)' }}>₹{maxPrice}</span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="2000" 
              step="10"
              style={{ width: '100%', accentColor: 'var(--primary-color)' }}
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            />
          </div>

          {/* Rating filter */}
          <div className="form-group">
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Minimum Rating</label>
            <select className="form-control" style={{ fontSize: '0.9rem' }} value={minRating} onChange={(e) => setMinRating(parseFloat(e.target.value))}>
              <option value="0">All Ratings</option>
              <option value="4">⭐ 4.0 & Up</option>
              <option value="3">⭐ 3.0 & Up</option>
              <option value="2">⭐ 2.0 & Up</option>
            </select>
          </div>
        </aside>

        {/* Product Catalog Grid (9 columns) */}
        <div style={{ gridColumn: 'span 9' }}>
          
          {/* Category Pills Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: category === cat ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  backgroundColor: category === cat ? 'var(--mint-light)' : '#fff',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'var(--transition)'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>Loading catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No products found matching your active filter choices.</p>
            </div>
          ) : (
            <div className="grid-responsive">
              {filteredProducts.map(product => (
                <div key={product._id} className="food-card">
                  <Link to={`/products/${product._id}`} style={{ position: 'relative', display: 'block', overflow: 'hidden' }}>
                    <img 
                      className="food-card-img"
                      src={product.image?.url || 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80'} 
                      alt={product.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1610348725531-843dff10902c?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      backgroundColor: 'rgba(30, 63, 32, 0.95)',
                      color: '#fff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      ₹{product.price} / kg
                    </span>
                    
                    {product.quantity === 0 && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(255,255,255,0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1.25rem',
                        color: '#c62828'
                      }}>
                        OUT OF STOCK
                      </div>
                    )}
                  </Link>
                  
                  <div className="food-card-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--primary-color)', fontWeight: 700 }}>{product.name}</h3>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <Tag size={12} /> {product.category || 'Organic'}
                      </span>
                    </div>

                    {product.averageRating > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--secondary-hover)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '12px' }}>
                        <Star size={14} fill="currentColor" /> {product.averageRating}
                      </div>
                    )}
                    
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px', flexGrow: 1 }}>
                      {product.description ? `${product.description.substring(0, 80)}...` : 'Fresh organic harvest direct from countryside farms.'}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
                      <div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Farmer</span>
                        <strong style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>{product.farmer?.name || 'Organic Grower'}</strong>
                      </div>
                      <Link to={`/products/${product._id}`} className="btn btn-primary" style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '0.85rem' }}>
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
