/**
 * Modal for collecting user name on first visit
 * Displays once until user provides a name (stored in localStorage)
 * 
 * This is the entry point for lightweight identity in Splitwith.
 */

import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { setUserIdentity, getUserIdentity } from '../services/apiClient';
import { userAPI } from '../services/apiClient';

const NameModal = ({ onNameSet }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Generate UUID if not already set
      let { userId } = getUserIdentity();
      if (!userId) {
        userId = uuidv4();
      }

      // Save to localStorage
      setUserIdentity(userId, name.trim());

      // Call backend to create/sync user
      await userAPI.getOrCreateIdentity(userId, name.trim());

      // Notify parent that identity is set
      onNameSet({ userId, userName: name.trim() });
    } catch (err) {
      setError(err.message || 'Failed to set user identity. Please try again.');
      console.error('Error setting user identity:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.backdrop}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Welcome to Splitwith 🎉</h2>
          <p style={styles.subtitle}>What should we call you?</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError('');
            }}
            autoFocus
            style={styles.input}
            disabled={loading}
          />

          {error && <p style={styles.error}>{error}</p>}

          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            disabled={loading}
          >
            {loading ? 'Setting up...' : 'Get Started'}
          </button>
        </form>

        <p style={styles.info}>
          💡 No login needed. Your identity is saved in your browser.
        </p>
      </div>
    </div>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '400px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0',
  },
  form: {
    marginBottom: '20px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    marginBottom: '16px',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    color: '#f56565',
    fontSize: '14px',
    margin: '0 0 12px 0',
  },
  info: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
};

export default NameModal;
