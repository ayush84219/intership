import React, { useEffect, useState } from 'react';
import { GraduationCap, Upload, Wand2, Search, Send, Edit3, CheckCircle, Flame, ThumbsUp, AlertCircle, FileText, Check, Globe, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('portal'); // 'portal' vs 'live'
  const [showEditModal, setShowEditModal] = useState(false);
  const [msg, setMsg] = useState(null);

  // Resume upload state
  const [resumeFile, setResumeFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Form edit state
  const [editForm, setEditForm] = useState({
    full_name: '',
    university: '',
    major: '',
    gpa: '',
    graduation_year: '',
    skills: '',
    bio: ''
  });

  const [liveJobs, setLiveJobs] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);

  const loadData = () => {
    axios.get('/api/student/dashboard')
      .then(res => {
        setData(res.data);
        setEditForm({
          full_name: res.data.student.full_name || '',
          university: res.data.student.university || '',
          major: res.data.student.major || '',
          gpa: res.data.student.gpa || '',
          graduation_year: res.data.student.graduation_year || 2026,
          skills: res.data.student.skills || '',
          bio: res.data.student.bio || ''
        });
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  const fetchLiveOpportunities = async () => {
    setLiveLoading(true);
    try {
      const res = await axios.get('/api/student/live-jobs');
      setLiveJobs(res.data.live_jobs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLiveLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    fetchLiveOpportunities();
  }, []);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/student/profile', editForm);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
      setShowEditModal(false);
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: 'Failed to update profile' });
    }
  };

  const handleUploadResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;

    const formData = new FormData();
    formData.append('resume_file', resumeFile);
    setUploading(true);

    try {
      const res = await axios.post('/api/student/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg({ type: 'success', text: res.data.message });
      setResumeFile(null);
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Upload failed' });
    } finally {
      setUploading(false);
    }
  };

  const handleApply = async (internshipId, title) => {
    try {
      const res = await axios.post(`/api/student/apply/${internshipId}`);
      setMsg({ type: 'success', text: `Applied for "${title}"! Match Score: ${res.data.match_score}%` });
      loadData();
    } catch (err) {
      setMsg({ type: 'danger', text: err.response?.data?.error || 'Application failed' });
    }
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading student dashboard & live AI matches...</div>;
  if (!data) return <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--danger)' }}>Unauthorized access</div>;

  const { student, recommended_internships, applications } = data;
  const filteredPortalInternships = (recommended_internships || []).filter(item => 
    item.title.toLowerCase().includes(search.toLowerCase()) || 
    item.company_name.toLowerCase().includes(search.toLowerCase()) ||
    item.required_skills.some(s => s.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredLiveJobs = (liveJobs || []).filter(item =>
    item.title.toLowerCase().includes(search.toLowerCase()) ||
    item.company_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Welcome Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>
          Welcome back, <span style={{ color: 'var(--primary)' }}>{student.full_name}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GraduationCap size={18} /> {student.university || 'University Student'} &bull; {student.major || 'General Major'} (GPA: {student.gpa || 'N/A'})
        </p>
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

      <div className="grid-3" style={{ marginBottom: '2.5rem' }}>
        {/* Profile & Skill Summary */}
        <div className="glass-panel" style={{ padding: '1.8rem', gridColumn: 'span 1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.2rem' }}>Skills Profile</h3>
            <button className="btn btn-outline btn-sm" onClick={() => setShowEditModal(true)}>
              <Edit3 size={14} /> Edit
            </button>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>Detected Skills:</p>
            {student.skills_list.map((s, idx) => (
              <span key={idx} className="skill-tag"><Check size={12} style={{ display: 'inline', marginRight: '3px' }} /> {s}</span>
            ))}
          </div>

          {/* AI Resume Upload Analyzer */}
          <div style={{ paddingTop: '1.2rem', borderTop: '1px solid var(--border-glass)' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--secondary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wand2 size={16} /> AI Resume Analyzer
            </h4>
            {student.resume_filename && (
              <p style={{ fontSize: '0.85rem', color: 'var(--success)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={14} /> Resume Uploaded: <code>{student.resume_filename}</code>
              </p>
            )}

            <form onSubmit={handleUploadResume}>
              <input 
                type="file" 
                className="form-control" 
                accept=".pdf,.txt" 
                style={{ marginBottom: '0.6rem', padding: '0.4rem', fontSize: '0.85rem' }} 
                onChange={e => setResumeFile(e.target.files[0])} 
                required 
              />
              <button type="submit" className="btn btn-secondary btn-sm" style={{ width: '100%' }} disabled={uploading}>
                {uploading ? 'Extracting...' : <>Upload & Parse Skills <Upload size={14} /></>}
              </button>
            </form>
          </div>
        </div>

        {/* Tabbed Recommendations Section */}
        <div className="glass-panel" style={{ padding: '1.8rem', gridColumn: 'span 2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`btn btn-sm ${activeTab === 'portal' ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab('portal')}
              >
                <Flame size={14} /> Portal Opportunities ({filteredPortalInternships.length})
              </button>
              <button 
                className={`btn btn-sm ${activeTab === 'live' ? 'btn-secondary' : 'btn-outline'}`}
                onClick={() => setActiveTab('live')}
              >
                <Globe size={14} /> Live Web Jobs ({filteredLiveJobs.length})
              </button>
            </div>

            <div style={{ position: 'relative', width: '200px' }}>
              <input 
                type="text" 
                className="form-control" 
                placeholder="Search..." 
                style={{ padding: '0.4rem 0.8rem 0.4rem 2rem', fontSize: '0.85rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto', paddingRight: '4px' }}>
            
            {/* Tab 1: Portal Internships */}
            {activeTab === 'portal' && filteredPortalInternships.map(item => (
              <div key={item.id} className="glass-panel" style={{ padding: '1.2rem', background: 'var(--bg-card-solid)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--secondary)' }}>{item.company_name}</strong> &bull; {item.location} &bull; {item.stipend}
                    </p>
                  </div>

                  <span className={`match-badge ${item.match_score >= 80 ? 'match-high' : item.match_score >= 50 ? 'match-medium' : 'match-low'}`}>
                    {item.match_score >= 80 ? <Flame size={14} /> : <ThumbsUp size={14} />} {item.match_score}% Match
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-main)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                  <div>
                    {item.required_skills.map((s, idx) => (
                      <span key={idx} className="skill-tag">{s}</span>
                    ))}
                  </div>

                  {item.applied ? (
                    <span className={`badge badge-${item.app_status ? item.app_status.toLowerCase() : 'pending'}`}>
                      Applied ({item.app_status})
                    </span>
                  ) : (
                    <button onClick={() => handleApply(item.id, item.title)} className="btn btn-primary btn-sm">
                      Apply <Send size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Tab 2: Live External Web Jobs */}
            {activeTab === 'live' && filteredLiveJobs.map(item => (
              <div key={item.id} className="glass-panel" style={{ padding: '1.2rem', background: 'var(--bg-card-solid)', borderLeft: '3px solid var(--secondary)', border: '1px solid var(--border-glass)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                  <div>
                    <h4 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <strong style={{ color: 'var(--secondary)' }}>{item.company_name}</strong> &bull; {item.location} &bull; <span style={{ color: 'var(--success)' }}>{item.stipend}</span>
                    </p>
                  </div>

                  <span className={`match-badge ${item.match_score >= 80 ? 'match-high' : item.match_score >= 50 ? 'match-medium' : 'match-low'}`}>
                    <Flame size={14} /> {item.match_score}% Match
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', marginBottom: '0.8rem', lineHeight: '1.4' }}>
                  {item.description}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.6rem' }}>
                  <div>
                    {item.required_skills.map((s, idx) => (
                      <span key={idx} className="skill-tag">{s}</span>
                    ))}
                  </div>

                  <a href={item.apply_url} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                    Apply on Web <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}

            {activeTab === 'live' && liveLoading && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                Fetching live external opportunities from Google Jobs & Pipelines...
              </p>
            )}

            {activeTab === 'live' && !liveLoading && filteredLiveJobs.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                <p style={{ marginBottom: '1rem' }}>No live jobs fetched for current query.</p>
                <a href="/internships" className="btn btn-secondary btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Explore All Internships & Filters <ExternalLink size={14} />
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submitted Applications Matrix */}
      <div className="glass-panel" style={{ padding: '1.8rem' }}>
        <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} style={{ color: 'var(--secondary)' }} /> Submitted Applications
        </h3>

        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Internship Title</th>
                <th>Company</th>
                <th>Applied Date</th>
                <th>AI Match Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app.id}>
                  <td><strong>{app.internship_title}</strong></td>
                  <td>{app.company_name}</td>
                  <td>{app.applied_at}</td>
                  <td><strong style={{ color: 'var(--secondary)' }}>{app.match_score}%</strong></td>
                  <td><span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span></td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No applications submitted yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="glass-panel" style={{ width: '500px', padding: '2rem', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <span style={{ position: 'absolute', top: '1rem', right: '1.5rem', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => setShowEditModal(false)}>&times;</span>
            <h3 style={{ marginBottom: '1.2rem' }}>Edit Student Profile</h3>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" className="form-control" value={editForm.full_name} onChange={e => setEditForm({ ...editForm, full_name: e.target.value })} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>University</label>
                  <input type="text" className="form-control" value={editForm.university} onChange={e => setEditForm({ ...editForm, university: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Major</label>
                  <input type="text" className="form-control" value={editForm.major} onChange={e => setEditForm({ ...editForm, major: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>GPA</label>
                  <input type="number" step="0.01" className="form-control" value={editForm.gpa} onChange={e => setEditForm({ ...editForm, gpa: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Graduation Year</label>
                  <input type="number" className="form-control" value={editForm.graduation_year} onChange={e => setEditForm({ ...editForm, graduation_year: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Skills (Comma separated)</label>
                <input type="text" className="form-control" value={editForm.skills} onChange={e => setEditForm({ ...editForm, skills: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea className="form-control" rows="3" value={editForm.bio} onChange={e => setEditForm({ ...editForm, bio: e.target.value })}></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
