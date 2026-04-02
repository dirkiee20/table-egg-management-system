import React, { useState, useEffect } from 'react';
import { 
  Bird, Package, ShoppingCart, TrendingUp, AlertCircle, Wheat, Activity,
  CalendarDays, Syringe, Building2, Wallet, PlusCircle, ClipboardList, Loader2
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useAuth, ROLES } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../App.css';

const AdminDashboard = ({ data }) => {
  const { flocks, inventory, sales, income, expenses, calendar, vaccinations, production } = data;

  const totalSales = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalIncome = income.reduce((sum, inc) => sum + Number(inc.amount), 0);
  const totalExpenses = expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  
  const totalActiveHens = flocks.filter(f => f.status === 'Active').reduce((sum, f) => sum + (Number(f.quantity) || 0), 0);
  
  // Todays eggs
  const today = new Date().toISOString().split('T')[0];
  const todaysProductionList = production.filter(p => p.date === today);
  const todaysEggs = todaysProductionList.reduce((sum, p) => sum + Number(p.eggsCollected), 0);
  const todaysDamaged = todaysProductionList.reduce((sum, p) => sum + Number(p.damagedEggs), 0);
  const rate = totalActiveHens > 0 ? ((todaysEggs / totalActiveHens) * 100).toFixed(1) : 0;

  // Build Weekly Data properly safely
  const buildWeeklyData = () => {
     let chartData = [];
     for(let i=6; i>=0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let dateStr = d.toISOString().split('T')[0];
        let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        let dayProds = production.filter(p => p.date === dateStr);
        let qty = dayProds.reduce((sum, p) => sum + Number(p.eggsCollected), 0);
        let activeForDay = totalActiveHens; // Simple assumption for MVP
        let dayRate = activeForDay > 0 ? ((qty / activeForDay) * 100).toFixed(1) : 0;
        
        chartData.push({
           day: dayName,
           eggs: qty,
           rate: Number(dayRate)
        });
     }
     return chartData;
  };
  
  const WEEKLY_DATA = buildWeeklyData();
  const upcomingVaccine = vaccinations[0];
  const upcomingEvent = calendar[0];

  return (
    <>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h2>Admin Overview</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Full Farm Health</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Active Layers</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalActiveHens.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Across {flocks.filter(f=>f.status==='Active').length} Flocks</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Bird size={22} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Today's Eggs</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{todaysEggs.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', color: todaysEggs > 0 ? '#16a34a' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={12} /> {rate}% Laying Rate
              </div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef9c3', borderRadius: '8px', color: '#ca8a04' }}><Activity size={22} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Warehouse Stock</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{inventory.totalSellable?.toLocaleString() || 0} <span style={{fontSize: '1rem'}}>Pieces</span></div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ready for Dispatch</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#4b5563' }}><Package size={22} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '20px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Recent Sales Volume</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>${totalSales.toFixed(2)}</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Across {sales.length} transactions</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}><ShoppingCart size={22} /></div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div className="card" style={{ marginBottom: 0, padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Wallet size={18} color="#475569" /> <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Aggregated Financials</h3>
          </div>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Gross Income</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#16a34a' }}>${totalIncome.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '4px' }}>Operating Expenses</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#dc2626' }}>${totalExpenses.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0, padding: 0, borderLeft: '4px solid var(--primary)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} color="var(--primary)" /> <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Approaching Events</h3>
          </div>
          <div style={{ padding: '16px 20px' }}>
            {upcomingVaccine ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Syringe size={14} color="#dc2626"/> {upcomingVaccine.vaccineName} ({upcomingVaccine.batchId})</span>
                <span style={{ fontWeight: '600', color: '#dc2626' }}>{upcomingVaccine.nextDueDate || 'Pending'}</span>
              </div>
            ) : (
              <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '12px' }}>No pending vaccinations.</div>
            )}
            
            {upcomingEvent ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CalendarDays size={14} color="var(--primary)"/> {upcomingEvent.title}</span>
                <span style={{ fontWeight: '500' }}>{upcomingEvent.date}</span>
              </div>
            ) : (
             <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No upcoming calendar events.</div> 
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '24px' }}>7-Day Production Trend</h3>
        <div style={{ width: '100%', height: '300px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEKLY_DATA} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={12} fill="#64748b" />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} fontSize={12} fill="#64748b" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} axisLine={false} tickLine={false} fontSize={12} fill="#64748b" />
              <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Line yAxisId="left" type="monotone" dataKey="eggs" name="Eggs Collected" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="rate" name="Laying Rate (%)" stroke="#eab308" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

const StaffDashboard = ({ data }) => {
  const navigate = useNavigate();
  const { vaccinations, hatchery, inventory } = data;
  const upcomingVaccine = vaccinations[0];
  const activeHatch = hatchery.find(h => !h.hatchedCount); // look for incubating

  return (
    <>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h2>Daily Operations</h2>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Good morning, let's check today's tasks.</span>
      </div>

      {/* URGENT TASKS / REMINDERS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {upcomingVaccine ? (
          <div className="card" style={{ marginBottom: 0, padding: 0, borderLeft: '4px solid #dc2626' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Syringe size={18} color="#dc2626" /> <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Vaccination Reminder</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>Flock <strong>{upcomingVaccine.batchId}</strong> requires its {upcomingVaccine.vaccineName} booster. Due: {upcomingVaccine.nextDueDate}</p>
              <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>Acknowledge</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0, padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Syringe size={24} color="#94a3b8" /> <span style={{ color: 'var(--text-muted)' }}>No urgent vaccinations.</span>
          </div>
        )}

        {activeHatch ? (
          <div className="card" style={{ marginBottom: 0, padding: 0, borderLeft: '4px solid #3b82f6' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Building2 size={18} color="#3b82f6" /> <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Hatchery Check</h3>
            </div>
            <div style={{ padding: '20px' }}>
              <p style={{ fontSize: '0.875rem', marginBottom: '12px' }}>Batch <strong>{activeHatch.batchCode}</strong> expected hatch on {activeHatch.hatchDate}.</p>
              <button onClick={() => navigate('/hatchery')} className="btn-secondary" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>View Hatchery</button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ marginBottom: 0, padding: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
             <Building2 size={24} color="#94a3b8" /> <span style={{ color: 'var(--text-muted)' }}>No incubating hatchery records.</span>
          </div>
        )}

        <div className="card" style={{ marginBottom: 0, padding: 0, backgroundColor: 'var(--bg-sidebar)', color: 'white' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="var(--primary)" /> <h3 style={{ fontSize: '0.9rem', fontWeight: '600', color: 'white' }}>Current Egg Stock</h3>
          </div>
          <div style={{ padding: '20px' }}>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginBottom: '4px' }}>{inventory.totalSellable || 0} <span style={{ fontSize: '1rem', color: 'var(--text-sidebar)' }}>Pieces</span></div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-sidebar)' }}>Ready in warehouse for dispatch.</p>
          </div>
        </div>
      </div>

      {/* QUICK ACTIONS FOR MOBILE FARM WORKERS */}
      <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '16px' }}>Quick Farm Actions</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
        
        <button onClick={() => navigate('/production')} className="card" style={{ marginBottom: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', border: '1px solid var(--primary)', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: '#fefce8' }}>
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '50%', color: 'var(--primary)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <PlusCircle size={32} />
          </div>
          <span style={{ fontWeight: '600', color: '#854d0e', textAlign: 'center' }}>Log Today's Eggs</span>
        </button>

        <button onClick={() => navigate('/production-records')} className="card" style={{ marginBottom: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '50%', color: '#475569' }}>
            <ClipboardList size={32} />
          </div>
          <span style={{ fontWeight: '500', color: 'var(--text-main)', textAlign: 'center' }}>House Mortalities</span>
        </button>

        <button onClick={() => navigate('/vaccinations')} className="card" style={{ marginBottom: 0, padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s' }}>
          <div style={{ backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '50%', color: '#475569' }}>
            <Syringe size={32} />
          </div>
          <span style={{ fontWeight: '500', color: 'var(--text-main)', textAlign: 'center' }}>Log Vaccination</span>
        </button>

      </div>
    </>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ flocks: [], inventory: {}, sales: [], income: [], expenses: [], calendar: [], vaccinations: [], hatchery: [], production: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const safeFetch = (promise) => promise.catch(() => []);
      
      const [ flocks, inventory, sales, income, expenses, calendar, vaccinations, hatchery, production ] = await Promise.all([
        safeFetch(api.flocks?.getAll?.() || Promise.resolve([])),
        api.eggInventory.getSummary().catch(() => ({ totalSellable: 0, totalDamaged: 0 })),
        safeFetch(api.sales.getAll()),
        safeFetch(api.income.getAll()),
        safeFetch(api.expenses.getAll()),
        safeFetch(api.calendar.getAll()),
        safeFetch(api.vaccinations.getAll()),
        safeFetch(api.hatchery.getAll()),
        safeFetch(api.production.getAll())
      ]);

      setData({ flocks, inventory, sales, income, expenses, calendar, vaccinations, hatchery, production });
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div style={{ padding: '16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {user?.role === ROLES.ADMIN ? <AdminDashboard data={data} /> : <StaffDashboard data={data} />}
    </div>
  );
};

export default Dashboard;
