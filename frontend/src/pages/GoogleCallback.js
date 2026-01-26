/**
 * GoogleCallback: Handle OAuth redirect from Google
 * 
 * After user authenticates with Google, they're redirected here with:
 * - code: Authorization code to exchange for user info
 * - state: Original state to prevent CSRF
 * 
 * This page:
 * 1. Extracts code from URL
 * 2. Sends code to backend for verification
 * 3. Logs user in
 * 4. Redirects to dashboard or original destination
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import IdentityService from '../services/IdentityService';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract OAuth parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        // Check for OAuth errors from Google
        if (error) {
          console.error('Google OAuth error:', error);
          setError(`Google login failed: ${error}`);
          setStatus('error');
          
          // Redirect back to landing after 3 seconds
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Validate authorization code
        if (!code) {
          console.error('No authorization code received');
          setError('Invalid OAuth response - missing authorization code');
          setStatus('error');
          
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        // Parse state to restore context
        let stateData = {};
        try {
          stateData = state ? JSON.parse(atob(state)) : {};
        } catch (err) {
          console.warn('Could not parse state:', err);
        }

        console.log('Processing Google OAuth callback with code:', code.substring(0, 20) + '...');
        setStatus('processing');

        // Send authorization code to backend for verification
        const authResponse = await IdentityService.authenticateGoogleWithCode(code);

        console.log('Google authentication successful:', authResponse);
        setStatus('success');

        // Retrieve intended action from sessionStorage
        const returnAction = sessionStorage.getItem('auth_return_action');
        const returnPath = sessionStorage.getItem('auth_return_path') || '/dashboard';
        
        // Clear session storage
        sessionStorage.removeItem('auth_return_action');
        sessionStorage.removeItem('auth_return_path');

        // Small delay to show success message
        setTimeout(() => {
          navigate(returnPath, { 
            replace: true,
            state: { 
              justAuthenticated: true,
              action: returnAction 
            }
          });
        }, 1000);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
        setStatus('error');
        
        // Redirect back to landing after 3 seconds
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'processing' && (
          <>
            <div style={styles.spinner}></div>
            <h2 style={styles.title}>Completing sign in...</h2>
            <p style={styles.subtitle}>Please wait while we verify your Google account</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={styles.successIcon}>✓</div>
            <h2 style={styles.title}>Success!</h2>
            <p style={styles.subtitle}>Redirecting you to your dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={styles.errorIcon}>✕</div>
            <h2 style={styles.title}>Authentication Failed</h2>
            <p style={styles.errorText}>{error}</p>
            <p style={styles.subtitle}>Redirecting you back...</p>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f7f9fc',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px 40px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },
  spinner: {
    width: '60px',
    height: '60px',
    margin: '0 auto 24px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #4299e1',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  successIcon: {
    width: '60px',
    height: '60px',
    margin: '0 auto 24px',
    backgroundColor: '#48bb78',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  errorIcon: {
    width: '60px',
    height: '60px',
    margin: '0 auto 24px',
    backgroundColor: '#f56565',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '32px',
    fontWeight: 'bold',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
  errorText: {
    fontSize: '14px',
    color: '#c53030',
    margin: '12px 0',
    padding: '12px',
    backgroundColor: '#fed7d7',
    borderRadius: '6px',
  },
};

// Add CSS animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(styleSheet);

export default GoogleCallback;
