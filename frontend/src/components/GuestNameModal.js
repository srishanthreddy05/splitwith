/**
 * GuestNameModal: Prompt guest user for display name.
 * Called from AuthChoiceModal when user selects "Continue as Guest".
 */

import React, { useState } from 'react';

const GuestNameModal = ({ onSignup, onBack, error, loading }) => {
  const [displayName, setDisplayName] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!displayName || displayName.trim().length === 0) {
      setValidationError('Please enter a name');
      return;
    }

    if (displayName.trim().length < 2) {
      setValidationError('Name must be at least 2 characters');
      return;
    }

    onSignup(displayName.trim());
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>What's your name?</h2>
        <p style={styles.subtitle}>
          This helps others recognize you in the trip
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {validationError && (
          <div style={styles.errorBox}>{validationError}</div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Enter your name"
            value={displayName}
            onChange={(e) => {
              setDisplayName(e.target.value);
              setValidationError('');
            }}
            style={styles.input}
            autoFocus
            disabled={loading}
          />

          <button
            type="submit"
            style={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Continue as Guest'}
          </button>

          <button
            type="button"
            onClick={onBack}
            style={{ ...styles.button, ...styles.cancelButton }}
            disabled={loading}
          >
            Back
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px',
    maxWidth: '400px',
    width: '90%',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 24px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px',
    fontSize: '14px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
  },
  submitButton: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  button: {
    padding: '12px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '12px',
    fontSize: '13px',
  },
};

export default GuestNameModal;
