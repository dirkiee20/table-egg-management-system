import React, { useState, useEffect } from 'react';
import { Receipt, Plus, Download, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('Feed Purchases');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await api.expenses.getAll();
      setExpenses(data.reverse()); // Latest first
    } catch (err) {
      setErrorMsg("Failed to retrieve expenses from backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await api.expenses.create({
        title: category, // Using category as title proxy
        category,
        amount: Number(amount),
        date,
        notes
      });
      
      await loadExpenses();
      setIsFormOpen(false);
      
      // Reset form
      setAmount('');
      setNotes('');
    } catch (err) {
       setErrorMsg("Failed to save expense record.");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Expense Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary"><Download size={18} /> Export</button>
          <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'Close Form' : <><Plus size={18} /> Record Expense</>}
          </button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {isFormOpen && (
        <div className="card" style={{ borderLeft: '4px solid #ef4444', marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Receipt size={20} color="#ef4444" /> New Operational Expense</h3>
          <form className="standard-form" style={{ padding: 0 }} onSubmit={handleSave}>
            <div className="form-row">
              <div className="form-group">
                <label>Date Incurred</label>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Expense Category</label>
                <select required value={category} onChange={e => setCategory(e.target.value)} disabled={isSubmitting}>
                  <option value="Feed Purchases">Feed Purchases</option>
                  <option value="Pullets / Chicks">Day-old Chicks / Pullets</option>
                  <option value="Medical/Vaccines">Medicines & Vaccines</option>
                  <option value="Farm Supplies">Farm Supplies (Trays, Cartons)</option>
                  <option value="Labor/Wages">Labor / Wages</option>
                  <option value="Utilities">Utilities (Electricity, Water)</option>
                  <option value="Maintenance">Repairs & Maintenance</option>
                </select>
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Total Amount (₱)</label>
                <input type="number" step="0.01" min="0.01" placeholder="0.00" required value={amount} onChange={e => setAmount(e.target.value)} disabled={isSubmitting} />
              </div>
              <div className="form-group">
                <label>Description / Invoice Reference</label>
                <input type="text" placeholder="e.g. Supplier XYZ Invoice #8801" value={notes} onChange={e => setNotes(e.target.value)} disabled={isSubmitting} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ backgroundColor: '#dc2626', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSubmitting ? <Loader2 className="spin" size={18} /> : null} Save Expense
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
                <th>Category</th>
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
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No expenses recorded yet.
                  </td>
                </tr>
              ) : expenses.map(ex => (
                <tr key={ex.id}>
                  <td>{ex.date}</td>
                  <td className="font-medium">{ex.category}</td>
                  <td className="text-right font-medium" style={{ color: '#dc2626' }}>₱{ex.amount?.toFixed(2)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{ex.notes || "-"}</td>
                  <td><span className="status-badge active">Recorded</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseManagement;
