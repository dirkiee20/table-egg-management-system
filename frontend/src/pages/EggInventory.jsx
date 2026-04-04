import React, { useState, useEffect } from 'react';
import { Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EggInventory = () => {
  const [inventory, setInventory] = useState({ totalSellable: 0, totalDamaged: 0 });
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch absolute stock + all production runs (IN) and sales runs (OUT)
      const [invData, prodData, salesData] = await Promise.all([
        api.eggInventory.getSummary(),
        api.production.getAll(),
        api.sales.getAll()
      ]);

      setInventory(invData);

      // Synthesize a rough ledger based on actual database production/sales
      const consolidatedLedger = [
        ...prodData.map(p => ({
          id: `prod-${p.id}`,
          date: p.date,
          type: 'IN',
          large: p.large || 0,
          medium: p.medium || 0,
          small: p.small || 0,
          quantity: p.eggsCollected,
          unit: 'Eggs',
          reference: `Daily Prod (Flock ${p.flockId})`
        })),
        ...salesData.map(s => ({
          id: `sale-${s.id}`,
          date: s.date,
          type: 'OUT',
          large: '-',
          medium: '-',
          small: '-',
          quantity: s.traysSold,
          unit: 'Trays',
          reference: `Sale (${s.customer})`
        }))
      ];

      // Sort chronological descending
      consolidatedLedger.sort((a, b) => new Date(b.date) - new Date(a.date));
      setLedger(consolidatedLedger);

    } catch (err) {
      console.error(err);
      setError('Failed to fetch real inventory data from server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Egg Inventory</h2>
        <button className="btn-secondary" onClick={loadInventoryData}>
          <Package size={18} /> Refresh Stock
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Summary Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Total Sellable Card */}
        <div className="card" style={{ backgroundColor: 'var(--bg-sidebar)', color: 'white', marginBottom: 0 }}>
          <h4 style={{ color: 'var(--text-sidebar)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px' }}>Total Sellable Stock</h4>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)' }}>
            {loading ? <Loader2 className="spin" size={28} /> : inventory.totalSellable.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-sidebar)' }}>Pieces</span>
          </div>
          <div style={{ color: 'var(--text-sidebar)', fontSize: '1rem', marginTop: '8px' }}>
            L: {inventory.large?.toLocaleString() || 0}, M: {inventory.medium?.toLocaleString() || 0}, S: {inventory.small?.toLocaleString() || 0}
          </div>
        </div>

        {/* Damage Card */}
        <div className="card" style={{ marginBottom: 0, padding: '20px', borderLeft: '4px solid #ef4444' }}>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={14} color="#ef4444" /> Target Rejects / Cracked
          </h4>
          <div style={{ fontSize: '1.75rem', fontWeight: '600', color: 'var(--text-main)' }}>
            {loading ? <Loader2 className="spin" size={24} /> : inventory.totalDamaged.toLocaleString()} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Pieces</span>
          </div>
        </div>
      </div>

      {/* Inventory Movement Ledger */}
      <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '16px' }}>Database Stock Movements</h3>
      <div className="card">
        {loading ? (
             <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spin" size={32} color="var(--primary)" /></div>
        ) : ledger.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <p>No inventory movements tracked in database yet.</p>
            </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Movement</th>
                  <th className="text-right">Large</th>
                  <th className="text-right">Medium</th>
                  <th className="text-right">Small</th>
                  <th className="text-right">Total Quantity</th>
                  <th>Source / Reference</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(row => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>
                      {row.type === 'IN' ? (
                        <span className="status-badge active" style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <ArrowDownLeft size={14} /> IN
                        </span>
                      ) : (
                        <span className="status-badge" style={{ backgroundColor: '#f3f4f6', color: '#4b5563', display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
                          <ArrowUpRight size={14} /> OUT
                        </span>
                      )}
                    </td>
                    <td className="text-right font-medium text-muted">{row.large}</td>
                    <td className="text-right font-medium text-muted">{row.medium}</td>
                    <td className="text-right font-medium text-muted">{row.small}</td>
                    <td className="text-right font-medium">
                      {row.type === 'IN' ? '+' : '-'}{row.quantity} {row.unit}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{row.reference}</td>
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

export default EggInventory;
