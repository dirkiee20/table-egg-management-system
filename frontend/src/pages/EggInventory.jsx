import React, { useState, useEffect } from 'react';
import { Package, ArrowDownLeft, ArrowUpRight, AlertTriangle, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';

const EGGS_PER_TRAY = 30;
const SIZE_COLUMNS = [
  { key: 'jumbo', label: 'Jumbo' },
  { key: 'extralarge', label: 'XL' },
  { key: 'large', label: 'Large' },
  { key: 'medium', label: 'Medium' },
  { key: 'small', label: 'Small' },
  { key: 'peewee', label: 'Peewee' }
];

const toTrayCount = (eggs = 0) => Math.floor((Number(eggs) || 0) / EGGS_PER_TRAY);
const getSortTime = (row) => new Date(row.actionAt || row.date || 0).getTime() || 0;

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
          actionAt: p.createdAt,
          sortId: p.id,
          staffIncharge: p.staff_incharge || '-',
          type: 'IN',
          jumbo: toTrayCount(p.jumbo),
          extralarge: toTrayCount(p.extralarge),
          large: toTrayCount(p.large),
          medium: toTrayCount(p.medium),
          small: toTrayCount(p.small),
          peewee: toTrayCount(p.peewee),
          quantity: toTrayCount(p.eggsCollected),
          unit: 'Trays',
          reference: `Daily Prod (Flock ${p.flockId})`
        })),
        ...salesData.map(s => ({
          id: `sale-${s.id}`,
          date: s.date,
          actionAt: s.createdAt,
          sortId: s.id,
          staffIncharge: s.staff_incharge || '-',
          type: 'OUT',
          jumbo: s.jumbo || 0,
          extralarge: s.extralarge || 0,
          large: s.large || 0,
          medium: s.medium || 0,
          small: s.small || 0,
          peewee: s.peewee || 0,
          quantity: s.traysSold,
          unit: 'Trays',
          reference: `Sale (${s.customer_name || s.customer || 'Walk-in Customer'})`
        }))
      ];

      consolidatedLedger.sort((a, b) => {
        const timeDiff = getSortTime(b) - getSortTime(a);
        if (timeDiff !== 0) return timeDiff;
        return (b.sortId || 0) - (a.sortId || 0);
      });
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
              {loading ? <Loader2 className="spin" size={24} /> : Math.floor((inventory.totalSellable || 0) / 30).toLocaleString()}
              <span style={{ fontSize: '1rem', fontWeight: '400', color: 'var(--text-muted)', marginLeft: '6px' }}>Trays</span>
            </div>
            <div className="stat-card__sub" style={{ fontSize: '0.8rem' }}>
              J: {toTrayCount(inventory.jumbo).toLocaleString()}, XL: {toTrayCount(inventory.extralarge).toLocaleString()}, L: {toTrayCount(inventory.large).toLocaleString()}, M: {toTrayCount(inventory.medium).toLocaleString()}, S: {toTrayCount(inventory.small).toLocaleString()}, P: {toTrayCount(inventory.peewee).toLocaleString()} trays
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
                  <th>Staff Incharge</th>
                  <th>Movement</th>
                  {SIZE_COLUMNS.map(size => (
                    <th key={size.key} className="text-right">{size.label}</th>
                  ))}
                  <th className="text-right">Total Quantity</th>
                  <th>Source / Reference</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map(row => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.staffIncharge}</td>
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
                    {SIZE_COLUMNS.map(size => (
                      <td key={size.key} className="text-right font-medium text-muted">
                        {(row[size.key] || 0).toLocaleString()}
                      </td>
                    ))}
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
