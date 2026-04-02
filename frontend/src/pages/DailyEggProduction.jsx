import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const DailyEggProduction = () => {
  const [formData, setFormData] = useState({
    flockId: '',
    date: new Date().toISOString().split('T')[0],
    totalEggs: '',
    crackedEggs: '',
    rejectedEggs: '',
    remarks: ''
  });

  const [flocks, setFlocks] = useState([]);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    // Fetch active flocks to populate the dropdown
    const fetchFlocks = async () => {
      try {
        const data = await api.flocks.getAll();
        setFlocks(data.filter(f => f.status === 'Active')); // Only active flocks can produce eggs
      } catch (err) {
        console.error("Failed to load flocks:", err);
      }
    };
    fetchFlocks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSubmitStatus('loading');
    
    try {
      await api.production.create({
        date: formData.date,
        flockId: formData.flockId,
        eggsCollected: Number(formData.totalEggs) || 0,
        damagedEggs: (Number(formData.crackedEggs) || 0) + (Number(formData.rejectedEggs) || 0),
        mortality: 0,
        notes: formData.remarks
      });

      setSubmitStatus('success');
      
      // Reset numeric fields but keep date and flock
      setFormData(prev => ({
        ...prev,
        totalEggs: '',
        crackedEggs: '',
        rejectedEggs: '',
        remarks: ''
      }));

      // Clear success message after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitStatus('error');
    }
  };

  // Warning if cracked + rejected > 5% of total (just a smart UI feature)
  const isHighLoss = formData.totalEggs > 0 && 
    ((Number(formData.crackedEggs) + Number(formData.rejectedEggs)) / Number(formData.totalEggs)) > 0.05;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
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
                onChange={e => setFormData({...formData, date: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Target Flock</label>
              <select 
                required 
                value={formData.flockId}
                onChange={e => setFormData({...formData, flockId: e.target.value})}
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

          <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '16px' }}>Production Grading</h3>

          <div className="form-group">
            <label>Total Good Eggs Collected (Pieces)</label>
            <input 
              type="number" 
              inputMode="numeric"
              required 
              min="0"
              placeholder="e.g. 4500"
              value={formData.totalEggs}
              onChange={e => setFormData({...formData, totalEggs: e.target.value})}
              style={{ fontSize: '1.25rem', padding: '12px' }} /* Larger touch target for mobile efficiency */
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cracked Eggs</label>
              <input 
                type="number" 
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={formData.crackedEggs}
                onChange={e => setFormData({...formData, crackedEggs: e.target.value})}
              />
            </div>
            
            <div className="form-group">
              <label>Rejected Eggs</label>
              <input 
                type="number" 
                inputMode="numeric"
                min="0"
                placeholder="0"
                value={formData.rejectedEggs}
                onChange={e => setFormData({...formData, rejectedEggs: e.target.value})}
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
              onChange={e => setFormData({...formData, remarks: e.target.value})}
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
