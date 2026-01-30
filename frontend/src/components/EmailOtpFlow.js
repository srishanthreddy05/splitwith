/**
 * EmailOtpFlow: Multi-step email+OTP authentication.
 * Step 1: Enter email, send OTP
 * Step 2: Verify OTP
 * Step 3 (first-time): Set password and display name
 * 
 * Called from AuthChoiceModal when user selects "Sign in with Email".
 */

import React, { useState } from 'react';
import IdentityService from '../services/IdentityService';

const EmailOtpFlow = ({ onSuccess, onBack }) => {
  const [step, setStep] = useState('email'); // 'email', 'otp', 'password'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);

  /**
   * Step 1: Send OTP to email.
   */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    try {
      await IdentityService.sendOtp(email);
      setStep('otp');
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 2: Verify OTP.
   */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setLoading(true);
    try {
      // Verify OTP only (no password yet)
      const authResponse = await IdentityService.verifyOtpOnly(email, otp);

      // Check if user already exists
      if (authResponse.nextStep === 'continue_action') {
        // Existing user - login complete
        if (onSuccess) {
          onSuccess(authResponse);
        }
      } else if (authResponse.nextStep === 'set_password') {
        // New user - ask for password and name
        setIsNewUser(true);
        setStep('password');
      }
    } catch (err) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Step 3 (first-time): Set password and display name.
   */
  const handleSetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!displayName || displayName.trim().length < 2) {
      setError('Please enter a display name');
      return;
    }

    setLoading(true);
    try {
      // Set password (OTP already verified, no need to send OTP again)
      const authResponse = await IdentityService.setPassword(
        email,
        password,
        displayName.trim()
      );

      if (onSuccess) {
        onSuccess(authResponse);
      }
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Email entry
  if (step === 'email') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Sign in with Email</h2>
          <p style={styles.subtitle}>Enter your email address</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSendOtp} style={styles.form}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
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
              {loading ? 'Sending...' : 'Send OTP'}
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
  }

  // Step 2: OTP verification
  if (step === 'otp') {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Verify OTP</h2>
          <p style={styles.subtitle}>
            We sent a code to <strong>{email}</strong>
          </p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleVerifyOtp} style={styles.form}>
            <input
              type="text"
              placeholder="000000"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError('');
              }}
              style={{ ...styles.input, ...styles.otpInput }}
              maxLength="6"
              autoFocus
              disabled={loading}
            />

            <button
              type="submit"
              style={styles.submitButton}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep('email')}
              style={{ ...styles.button, ...styles.cancelButton }}
              disabled={loading}
            >
              Change Email
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Password + display name (first-time users)
  if (step === 'password' && isNewUser) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <h2 style={styles.title}>Create Account</h2>
          <p style={styles.subtitle}>Set up your account</p>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSetPassword} style={styles.form}>
            <input
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => {
                setDisplayName(e.target.value);
                setError('');
              }}
              style={styles.input}
              disabled={loading}
            />

            <input
              type="password"
              placeholder="Password (min 6 chars)"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
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
              {loading ? 'Creating...' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => setStep('otp')}
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
  otpInput: {
    fontSize: '24px',
    letterSpacing: '4px',
    textAlign: 'center',
    fontFamily: 'monospace',
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

export default EmailOtpFlow;
