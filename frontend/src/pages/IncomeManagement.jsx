import React, { useState, useEffect } from 'react';
import { Wallet, Plus, Download, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [source, setSource] = useState('Manure / Fertilizer Sales');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadIncomes();
  }, []);

  const loadIncomes = async () => {
    try {
      setLoading(true);
      const data = await api.income.getAll();
      setIncomes(data.reverse()); // Latest first
    } catch (err) {
      setErrorMsg("Failed to retrieve income records from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
       await api.income.create({
         date,
         source,
         category: "Miscellaneous Income",
         amount: Number(amount),
         notes
       });
       
       await loadIncomes();
       setIsFormOpen(false);
       
       // Reset form
       setAmount('');
       setNotes('');
    } catch (err) {
       setErrorMsg("Failed to save income record.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>Income Management</h2>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Note: Egg sales are automatically synced here when marked Paid in POS.</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary"><Download size={18} /> Export</button>
          <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'Cancel' : <><Plus size={18} /> Record Extra Income</>}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {isFormOpen && (
        <div className="card" style={{ borderLeft: '4px solid #10b981', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Wallet size={20} color="#10b981" /> Add Manual Income Record</h3>
          <form className="standard-form" style={{ padding: 0 }} onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Date Received</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Income Source / Category</label>
                <select required value={source} onChange={e => setSource(e.target.value)} disabled={isSubmitting}>
                  <option value="Manure / Fertilizer Sales">Manure / Fertilizer Sales</option>
                  <option value="Cull / Depleted Hen Sales">Cull / Depleted Hen Sales</option>
                  <option value="Equipment Sales">Old Equipment Sales</option>
                  <option value="Other">Other / Miscellaneous</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Total Amount (₱)</label>
                <input type="number" step="0.01" min="0.01" placeholder="0.00" required value={amount} onChange={e => setAmount(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Description / Buyer Info</label>
                <input type="text" placeholder="e.g. Sold 100 sacks to Walker Farm" value={notes} onChange={e => setNotes(e.target.value)} disabled={isSubmitting} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSubmitting ? <Loader2 className="spin" size={18} /> : null} Save Income
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
                <th>Date</th>
                <th>Source Category</th>
                <th className="text-right">Amount (₱)</th>
                <th>Description</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : incomes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No income records found.
                  </td>
                </tr>
              ) : incomes.map(inc => (
                <tr key={inc.id}>
                  <td>{inc.date}</td>
                  <td className="font-medium">
                    {inc.source}
                    {inc.referenceType && <span style={{display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)'}}>{inc.referenceType} #{inc.referenceId}</span>}
                  </td>
                  <td className="text-right font-medium" style={{ color: '#16a34a' }}>+₱{inc.amount?.toFixed(2)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{inc.notes || "-"}</td>
                  <td><span className="status-badge active" style={{ backgroundColor: '#dcfce7', color: '#166534' }}>Deposited</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeManagement;
