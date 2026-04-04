import React, { useState, useEffect } from 'react';
import { 
  Bird, Package, ShoppingCart, TrendingUp, TrendingDown, AlertCircle, 
  CalendarDays, Syringe, Building2, Wallet, PlusCircle, ClipboardList, 
  Loader2, Activity, BarChart3, ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { useAuth, ROLES } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../App.css';

/* ── Custom Recharts Tooltip ── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-surface)', border: '1px solid var(--border-color)',
      borderRadius: '10px', padding: '10px 14px', boxShadow: 'var(--shadow-lg)',
      fontSize: '0.8125rem'
    }}>
      <p style={{ fontWeight: '700', marginBottom: '6px', color: 'var(--text-main)' }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.color, display: 'inline-block' }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}:</span>
          <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{p.value?.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

/* ── Stat Card Component ── */
const StatCard = ({ label, value, sub, subOk, icon: Icon, iconBg, iconColor, trend }) => (
  <div className="stat-card" style={{ marginBottom: 0 }}>
    <div>
      <div className="stat-card__label">{label}</div>
      <div className="stat-card__value">{value}</div>
      {sub && (
        <div className="stat-card__sub" style={{ color: subOk === true ? 'var(--success)' : subOk === false ? 'var(--danger)' : 'var(--text-muted)' }}>
          {subOk === true ? <TrendingUp size={12} /> : subOk === false ? <TrendingDown size={12} /> : null}
          {sub}
        </div>
      )}
    </div>
    <div className="stat-card__icon" style={{ background: iconBg, color: iconColor }}>
      <Icon size={20} />
    </div>
  </div>
);

/* ══════════════════════════════════════════════
   ADMIN DASHBOARD
══════════════════════════════════════════════ */
const AdminDashboard = ({ data }) => {
  const { flocks, inventory, sales, income, expenses, calendar, vaccinations, production } = data;

  const totalSales    = sales.reduce((s, r) => s + Number(r.total), 0);
  const totalIncome   = income.reduce((s, r) => s + Number(r.amount), 0);
  const totalExpenses = expenses.reduce((s, r) => s + Number(r.amount), 0);
  const netProfit     = totalIncome - totalExpenses;

  const activeFlocks  = flocks.filter(f => f.status === 'Active');
  const totalActiveHens = activeFlocks.reduce((s, f) => s + (Number(f.quantity) || 0), 0);

  const today = new Date().toISOString().split('T')[0];
  const todayProd = production.filter(p => p.date === today);
  const todaysEggs = todayProd.reduce((s, p) => s + Number(p.eggsCollected), 0);
  const rate = totalActiveHens > 0 ? ((todaysEggs / totalActiveHens) * 100).toFixed(1) : 0;

  // Build 7-day chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const ds = d.toISOString().split('T')[0];
    const day = d.toLocaleDateString('en-US', { weekday: 'short' });
    const qty = production.filter(p => p.date === ds).reduce((s, p) => s + Number(p.eggsCollected), 0);
    return {
      day,
      eggs: qty,
      rate: totalActiveHens > 0 ? Number(((qty / totalActiveHens) * 100).toFixed(1)) : 0
    };
  });

  const upcomingVaccine = vaccinations[0];
  const upcomingEvent   = calendar[0];

  return (
    <>
      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Active Layers" value={totalActiveHens.toLocaleString()}
          sub={`${activeFlocks.length} active flocks`}
          icon={Bird} iconBg="var(--info-bg)" iconColor="var(--info)" />
        <StatCard label="Today's Eggs" value={todaysEggs.toLocaleString()}
          sub={`${rate}% laying rate`} subOk={todaysEggs > 0}
          icon={Activity} iconBg="var(--primary-light)" iconColor="var(--warning)" />
        <StatCard label="Warehouse Stock" value={(inventory.totalSellable || 0).toLocaleString()}
          sub="pieces ready"
          icon={Package} iconBg="var(--bg-surface-2)" iconColor="var(--text-muted)" />
        <StatCard label="Total Sales" value={`₱${totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`}
          sub={`${sales.length} transactions`} subOk={totalSales > 0}
          icon={ShoppingCart} iconBg="var(--success-bg)" iconColor="var(--success)" />
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {/* Financials */}
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <Wallet size={18} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>Financials</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div style={{ padding: '14px', background: 'var(--success-bg)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--success)', fontWeight: '600', marginBottom: '4px' }}>Gross Income</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--success)' }}>₱{totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
            </div>
            <div style={{ padding: '14px', background: 'var(--danger-bg)', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--danger)', fontWeight: '600', marginBottom: '4px' }}>Expenses</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--danger)' }}>₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div style={{ padding: '14px', background: netProfit >= 0 ? 'var(--success-bg)' : 'var(--danger-bg)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>Net Profit</span>
            <span style={{ fontSize: '1.125rem', fontWeight: '700', color: netProfit >= 0 ? 'var(--success)' : 'var(--danger)' }}>
              {netProfit >= 0 ? '+' : ''}₱{netProfit.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Upcoming events */}
        <div className="card" style={{ marginBottom: 0, borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <CalendarDays size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>Upcoming Events</span>
          </div>

          {upcomingVaccine ? (
            <div style={{ padding: '12px 14px', background: 'var(--danger-bg)', borderRadius: '10px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: 'var(--danger-text)', fontWeight: '500' }}>
                <Syringe size={14} /> {upcomingVaccine.vaccineName}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--danger)' }}>{upcomingVaccine.nextDueDate || 'Due'}</span>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              No pending vaccinations
            </div>
          )}

          {upcomingEvent ? (
            <div style={{ padding: '12px 14px', background: 'var(--primary-light)', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '7px', fontSize: '0.85rem', color: 'var(--warning)', fontWeight: '500' }}>
                <CalendarDays size={14} /> {upcomingEvent.title}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--warning)' }}>{upcomingEvent.date}</span>
            </div>
          ) : (
            <div style={{ padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No upcoming events
            </div>
          )}
        </div>
      </div>

      {/* 7-day chart */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <BarChart3 size={18} />
            </div>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9375rem', color: 'var(--text-main)' }}>7-Day Production Trend</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Eggs collected & laying rate</div>
            </div>
          </div>
        </div>
        <div style={{ height: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--text-muted)' }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} fontSize={12} tick={{ fill: 'var(--text-muted)' }} unit="%" />
              <Tooltip content={<ChartTooltip />} />
              <Legend wrapperStyle={{ fontSize: '0.8125rem', paddingTop: '16px' }} />
              <Line yAxisId="left"  type="monotone" dataKey="eggs" name="Eggs Collected" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="Laying Rate (%)" stroke="#eab308" strokeWidth={2.5} dot={{ r: 4, fill: '#eab308' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════
   STAFF DASHBOARD
══════════════════════════════════════════════ */
const StaffDashboard = ({ data }) => {
  const navigate = useNavigate();
  const { vaccinations, hatchery, inventory } = data;
  const upcomingVaccine = vaccinations[0];
  const activeHatch = hatchery.find(h => !h.hatchedCount);

  const QuickAction = ({ to, icon: Icon, label, accent }) => (
    <button
      onClick={() => navigate(to)}
      style={{
        background: 'var(--bg-surface)',
        border: `1.5px solid ${accent || 'var(--border-color)'}`,
        borderRadius: '14px',
        padding: '20px 16px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
        cursor: 'pointer', transition: 'all 0.2s ease',
        boxShadow: 'var(--shadow-sm)'
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
    >
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        background: accent ? `${accent}20` : 'var(--bg-surface-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent || 'var(--text-muted)'
      }}>
        <Icon size={26} />
      </div>
      <span style={{ fontWeight: '600', fontSize: '0.8375rem', color: 'var(--text-main)', textAlign: 'center' }}>{label}</span>
    </button>
  );

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.375rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px' }}>Daily Operations</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Good morning! Here's your farm status for today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Vaccination reminder */}
        {upcomingVaccine ? (
          <div className="card" style={{ borderLeft: '3px solid var(--danger)', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Syringe size={18} style={{ color: 'var(--danger)' }} />
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>Vaccination Due</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Flock <strong>{upcomingVaccine.batchId}</strong> needs {upcomingVaccine.vaccineName}. Due: <strong style={{ color: 'var(--danger)' }}>{upcomingVaccine.nextDueDate}</strong>
            </p>
            <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Acknowledge</button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <Syringe size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>No Pending Vaccinations</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>All flocks are up to date</div>
            </div>
          </div>
        )}

        {/* Hatchery */}
        {activeHatch ? (
          <div className="card" style={{ borderLeft: '3px solid var(--info)', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Building2 size={18} style={{ color: 'var(--info)' }} />
              <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>Hatchery Active</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              Batch <strong>{activeHatch.batchCode}</strong> expected hatch: <strong style={{ color: 'var(--info)' }}>{activeHatch.hatchDate}</strong>
            </p>
            <button onClick={() => navigate('/hatchery')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>View Hatchery</button>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '600', color: 'var(--text-main)', fontSize: '0.9rem' }}>No Active Hatchery</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No eggs incubating</div>
            </div>
          </div>
        )}

        {/* Egg Stock */}
        <div className="card" style={{ background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: 'none', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Package size={18} style={{ color: 'var(--primary)' }} />
            <span style={{ fontWeight: '700', color: 'rgba(255,255,255,0.8)' }}>Current Stock</span>
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--primary)', lineHeight: 1, marginBottom: '6px' }}>
            {(inventory.totalSellable || 0).toLocaleString()}
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.35)' }}>pieces ready for dispatch</div>
        </div>
      </div>

      <h3 style={{ fontSize: '0.9375rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '16px' }}>Quick Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px' }}>
        <QuickAction to="/production"        icon={PlusCircle}    label="Log Today's Eggs"   accent="#eab308" />
        <QuickAction to="/production-records" icon={ClipboardList} label="View Records"        />
        <QuickAction to="/vaccinations"      icon={Syringe}       label="Log Vaccination"     />
        <QuickAction to="/feed"              icon={Activity}      label="Feed Management"     accent="#3b82f6" />
      </div>
    </>
  );
};

/* ══════════════════════════════════════════════
   MAIN DASHBOARD PAGE
══════════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData]       = useState({ flocks: [], inventory: {}, sales: [], income: [], expenses: [], calendar: [], vaccinations: [], hatchery: [], production: [] });
  const [error, setError]     = useState(null);

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const safe = p => p.catch(() => []);
      const [flocks, inventory, sales, income, expenses, calendar, vaccinations, hatchery, production] = await Promise.all([
        safe(api.flocks?.getAll?.() || Promise.resolve([])),
        api.eggInventory.getSummary().catch(() => ({ totalSellable: 0, totalDamaged: 0 })),
        safe(api.sales.getAll()),
        safe(api.income.getAll()),
        safe(api.expenses.getAll()),
        safe(api.calendar.getAll()),
        safe(api.vaccinations.getAll()),
        safe(api.hatchery.getAll()),
        safe(api.production.getAll())
      ]);
      setData({ flocks, inventory, sales, income, expenses, calendar, vaccinations, hatchery, production });
    } catch (err) {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '50vh', gap: '16px' }}>
      <Loader2 className="spin" size={40} style={{ color: 'var(--primary)' }} />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading dashboard…</span>
    </div>
  );

  if (error) return (
    <div className="page-container">
      <div className="alert alert-error"><AlertCircle size={18} /> {error}</div>
    </div>
  );

  return (
    <div className="page-container">
      {user?.role === ROLES.ADMIN ? <AdminDashboard data={data} /> : <StaffDashboard data={data} />}
    </div>
  );
};

export default Dashboard;
