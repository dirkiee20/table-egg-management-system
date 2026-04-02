import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Egg, Loader2, AlertCircle } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  // If already logged in, redirect immediately to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ backgroundColor: '#eff6ff', display: 'inline-flex', padding: '16px', borderRadius: '50%', color: '#3b82f6', marginBottom: '16px' }}>
             <Egg size={40} />
          </div>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '8px' }}>EggManager Login</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Enter your credentials to access the system.</p>
        </div>

        {error && (
          <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="standard-form" style={{ padding: 0 }}>
          <div className="form-group">
            <label>Email Address / Username</label>
            <input 
              type="text" 
              placeholder="admin@farm.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '8px' }} disabled={loading}>
            {loading ? <Loader2 className="spin" size={20}/> : 'Secure Sign In'}
          </button>
        </form>

        <div style={{ marginTop: '32px', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px', fontSize: '0.75rem', color: '#64748b' }}>
          <p style={{ marginBottom: '8px', fontWeight: 'bold' }}>Demo Accounts:</p>
          <p>Admin: admin@farm.com / admin123</p>
          <p>Staff: staff@farm.com / staff123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
