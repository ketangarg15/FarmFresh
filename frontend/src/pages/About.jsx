import React from 'react';
import { Target, Heart, Award } from 'lucide-react';

export default function About() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div className="glass-panel" style={{ borderTop: '4px solid var(--primary-color)', marginBottom: '40px', padding: '40px' }}>
        <h1 style={{ color: 'var(--primary-color)', fontSize: '2.5rem', fontWeight: 800, textAlign: 'center', marginBottom: '16px' }}>About FarmFresh</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', textAlign: 'center', maxWidth: '700px', margin: '0 auto 40px auto' }}>
          Connecting consumers directly with local organic farmers, fostering community-driven farming and sustainability.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', margin: '40px 0' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Target size={28} />
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>Our Mission</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              To ensure access to fresh, healthy, pesticide-free organic food for families while helping small farmers secure fair prices for their harvests.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Heart size={28} />
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>Community Support</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              By bypassing middlemen, we build direct bonds and channel maximum profits directly to the hard-working farming families in local districts.
            </p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ backgroundColor: 'var(--mint-light)', color: 'var(--primary-color)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
              <Award size={28} />
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--primary-color)' }}>Guaranteed Fresh</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              All produce is harvested based on orders and delivered right from local farms in temperature-safe packaging to lock in nutrients.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '30px', marginTop: '30px' }}>
          <h2 style={{ color: 'var(--primary-color)', marginBottom: '16px', fontWeight: 700 }}>Why Choose Us?</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
            FarmFresh was born from a desire to address the disparity between farmer earnings and retail store pricing, whilst delivering premium quality organic foods. Our platform provides complete transparency, allowing you to get to know the farmer behind your food.
          </p>
          <p style={{ color: 'var(--text-muted)' }}>
            We work with verified organic farmers who utilize rain-water irrigation, crop rotation, and natural compost, protecting local soil biology and giving you the healthiest meals possible.
          </p>
        </div>
      </div>
    </div>
  );
}
