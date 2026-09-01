import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Home, Building, ShieldCheck, LogOut, LogIn, UserPlus } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await onLogout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">
          <GraduationCap style={{ color: '#6366f1' }} size={28} />
          Smart<span>Intern</span>
        </Link>

        <ul className="nav-links">
          <li>
            <Link to="/"><Home size={18} /> Home</Link>
          </li>
          <li>
            <Link to="/internships"><Building size={18} /> Find Internships</Link>
          </li>

          {user ? (
            <>
              {user.role === 'student' && (
                <li>
                  <Link to="/student"><GraduationCap size={18} /> Dashboard</Link>
                </li>
              )}
              {user.role === 'company' && (
                <li>
                  <Link to="/company"><Building size={18} /> Company Portal</Link>
                </li>
              )}
              {user.role === 'admin' && (
                <li>
                  <Link to="/admin"><ShieldCheck size={18} /> Admin Console</Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">
                  <LogOut size={16} /> Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <Link to="/login"><LogIn size={18} /> Login</Link>
              </li>
              <li>
                <Link to="/register" className="btn btn-primary btn-sm">
                  <UserPlus size={16} /> Get Started
                </Link>
              </li>
            </>
          )}

          <li>
            <ThemeSwitcher />
          </li>
        </ul>
      </div>
    </nav>
  );
}
