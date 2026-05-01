import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EGGS_PER_TRAY = 30;
const SIZE_FIELDS = ['jumbo', 'extralarge', 'large', 'medium', 'small', 'peewee'];

const parseWholeNumber = (value) => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 0;
  }

  return Math.floor(parsed);
};

const DailyEggProduction = () => {
  const [formData, setFormData] = useState({
    flockId: '',
    date: new Date().toISOString().split('T')[0],
    jumbo_trays: '', jumbo_odd: '',
    extralarge_trays: '', extralarge_odd: '',
    large_trays: '', large_odd: '',
    medium_trays: '', medium_odd: '',
    small_trays: '', small_odd: '',
    peewee_trays: '', peewee_odd: '',
    cracked: '',
    reject: '',
    remarks: ''
  });

  const [flocks, setFlocks] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const fetchFlocks = async () => {
      try {
        const data = await api.flocks.getAll();
        setFlocks(data.filter(f => f.status === 'Active'));
      } catch (err) {
        console.error("Failed to load flocks:", err);
      }
    };
    fetchFlocks();
  }, []);

  const totalTrays = SIZE_FIELDS.reduce((sum, field) => sum + parseWholeNumber(formData[`${field}_trays`]), 0);
  const totalOddEggs = SIZE_FIELDS.reduce((sum, field) => sum + parseWholeNumber(formData[`${field}_odd`]), 0);
  const totalGoodEggs = (totalTrays * EGGS_PER_TRAY) + totalOddEggs;
  const crackedVal = parseWholeNumber(formData.cracked);
  const rejectVal = parseWholeNumber(formData.reject);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitStatus('loading');

    try {
      const sizePayload = SIZE_FIELDS.reduce((payload, field) => {
        payload[field] = (parseWholeNumber(formData[`${field}_trays`]) * EGGS_PER_TRAY) + parseWholeNumber(formData[`${field}_odd`]);
        return payload;
      }, {});

      await api.production.create({
        date: formData.date,
        flockId: formData.flockId,
        ...sizePayload,
        bunkig: 0,
        cracked: crackedVal,
        reject: rejectVal,
        mortality: 0,
        notes: formData.remarks
      });

      setSubmitStatus('success');

      setFormData(prev => ({
        ...prev,
        jumbo_trays: '', jumbo_odd: '',
        extralarge_trays: '', extralarge_odd: '',
        large_trays: '', large_odd: '',
        medium_trays: '', medium_odd: '',
        small_trays: '', small_odd: '',
        peewee_trays: '', peewee_odd: '',
        cracked: '',
        reject: '',
        remarks: ''
      }));

      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitStatus('error');
    }
  };

  const isHighLoss = totalGoodEggs > 0 &&
    ((crackedVal + rejectVal) / totalGoodEggs) > 0.05;

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Daily Egg Production</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Record the daily collection and grading numbers.</p>
      </div>

      <div className="card">
        {submitStatus === 'success' && (
          <div style={{ padding: '12px 16px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            <CheckCircle2 size={20} /> Production record saved successfully!
          </div>
        )}

        {submitStatus === 'error' && (
          <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
            <AlertCircle size={20} /> Failed to save production record. Please try again.
          </div>
        )}

        <form onSubmit={handleSubmit} className="standard-form" style={{ padding: 0 }}>
          <div className="form-row">
            <div className="form-group">
              <label>Collection Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Target Flock</label>
              <select
                required
                value={formData.flockId}
                onChange={e => setFormData({ ...formData, flockId: e.target.value })}
              >
                <option value="" disabled>Select a flock...</option>
                {flocks.map(f => (
                  <option key={f.id} value={f.id}>{f.house} / {f.batchId}</option>
                ))}
                {flocks.length === 0 && <option value="" disabled>Loading active flocks...</option>}
              </select>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '24px 0' }} />

          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Production Grading</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '16px' }}>
            Enter full trays and odd eggs for each size.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { id: 'jumbo', label: 'Jumbo (J)' },
              { id: 'extralarge', label: 'Extra-Large (ExL)' },
              { id: 'large', label: 'Large (L)' },
              { id: 'medium', label: 'Medium (M)' },
              { id: 'small', label: 'Small (S)' },
              { id: 'peewee', label: 'Peewee (P)' }
            ].map(size => (
              <div key={size.id} className="form-group" style={{ marginBottom: 0 }}>
                <label>{size.label}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="Trays"
                    value={formData[`${size.id}_trays`]}
                    onChange={e => setFormData({ ...formData, [`${size.id}_trays`]: e.target.value })}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    min="0"
                    step="1"
                    placeholder="Odd"
                    value={formData[`${size.id}_odd`]}
                    onChange={e => setFormData({ ...formData, [`${size.id}_odd`]: e.target.value })}
                    style={{ flex: 1, minWidth: 0 }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px', backgroundColor: '#f0fdf4', color: '#166534', borderRadius: '6px', margin: '20px 0', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <span>Total Eggs: {totalGoodEggs}</span>
            <span>Total Trays: {totalTrays} + {totalOddEggs} Odd</span>
          </div>

          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '16px', marginTop: '24px' }}>Damages</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Cracked</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                value={formData.cracked}
                onChange={e => setFormData({ ...formData, cracked: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Reject</label>
              <input
                type="number"
                inputMode="numeric"
                min="0"
                step="1"
                placeholder="0"
                value={formData.reject}
                onChange={e => setFormData({ ...formData, reject: e.target.value })}
              />
            </div>
          </div>

          {isHighLoss && (
            <div style={{ padding: '12px', backgroundColor: '#fef3c7', color: '#92400e', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '0.875rem' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>Warning: Total cracked and rejected eggs are over 5% of the total collection. Plausibly review the conveying or collection handling process.</span>
            </div>
          )}

          <div className="form-group">
            <label>Daily Remarks / Notes (Optional)</label>
            <textarea
              rows="3"
              placeholder="Any issues with water, temperature shifts, or bird health observed today?"
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            ></textarea>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
              disabled={submitStatus === 'loading'}
            >
              <Save size={20} /> {submitStatus === 'loading' ? 'Saving...' : 'Save Daily Production'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyEggProduction;
