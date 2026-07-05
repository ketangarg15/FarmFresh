import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Upload, Save } from 'lucide-react';

export default function ProductForm({ showToast }) {
  const { id } = useParams(); // if present, we are in Edit mode
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [category, setCategory] = useState('Vegetables');
  const [location, setLocation] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setLoading(true);
      fetch(`/api/products/${id}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            const p = data.product;
            setName(p.name);
            setDescription(p.description || '');
            setPrice(p.price);
            setQuantity(p.quantity);
            setCategory(p.category || 'Vegetables');
            setLocation(p.location || '');
            if (p.image?.url) {
              setImagePreview(p.image.url);
            }
          }
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !price || !quantity || !location) {
      showToast('Please fill in name, price, stock quantity, and origin location', 'error');
      return;
    }
    if (!isEditMode && !imageFile) {
      showToast('Please select a product image', 'error');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('category', category);
    formData.append('location', location);
    
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const url = isEditMode ? `/api/products/${id}` : '/api/products';
    // When using method override or PUT, we can use PUT method. Since express handles app.put('/api/products/:id'), we make a PUT request.
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        body: formData
      });
      const data = await res.json();
      setLoading(false);

      if (data.success) {
        showToast(isEditMode ? 'Listing updated successfully!' : 'Listing added successfully!', 'success');
        navigate(`/products/${data.product._id}`);
      } else {
        showToast(data.error || 'Failed to save product details.', 'error');
      }
    } catch (err) {
      setLoading(false);
      showToast('Connection error. Please try again.', 'error');
    }
  };

  const categories = ['Vegetables', 'Fruits', 'Grains & Pulses', 'Dairy & Eggs', 'Spices & Oils', 'Honey & Sweeteners'];

  return (
    <div style={{ maxWidth: '650px', margin: '0 auto' }}>
      <Link to="/products" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-color)', marginBottom: '24px', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Organic Marketplace
      </Link>

      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)' }}>
        <h2 style={{ color: 'var(--primary-color)', marginBottom: '24px', fontWeight: 800 }}>
          {isEditMode ? 'Edit Farm Product' : 'Add Organic Harvest Listing'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input 
              type="text" 
              className="form-control"
              placeholder="e.g. Organic Red Carrots"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-control" value={category} onChange={(e) => setCategory(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Origin Location</label>
              <input 
                type="text" 
                className="form-control"
                placeholder="e.g. Pune, Maharashtra"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label className="form-label">Price (₹ per kg)</label>
              <input 
                type="number" 
                min="0"
                step="0.01"
                className="form-control"
                placeholder="e.g. 60"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Stock Quantity (kg)</label>
              <input 
                type="number" 
                min="0"
                className="form-control"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              rows="4" 
              placeholder="Provide information about crop methods, certifications, or culinary tips..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* Image Upload */}
          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label">Harvest Photo</label>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 20px',
                border: '1px dashed var(--mint-accent)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                color: 'var(--primary-color)',
                backgroundColor: 'var(--bg-light)'
              }}>
                <Upload size={18} /> Select Image File
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              </label>

              {imagePreview && (
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              )}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '14px' }} disabled={loading}>
            <Save size={18} /> {loading ? 'Saving Listing Details...' : (isEditMode ? 'Update Listing' : 'Publish Listing')}
          </button>
        </form>
      </div>
    </div>
  );
}
