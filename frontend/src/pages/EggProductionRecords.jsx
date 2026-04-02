import React, { useState, useEffect } from 'react';
import { Filter, Calendar as CalIcon, Download, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EggProductionRecords = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await api.production.getAll();
      setRecords(data.reverse()); // Latest first
    } catch (err) {
      setErrorMsg("Failed to retrieve production history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Egg Production Records</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-secondary"><Filter size={18} /> Filters</button>
          <button className="btn-secondary"><Download size={18} /> Export CSV</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <input type="date" className="card" style={{ marginBottom: 0, padding: '10px 16px', border: '1px solid var(--border-color)', outline: 'none' }} />
        <select className="card" style={{ marginBottom: 0, padding: '10px 16px', border: '1px solid var(--border-color)', outline: 'none', backgroundColor: 'white', minWidth: '200px' }}>
          <option>All Flocks</option>
          <option>House A</option>
          <option>House B</option>
        </select>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div className="card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Flock Reference ID</th>
                <th className="text-right">Total Good Eggs</th>
                <th className="text-right">Damaged/Rejected</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No egg production records found.
                  </td>
                </tr>
              ) : records.map(row => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalIcon size={14} color="var(--text-muted)"/>{row.date}</div></td>
                  <td className="font-medium">Flock #{row.flockId}</td>
                  <td className="text-right font-medium" style={{ color: '#16a34a' }}>{(row.eggsCollected || 0).toLocaleString()}</td>
                  <td className="text-right">{(row.damagedEggs || 0).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{row.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EggProductionRecords;
