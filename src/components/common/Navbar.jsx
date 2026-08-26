import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaRoad, FaShieldAlt, FaBars, FaTimes } from 'react-icons/fa';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-glass">
        {/* Brand / Logo */}
        <Link to="/" className="brand" onClick={() => setIsOpen(false)}>
          <div className="brand-icon">
            <FaRoad />
          </div>
          <span className="brand-text">
            ROAD<span>-SENTRY</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link
            to="/admin"
            className={`btn-login ${location.pathname.startsWith('/admin') ? 'active' : ''}`}
            onClick={() => setIsOpen(false)}
          >
            <FaShieldAlt className="link-icon" />
            <span>Portal Administrator</span>
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
