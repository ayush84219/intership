import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Mail, Key, User, GraduationCap, Building, Code, MapPin, Globe, Factory } from 'lucide-react';
import axios from 'axios';

export default function Register({ onLoginSuccess }) {
  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Student specific state
  const [fullName, setFullName] = useState('');
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  const [skills, setSkills] = useState('');

  // Company specific state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      email,
      password,
      role,
      full_name: fullName,
      university,
      major,
      skills,
      company_name: companyName,
      industry,
      location,
      website
    };

    try {
      const res = await axios.post('/api/auth/register', payload);
      if (res.data.success) {
        await onLoginSuccess();
        if (role === 'student') navigate('/student');
        else navigate('/company');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Select your role and start matching with internships</p>
        </div>

        {error && (
          <div style={{ padding: '0.8rem 1rem', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', borderRadius: '8px', marginBottom: '1.2rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Toggle Buttons */}
          <div className="form-group" style={{ marginBottom: '1.8rem' }}>
            <label>Select Role</label>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.4rem' }}>
              <button
                type="button"
                className="btn"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  border: '1px solid var(--border-glass)',
                  background: role === 'student' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.03)',
                  borderColor: role === 'student' ? 'var(--primary)' : 'var(--border-glass)',
                  color: '#fff'
                }}
                onClick={() => setRole('student')}
              >
                <GraduationCap size={18} /> Student
              </button>
              <button
                type="button"
                className="btn"
                style={{
                  flex: 1,
                  padding: '0.8rem',
                  border: '1px solid var(--border-glass)',
                  background: role === 'company' ? 'rgba(6,182,212,0.25)' : 'rgba(255,255,255,0.03)',
                  borderColor: role === 'company' ? 'var(--secondary)' : 'var(--border-glass)',
                  color: '#fff'
                }}
                onClick={() => setRole('company')}
              >
                <Building size={18} /> Company
              </button>
            </div>
          </div>

          <div className="form-group">
            <label><Mail size={16} style={{ display: 'inline', marginRight: '6px' }} /> Email Address</label>
            <input type="email" className="form-control" placeholder="user@domain.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="form-group">
            <label><Key size={16} style={{ display: 'inline', marginRight: '6px' }} /> Password</label>
            <input type="password" className="form-control" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          {role === 'student' ? (
            <>
              <div className="form-group">
                <label><User size={16} style={{ display: 'inline', marginRight: '6px' }} /> Full Name</label>
                <input type="text" className="form-control" placeholder="Alex Johnson" value={fullName} onChange={e => setFullName(e.target.value)} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>University</label>
                  <input type="text" className="form-control" placeholder="Stanford University" value={university} onChange={e => setUniversity(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Major</label>
                  <input type="text" className="form-control" placeholder="Computer Science" value={major} onChange={e => setMajor(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label><Code size={16} style={{ display: 'inline', marginRight: '6px' }} /> Technical Skills (Comma separated)</label>
                <input type="text" className="form-control" placeholder="Python, Machine Learning, React, SQL" value={skills} onChange={e => setSkills(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div className="form-group">
                <label><Building size={16} style={{ display: 'inline', marginRight: '6px' }} /> Company Name</label>
                <input type="text" className="form-control" placeholder="TechCorp Solutions" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Industry</label>
                  <input type="text" className="form-control" placeholder="Software & AI" value={industry} onChange={e => setIndustry(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-control" placeholder="San Francisco, CA / Remote" value={location} onChange={e => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label><Globe size={16} style={{ display: 'inline', marginRight: '6px' }} /> Company Website</label>
                <input type="url" className="form-control" placeholder="https://company.com" value={website} onChange={e => setWebsite(e.target.value)} />
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem', padding: '0.85rem' }} disabled={loading}>
            {loading ? 'Creating Account...' : <>Create Account <UserPlus size={18} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
