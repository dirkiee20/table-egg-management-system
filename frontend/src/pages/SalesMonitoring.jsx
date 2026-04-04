import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, CircleDollarSign, Users, Package, Loader2, AlertCircle, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart } from 'recharts';
import { api } from '../services/api';
import '../App.css';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', boxShadow: 'var(--shadow-lg)', fontSize: '0.8125rem' }}>
      <p style={{ fontWeight: '700', marginBottom: '8px', color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>₱{Number(p.value).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
      ))}
    </div>
  );
};

const SalesMonitoring = () => {
  const [sales, setSales]       = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter]     = useState('Last 7 Days');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [sd, ed] = await Promise.all([api.sales.getAll(), api.expenses.getAll()]);
      setSales(sd);
      setExpenses(ed);
    } catch (err) {
      setErrorMsg('Failed to retrieve monitoring data.');
    } finally {
      setLoading(false);
    }
  };

  const pad = n => n < 10 ? '0' + n : n;

  const getFilteredDates = () => {
    const now = new Date();
    if (filter === 'Last 7 Days') {
      return Array.from({ length: 7 }, (_, i) => { const d = new Date(); d.setDate(now.getDate() - (6 - i)); return d; });
    }
    if (filter === 'This Month') {
      const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      return Array.from({ length: days }, (_, i) => new Date(now.getFullYear(), now.getMonth(), i + 1));
    }
    if (filter === 'Last Month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const days = new Date(lm.getFullYear(), lm.getMonth() + 1, 0).getDate();
      return Array.from({ length: days }, (_, i) => new Date(lm.getFullYear(), lm.getMonth(), i + 1));
    }
    return [];
  };

  const buildChartData = () => {
    const dates = getFilteredDates();
    const map = {};
    dates.forEach(d => {
      const ds = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      const label = filter === 'Last 7 Days'
        ? d.toLocaleDateString('en-US', { weekday: 'short' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      map[ds] = { name: label, dateStr: ds, sales: 0, expenses: 0 };
    });
    sales.forEach(s    => { if (map[s.date]) map[s.date].sales    += Number(s.total)  || 0; });
    expenses.forEach(e => { if (map[e.date]) map[e.date].expenses += Number(e.amount) || 0; });
    return Object.values(map);
  };

  const CHART_DATA = buildChartData();

  const dateSet = () => {
    const m = {};
    getFilteredDates().forEach(d => { m[`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`] = true; });
    return m;
  };

  const ds = dateSet();
  const activeSales    = sales.filter(s => ds[s.date]);
  const activeExpenses = expenses.filter(e => ds[e.date]);

  const totalRevenue     = activeSales.reduce((s, r) => s + Number(r.total), 0);
  const totalExpenseNum  = activeExpenses.reduce((s, r) => s + Number(r.amount), 0);
  const netProfit        = totalRevenue - totalExpenseNum;
  const totalOrders      = activeSales.length;
  const uniqueCustomers  = new Set(activeSales.map(s => (s.customer_name || s.customer)?.toLowerCase().trim())).size;
  const avgOrderValue    = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <Loader2 className="spin" size={40} style={{ color: 'var(--primary)' }} />
    </div>
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Sales &amp; Expense Monitoring</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{
              padding: '8px 32px 8px 12px',
              border: '1.5px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-main)',
              background: 'var(--bg-surface)',
              cursor: 'pointer',
              outline: 'none',
              appearance: 'none',
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' fill='%2364748b' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 10px center'
            }}
          >
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="btn-secondary"><Download size={16} /> Export</button>
        </div>
      </div>

      {errorMsg && <div className="alert alert-error"><AlertCircle size={16} />{errorMsg}</div>}

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Total Revenue',   value: `₱${totalRevenue.toLocaleString('en-PH', {minimumFractionDigits:2})}`, icon: TrendingUp,        bg: 'var(--success-bg)',  color: 'var(--success)' },
          { label: 'Total Expenses',  value: `₱${totalExpenseNum.toLocaleString('en-PH', {minimumFractionDigits:2})}`, icon: TrendingDown, bg: 'var(--danger-bg)',   color: 'var(--danger)' },
          { label: 'Net Profit',      value: `₱${netProfit.toLocaleString('en-PH', {minimumFractionDigits:2})}`,      icon: CircleDollarSign, bg: netProfit >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Avg. Order',      value: `₱${avgOrderValue.toLocaleString('en-PH', {minimumFractionDigits:2})}`,  icon: Package,          bg: 'var(--warning-bg)', color: 'var(--warning)' },
          { label: 'Unique Customers',value: uniqueCustomers, icon: Users, bg: 'var(--info-bg)', color: 'var(--info)' },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="stat-card" style={{ marginBottom: 0 }}>
            <div>
              <div className="stat-card__label">{label}</div>
              <div className="stat-card__value" style={{ fontSize: '1.375rem', color }}>{value}</div>
            </div>
            <div className="stat-card__icon" style={{ background: bg, color }}><Icon size={20} /></div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
            <BarChart3 size={18} />
          </div>
          <div>
            <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>Sales vs Expenses Trend</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{filter}</div>
          </div>
        </div>
        <div style={{ height: '340px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `₱${v}`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '16px' }} />
              <Line type="monotone" dataKey="sales"    name="Sales (₱)"    stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses (₱)" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4, fill: '#ef4444' }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesMonitoring;
