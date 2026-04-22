import React, { useState, useEffect } from 'react';
import { Calendar as CalIcon, Download, Loader2, AlertCircle, Printer } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EGGS_PER_TRAY = 30;
const SIZE_FIELDS = ['jumbo', 'extralarge', 'large', 'medium', 'small', 'peewee'];

const getTrayCount = (value) => Math.floor((Number(value) || 0) / EGGS_PER_TRAY);

const getRecordTotalTrays = (record) => (
  SIZE_FIELDS.reduce((sum, field) => sum + getTrayCount(record[field]), 0)
);

const getRecordOddEggs = (record) => (
  (Number(record.bunkig) || 0) +
  SIZE_FIELDS.reduce((sum, field) => sum + ((Number(record[field]) || 0) % EGGS_PER_TRAY), 0)
);

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

  const exportCSV = () => {
    if (!records.length) return;
    
    const headers = ['Date', 'J Trays', 'ExL Trays', 'L Trays', 'M Trays', 'S Trays', 'P Trays', 'Total Trays', 'ODD', 'Cracked', 'Reject', 'Remarks'];
    const rows = records.map(r => {
      const trays = getRecordTotalTrays(r);
      return [
        r.date, 
        getTrayCount(r.jumbo), getTrayCount(r.extralarge), getTrayCount(r.large), getTrayCount(r.medium), getTrayCount(r.small), getTrayCount(r.peewee),
        trays, getRecordOddEggs(r), r.cracked || 0, r.reject || 0, `"${r.notes || ''}"`
      ].join(',');
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `egg_production_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printPDF = () => {
    window.print();
  };

  return (
    <div className="page-container" id="printable-area">
      <div className="page-header">
        <h2>Egg Production Records</h2>
        <div style={{ display: 'flex', gap: '12px' }} className="no-print">
          <button className="btn-secondary" onClick={exportCSV}><Download size={18} /> Export CSV</button>
          <button className="btn-secondary" onClick={printPDF}><Printer size={18} /> Print PDF</button>
        </div>
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
                <th className="text-right">J</th>
                <th className="text-right">ExL</th>
                <th className="text-right">L</th>
                <th className="text-right">M</th>
                <th className="text-right">S</th>
                <th className="text-right">P</th>
                <th className="text-right">Total Trays</th>
                <th className="text-right">ODD</th>
                <th className="text-right">Cracked</th>
                <th className="text-right">Reject</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '32px' }}>
                    <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan="12" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                    No egg production records found.
                  </td>
                </tr>
              ) : records.map(row => (
                <tr key={row.id}>
                  <td><div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalIcon size={14} color="var(--text-muted)"/>{row.date}</div></td>
                  <td className="text-right">{getTrayCount(row.jumbo).toLocaleString()}</td>
                  <td className="text-right">{getTrayCount(row.extralarge).toLocaleString()}</td>
                  <td className="text-right">{getTrayCount(row.large).toLocaleString()}</td>
                  <td className="text-right">{getTrayCount(row.medium).toLocaleString()}</td>
                  <td className="text-right">{getTrayCount(row.small).toLocaleString()}</td>
                  <td className="text-right">{getTrayCount(row.peewee).toLocaleString()}</td>
                  <td className="text-right font-medium" style={{ color: '#16a34a' }}>{getRecordTotalTrays(row).toLocaleString()}</td>
                  <td className="text-right">{getRecordOddEggs(row).toLocaleString()}</td>
                  <td className="text-right">{(row.cracked || 0).toLocaleString()}</td>
                  <td className="text-right">{(row.reject || 0).toLocaleString()}</td>
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
