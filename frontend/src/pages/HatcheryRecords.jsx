import React, { useState, useEffect } from 'react';
import { Building2, Plus, Info, Share2, Loader2, AlertCircle, Thermometer } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const HatcheryRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [batchCode, setBatchCode] = useState('');
  const [eggCount, setEggCount] = useState('');
  const [fertileCount, setFertileCount] = useState('');
  const [hatchDate, setHatchDate] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.hatchery.getAll();
      setRecords(data);
    } catch (err) {
      setError('Failed to fetch hatchery records.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.hatchery.create({
        batchCode: batchCode,
        eggCount: Number(eggCount),
        fertileEggCount: Number(fertileCount) || null,
        hatchDate: hatchDate,
        notes: notes
      });
      setIsFormOpen(false);
      resetForm();
      await loadRecords(); // Refresh list
    } catch (err) {
      setError('Failed to create hatchery record.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setBatchCode(''); setEggCount(''); setFertileCount(''); setHatchDate(''); setNotes('');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Hatchery Management</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Incubation cycles and hatch mapping</span>
        </div>
        <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Close Form' : <><Plus size={18} /> New Batch</>}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {isFormOpen && (
        <div className="card" style={{ borderLeft: '4px solid #3b82f6', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Thermometer size={20} color="#3b82f6" /> Initialize Incubator Batch
          </h3>
          <form className="standard-form" style={{ padding: 0 }} onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Batch Code Identifier</label>
                <input type="text" placeholder="e.g. HB-Alpha-2" required value={batchCode} onChange={e => setBatchCode(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Total Eggs Set</label>
                <input type="number" min="1" required value={eggCount} onChange={e => setEggCount(e.target.value)} />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Fertile Eggs (Candling Result)</label>
                <input type="number" min="0" placeholder="Optional initially" value={fertileCount} onChange={e => setFertileCount(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Expected Hatch Date</label>
                <input type="date" required value={hatchDate} onChange={e => setHatchDate(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Field Notes / Observations</label>
              <textarea rows="2" placeholder="e.g. Machine 2 settings adjusted." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 className="spin" size={18}/> Saving...</> : 'Save Batch'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', margin: 0 }}>Incubator Pipeline</h3>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Building2 size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No active hatchery records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Batch Code</th>
                  <th>Expected Hatch Date</th>
                  <th className="text-right">Eggs Set</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td className="font-medium" style={{ color: '#1d4ed8' }}>{rec.batchCode}</td>
                    <td>{rec.hatchDate}</td>
                    <td className="text-right">{rec.eggCount?.toLocaleString()}</td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8' }}>Incubating</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{rec.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default HatcheryRecords;
