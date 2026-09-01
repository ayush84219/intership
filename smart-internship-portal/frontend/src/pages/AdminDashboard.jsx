import React, { useEffect, useState } from 'react';
import { ShieldCheck, GraduationCap, Building, Briefcase, FileCheck, Trash2 } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);

  const loadData = () => {
    axios.get('/api/admin/dashboard')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteUser = async (userId, email) => {
    if (!window.confirm(`Are you sure you want to remove user ${email}?`)) return;

    try {
      const res = await axios.delete(`/api/admin/user/${userId}/delete`);
      setMsg({ type: 'success', text: res.data.message });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Delete failed' });
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading admin console...</div>;
  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>Admin access restricted</div>;

  const { total_students, total_companies, total_internships, total_applications, users, internships } = data;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          System Administration Console <ShieldCheck size={28} style={{ color: 'var(--primary)' }} />
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time portal analytics, user management, and internship oversight.</p>
      </div>

      {msg && (
        <div style={{ 
          padding: '1rem 1.2rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem', 
          background: msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: msg.type === 'success' ? '#34d399' : '#f87171'
        }}>
          {msg.text}
        </div>
      )}

      {/* Analytics Cards Grid */}
      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <GraduationCap size={40} style={{ color: 'var(--primary)' }} />
          <div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{total_students}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Registered Students</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <Building size={40} style={{ color: 'var(--secondary)' }} />
          <div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{total_companies}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Verified Companies</p>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <Briefcase size={40} style={{ color: 'var(--success)' }} />
          <div>
            <h3 style={{ fontSize: '1.8rem', color: '#fff' }}>{total_internships}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Active Postings</p>
          </div>
        </div>
      </div>

      {/* User Accounts Management Directory */}
      <div className="glass-panel" style={{ padding: '1.8rem', marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>User Accounts Directory</h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>User Email</th>
                <th>Role</th>
                <th>Account Details</th>
                <th>Registered Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td><strong>{u.email}</strong></td>
                  <td>
                    <span className="badge" style={{ background: u.role === 'admin' ? 'rgba(239,68,68,0.2)' : u.role === 'company' ? 'rgba(6,182,212,0.2)' : 'rgba(99,102,241,0.2)', color: u.role === 'admin' ? '#f87171' : u.role === 'company' ? '#38bdf8' : '#a5b4fc' }}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>{u.details}</td>
                  <td>{u.created_at}</td>
                  <td>
                    {u.role !== 'admin' ? (
                      <button onClick={() => handleDeleteUser(u.id, u.email)} className="btn btn-outline btn-sm" style={{ color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
                        <Trash2 size={14} /> Remove
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Protected System Admin</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Internships Monitoring */}
      <div className="glass-panel" style={{ padding: '1.8rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>Active Internships Overview</h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Company</th>
                <th>Location</th>
                <th>Required Skills</th>
                <th>Applicants</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {internships.map(i => (
                <tr key={i.id}>
                  <td><strong>{i.title}</strong></td>
                  <td>{i.company_name}</td>
                  <td>{i.location}</td>
                  <td>
                    {i.skills.slice(0, 3).map((s, idx) => (
                      <span key={idx} className="skill-tag" style={{ fontSize: '0.75rem' }}>{s}</span>
                    ))}
                  </td>
                  <td><strong>{i.applicant_count}</strong></td>
                  <td>
                    <span className="badge" style={{ background: i.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: i.status === 'Active' ? '#34d399' : '#f87171' }}>
                      {i.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
