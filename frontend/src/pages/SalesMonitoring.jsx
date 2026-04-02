import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, CircleDollarSign, Users, Package, Loader2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import '../App.css';

const SalesMonitoring = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    loadSales();
  }, []);

  const loadSales = async () => {
    try {
      setLoading(true);
      const data = await api.sales.getAll();
      setSales(data);
    } catch (err) {
      setErrorMsg("Failed to retrieve sales monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalTrays = sales.reduce((sum, s) => sum + Number(s.traysSold), 0);
  const totalOrders = sales.length;
  // Deduplicate customer names roughly
  const uniqueCustomers = new Set(sales.map(s => s.customer?.toLowerCase().trim())).size;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  const buildChartData = () => {
     let chartMap = {};
     for(let i=6; i>=0; i--) {
        let d = new Date();
        d.setDate(d.getDate() - i);
        let dateStr = d.toISOString().split('T')[0];
        let dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        chartMap[dateStr] = { name: dayName, revenue: 0, trays: 0 };
     }
     
     sales.forEach(s => {
       if (chartMap[s.date]) {
         chartMap[s.date].revenue += Number(s.total) || 0;
         chartMap[s.date].trays += Number(s.traysSold) || 0;
       }
     });
     
     // Only format revenue for chart display specifically if needed, but recharts is fine
     return Object.values(chartMap);
  };

  const CHART_DATA = buildChartData();

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>Sales Analytics Dashboard</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select className="btn-secondary" style={{ backgroundColor: 'white' }}>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>Last Month</option>
          </select>
          <button className="btn-secondary"><Download size={18} /> Export</button>
        </div>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '500' }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Total Revenue</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>${totalRevenue.toFixed(2)}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}><CircleDollarSign size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Trays Sold</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{totalTrays}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#eff6ff', borderRadius: '8px', color: '#3b82f6' }}><Package size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Avg. Order Value</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>${avgOrderValue.toFixed(2)}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}><CircleDollarSign size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Active Customers</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>{uniqueCustomers}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique Logged</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#f3f4f6', borderRadius: '8px', color: '#4b5563' }}><Users size={24} /></div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '24px' }}>7-Day Revenue & Volume Trends</h3>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#eab308" axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" name="Revenue ($)" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar yAxisId="right" dataKey="trays" fill="#fef08a" name="Trays Sold" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesMonitoring;
