import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Egg, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import '../App.css';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, user }         = useAuth();
  const navigate                = useNavigate();

  if (user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
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
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      background: 'linear-gradient(135deg, #0a0f1e 0%, #0f172a 50%, #1a2234 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.05,
        backgroundImage: 'radial-gradient(circle at 25% 25%, #eab308 0%, transparent 50%), radial-gradient(circle at 75% 75%, #3b82f6 0%, transparent 50%)',
        pointerEvents: 'none'
      }} />

      {/* Left panel – branding */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '48px',
        display: 'none'
      }} className="login-brand-panel">
        <div style={{ fontSize: '3rem', marginBottom: '24px' }}>🐣</div>
        <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '12px' }}>
          EggManager
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1.7, maxWidth: '340px' }}>
          A professional farm operations platform built to help you track flocks, production, inventory, and financials—all in one place.
        </p>
      </div>

      {/* Right panel – form */}
      <div style={{
        flex: '0 0 auto', width: '100%', maxWidth: '440px',
        margin: 'auto',
        padding: '20px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '40px 36px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          animation: 'scaleIn 0.3s ease'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <div style={{
              width: '60px', height: '60px',
              background: 'linear-gradient(135deg, #eab308, #ca8a04)',
              borderRadius: '18px',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.75rem', marginBottom: '16px',
              boxShadow: '0 4px 20px rgba(234,179,8,0.3)'
            }}>
              🐣
            </div>
            <h2 style={{ color: '#ffffff', fontSize: '1.5rem', fontWeight: '700', marginBottom: '6px', letterSpacing: '-0.01em' }}>
              Welcome back
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.875rem' }}>
              Sign in to your EggManager account
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 14px',
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.3)',
              color: '#f87171',
              borderRadius: '10px',
              fontSize: '0.85rem',
              display: 'flex', alignItems: 'center', gap: '8px',
              marginBottom: '20px',
              animation: 'slideDown 0.2s ease'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '7px', letterSpacing: '0.01em' }}>
                Email Address
              </label>
              <input
                type="text"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                style={{
                  width: '100%', padding: '11px 14px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1.5px solid rgba(255,255,255,0.1)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none',
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                }}
                onFocus={e => { e.target.style.borderColor = '#eab308'; e.target.style.boxShadow = '0 0 0 3px rgba(234,179,8,0.15)'; }}
                onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '7px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.1)',
                    borderRadius: '10px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
                  }}
                  onFocus={e => { e.target.style.borderColor = '#eab308'; e.target.style.boxShadow = '0 0 0 3px rgba(234,179,8,0.15)'; }}
                  onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    color: 'rgba(255,255,255,0.3)', padding: '4px', borderRadius: '4px'
                  }}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                background: loading ? 'rgba(234,179,8,0.5)' : 'linear-gradient(135deg, #eab308, #ca8a04)',
                color: '#1a1000',
                fontWeight: '700', fontSize: '0.9375rem',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(234,179,8,0.3)'
              }}
              onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(234,179,8,0.4)'; } }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = loading ? 'none' : '0 4px 14px rgba(234,179,8,0.3)'; }}
            >
              {loading ? <Loader2 className="spin" size={18} /> : <Egg size={18} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          {/* credentials block removed */}
        </div>
      </div>
    </div>
  );
};

export default Login;
