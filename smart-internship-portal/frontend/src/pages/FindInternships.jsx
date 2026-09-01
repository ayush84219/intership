import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Globe, Filter, Flame, ThumbsUp, ExternalLink, 
  Clock, Sparkles, Building, Briefcase, ChevronDown, Check, RefreshCw, Send, AlertCircle
} from 'lucide-react';
import axios from 'axios';

const QUICK_FILTERS_TECH = [
  'AI/ML', 'React Developer', 'UI UX Design', 'Fullstack Intern', 'Data Science', 'Python Dev', 'DevOps'
];

const QUICK_FILTERS_BIZ = [
  'Business Analyst', 'Digital Marketing', 'Product Management', 'Financial Analyst', 'HR Intern', 'Sales & Growth'
];

const PLATFORMS = [
  { id: 'all', name: 'All Platforms' },
  { id: 'internshala', name: 'Internshala.com' },
  { id: 'naukri', name: 'Naukri.com' },
  { id: 'apna', name: 'Apna.com' },
  { id: 'shine', name: 'Shine.com' },
  { id: 'google', name: 'Google Jobs' }
];

const STATES_CITIES = {
  'Bangalore': ['Electronic City', 'Whitefield', 'Koramangala', 'HSR Layout', 'Indiranagar'],
  'Delhi NCR': ['Gurugram', 'Noida', 'New Delhi', 'Faridabad'],
  'Mumbai': ['Andheri', 'Bandra', 'Powai', 'Navi Mumbai'],
  'Hyderabad': ['Hitec City', 'Madhapur', 'Gachibowli'],
  'Pune': ['Hinjewadi', 'Viman Nagar', 'Magarpatta'],
  'Remote / Work from Home': ['All Remote', 'Hybrid']
};

export default function FindInternships({ user }) {
  const [track, setTrack] = useState('tech'); // 'tech' | 'biz'
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [excludeLocation, setExcludeLocation] = useState('');
  const [datePosted, setDatePosted] = useState('any');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalFound, setTotalFound] = useState(0);
  const [applyMsg, setApplyMsg] = useState(null);

  const fetchJobs = async (
    searchQuery = query, 
    currentTrack = track, 
    loc = location, 
    excludeLoc = excludeLocation, 
    platform = selectedPlatform,
    date = datePosted
  ) => {
    setLoading(true);
    setError(null);
    try {
      const activeLocation = loc || (selectedCity ? `${selectedCity}, ${selectedState}` : selectedState);
      const payload = {
        query: searchQuery,
        track: currentTrack,
        location: activeLocation,
        exclude_location: excludeLoc,
        platform: platform,
        date_posted: date,
        limit: 24
      };

      const res = await axios.post('/api/jobs/search', payload);
      setJobs(res.data.results || []);
      setTotalFound(res.data.total || 0);
    } catch (err) {
      console.error(err);
      setError('Unable to fetch live internships right now. Please retry in a few seconds.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load and track / platform / date change
  useEffect(() => {
    fetchJobs(query, track, location, excludeLocation, selectedPlatform, datePosted);
  }, [track, selectedPlatform, datePosted]);

  // Debounced auto-search when typing in location or excludeLocation
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs(query, track, location, excludeLocation, selectedPlatform, datePosted);
    }, 450);
    return () => clearTimeout(timer);
  }, [location, excludeLocation]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs(query, track, location, excludeLocation, selectedPlatform, datePosted);
  };

  const handleQuickFilterClick = (filterText) => {
    setQuery(filterText);
    fetchJobs(filterText, track, location, excludeLocation, selectedPlatform, datePosted);
  };

  const handleStateChange = (stateName) => {
    setSelectedState(stateName);
    setSelectedCity('');
    setLocation(stateName);
    fetchJobs(query, track, stateName, excludeLocation, selectedPlatform, datePosted);
  };

  const handleCityChange = (cityName) => {
    setSelectedCity(cityName);
    const combinedLoc = cityName ? `${cityName}, ${selectedState}` : selectedState;
    setLocation(combinedLoc);
    fetchJobs(query, track, combinedLoc, excludeLocation, selectedPlatform, datePosted);
  };

  const handleApplyPortal = async (portalId, title) => {
    try {
      const res = await axios.post(`/api/student/apply/${portalId}`);
      setApplyMsg({ type: 'success', text: `Application submitted for "${title}"! Match: ${res.data.match_score}%` });
      setTimeout(() => setApplyMsg(null), 4000);
    } catch (err) {
      setApplyMsg({ type: 'danger', text: err.response?.data?.error || 'Failed to submit application' });
      setTimeout(() => setApplyMsg(null), 4000);
    }
  };

  const quickFilters = track === 'tech' ? QUICK_FILTERS_TECH : QUICK_FILTERS_BIZ;

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Toast Notification */}
      {applyMsg && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          padding: '1rem 1.5rem',
          borderRadius: '8px',
          background: applyMsg.type === 'success' ? '#059669' : '#dc2626',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <Check size={18} /> {applyMsg.text}
        </div>
      )}

      {/* Header with Track Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '1.8rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.4rem' }}>
            <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: 0, color: 'var(--text-heading)' }}>
              Find Internships
            </h1>
            <span style={{
              background: track === 'tech' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(236, 72, 153, 0.15)',
              color: track === 'tech' ? 'var(--secondary)' : 'var(--accent)',
              border: `1px solid ${track === 'tech' ? 'rgba(6, 182, 212, 0.4)' : 'rgba(236, 72, 153, 0.4)'}`,
              borderRadius: '6px',
              padding: '0.2rem 0.6rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase'
            }}>
              {track === 'tech' ? 'TECH FEED' : 'BUSINESS FEED'}
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0 }}>
            Showing live openings aggregated from major job pipelines & direct portal partners
          </p>
        </div>

        {/* Track Segmented Switcher */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '4px',
          display: 'inline-flex',
          gap: '4px'
        }}>
          <button
            type="button"
            onClick={() => setTrack('tech')}
            style={{
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: track === 'tech' ? 'var(--secondary)' : 'transparent',
              color: track === 'tech' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Tech Track
          </button>
          <button
            type="button"
            onClick={() => setTrack('biz')}
            style={{
              padding: '0.55rem 1.2rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              background: track === 'biz' ? 'var(--accent)' : 'transparent',
              color: track === 'biz' ? '#ffffff' : 'var(--text-muted)'
            }}
          >
            Business Track
          </button>
        </div>
      </div>

      {/* Main Search Input Form */}
      <form onSubmit={handleSearchSubmit} style={{ marginBottom: '1.2rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--bg-card-solid)',
          border: '1px solid var(--border-glass)',
          borderRadius: '12px',
          padding: '6px 8px 6px 18px',
          boxShadow: 'var(--box-shadow)'
        }}>
          <Search size={22} style={{ color: 'var(--text-dim)', marginRight: '12px', flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={track === 'tech' ? "Search AI/ML, Fullstack, Frontend, UI/UX Design, Python..." : "Search Business Analyst, Product Intern, Finance, Marketing..."}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '1.05rem',
              color: 'var(--text-heading)',
              background: 'transparent',
              padding: '0.6rem 0'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              padding: '0.8rem 1.8rem',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.9rem',
              letterSpacing: '0.05em'
            }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : 'SEARCH'}
          </button>
        </div>
      </form>

      {/* Location Filter & Date Filter Box */}
      <div style={{
        background: 'var(--bg-card-solid)',
        border: '1px solid var(--border-glass)',
        borderRadius: '14px',
        padding: '1.2rem 1.5rem',
        marginBottom: '1.5rem',
        boxShadow: 'var(--box-shadow)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Left icon and label */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '220px' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            color: 'var(--secondary)',
            padding: '10px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <MapPin size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '0.95rem' }}>Filter by Location</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Filter locations and date posted for jobs</div>
          </div>
        </div>

        {/* Inputs & Dropdowns */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', flex: 1, justifyContent: 'flex-end' }}>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Type location..."
            className="form-control"
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              width: '140px'
            }}
          />

          <input
            type="text"
            value={excludeLocation}
            onChange={(e) => setExcludeLocation(e.target.value)}
            placeholder="Exclude location..."
            className="form-control"
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              width: '150px'
            }}
          />

          <select
            value={datePosted}
            onChange={(e) => setDatePosted(e.target.value)}
            className="form-control"
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              width: 'auto'
            }}
          >
            <option value="any">Any Time</option>
            <option value="today">Past 24 Hours</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
          </select>

          <select
            value={selectedState}
            onChange={(e) => handleStateChange(e.target.value)}
            className="form-control"
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              cursor: 'pointer',
              width: 'auto'
            }}
          >
            <option value="">Select State</option>
            {Object.keys(STATES_CITIES).map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>

          <select
            value={selectedCity}
            onChange={(e) => handleCityChange(e.target.value)}
            disabled={!selectedState || !STATES_CITIES[selectedState]}
            className="form-control"
            style={{
              padding: '0.55rem 0.9rem',
              borderRadius: '20px',
              fontSize: '0.85rem',
              cursor: selectedState ? 'pointer' : 'not-allowed',
              width: 'auto',
              opacity: selectedState ? 1 : 0.6
            }}
          >
            <option value="">Select City</option>
            {selectedState && STATES_CITIES[selectedState]?.map(ct => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
          </select>
        </div>
      </div>

      {/* QUICK FILTERS */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          QUICK FILTERS:
        </span>
        {quickFilters.map((qf) => (
          <button
            key={qf}
            type="button"
            onClick={() => handleQuickFilterClick(qf)}
            style={{
              background: query === qf ? 'rgba(6, 182, 212, 0.2)' : 'var(--bg-card-solid)',
              color: query === qf ? 'var(--secondary)' : 'var(--text-main)',
              border: `1px solid ${query === qf ? 'var(--secondary)' : 'var(--border-glass)'}`,
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: 'var(--box-shadow)',
              transition: 'all 0.2s'
            }}
          >
            {qf}
          </button>
        ))}
      </div>

      {/* SOURCE PLATFORMS TABS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.6rem',
        flexWrap: 'wrap',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-glass)'
      }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.05em', marginRight: '4px' }}>
          SOURCE PLATFORMS:
        </span>
        {PLATFORMS.map((plat) => (
          <button
            key={plat.id}
            type="button"
            onClick={() => setSelectedPlatform(plat.id)}
            style={{
              background: selectedPlatform === plat.id ? 'var(--secondary)' : 'var(--bg-card-solid)',
              color: selectedPlatform === plat.id ? '#ffffff' : 'var(--text-main)',
              border: selectedPlatform === plat.id ? 'none' : '1px solid var(--border-glass)',
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: selectedPlatform === plat.id ? 700 : 600,
              cursor: 'pointer',
              boxShadow: 'var(--box-shadow)',
              transition: 'all 0.2s'
            }}
          >
            {plat.name}
          </button>
        ))}
      </div>

      {/* Results Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
        <div style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>
          Found <strong style={{ color: 'var(--text-heading)' }}>{jobs.length}</strong> matching openings
        </div>
        <button
          onClick={() => fetchJobs()}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh Live Feed
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          padding: '1.2rem',
          borderRadius: '8px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid-3" style={{ gap: '1.2rem' }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="glass-panel" style={{ padding: '1.5rem', minHeight: '220px', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'pulse 1.5s infinite' }}>
              <div style={{ height: '24px', width: '70%', background: 'var(--border-glass)', borderRadius: '4px' }}></div>
              <div style={{ height: '16px', width: '45%', background: 'var(--border-glass)', borderRadius: '4px' }}></div>
              <div style={{ height: '48px', width: '100%', background: 'var(--border-glass)', borderRadius: '4px' }}></div>
              <div style={{ height: '32px', width: '100%', marginTop: 'auto', background: 'var(--border-glass)', borderRadius: '6px' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Job Cards Grid */}
      {!loading && (
        <div className="grid-3" style={{ gap: '1.2rem' }}>
          {jobs.map((job) => (
            <div
              key={job.id}
              className="glass-panel"
              style={{
                padding: '1.4rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                borderLeft: job.is_portal ? '4px solid var(--primary)' : '4px solid var(--secondary)'
              }}
            >
              {/* Top Row: Title, Company, Badge */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '0.5rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', margin: 0, fontWeight: 700, lineHeight: 1.35 }}>
                    {job.title}
                  </h3>
                  {job.match_score && (
                    <span className={`match-badge ${job.match_score >= 80 ? 'match-high' : job.match_score >= 50 ? 'match-medium' : 'match-low'}`} style={{ flexShrink: 0 }}>
                      <Flame size={13} /> {job.match_score}%
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--secondary)', fontWeight: 700 }}>{job.company_name}</span>
                  <span>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-main)' }}>
                    <MapPin size={13} /> {job.location || 'Remote'}
                  </span>
                </div>

                {/* Stipend and Platform Source Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: 'var(--success)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 700
                  }}>
                    {job.stipend || 'Competitive'}
                  </span>

                  <span style={{
                    background: 'var(--border-glass)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-glass)',
                    padding: '0.25rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600
                  }}>
                    {job.source || 'Live Web'}
                  </span>
                </div>

                {/* Snippet */}
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.5',
                  marginBottom: '1rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  opacity: 0.9
                }}>
                  {job.description}
                </p>

                {/* Required Skills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '1.2rem' }}>
                  {(job.required_skills || []).slice(0, 4).map((sk, idx) => (
                    <span key={idx} className="skill-tag" style={{ fontSize: '0.78rem', padding: '3px 9px' }}>
                      {sk}
                    </span>
                  ))}
                  {(job.required_skills || []).length > 4 && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', fontWeight: 600 }}>
                      +{job.required_skills.length - 4} more
                    </span>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ marginTop: 'auto', paddingTop: '0.8rem', borderTop: '1px solid var(--border-glass)' }}>
                {job.is_portal ? (
                  <button
                    onClick={() => handleApplyPortal(job.portal_id, job.title)}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    Quick Apply on Portal <Send size={14} />
                  </button>
                ) : (
                  <a
                    href={job.apply_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                    style={{ width: '100%', justifyContent: 'center', textDecoration: 'none' }}
                  >
                    Apply on {job.source || 'External Site'} <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Briefcase size={40} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>No matching internships found</h3>
          <p>Try clearing filters or searching for broader terms like "Software", "Developer", "Marketing" or "Remote".</p>
          <button
            onClick={() => { setQuery(''); setLocation(''); setSelectedPlatform('all'); fetchJobs('', track, '', 'all'); }}
            className="btn btn-outline btn-sm"
            style={{ marginTop: '1rem' }}
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
}
