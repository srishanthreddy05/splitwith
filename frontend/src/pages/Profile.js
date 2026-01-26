/**
 * Profile: Placeholder for future user profile/settings
 * MVP: Show user identity and basic info
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdentity } from '../services/apiClient';

const Profile = () => {
  const navigate = useNavigate();
  const { userId, userName } = getUserIdentity();

  const handleLogout = () => {
    // Clear identity
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // Redirect to home
    navigate('/');
    window.location.reload();
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Profile</h1>

        {/* User Info Card */}
        <div style={styles.infoCard}>
          <div style={styles.infoSection}>
            <p style={styles.label}>Name</p>
            <p style={styles.value}>{userName}</p>
          </div>
          <div style={styles.divider} />
          <div style={styles.infoSection}>
            <p style={styles.label}>User ID</p>
            <p style={{ ...styles.value, fontSize: '12px', fontFamily: 'monospace' }}>
              {userId}
            </p>
          </div>
        </div>

        {/* Future Features */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Coming Soon</h2>
          <div style={styles.featureList}>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>🔐</span>
              <p style={styles.featureText}>Connect with Google Login</p>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>💰</span>
              <p style={styles.featureText}>Link UPI/Bank for Settlements</p>
            </div>
            <div style={styles.featureItem}>
              <span style={styles.featureIcon}>📧</span>
              <p style={styles.featureText}>Email Notifications</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Settings</h2>
          <button
            onClick={() => navigate('/dashboard')}
            style={styles.settingsButton}
          >
            Back to Dashboard
          </button>
          <button
            onClick={handleLogout}
            style={{ ...styles.settingsButton, color: '#f56565' }}
          >
            Clear Identity
          </button>
        </div>

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            🔒 Your data is stored in your browser. No passwords, no tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    padding: '40px 20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '30px',
    margin: '0 0 30px 0',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  infoSection: {
    marginBottom: '16px',
  },
  label: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  },
  value: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0',
    wordBreak: 'break-all',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e2e8f0',
    margin: '16px 0',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '16px',
    margin: '0 0 16px 0',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f7f9fc',
    borderRadius: '8px',
  },
  featureIcon: {
    fontSize: '20px',
  },
  featureText: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '0',
  },
  settingsButton: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'transparent',
    color: '#4299e1',
    border: '2px solid #4299e1',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '12px',
    transition: 'all 0.2s',
  },
  infoBox: {
    backgroundColor: '#edf2f7',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
  },
  infoText: {
    fontSize: '13px',
    color: '#2d3748',
    margin: '0',
  },
};

export default Profile;
