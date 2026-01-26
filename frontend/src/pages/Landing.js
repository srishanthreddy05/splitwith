/**
 * Landing page: Main entry point after user identity is set
 * Shows welcome message and two main actions: Create Trip or Join Trip
 * If user is not authenticated, show AuthChoiceModal
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthChoiceModal from '../components/AuthChoiceModal';

const Landing = ({ user }) => {
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authAction, setAuthAction] = useState(null);

  const handleCreateTrip = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthAction('create');
      setShowAuthModal(true);
    }
  };

  const handleJoinTrip = () => {
    if (user) {
      navigate('/dashboard');
    } else {
      setAuthAction('join');
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (authResponse) => {
    // User is now authenticated, redirect to dashboard
    setShowAuthModal(false);
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.header}>
          <h1 style={styles.title}>Splitwith</h1>
          <p style={styles.subtitle}>
            Split trip expenses with friends, stress-free
          </p>
          {user && (
            <p style={styles.welcome}>
              Welcome back, <strong>{user.displayName}</strong>! 👋
            </p>
          )}
        </div>

        {/* Main Actions */}
        <div style={styles.cardsContainer}>
          <div 
            style={styles.card}
            onClick={handleCreateTrip}
          >
            <div style={styles.cardIcon}>✨</div>
            <h2 style={styles.cardTitle}>Create a Trip</h2>
            <p style={styles.cardDescription}>
              Start a new trip and get a shareable code to invite friends
            </p>
            <span style={styles.cardHint}>→</span>
          </div>

          <div 
            style={styles.card}
            onClick={handleJoinTrip}
          >
            <div style={styles.cardIcon}>🎫</div>
            <h2 style={styles.cardTitle}>Join a Trip</h2>
            <p style={styles.cardDescription}>
              Have a trip code? Join an existing trip instantly
            </p>
            <span style={styles.cardHint}>→</span>
          </div>
        </div>

        {/* Secondary Action */}
        {user && (
          <div style={styles.secondaryAction}>
            <button 
              onClick={() => navigate('/previous-trips')}
              style={styles.secondaryButton}
            >
              View My Previous Trips
            </button>
          </div>
        )}

        {/* Info Box */}
        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            💡 <strong>No login required!</strong> Your identity is saved in your browser. Share trip codes with friends to collaborate.
          </p>
        </div>
      </div>

      {showAuthModal && (
        <AuthChoiceModal
          action={authAction}
          onSuccess={handleAuthSuccess}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px 20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '18px',
    color: '#718096',
    margin: '0 0 20px 0',
  },
  welcome: {
    fontSize: '16px',
    color: '#4299e1',
    margin: '0',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '1px solid #e2e8f0',
  },
  cardIcon: {
    fontSize: '40px',
    marginBottom: '16px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  cardDescription: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
    lineHeight: '1.5',
  },
  cardHint: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    fontSize: '20px',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  secondaryAction: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  secondaryButton: {
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4299e1',
    backgroundColor: 'transparent',
    border: '2px solid #4299e1',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  infoBox: {
    backgroundColor: '#edf2f7',
    borderRadius: '8px',
    padding: '20px',
    textAlign: 'center',
  },
  infoText: {
    fontSize: '14px',
    color: '#2d3748',
    margin: '0',
    lineHeight: '1.6',
  },
};

export default Landing;
