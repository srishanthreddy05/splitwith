/**
 * AuthChoiceModal: Show when user clicks Create/Join without being logged in.
 * 
 * Options:
 * 1. Continue as Guest
 * 2. Sign in with Google
 * 3. Sign in with Email
 */

import React, { useState } from 'react';
import IdentityService from '../services/IdentityService';
import GuestNameModal from './GuestNameModal';
import EmailOtpFlow from './EmailOtpFlow';

const AuthChoiceModal = ({ onClose, onSuccess, action }) => {
  const [step, setStep] = useState('choice'); // 'choice', 'guest', 'email'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Server-managed Google OAuth (no SDK, no popup)
   * Delegates to Spring Boot at /oauth2/authorization/google
   */
  const handleGoogleClick = () => {
    try {
      setLoading(true);

      // Store the intended action (create/join trip) to resume after login
      sessionStorage.setItem('auth_return_action', action);
      sessionStorage.setItem('auth_return_path', window.location.pathname);

      // Hand off to Spring Boot OAuth2 client
      window.location.href = 'http://localhost:9090/oauth2/authorization/google';

    } catch (err) {
      console.error('Error initiating Google redirect:', err);
      setError('Failed to start Google login. Please try again.');
      setLoading(false);
    }
  };

  /**
   * Guest flow: Show GuestNameModal
   */
  const handleGuestClick = () => {
    setStep('guest');
  };

  /**
   * Email flow: Show EmailOtpFlow
   */
  const handleEmailClick = () => {
    setStep('email');
  };


  /**
   * Guest signup complete
   */
  const handleGuestSignup = async (displayName) => {
    setLoading(true);
    setError('');

    try {
      const authResponse = await IdentityService.signupGuest(displayName);

      if (onSuccess) {
        onSuccess(authResponse);
      }
    } catch (err) {
      setError(err.message || 'Failed to create guest account');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Email/OTP signup complete
   */
  const handleEmailSignup = (authResponse) => {
    if (onSuccess) {
      onSuccess(authResponse);
    }
  };

  // Show GuestNameModal
  if (step === 'guest') {
    return (
      <GuestNameModal
        onSignup={handleGuestSignup}
        onBack={() => setStep('choice')}
        error={error}
        loading={loading}
      />
    );
  }

  // Show EmailOtpFlow
  if (step === 'email') {
    return (
      <EmailOtpFlow
        onSuccess={handleEmailSignup}
        onBack={() => setStep('choice')}
      />
    );
  }

  // Choice screen
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {action === 'create' ? 'Create a Trip' : 'Join a Trip'}
        </h2>
        <p style={styles.subtitle}>
          Choose how you'd like to {action === 'create' ? 'create' : 'join'} a trip
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <button
          onClick={handleGuestClick}
          disabled={loading}
          style={styles.button}
        >
          👤 Continue as Guest
        </button>

        <button
          onClick={handleGoogleClick}
          disabled={loading}
          style={styles.button}
        >
          🔵 Sign in with Google
        </button>

        <button
          onClick={handleEmailClick}
          disabled={loading}
          style={styles.button}
        >
          ✉️ Sign in with Email
        </button>

        <button
          onClick={onClose}
          disabled={loading}
          style={{ ...styles.button, ...styles.cancelButton }}
        >
          Cancel
        </button>
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
  button: {
    width: '100%',
    padding: '14px',
    marginBottom: '12px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4299e1',
    color: 'white',
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
    marginBottom: '20px',
    fontSize: '13px',
  },
};

export default AuthChoiceModal;
