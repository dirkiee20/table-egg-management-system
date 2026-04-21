import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';
import '../App.css';

const Pricing = () => {
  const [pricing, setPricing] = useState({
    Jumbo: 300,
    'Extra-Large': 285,
    Large: 270,
    Medium: 255,
    Small: 240,
    Peewee: 225
  });
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('egg_pricing');
    if (saved) {
      try {
        setPricing(JSON.parse(saved));
      } catch (e) {
        // use defaults
      }
    }
  }, []);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      localStorage.setItem('egg_pricing', JSON.stringify(pricing));
      setIsSaving(false);
      setSuccessMsg('Pricing updated successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 600);
  };

  const updatePrice = (size, value) => {
    setPricing({
      ...pricing,
      [size]: parseFloat(value) || 0
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <div className="page-header">
        <h2>Egg Pricing Area</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Set default prices per tray for each egg size. These prices are auto-computed in the Point of Sale.</p>
      </div>

      <div className="card">
        {successMsg && (
          <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}

        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="standard-form" style={{ padding: 0 }}>
          {Object.keys(pricing).map(size => (
            <div className="form-row" key={size} style={{ alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ flex: 1, fontWeight: '500', color: 'var(--text-main)' }}>{size} Tray (₱)</div>
              <div style={{ flex: 2 }}>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={pricing[size]}
                  onChange={e => updatePrice(size, e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving}
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {isSaving ? <Loader2 className="spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Saving...' : 'Save Pricing Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Pricing;
