/**
 * Navigation bar shown on all pages
 * Contains: Splitwith logo (home link), Dashboard, Previous Trips, Profile
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user }) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    ...styles.link,
    color: isActive(path) ? '#4299e1' : '#4a5568',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    borderBottom: isActive(path) ? '2px solid #4299e1' : 'none',
  });

  const mobileLinkStyle = (path) => ({
    ...styles.mobileLink,
    color: isActive(path) ? '#4299e1' : '#4a5568',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    backgroundColor: isActive(path) ? '#EBF8FF' : 'transparent',
  });

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        {/* Left: Logo */}
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>
            Splitwith
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        {user && (
          <>
            <div style={styles.right}>
              <Link to="/dashboard" style={linkStyle('/dashboard')}>
                Dashboard
              </Link>
              <Link to="/previous-trips" style={linkStyle('/previous-trips')}>
                Previous Trips
              </Link>
              <Link to="/profile" style={linkStyle('/profile')}>
                Profile
              </Link>
            </div>

            {/* Mobile Menu Toggle */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={styles.hamburger}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {user && mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          <Link 
            to="/dashboard" 
            style={mobileLinkStyle('/dashboard')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Dashboard
          </Link>
          <Link 
            to="/previous-trips" 
            style={mobileLinkStyle('/previous-trips')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Previous Trips
          </Link>
          <Link 
            to="/profile" 
            style={mobileLinkStyle('/profile')}
            onClick={() => setMobileMenuOpen(false)}
          >
            Profile
          </Link>
          <div style={styles.mobileUserName}>Hi, {user.displayName}!</div>
        </div>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
  },
  logo: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4299e1',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  right: {
    flex: 1,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '32px',
  },
  link: {
    textDecoration: 'none',
    fontSize: '14px',
    padding: '8px 0',
    transition: 'all 0.2s',
  },
  userName: {
    fontSize: '14px',
    color: '#718096',
    marginLeft: '16px',
    paddingLeft: '16px',
    borderLeft: '1px solid #e2e8f0',
  },
  hamburger: {
    display: 'none',
    fontSize: '24px',
    background: 'none',
    border: 'none',
    color: '#4299e1',
    cursor: 'pointer',
    padding: '8px',
  },
  mobileMenu: {
    display: 'none',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderTop: '1px solid #e2e8f0',
    padding: '12px 0',
  },
  mobileLink: {
    textDecoration: 'none',
    fontSize: '16px',
    padding: '12px 20px',
    transition: 'all 0.2s',
  },
  mobileUserName: {
    fontSize: '14px',
    color: '#718096',
    padding: '12px 20px',
    borderTop: '1px solid #e2e8f0',
    marginTop: '8px',
  },
};

// Add media query styles with a style tag
if (typeof document !== 'undefined') {
  const styleTag = document.getElementById('navbar-responsive-styles') || document.createElement('style');
  styleTag.id = 'navbar-responsive-styles';
  styleTag.innerHTML = `
    @media (max-width: 768px) {
      nav > div > div:nth-child(2) { display: none !important; }
      nav button { display: block !important; }
      nav > div + div { display: flex !important; }
    }
  `;
  if (!document.getElementById('navbar-responsive-styles')) {
    document.head.appendChild(styleTag);
  }
};

export default Navbar;
