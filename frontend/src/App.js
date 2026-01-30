/**
 * Main App Component
 * 
 * Architecture & Auth Flow:
 * 
 * 1. Bootstrap Identity on App Load:
 *    - Check localStorage for userId
 *    - If exists, verify with backend (GET /users/{id})
 *    - If valid, user is logged in
 *    - If not found, clear storage
 * 
 * 2. Auth Choice:
 *    - User can be: Guest, Email-authenticated, Google-authenticated
 *    - All have ONE backend userId stored in localStorage
 * 
 * 3. Guest → Upgrade:
 *    - Guest can upgrade to Email or Google
 *    - All trips/expenses preserved
 * 
 * Routes:
 * / - Landing page (shows auth choice if needed)
 * /dashboard - Dashboard (active trips, create/join)
 * /trip/:tripId - Trip detail page
 * /previous-trips - Completed trips
 * /profile - User profile & upgrade
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import IdentityService from './services/IdentityService';
import authService from './services/authService';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TripPage from './pages/TripPage';
import PreviousTrips from './pages/PreviousTrips';
import ProfilePage from './pages/ProfilePage';
import GoogleCallback from './pages/GoogleCallback';

const LoginSuccess = () => <Navigate to="/dashboard" replace />;
const LoginFailure = () => <Navigate to="/" replace />;

function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState('');
  const location = useLocation();

  /**
   * Bootstrap on app load:
   * Check localStorage and verify with backend
   * Also check for OAuth2 session
   */
  const bootstrap = async () => {
    try {
      setLoading(true);
      
      // First, check if user has an OAuth session
      const oauthUser = await authService.checkAuth();
      if (oauthUser && oauthUser.authenticated) {
        console.log('OAuth session found:', oauthUser);
        setUser(oauthUser);
        setLoading(false);
        return;
      }
      
      // Fallback to existing identity service (for guest/email users)
      const identity = await IdentityService.bootstrap();
      if (identity) {
        setUser(identity);
      }
    } catch (err) {
      console.error('Bootstrap error:', err);
      setBootstrapError('Failed to verify user identity');
      IdentityService.clearIdentity();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  // Re-check auth when navigating to protected routes
  useEffect(() => {
    if (['/dashboard', '/profile', '/previous-trips'].includes(location.pathname) && !user) {
      bootstrap();
    }
  }, [location.pathname, user]);

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}>
          <p>Initializing...</p>
        </div>
      </div>
    );
  }

  if (bootstrapError) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.errorBox}>
          <p>{bootstrapError}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Main app with navbar and routes
  return (
    <>
      <Navbar user={user} />
      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f7f9fc' }}>
        <Routes>
          <Route path="/" element={<Landing user={user} />} />
          {/* Spring Security OAuth redirects */}
          <Route path="/auth/google/callback" element={<GoogleCallback />} />
          <Route path="/login/success" element={<LoginSuccess />} />
          <Route path="/login/failure" element={<LoginFailure />} />
          <Route
            path="/dashboard"
            element={user ? <Dashboard user={user} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/trip/:tripId"
            element={user ? <TripPage user={user} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/previous-trips"
            element={user ? <PreviousTrips user={user} /> : <Navigate to="/" replace />}
          />
          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} /> : <Navigate to="/" replace />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

const styles = {
  loadingContainer: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f9fc',
  },
  loadingSpinner: {
    textAlign: 'center',
    padding: '40px',
  },
  errorBox: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: '16px',
    padding: '10px 20px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
};

export default App;
