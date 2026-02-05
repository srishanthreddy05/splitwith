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
    <div style={styles.container} className="landing-container">
      <div style={styles.content}>
        <div style={styles.header} className="landing-header">
          <h1 style={styles.title} className="landing-title">Splitwith</h1>
          <p style={styles.subtitle} className="landing-subtitle">
            Split trip expenses with friends, stress-free
          </p>
          {user && (
            <p style={styles.welcome} className="landing-welcome">
              Welcome back, <strong>{user.displayName}</strong>! 👋
            </p>
          )}
        </div>

        {/* Main Actions */}
        <div style={styles.cardsContainer} className="landing-cards">
          <div 
            style={styles.card}
            className="landing-card"
            onClick={handleCreateTrip}
          >
            <div style={styles.cardIcon} className="landing-card-icon">✨</div>
            <h2 style={styles.cardTitle} className="landing-card-title">Create a Trip</h2>
            <p style={styles.cardDescription}>
              Start a new trip and get a shareable code to invite friends
            </p>
            <span style={styles.cardHint} className="landing-card-hint">→</span>
          </div>

          <div 
            style={styles.card}
            className="landing-card"
            onClick={handleJoinTrip}
          >
            <div style={styles.cardIcon} className="landing-card-icon">🎫</div>
            <h2 style={styles.cardTitle} className="landing-card-title">Join a Trip</h2>
            <p style={styles.cardDescription}>
              Have a trip code? Join an existing trip instantly
            </p>
            <span style={styles.cardHint} className="landing-card-hint">→</span>
          </div>
        </div>

        {/* Secondary Action */}
        {user && (
          <div style={styles.secondaryAction} className="landing-secondary">
            <button 
              onClick={() => navigate('/previous-trips')}
              style={styles.secondaryButton}
              className="landing-secondary-button"
            >
              View My Previous Trips
            </button>
          </div>
        )}

        {/* Info Box */}
        <div style={styles.infoBox} className="landing-info">
          <p style={styles.infoText} className="landing-info-text">
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
    padding: '20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '600px',
    width: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  subtitle: {
    fontSize: '16px',
    color: '#718096',
    margin: '0 0 16px 0',
  },
  welcome: {
    fontSize: '15px',
    color: '#4299e1',
    margin: '0',
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '16px',
    marginBottom: '30px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    position: 'relative',
    border: '1px solid #e2e8f0',
  },
  cardIcon: {
    fontSize: '36px',
    marginBottom: '12px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 8px 0',
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
    marginBottom: '24px',
  },
  secondaryButton: {
    padding: '12px 24px',
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
    padding: '16px',
    textAlign: 'center',
  },
  infoText: {
    fontSize: '13px',
    color: '#2d3748',
    margin: '0',
    lineHeight: '1.6',
  },
};

// Add media query styles for responsive design
if (typeof document !== 'undefined') {
  const styleTag = document.getElementById('landing-responsive-styles') || document.createElement('style');
  styleTag.id = 'landing-responsive-styles';
  styleTag.innerHTML = `
    @media (min-width: 640px) {
      .landing-container {
        padding: 40px 20px !important;
      }
      .landing-header {
        margin-bottom: 50px !important;
      }
      .landing-title {
        font-size: 48px !important;
      }
      .landing-subtitle {
        font-size: 18px !important;
        margin-bottom: 20px !important;
      }
      .landing-welcome {
        font-size: 16px !important;
      }
      .landing-cards {
        grid-template-columns: 1fr 1fr !important;
        gap: 20px !important;
        margin-bottom: 40px !important;
      }
      .landing-card {
        padding: 30px !important;
      }
      .landing-card-icon {
        font-size: 40px !important;
        margin-bottom: 16px !important;
      }
      .landing-card-title {
        margin-bottom: 12px !important;
      }
      .landing-secondary {
        margin-bottom: 30px !important;
      }
      .landing-secondary-button {
        padding: 12px 32px !important;
      }
      .landing-info {
        padding: 20px !important;
      }
      .landing-info-text {
        font-size: 14px !important;
      }
      .landing-card:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12) !important;
      }
      .landing-card:hover .landing-card-hint {
        opacity: 1 !important;
      }
    }
  `;
  if (!document.getElementById('landing-responsive-styles')) {
    document.head.appendChild(styleTag);
  }
}

export default Landing;
