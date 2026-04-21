import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const FlockManagement = () => {
  const [flocks, setFlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: 'Lohmann Brown',
    startDate: '',
    hens: '',
    mortality: 0,
    status: 'Active'
  });

  useEffect(() => {
    loadFlocks();
  }, []);

  const loadFlocks = async () => {
    try {
      setLoading(true);
      const data = await api.flocks.getAll();
      setFlocks(data.reverse());
    } catch (err) {
      setErrorMsg("Failed to retrieve flock data from backend.");
    } finally {
      setLoading(false);
    }
  };

  const openForm = (flock = null) => {
    if (flock) {
      setEditingId(flock.id);
      setFormData({
        name: flock.house,
        breed: flock.breed,
        startDate: flock.batchId,
        hens: flock.quantity,
        mortality: flock.mortality || 0,
        status: flock.status
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', breed: 'Lohmann Brown', startDate: '', hens: '', mortality: 0, status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const closeForm = () => setIsModalOpen(false);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this flock?")) {
      try {
        await api.flocks.delete(id);
        await loadFlocks();
      } catch (err) {
        setErrorMsg("Failed to delete flock.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      if (editingId) {
        await api.flocks.update(editingId, {
          batchId: formData.startDate,
          house: formData.name,
          breed: formData.breed,
          ageWeeks: 0,
          quantity: Number(formData.hens),
          mortality: Number(formData.mortality),
          status: formData.status
        });
      } else {
        await api.flocks.create({
          batchId: formData.startDate,
          house: formData.name,
          breed: formData.breed,
          ageWeeks: 0,
          quantity: Number(formData.hens),
          mortality: Number(formData.mortality),
          status: formData.status
        });
      }
      await loadFlocks();
      closeForm();
    } catch (err) {
      setErrorMsg("Failed to save flock.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Flock Management</h2>
        <button className="btn-primary" onClick={() => openForm()}>
          <Plus size={18} /> Add New Flock
        </button>
      </div>

      {errorMsg && !isModalOpen && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Flock Name</th>
                <th>Breed</th>
                <th>Start Date</th>
                <th>Number of Hens</th>
                <th>Mortality</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : flocks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center empty-state" style={{ padding: '32px', color: 'var(--text-muted)' }}>No flocks registered yet.</td>
                </tr>
              ) : flocks.map(flock => (
                <tr key={flock.id}>
                  <td className="font-medium">{flock.house}</td>
                  <td>{flock.breed}</td>
                  <td>{flock.batchId}</td>
                  <td>{(flock.quantity || 0).toLocaleString()}</td>
                  <td>{(flock.mortality || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${(flock.status||'').toLowerCase()}`}>
                      {flock.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit" onClick={() => openForm(flock)} title="Edit">
                      <Edit2 size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(flock.id)} title="Delete">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => !isSubmitting && closeForm()}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Flock Info' : 'Add New Flock'}</h3>
              <button className="close-btn" onClick={() => !isSubmitting && closeForm()}><X size={20} /></button>
            </div>

            {errorMsg && (
              <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', margin: '0 24px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                <AlertCircle size={18} style={{flexShrink:0}}/> {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="standard-form">
              <div className="form-group">
                <label>Flock Name / House</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. F-03 / House 2" disabled={isSubmitting} />
              </div>
              
              <div className="form-group">
                <label>Laying Breed</label>
                <select value={['Lohmann Brown', 'ISA Brown', 'Hy-Line Brown', 'Dekalb White'].includes(formData.breed) ? formData.breed : 'Other'} onChange={e => {
                  if (e.target.value === 'Other') {
                    setFormData({...formData, breed: ''});
                  } else {
                    setFormData({...formData, breed: e.target.value});
                  }
                }}>
                  <option value="Lohmann Brown">Lohmann Brown</option>
                  <option value="ISA Brown">ISA Brown</option>
                  <option value="Hy-Line Brown">Hy-Line Brown</option>
                  <option value="Dekalb White">Dekalb White</option>
                  <option value="Other">Other</option>
                </select>
                {!['Lohmann Brown', 'ISA Brown', 'Hy-Line Brown', 'Dekalb White'].includes(formData.breed) && (
                  <input style={{marginTop: '8px'}} required type="text" value={formData.breed} onChange={e => setFormData({...formData, breed: e.target.value})} placeholder="Enter Breed" />
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Placement / Start Date</label>
                  <input required type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>Number of Hens</label>
                  <input required type="number" min="0" value={formData.hens} onChange={e => setFormData({...formData, hens: parseInt(e.target.value) || 0})} placeholder="e.g. 5000" disabled={isSubmitting} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Mortality</label>
                  <input required type="number" min="0" value={formData.mortality} onChange={e => {
                    const newMortality = parseInt(e.target.value) || 0;
                    const diff = newMortality - formData.mortality;
                    setFormData({
                      ...formData,
                      mortality: newMortality,
                      hens: Math.max(0, formData.hens - diff)
                    });
                  }} placeholder="e.g. 10" disabled={isSubmitting} />
                </div>
                <div className="form-group">
                  <label>Current Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} disabled={isSubmitting}>
                    <option value="Active">Active</option>
                    <option value="Depleted">Depleted / Culled</option>
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary" style={{color: '#1e293b'}} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="spin" size={18} /> : (editingId ? 'Save Changes' : 'Create Flock')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlockManagement;
