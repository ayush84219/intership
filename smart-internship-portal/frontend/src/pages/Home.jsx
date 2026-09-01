import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, Building, Target, Flame, ArrowRight, MapPin } from 'lucide-react';
import axios from 'axios';

export default function Home({ user }) {
  const [data, setData] = useState({
    student_count: 0,
    company_count: 0,
    internship_count: 0,
    featured_internships: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/api/public/landing')
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {/* Hero Section */}
      <div style={{ textAlign: 'center', padding: '3.5rem 1rem 3rem' }}>
        <h1 style={{
          fontSize: '3rem',
          marginBottom: '1.2rem',
          color: 'var(--text-heading)'
        }}>
          Find Your Dream Internship with <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            AI Skill Matching
          </span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '720px', margin: '0 auto 2.5rem' }}>
          Automated resume parsing, intelligent TF-IDF candidate ranking, and instant percentage match scores to pair students with top tech employers.
        </p>

        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '3.5rem' }}>
          {!user ? (
            <>
              <Link to="/register" className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}>
                Join as Student <GraduationCap size={20} />
              </Link>
              <Link to="/register" className="btn btn-secondary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}>
                Post Opportunities <Building size={20} />
              </Link>
            </>
          ) : (
            <Link to={user.role === 'student' ? '/student' : user.role === 'company' ? '/company' : '/admin'} className="btn btn-primary" style={{ padding: '0.9rem 2rem', fontSize: '1.1rem' }}>
              Go to Portal <ArrowRight size={20} />
            </Link>
          )}
        </div>

        {/* Live Portal Metrics */}
        <div className="grid-3" style={{ marginBottom: '4rem' }}>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <GraduationCap size={36} style={{ color: 'var(--primary)', marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '2rem', color: 'var(--text-heading)' }}>{data.student_count || 250}+</h3>
            <p style={{ color: 'var(--text-muted)' }}>Registered Students</p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Building size={36} style={{ color: 'var(--secondary)', marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '2rem', color: 'var(--text-heading)' }}>{data.company_count || 40}+</h3>
            <p style={{ color: 'var(--text-muted)' }}>Verified Companies</p>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center' }}>
            <Target size={36} style={{ color: 'var(--success)', marginBottom: '0.8rem' }} />
            <h3 style={{ fontSize: '2rem', color: 'var(--text-heading)' }}>{data.internship_count || 120}+</h3>
            <p style={{ color: 'var(--text-muted)' }}>Active Opportunities</p>
          </div>
        </div>
      </div>

      {/* Featured Internships Grid */}
      <div style={{ marginBottom: '4rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Flame style={{ color: 'var(--warning)' }} size={28} /> Featured Opportunities
        </h2>

        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading active internships...</p>
        ) : (
          <div className="grid-3">
            {data.featured_internships.map(item => (
              <div key={item.id} className="glass-panel glass-panel-hover" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.8rem' }}>
                    <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8' }}>{item.internship_type}</span>
                    <span style={{ color: 'var(--success)', fontWeight: '600', fontSize: '0.9rem' }}>{item.stipend}</span>
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.4rem' }}>{item.title}</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.8rem' }}>
                    <Building size={14} style={{ display: 'inline', marginRight: '4px' }} /> {item.company_name} &bull; <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }} /> {item.location}
                  </p>

                  <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', marginBottom: '1.2rem', lineHeight: '1.4' }}>
                    {item.description.substring(0, 110)}...
                  </p>

                  <div style={{ marginBottom: '1rem' }}>
                    {item.skills.map((skill, idx) => (
                      <span key={idx} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>

                <Link to={user ? (user.role === 'student' ? '/student' : '/company') : '/login'} className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
                  {user ? 'View & Apply' : 'Sign In to Match'} <ArrowRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
