import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaRoad, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';

export const AdminNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-glass">
        {/* Brand / Logo */}
        <div className="brand">
          <div className="brand-icon">
            <FaRoad />
          </div>
          <span className="brand-text">
            ROAD<span>-SENTRY</span>
          </span>
          <span className="admin-badge">ADMIN</span>
        </div>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link 
            to="/" 
            className="btn-login"
            onClick={() => setIsOpen(false)}
          >
            <FaSignOutAlt className="link-icon" />
            <span>Keluar</span>
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="mobile-toggle" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Menu"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>
    </nav>
  );
};