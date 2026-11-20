import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles, LayoutDashboard, User, FileText, Target,
  Layers, Video, Bot, Globe, Settings, LogOut, LogIn
} from 'lucide-react';

const Navbar = ({ overlay = false }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/overview')) return true;
    if (path === '/resume' && (location.pathname === '/resume' || location.pathname === '/resumes')) return true;
    return location.pathname === path;
  };

  return (
    <header className={`navbar${overlay ? ' navbar-overlay' : ''}`}>
      <div className="container navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="nav-brand">
          <div className="nav-brand-logo">
            <Sparkles size={20} />
          </div>
          <span>SkillBridge AI</span>
        </Link>

        <nav>
          <ul className="nav-links">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <LayoutDashboard size={16} /> Dashboard
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <User size={16} /> Profile
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/resume" className={`nav-link ${isActive('/resume') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <FileText size={16} /> Resume
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/target" className={`nav-link ${isActive('/target') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Target size={16} /> Target Role
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/preparation" className={`nav-link ${isActive('/preparation') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={16} /> Preparation
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/interview" className={`nav-link ${isActive('/interview') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Video size={16} /> Interview Prep
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/assistant" className={`nav-link ${isActive('/assistant') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Bot size={16} /> AI Assistant
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/portfolio" className={`nav-link ${isActive('/portfolio') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Globe size={16} /> Portfolio
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className={`nav-link ${isActive('/settings') ? 'active' : ''}`}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Settings size={16} /> Settings
                    </span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                    Home
                  </Link>
                </li>
                <li>
                  <a href="/#modules" className="nav-link">
                    Modules
                  </a>
                </li>
                <li>
                  <a href="/#how-it-works" className="nav-link">
                    How it Works
                  </a>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="nav-user">
                <div className="nav-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span>{user?.name || 'Student'}</span>
              </div>
              <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log Out">
                <LogOut size={16} /> Logout
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">
                <LogIn size={16} /> Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
