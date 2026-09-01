import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, Users, TrendingUp, MapPin, Building, ToggleLeft } from 'lucide-react';
import axios from 'axios';

export default function CompanyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [showPostModal, setShowPostModal] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form post state
  const [postForm, setPostForm] = useState({
    title: '',
    required_skills: '',
    stipend: '$4,000 / month',
    location: 'Remote',
    internship_type: 'Full-time',
    duration: '3 Months',
    description: ''
  });

  const loadData = (internshipId = null) => {
    const url = internshipId ? `/api/company/dashboard?internship_id=${internshipId}` : '/api/company/dashboard';
    axios.get(url)
      .then(res => {
        setData(res.data);
        setSelectedId(res.data.selected_internship_id);
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

  const handlePostInternship = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/company/internship/post', postForm);
      setMsg({ type: 'success', text: res.data.message });
      setShowPostModal(false);
      loadData(res.data.internship_id);
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to post' });
    }
  };

  const handleToggleStatus = async (internshipId) => {
    try {
      const res = await axios.post(`/api/company/internship/${internshipId}/toggle`);
      setMsg({ type: 'info', text: res.data.message });
      loadData(internshipId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateApplicantStatus = async (appId, newStatus) => {
    try {
      await axios.post(`/api/company/application/${appId}/status`, { status: newStatus });
      setMsg({ type: 'success', text: `Updated status to ${newStatus}` });
      loadData(selectedId);
    } catch (err) {
      setMsg({ type: 'danger', text: 'Status update failed' });
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading company portal...</div>;
  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>Unauthorized company access</div>;

  const { company, internships, applicants } = data;
  const selectedInternship = internships.find(i => i.id === selectedId);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Company Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.3rem' }}>
            Company Console: <span style={{ color: 'var(--secondary)' }}>{company.company_name}</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building size={16} /> {company.industry || 'Software & Technology'} &bull; <MapPin size={16} /> {company.location || 'Global'}
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowPostModal(true)}>
          <Plus size={18} /> Post Opportunity
        </button>
      </div>

      {msg && (
        <div style={{ 
          padding: '1rem 1.2rem', 
          borderRadius: '8px', 
          marginBottom: '1.5rem', 
          background: msg.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(6,182,212,0.15)',
          border: `1px solid ${msg.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(6,182,212,0.3)'}`,
          color: msg.type === 'success' ? '#34d399' : '#38bdf8'
        }}>
          {msg.text}
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Posted Opportunities Sidebar */}
        <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: 'span 1' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={18} style={{ color: 'var(--primary)' }} /> Posted Positions ({internships.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            {internships.map(item => (
              <div 
                key={item.id} 
                className="glass-panel"
                style={{ 
                  padding: '1rem', 
                  cursor: 'pointer',
                  borderColor: selectedId === item.id ? 'var(--primary)' : 'var(--border-glass)',
                  background: selectedId === item.id ? 'rgba(99,102,241,0.18)' : 'rgba(15,23,42,0.4)'
                }}
                onClick={() => { setSelectedId(item.id); loadData(item.id); }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ color: '#fff', fontSize: '0.95rem' }}>{item.title}</strong>
                  <span className="badge" style={{ fontSize: '0.75rem', background: item.status === 'Active' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: item.status === 'Active' ? '#34d399' : '#f87171' }}>
                    {item.status}
                  </span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  {item.applicant_count} Applicants &bull; {item.location}
                </p>
              </div>
            ))}
            {internships.length === 0 && <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>No opportunities posted yet.</p>}
          </div>
        </div>

        {/* Candidate Ranking List Sorted by AI Score */}
        <div className="glass-panel" style={{ padding: '1.8rem', gridColumn: 'span 2' }}>
          {selectedInternship ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', color: '#fff' }}>{selectedInternship.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    Required Skills: {selectedInternship.required_skills.map((s, idx) => (
                      <span key={idx} className="skill-tag">{s}</span>
                    ))}
                  </p>
                </div>

                <button onClick={() => handleToggleStatus(selectedInternship.id)} className="btn btn-outline btn-sm">
                  <ToggleLeft size={16} /> Status: {selectedInternship.status}
                </button>
              </div>

              <h4 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users size={18} style={{ color: 'var(--secondary)' }} /> Candidate Ranking (AI Sorted)
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {applicants.map(app => (
                  <div key={app.id} className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(15, 23, 42, 0.5)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                      <div>
                        <h4 style={{ fontSize: '1.1rem', color: '#fff' }}>{app.student_name}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          {app.university || 'University'} &bull; {app.major || 'Major'} &bull; GPA: {app.gpa || 'N/A'}
                        </p>
                      </div>

                      <span className={`match-badge ${app.match_score >= 80 ? 'match-high' : app.match_score >= 50 ? 'match-medium' : 'match-low'}`}>
                        <TrendingUp size={14} /> {app.match_score}% Match
                      </span>
                    </div>

                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '0.8rem' }}>
                      Skills: {app.skills.map((s, idx) => (
                        <span key={idx} className="skill-tag" style={{ fontSize: '0.75rem' }}>{s}</span>
                      ))}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.8rem' }}>
                      <span className={`badge badge-${app.status.toLowerCase()}`}>Status: {app.status}</span>

                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {['Reviewed', 'Shortlisted', 'Accepted', 'Rejected'].map(st => (
                          <button
                            key={st}
                            className={`btn btn-sm ${app.status === st ? 'btn-primary' : 'btn-outline'}`}
                            style={{ fontSize: '0.78rem', padding: '0.2rem 0.5rem' }}
                            onClick={() => handleUpdateApplicantStatus(app.id, st)}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
                {applicants.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No applications received for this internship position yet.</p>}
              </div>
            </>
          ) : (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Select an internship to view applicants.</p>
          )}
        </div>
      </div>

      {/* Post Internship Modal */}
      {showPostModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '550px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowPostModal(false)}>&times;</span>
            <h3 style={{ marginBottom: '1.2rem' }}>Post New Internship Opportunity</h3>

            <form onSubmit={handlePostInternship}>
              <div className="form-group">
                <label>Internship Title</label>
                <input type="text" className="form-control" placeholder="e.g. AI & Full-Stack Developer Intern" value={postForm.title} onChange={e => setPostForm({ ...postForm, title: e.target.value })} required />
              </div>

              <div className="form-group">
                <label>Required Skills (Comma separated)</label>
                <input type="text" className="form-control" placeholder="Python, Flask, React, Machine Learning, SQL" value={postForm.required_skills} onChange={e => setPostForm({ ...postForm, required_skills: e.target.value })} required />
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Stipend</label>
                  <input type="text" className="form-control" value={postForm.stipend} onChange={e => setPostForm({ ...postForm, stipend: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input type="text" className="form-control" value={postForm.location} onChange={e => setPostForm({ ...postForm, location: e.target.value })} required />
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label>Type</label>
                  <select className="form-control" value={postForm.internship_type} onChange={e => setPostForm({ ...postForm, internship_type: e.target.value })}>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Duration</label>
                  <input type="text" className="form-control" value={postForm.duration} onChange={e => setPostForm({ ...postForm, duration: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea className="form-control" rows="4" value={postForm.description} onChange={e => setPostForm({ ...postForm, description: e.target.value })} required></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Publish Internship</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
