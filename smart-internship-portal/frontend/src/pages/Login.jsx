import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, Key, LogIn, Lightbulb } from 'lucide-react';
import axios from 'axios';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', { email, password });
      if (res.data.success) {
        await onLoginSuccess();
        const role = res.data.user.role;
        if (role === 'student') navigate('/student');
        else if (role === 'company') navigate('/company');
        else if (role === 'admin') navigate('/admin');
        else navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ maxWidth: '480px', margin: '3rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Lock size={42} style={{ color: 'var(--primary)', marginBottom: '0.8rem' }} />
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Welcome Back</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Sign in to access your portal & AI match engine</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label><Mail size={16} style={{ display: 'inline', marginRight: '6px' }} /> Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="user@domain.com" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="form-group">
            <label><Key size={16} style={{ display: 'inline', marginRight: '6px' }} /> Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'Authenticating...' : <>Sign In <LogIn size={18} /></>}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.8rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>Register Here</Link>
        </div>

        {/* Demo Credentials Helper */}
        <div style={{ marginTop: '2rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-glass)', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.6rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Lightbulb size={16} style={{ color: 'var(--warning)' }} /> Quick Demo Credentials:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('alex@demo.com', 'student123')}>
              Student Demo
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('techcorp@demo.com', 'company123')}>
              Company Demo
            </button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => fillDemo('admin@portal.com', 'admin123')}>
              Admin Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
