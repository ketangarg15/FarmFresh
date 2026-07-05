import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Heart, Sparkles, TrendingUp, Compass, ShoppingBag, Plus, PlusCircle, CheckCircle, Clock, Truck, ShieldAlert, Award } from 'lucide-react';

export default function Dashboard({ user, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState([]);
  const [selectedPartners, setSelectedPartners] = useState({}); // mapping { deliveryId: partnerId }
  const [assigningId, setAssigningId] = useState(null);

  const fetchDashboardData = () => {
    fetch('/api/dashboard/data')
      .then(res => res.json())
      .then(d => {
        if (!d.error) {
          setData(d);
        } else {
          showToast(d.error, 'error');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch dashboard data:', err);
        setLoading(false);
      });
  };

  const fetchPartners = () => {
    if (user.role === 'admin') {
      fetch('/api/deliveries/partners')
        .then(res => res.json())
        .then(list => {
          setPartners(Array.isArray(list) ? list : []);
        })
        .catch(err => console.error('Failed to fetch delivery partners:', err));
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchPartners();
  }, []);

  const handleAssignPartner = async (deliveryId) => {
    const partnerId = selectedPartners[deliveryId];
    if (!partnerId) {
      showToast('Please select a delivery partner first!', 'error');
      return;
    }

    setAssigningId(deliveryId);
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId })
      });
      const resData = await res.json();
      setAssigningId(null);

      if (resData.success) {
        showToast('Delivery assigned to partner successfully!', 'success');
        fetchDashboardData(); // reload stats and list
      } else {
        showToast(resData.error || 'Assignment failed', 'error');
      }
    } catch (err) {
      setAssigningId(null);
      showToast('Connection error', 'error');
    }
  };

  const handlePartnerSelect = (deliveryId, partnerId) => {
    setSelectedPartners(prev => ({ ...prev, [deliveryId]: partnerId }));
  };

  const handleUpdateDeliveryStatus = async (deliveryId, nextStatus) => {
    try {
      const res = await fetch(`/api/deliveries/${deliveryId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
      const resData = await res.json();
      
      if (resData.success) {
        showToast(`Logistics status updated to ${nextStatus}!`, 'success');
        fetchDashboardData(); // reload list
      } else {
        showToast(resData.error || 'Update failed', 'error');
      }
    } catch (err) {
      showToast('Connection error', 'error');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading dashboard panel...</div>;
  if (!data) return <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Could not load data.</div>;

  const { stats, recentOrders, recentProducts, recentDeliveries } = data;

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{user.role === 'farmer' ? '🚜' : user.role === 'admin' ? '🛡️' : user.role === 'delivery_partner' ? '🚴' : '🛒'}</span>
          {user.role === 'delivery_partner' ? 'Delivery Partner' : user.role.charAt(0).toUpperCase() + user.role.slice(1)} Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Welcome back, <strong>{user.name}</strong>. Here is your summary for today.</p>
      </div>

      {/* Role-Specific Stats Grid */}
      {user.role === 'consumer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
              <ShoppingBag size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Orders</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{stats.totalOrders || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
              <Heart size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Favorite Farms</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{stats.savedItemsCount || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 179, 0, 0.15)', color: 'var(--secondary-hover)', padding: '16px', borderRadius: '12px' }}>
              <TrendingUp size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Money Saved</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary-hover)', fontWeight: 800 }}>₹{stats.moneySaved || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {user.role === 'farmer' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
              <Package size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Listings</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{stats.totalListings || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 179, 0, 0.15)', color: 'var(--secondary-hover)', padding: '16px', borderRadius: '12px' }}>
              <Clock size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Pending Orders</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary-hover)', fontWeight: 800 }}>{stats.pendingOrders || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-hover)', padding: '16px', borderRadius: '12px' }}>
              <Sparkles size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Farm Revenue</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>₹{stats.revenue || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {user.role === 'admin' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
              <ShoppingBag size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>System Orders</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{stats.totalOrders || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 179, 0, 0.15)', color: 'var(--secondary-hover)', padding: '16px', borderRadius: '12px' }}>
              <Compass size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>All Deliveries</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary-hover)', fontWeight: 800 }}>{stats.totalDeliveries || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-hover)', padding: '16px', borderRadius: '12px' }}>
              <Clock size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Deliveries</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{stats.pendingDeliveries || 0}</h3>
            </div>
          </div>
        </div>
      )}

      {user.role === 'delivery_partner' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', padding: '16px', borderRadius: '12px' }}>
              <Truck size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Assigned Shipments</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--primary-color)', fontWeight: 800 }}>{recentOrders?.length || 0}</h3>
            </div>
          </div>

          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ backgroundColor: 'rgba(255, 179, 0, 0.15)', color: 'var(--secondary-hover)', padding: '16px', borderRadius: '12px' }}>
              <Award size={28} />
            </div>
            <div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rating & Status</span>
              <h3 style={{ fontSize: '1.8rem', color: 'var(--secondary-hover)', fontWeight: 800 }}>⭐ Verified Courier</h3>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Panel */}
      <div className="glass-panel" style={{ marginBottom: '40px', padding: '24px' }}>
        <h3 style={{ color: 'var(--primary-color)', marginBottom: '16px', fontWeight: 700 }}>Quick Actions</h3>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {user.role === 'consumer' && (
            <>
              <Link to="/products" className="btn btn-primary"><Compass size={16} /> Browse Marketplace</Link>
              <Link to="/orders" className="btn btn-outline"><ShoppingBag size={16} /> View My Orders</Link>
              <Link to="/farmers" className="btn btn-outline">🚜 Meet Local Farmers</Link>
            </>
          )}

          {user.role === 'farmer' && (
            <>
              <Link to="/products/new" className="btn btn-primary"><PlusCircle size={16} /> Add Harvest Listing</Link>
              <Link to="/products" className="btn btn-outline">📋 View My Catalog Items</Link>
              <Link to="/deliveries" className="btn btn-outline">🚚 Monitor Orders & Deliveries</Link>
            </>
          )}

          {user.role === 'admin' && (
            <>
              <Link to="/deliveries" className="btn btn-primary"><Compass size={16} /> Dispatch Deliveries</Link>
              <Link to="/products" className="btn btn-outline">📋 View Catalog Audit</Link>
            </>
          )}

          {user.role === 'delivery_partner' && (
            <Link to="/deliveries" className="btn btn-primary"><Truck size={16} /> Monitor Assigned Deliveries</Link>
          )}
        </div>
      </div>

      {/* Lists / History Tables */}
      <div className="glass-panel" style={{ padding: '30px' }}>
        {user.role === 'consumer' && (
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>Recent Orders</h3>
            {recentOrders?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>You haven't placed any orders yet. Visit our marketplace to order!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentOrders.map(order => (
                  <div key={order._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-light)' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-color)' }}>Order #{order._id.substring(18)}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <strong style={{ color: 'var(--primary-color)' }}>₹{order.totalAmount}</strong>
                      <span className={`badge ${order.status === 'delivered' ? 'badge-fresh' : 'badge-scarcity'}`}>
                        {order.status}
                      </span>
                      <Link to={`/orders/${order._id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View Status</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'farmer' && (
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>Recent Product Listings</h3>
            {recentProducts?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No products listed yet. Publish one using Add Harvest Listing!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentProducts.map(p => (
                  <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-light)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <img src={p.image?.url} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />
                      <div>
                        <h4 style={{ color: 'var(--primary-color)' }}>{p.name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>₹{p.price} / kg • Stock: {p.quantity} kg</p>
                      </div>
                    </div>
                    <Link to={`/products/${p._id}`} className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>View Detail</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'admin' && (
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>Manage Deliveries Assignment</h3>
            {recentDeliveries?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No active dispatches logged.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentDeliveries.map(d => (
                  <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-light)', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-color)' }}>Delivery ID: #{d._id.substring(18)}</h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Consumer: <strong>{d.order?.consumer?.name || d.order?.consumer?.username}</strong> • Total: ₹{d.order?.totalAmount}
                      </p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Partner: <span style={{ color: 'var(--primary-hover)', fontWeight: 'bold' }}>{d.deliveryPartner?.name || d.partnerName || 'Not Assigned'}</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                      {d.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <select 
                            className="form-control" 
                            style={{ padding: '6px 12px', fontSize: '0.85rem', maxWidth: '180px' }}
                            value={selectedPartners[d._id] || ''}
                            onChange={(e) => handlePartnerSelect(d._id, e.target.value)}
                          >
                            <option value="">Select Partner...</option>
                            {partners.map(p => (
                              <option key={p._id} value={p._id}>{p.name || p.username}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => handleAssignPartner(d._id)} 
                            className="btn btn-primary"
                            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                            disabled={assigningId === d._id}
                          >
                            Assign
                          </button>
                        </div>
                      )}

                      <span className={`badge ${d.status === 'delivered' ? 'badge-fresh' : 'badge-scarcity'}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {user.role === 'delivery_partner' && (
          <div>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '20px', fontWeight: 700 }}>My Assigned Dispatches</h3>
            {recentDeliveries?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No shipments assigned to you yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentDeliveries.map(d => (
                  <div key={d._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', backgroundColor: 'var(--bg-light)', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ color: 'var(--primary-color)' }}>Delivery ID: #{d._id.substring(18)}</h4>
                      <p style={{ fontSize: '0.9rem' }}>Consumer: <strong>{d.order?.consumer?.name}</strong></p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Address: {d.order?.consumer?.address || 'Green Lane'}</p>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Contact: {d.order?.consumer?.contactNumber || '9988776655'}</p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      {d.status !== 'delivered' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleUpdateDeliveryStatus(d._id, 'in_transit')} 
                            className="btn btn-outline"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            disabled={d.status === 'in_transit'}
                          >
                            In Transit
                          </button>
                          <button 
                            onClick={() => handleUpdateDeliveryStatus(d._id, 'delivered')} 
                            className="btn btn-primary"
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                          >
                            Mark Delivered
                          </button>
                        </div>
                      )}
                      
                      <span className={`badge ${d.status === 'delivered' ? 'badge-fresh' : 'badge-scarcity'}`}>
                        {d.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
