import React, { useState, useEffect } from 'react';
import { Syringe, Plus, Info, Share2, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const VaccinationRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [flock, setFlock] = useState('');
  const [vaccine, setVaccine] = useState('');
  const [dateGiven, setDateGiven] = useState(new Date().toISOString().split('T')[0]);
  const [nextDue, setNextDue] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [flocksList, setFlocksList] = useState([]);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      const [data, flocksData] = await Promise.all([
        api.vaccinations.getAll(),
        api.flocks.getAll().catch(() => []) // Gracefully fail if non-admin/perms
      ]);
      setRecords(data);
      setFlocksList(flocksData.filter(f => f.status === 'Active'));
    } catch (err) {
      setError('Failed to fetch data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.vaccinations.create({
        batchId: flock,
        vaccineName: vaccine,
        dateAdministered: dateGiven,
        nextDueDate: nextDue || null,
        notes: notes,
        administeredBy: 'STF-001' // Mock Current User
      });
      setIsFormOpen(false);
      resetForm();
      await loadRecords(); // Refresh list
    } catch (err) {
      setError('Failed to create vaccination record.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFlock(''); setVaccine(''); setNextDue(''); setNotes('');
    setDateGiven(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Vaccination Records</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track immunity and medication logs</span>
        </div>
        <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Close Form' : <><Plus size={18} /> Log Vaccination</>}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {isFormOpen && (
        <div className="card" style={{ borderLeft: '4px solid var(--primary)', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Syringe size={20} color="var(--primary)" /> New Medical Record
          </h3>
          <form className="standard-form" style={{ padding: 0 }} onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Target Flock</label>
                <select required value={flock} onChange={e => setFlock(e.target.value)}>
                  <option value="">-- Select Flock --</option>
                  {flocksList.map(f => (
                    <option key={f.id} value={f.batchId}>{f.house} ({f.batchId})</option>
                  ))}
                  {flocksList.length === 0 && <option value="" disabled>Loading flocks...</option>}
                </select>
              </div>
              <div className="form-group">
                <label>Vaccine / Medication Type</label>
                <select required value={vaccine} onChange={e => setVaccine(e.target.value)}>
                  <option value="">-- Select Type --</option>
                  <option value="Newcastle Disease (ND)">Newcastle Disease (ND)</option>
                  <option value="Infectious Bronchitis (IB)">Infectious Bronchitis (IB)</option>
                  <option value="Fowl Pox">Fowl Pox</option>
                  <option value="Deworming (Water)">Deworming (via Water)</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date Administered</label>
                <input type="date" required value={dateGiven} onChange={e => setDateGiven(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Next Due Date (Booster)</label>
                <input type="date" value={nextDue} onChange={e => setNextDue(e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Field Notes / Observations</label>
              <textarea rows="2" placeholder="e.g. Added vitamin C to water mix." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', gap: '8px' }}>
              <button type="button" className="btn-secondary" onClick={() => setIsFormOpen(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <><Loader2 className="spin" size={18}/> Saving...</> : 'Save Record'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', margin: 0 }}>Immunization History</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="status-badge" style={{ backgroundColor: '#f1f5f9', color: '#475569' }}><Info size={14} style={{ marginRight: '4px' }}/> F-01 Complete</span>
          </div>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            <Syringe size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <p>No vaccination records found.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Flock / Batch</th>
                  <th>Vaccine Administered</th>
                  <th>Notes</th>
                  <th>Next Due</th>
                </tr>
              </thead>
              <tbody>
                {records.map(rec => (
                  <tr key={rec.id}>
                    <td>{rec.dateAdministered}</td>
                    <td className="font-medium">{rec.batchId}</td>
                    <td>{rec.vaccineName}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{rec.notes || '-'}</td>
                    <td>
                      {rec.nextDueDate ? (
                        <span className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#b91c1c' }}>{rec.nextDueDate}</span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>N/A</span>
                      )}
                    </td>
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

export default VaccinationRecords;
