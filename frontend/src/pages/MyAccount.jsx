import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Shield, UserRound } from 'lucide-react';
import { useAuth, ROLES } from '../context/AuthContext';
import { api } from '../services/api';
import '../App.css';

const MyAccount = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setErrorMsg('Please complete all password fields.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMsg('New password and confirm password must match.');
      return;
    }

    try {
      setIsSavingPassword(true);
      const response = await api.auth.changePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword
      });
      setSuccessMsg(response.message || 'Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setErrorMsg(error.message || 'Unable to update your password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h2>My Account</h2>
          <p className="page-subtitle">Manage your login details and review your account information.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--warning)' }}>
              <UserRound size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Account Profile</div>
              <div className="text-sm text-muted">Your basic login information</div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '14px' }}>
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-2)' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>Full Name</div>
              <div className="font-semibold">{user?.name || '-'}</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-2)' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>Email Address</div>
              <div className="font-semibold">{user?.email || '-'}</div>
            </div>
            <div style={{ padding: '14px 16px', borderRadius: '12px', backgroundColor: 'var(--bg-surface-2)' }}>
              <div className="text-xs text-muted" style={{ marginBottom: '4px' }}>Role</div>
              <div className="font-semibold">{user?.role || '-'}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--info-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--info)' }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>Change Password</div>
              <div className="text-sm text-muted">Keep your account secure by updating your login password.</div>
            </div>
          </div>

          {errorMsg && (
            <div className="alert alert-error">
              <AlertCircle size={16} /> {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="alert alert-success">
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          <form className="standard-form" style={{ padding: 0 }} onSubmit={handlePasswordSubmit}>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={event => setPasswordForm({ ...passwordForm, currentPassword: event.target.value })}
                disabled={isSavingPassword}
                autoComplete="current-password"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={event => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
                  disabled={isSavingPassword}
                  autoComplete="new-password"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={event => setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })}
                  disabled={isSavingPassword}
                  autoComplete="new-password"
                />
              </div>
            </div>

            {user?.role === ROLES.STAFF && (
              <div className="form-hint" style={{ marginBottom: '20px' }}>
                If you forget your password, an admin can reset it back to your original password.
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-primary" disabled={isSavingPassword}>
                {isSavingPassword ? <Loader2 className="spin" size={18} /> : <Shield size={18} />}
                {isSavingPassword ? 'Saving...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
