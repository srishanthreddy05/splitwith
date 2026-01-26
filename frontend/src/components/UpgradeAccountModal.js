/**
 * UpgradeAccountModal: Allow guest users to upgrade to email or Google auth.
 * Preserves all trip/expense data during upgrade.
 */

import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import IdentityService from '../services/IdentityService';
import EmailOtpFlow from './EmailOtpFlow';

const UpgradeAccountModal = ({ userId, onSuccess, onClose }) => {
  const [step, setStep] = useState('choice'); // 'choice', 'email', 'google'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');

  /**
   * Real Google OAuth flow for guest upgrade:
   * 1. Guest user clicks "Upgrade with Google"
   * 2. Google login popup appears
   * 3. User authenticates with Google
   * 4. Frontend receives credential (ID token)
   * 5. Send to backend POST /auth/google with currentUserId (the guest ID)
   * 6. Backend:
   *    - Verifies Google token
   *    - Checks if guest user exists
   *    - Upgrades guest to Google auth (preserves trips/expenses)
   *    - Returns updated userId (same as before)
   * 7. Frontend saves userId and closes modal
   */
  const googleUpgrade = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setLoading(true);
      setError('');

      try {
        const authResponse = await IdentityService.authenticateGoogle(
          codeResponse.credential,
          userId // Pass current guest userId for upgrade
        );

        if (onSuccess) {
          onSuccess();
        }
      } catch (err) {
        setError(err.message || 'Google upgrade failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError('Google login failed. Please try again.');
    },
    flow: 'implicit',
  });

  const handleGoogleUpgrade = () => {
    googleUpgrade();
  };

  /**
   * Upgrade to Email: Step 1 - Collect email and password
   */
  const handleEmailUpgradeStart = () => {
    setStep('email');
  };

  /**
   * Upgrade to Email: Complete
   */
  const handleEmailUpgradeComplete = async () => {
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await IdentityService.upgradeGuestToEmail(
        userId,
        email,
        newPassword,
        displayName || undefined
      );

      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'Email upgrade failed');
    } finally {
      setLoading(false);
    }
  };

  // Choice step
  if (step === 'choice') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Upgrade Account</h2>
          <p style={styles.subtitle}>
            Secure your account by upgrading from guest
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            onClick={handleEmailUpgradeStart}
            style={styles.button}
            disabled={loading}
          >
            ✉️ Upgrade with Email
          </button>

          <button
            onClick={handleGoogleUpgrade}
            style={styles.button}
            disabled={loading}
          >
            🔵 Upgrade with Google
          </button>

          <button
            onClick={onClose}
            style={{ ...styles.button, ...styles.cancelButton }}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Email upgrade step
  if (step === 'email') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Upgrade with Email</h2>
          <p style={styles.subtitle}>Set up email and password</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={(e) => { e.preventDefault(); handleEmailUpgradeComplete(); }} style={styles.form}>
            <input
              type="text"
              placeholder="Display name (optional)"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              style={styles.input}
              disabled={loading}
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              style={styles.input}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setError('');
              }}
              style={styles.input}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              style={styles.input}
              disabled={loading}
            />

            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Upgrading...' : 'Complete Upgrade'}
            </button>

            <button
              type="button"
              onClick={() => setStep('choice')}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
            >
              Back
            </button>
          </form>
        </div>
      </div>
    );
  }

  return null;
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
  submitButton: {
    width: '100%',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    marginBottom: '0',
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

export default UpgradeAccountModal;
