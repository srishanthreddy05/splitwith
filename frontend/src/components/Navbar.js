/**
 * Navigation bar shown on all pages
 * Contains: Splitwith logo (home link), Dashboard, Previous Trips, Profile
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ user }) => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const linkStyle = (path) => ({
    ...styles.link,
    color: isActive(path) ? '#4299e1' : '#4a5568',
    fontWeight: isActive(path) ? 'bold' : 'normal',
    borderBottom: isActive(path) ? '2px solid #4299e1' : 'none',
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

        {/* Right: Navigation Links */}
        {user && (
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
            <span style={styles.userName}>Hi, {user.displayName}!</span>
          </div>
        )}
      </div>
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
};

export default Navbar;
