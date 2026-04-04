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

      {error && <div className="alert alert-error"><AlertCircle size={16} />{error}</div>}

      {/* Summary Cards Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Total Sellable Card */}
        <div className="stat-card" style={{ marginBottom: 0, borderLeft: '3px solid var(--primary)' }}>
          <div>
            <div className="stat-card__label">Total Sellable Stock</div>
            <div className="stat-card__value" style={{ color: 'var(--primary)' }}>
              {loading ? <Loader2 className="spin" size={24} /> : (inventory.totalSellable || 0).toLocaleString()}
              <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '6px' }}>pieces</span>
            </div>
            <div className="stat-card__sub">
              L: {inventory.large?.toLocaleString() || 0} &nbsp;|&nbsp; M: {inventory.medium?.toLocaleString() || 0} &nbsp;|&nbsp; S: {inventory.small?.toLocaleString() || 0}
            </div>
          </div>
          <div className="stat-card__icon" style={{ background: 'var(--primary-light)', color: 'var(--warning)' }}>
            <Package size={22} />
          </div>
        </div>

        {/* Damage Card */}
        <div className="stat-card" style={{ marginBottom: 0, borderLeft: '3px solid var(--danger)' }}>
          <div>
            <div className="stat-card__label">Rejected / Cracked</div>
            <div className="stat-card__value" style={{ color: 'var(--danger)' }}>
              {loading ? <Loader2 className="spin" size={24} /> : (inventory.totalDamaged || 0).toLocaleString()}
              <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '6px' }}>pieces</span>
            </div>
            <div className="stat-card__sub"><AlertTriangle size={12} /> Unsellable stock</div>
          </div>
          <div className="stat-card__icon" style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
            <AlertTriangle size={22} />
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
