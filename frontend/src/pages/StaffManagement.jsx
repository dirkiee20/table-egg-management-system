import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, Shield, UserMinus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    role: 'Staff',
    email: '',
    contactNumber: ''
  });

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      const data = await api.staff.getAll();
      setStaff(data);
    } catch (err) {
      setErrorMsg("Failed to retrieve staff directory. Ensure you hold Admin privileges.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.staff.create(formData);
      
      await loadStaff();
      setIsFormOpen(false);
      setFormData({ name: '', role: 'Staff', email: '', contactNumber: '' });
    } catch (err) {
      setErrorMsg("Failed to create staff account constraints.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Staff Management</h2>
        <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Close Form' : <><Plus size={18} /> Add Employee</>}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {isFormOpen && (
        <div className="card" style={{ borderLeft: '4px solid #10b981', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Shield size={20} color="#10b981" /> Register New Account</h3>
          <form className="standard-form" style={{ padding: 0 }} onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" placeholder="e.g. Jane Doe" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>System Role Access</label>
                <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} disabled={isSubmitting}>
                  <option value="Staff">Staff (Operations Only)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email Address / Username</label>
                <input type="email" placeholder="jane.doe@farm.local" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" placeholder="+1 555-xxxx" required value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} disabled={isSubmitting} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSubmitting ? <Loader2 className="spin" size={18} /> : null} Create Staff Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee Name</th>
                <th>Role</th>
                <th>Email / Contact</th>
                <th>Phone</th>
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
              ) : staff.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No staff records found via API.
                  </td>
                </tr>
              ) : staff.map(s => (
                <tr key={s.id}>
                  <td className="font-medium">{s.name}</td>
                  <td>
                     <span className="status-badge" style={{ backgroundColor: s.role === 'Admin' ? '#fef3c7' : '#f1f5f9', color: s.role === 'Admin' ? '#d97706' : '#475569' }}>
                       {s.role}
                     </span>
                  </td>
                  <td>{s.email}</td>
                  <td>{s.contactNumber}</td>
                  <td>
                    <span className={`status-badge active`} style={{ backgroundColor: s.status === 'On Leave' ? '#fed7aa' : '', color: s.status === 'On Leave' ? '#c2410c' : ''}}>
                      {s.status}
                    </span>
                  </td>
                  <td className="actions-cell">
                    <button className="action-btn edit" title="Edit Profile Disabled"><Edit2 size={16} /></button>
                    <button className="action-btn delete" title="Deactivate Account Disabled"><UserMinus size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
