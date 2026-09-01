import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FindInternships from './pages/FindInternships';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Configure Axios defaults to handle sessions with Flask
axios.defaults.withCredentials = true;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const res = await axios.get('/api/auth/me');
      if (res.data.authenticated) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading Smart Internship Portal...
      </div>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar user={user} onLogout={handleLogout} />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/internships" element={<FindInternships user={user} />} />
            <Route path="/login" element={<Login onLoginSuccess={checkAuth} />} />
            <Route path="/register" element={<Register onLoginSuccess={checkAuth} />} />
            
            <Route path="/student" element={user && user.role === 'student' ? <StudentDashboard /> : <Navigate to="/login" />} />
            <Route path="/company" element={user && user.role === 'company' ? <CompanyDashboard /> : <Navigate to="/login" />} />
            <Route path="/admin" element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)', borderTop: '1px solid var(--border-glass)', marginTop: 'auto', fontSize: '0.9rem' }}>
          &copy; 2026 Smart Internship Portal. Powered by React & AI Match Recommendation Engine.
        </footer>
      </div>
    </Router>
  );
}
