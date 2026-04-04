import React, { useState, useEffect } from 'react';
import { Download, TrendingUp, TrendingDown, CircleDollarSign, Users, Package, Loader2, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { api } from '../services/api';
import '../App.css';

const SalesMonitoring = () => {
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [filter, setFilter] = useState('Last 7 Days');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, expensesData] = await Promise.all([
        api.sales.getAll(),
        api.expenses.getAll()
      ]);
      setSales(salesData);
      setExpenses(expensesData);
    } catch (err) {
      setErrorMsg("Failed to retrieve monitoring data.");
    } finally {
      setLoading(false);
    }
  };

  const padZero = (n) => n < 10 ? '0' + n : n;
  
  const getFilteredDates = () => {
    const now = new Date();
    if (filter === 'Last 7 Days') {
      const dates = [];
      for(let i=6; i>=0; i--) {
        let d = new Date();
        d.setDate(now.getDate() - i);
        dates.push(d);
      }
      return dates;
    } else if (filter === 'This Month') {
      const dates = [];
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      for(let i=1; i<=daysInMonth; i++) {
        dates.push(new Date(now.getFullYear(), now.getMonth(), i));
      }
      return dates;
    } else if (filter === 'Last Month') {
      const dates = [];
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const daysInMonth = new Date(lastMonth.getFullYear(), lastMonth.getMonth() + 1, 0).getDate();
      for(let i=1; i<=daysInMonth; i++) {
        dates.push(new Date(lastMonth.getFullYear(), lastMonth.getMonth(), i));
      }
      return dates;
    }
    return [];
  };

  const buildChartData = () => {
     let chartMap = {};
     const dates = getFilteredDates();
     dates.forEach(d => {
       const dateStr = `${d.getFullYear()}-${padZero(d.getMonth()+1)}-${padZero(d.getDate())}`;
       let formatName = d.toLocaleDateString('en-US', { weekday: 'short' });
       if (filter !== 'Last 7 Days') {
         formatName = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
       }
       chartMap[dateStr] = { name: formatName, dateStr: dateStr, sales: 0, expenses: 0 };
     });
     
     sales.forEach(s => {
       if (chartMap[s.date]) {
         chartMap[s.date].sales += Number(s.total) || 0;
       }
     });

     expenses.forEach(e => {
       if (chartMap[e.date]) {
         chartMap[e.date].expenses += Number(e.amount) || 0;
       }
     });
     
     return Object.values(chartMap);
  };

  const CHART_DATA = buildChartData();

  // Filter raw data for summary cards based on selected filter
  const getFilteredSales = () => {
     const chartMap = {};
     getFilteredDates().forEach(d => {
        const dateStr = `${d.getFullYear()}-${padZero(d.getMonth()+1)}-${padZero(d.getDate())}`;
        chartMap[dateStr] = true;
     });
     return sales.filter(s => chartMap[s.date]);
  };
  const getFilteredExpenses = () => {
     const chartMap = {};
     getFilteredDates().forEach(d => {
        const dateStr = `${d.getFullYear()}-${padZero(d.getMonth()+1)}-${padZero(d.getDate())}`;
        chartMap[dateStr] = true;
     });
     return expenses.filter(e => chartMap[e.date]);
  };

  const activeSales = getFilteredSales();
  const activeExpenses = getFilteredExpenses();

  const totalRevenue = activeSales.reduce((sum, s) => sum + Number(s.total), 0);
  const totalExpenseNum = activeExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalTrays = activeSales.reduce((sum, s) => sum + Number(s.traysSold), 0);
  const totalOrders = activeSales.length;
  const uniqueCustomers = new Set(activeSales.map(s => s.customer?.toLowerCase().trim())).size;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

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
        <h2>Sales and Expense Monitoring</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <select 
            className="btn-secondary" 
            style={{ backgroundColor: 'white' }}
            value={filter}
            onChange={e => setFilter(e.target.value)}
          >
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
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>₱{totalRevenue.toFixed(2)}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#16a34a' }}><TrendingUp size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Total Expenses</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626' }}>₱{totalExpenseNum.toFixed(2)}</div>
            </div>
            <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}><TrendingDown size={24} /></div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', marginBottom: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', marginBottom: '4px' }}>Avg. Order Value</h4>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)' }}>₱{avgOrderValue.toFixed(2)}</div>
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
        <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)', marginBottom: '24px' }}>Sales vs Expenses Trend ({filter})</h3>
        <div style={{ width: '100%', height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={CHART_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis orientation="left" stroke="#3b82f6" axisLine={false} tickLine={false} tickFormatter={(value) => `₱${value}`} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="sales" name="Sales (₱)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="expenses" name="Expenses (₱)" stroke="#dc2626" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default SalesMonitoring;
