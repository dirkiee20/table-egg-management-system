import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle2, Filter, Loader2, LineChart } from 'lucide-react';
import { api } from '../services/api';
import '../App.css';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const FeedManagement = () => {
  const [formData, setFormData] = useState({
    flockId: '',
    date: new Date().toISOString().split('T')[0],
    feedConsumedKgs: ''
  });

  const [flocks, setFlocks] = useState([]);
  const [feedRecords, setFeedRecords] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.flockId) {
       loadForecast(formData.flockId);
    }
  }, [formData.flockId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [flocksRes, feedRes] = await Promise.all([
        api.flocks.getAll(),
        api.feed.getAll()
      ]);
      setFlocks(flocksRes.filter(f => f.status === 'Active'));
      setFeedRecords(feedRes.reverse());
    } catch (err) {
      console.error(err);
      setErrorMsg("Failed to load feed management data.");
    } finally {
      setLoading(false);
    }
  };

  const loadForecast = async (flockId) => {
    try {
       setLoadingForecast(true);
       setForecastData(null);
       const fData = await api.feed.getForecast(flockId);
       setForecastData(fData);
    } catch (err) {
       console.error("Forecast failed:", err);
    } finally {
       setLoadingForecast(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus('loading');
    setErrorMsg(null);
    try {
      await api.feed.create({
        flockId: formData.flockId,
        date: formData.date,
        feedConsumedKgs: Number(formData.feedConsumedKgs)
      });
      setSubmitStatus('success');
      setFormData(prev => ({ ...prev, feedConsumedKgs: '' }));
      await fetchData();
      if (formData.flockId) {
        await loadForecast(formData.flockId);
      }
      setTimeout(() => setSubmitStatus(null), 3000);
    } catch (err) {
      setSubmitStatus('error');
      setErrorMsg("Failed to save feed consumption record.");
    }
  };

  const getChartData = () => {
     if (!forecastData || !forecastData.forecasts) return [];
     
     return forecastData.forecasts.map((val, idx) => ({
         name: `Day ${idx + 1}`,
         feed: val
     }));
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ marginBottom: '24px' }}>
        <h2>Feed Management & Forecasting</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Log daily feed intake per flock and view AI forecasts.</p>
      </div>

      {errorMsg && <div className="alert alert-error"><AlertCircle size={16} />{errorMsg}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        
        {/* left column: form */}
        <div className="card" style={{ alignSelf: 'start', marginBottom: 0 }}>
          <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} /> Record Feed Consumption
          </h3>

          {submitStatus === 'success' && (
            <div className="alert alert-success"><CheckCircle2 size={16} /> Record saved successfully!</div>
          )}

          <form onSubmit={handleSubmit} className="standard-form" style={{ padding: 0 }}>
            <div className="form-group">
              <label>Target Flock</label>
              <select required value={formData.flockId} onChange={e => setFormData({...formData, flockId: e.target.value})}>
                <option value="" disabled>Select a flock...</option>
                {flocks.map(f => (
                  <option key={f.id} value={f.id}>Flock {f.batchId} / {f.house}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label>Date</label>
              <input type="date" required value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} disabled={submitStatus === 'loading'} />
            </div>

            <div className="form-group">
              <label>Total Feed Consumed (kg)</label>
              <input type="number" step="0.1" min="0" required placeholder="e.g. 150.5" value={formData.feedConsumedKgs} onChange={e => setFormData({...formData, feedConsumedKgs: e.target.value})} disabled={submitStatus === 'loading'} />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px' }} disabled={submitStatus === 'loading'}>
              {submitStatus === 'loading' ? <Loader2 className="spin" size={20} /> : 'Save Feed Record'}
            </button>
          </form>
        </div>

        {/* right column: AI forecast */}
        <div className="card" style={{ marginBottom: 0 }}>
           <h3 style={{ fontSize: '1.125rem', marginBottom: '16px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LineChart size={18} color="var(--primary)" /> Machine Learning Forecast
           </h3>
           <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Select a flock to view predictive 7-day feed consumption.</p>

           {!formData.flockId ? (
               <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '10px', border: '1.5px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize:'0.875rem' }}>Select a flock above to load the AI forecast</p>
               </div>
           ) : loadingForecast ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                 <Loader2 className="spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
                 <p style={{ marginTop: '16px', color: 'var(--text-muted)' }}>Generating precision forecast...</p>
              </div>
           ) : forecastData ? (
              <div>
                 {forecastData.method === 'historical_average' && (
                     <div className="alert alert-warning" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>{forecastData.message}</div>
                  )}
                 <div style={{ height: '240px', width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLine data={getChartData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis label={{ value: 'Kg', angle: -90, position: 'insideLeft' }} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="feed" name="Forecasted Feed Consumption (kg)" stroke="#3b82f6" activeDot={{ r: 8 }} />
                      </RechartsLine>
                    </ResponsiveContainer>
                 </div>
              </div>
            ) : (
               <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '10px', border: '1.5px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--danger)', fontSize: '0.875rem' }}>Unable to load forecast. Add more feed records to enable predictions.</p>
               </div>
            )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-main)' }}>Historical Records</h3>
            <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.875rem' }}><Filter size={16}/> Filter</button>
         </div>

         <div className="table-responsive">
           <table className="data-table">
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Flock ID</th>
                 <th className="text-right">Consumed (kg)</th>
               </tr>
             </thead>
             <tbody>
               {loading ? (
                 <tr>
                   <td colSpan="3" style={{ textAlign: 'center', padding: '32px' }}>
                     <Loader2 className="spin" size={24} style={{ margin: '0 auto', color: 'var(--primary)' }} />
                   </td>
                 </tr>
               ) : feedRecords.length === 0 ? (
                 <tr>
                   <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                     No feed consumption records found.
                   </td>
                 </tr>
               ) : feedRecords.map(row => (
                 <tr key={row.id}>
                   <td>{row.date}</td>
                   <td className="font-medium">Flock #{row.flockId}</td>
                   <td className="text-right font-medium">{row.feedConsumedKgs?.toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
};

export default FeedManagement;
