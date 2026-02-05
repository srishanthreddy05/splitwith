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

      {/* Mobile Menu Overlay */}
      {user && mobileMenuOpen && (
        <div 
          style={styles.overlay} 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu - Slide from Right */}
      {user && (
        <div style={{
          ...styles.mobileMenu,
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(100%)',
        }}>
          <div style={styles.mobileMenuHeader}>
            <div style={styles.mobileUserName}>Hi, {user.displayName}!</div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              style={styles.closeButton}
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>
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
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
  },
  mobileMenu: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    width: '280px',
    maxWidth: '80%',
    backgroundColor: 'white',
    boxShadow: '-2px 0 8px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    zIndex: 999,
    transition: 'transform 0.3s ease-in-out',
    overflowY: 'auto',
  },
  mobileMenuHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#4a5568',
    cursor: 'pointer',
    padding: '4px 8px',
    lineHeight: 1,
  },
  mobileLink: {
    textDecoration: 'none',
    fontSize: '16px',
    padding: '16px 20px',
    transition: 'all 0.2s',
    borderBottom: '1px solid #f7fafc',
  },
  mobileUserName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
    flex: 1,
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
    }
    
    @media (min-width: 769px) {
      nav > div + div,
      nav > div + div + div { display: none !important; }
    }
    
    body.menu-open {
      overflow: hidden;
    }
  `;
  if (!document.getElementById('navbar-responsive-styles')) {
    document.head.appendChild(styleTag);
  }
};

export default Navbar;
