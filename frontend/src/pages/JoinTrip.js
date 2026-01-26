import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestIdentity } from '../utils/guestIdentity';
import { tripAPI, joinRequestAPI } from '../services/api';

const JoinTrip = () => {
  const navigate = useNavigate();
  const [tripCode, setTripCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trip, setTrip] = useState(null);
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleLookup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setTrip(null);

    try {
      const result = await tripAPI.getByCode(tripCode.trim().toUpperCase());

      if (result.success) {
        setTrip(result.data);
      } else {
        setError(result.error || 'Trip not found');
      }
    } catch (err) {
      setError('Invalid trip code');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async () => {
    setLoading(true);
    setError(null);

    try {
      const { userId } = guestIdentity.get();

      if (!userId) {
        setError('Please refresh the page to initialize your account');
        setLoading(false);
        return;
      }

      const result = await joinRequestAPI.submit(trip.id, userId);

      if (result.success) {
        setRequestSubmitted(true);
      } else {
        setError(result.error || 'Failed to submit join request');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (requestSubmitted) {
    return (
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>✅</div>
            <h2 style={styles.successTitle}>Request Sent!</h2>
            <p style={styles.successText}>
              Your join request has been sent to the trip creator.
              You'll be able to view the trip once they approve your request.
            </p>
            <button onClick={() => navigate('/')} style={styles.button}>
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Back</button>

        <div style={styles.header}>
          <h1 style={styles.title}>Join a Trip</h1>
          <p style={styles.subtitle}>Enter the trip code to join</p>
        </div>

        {!trip ? (
          <form onSubmit={handleLookup} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Trip Code</label>
              <input
                type="text"
                placeholder="Enter 6-character code"
                value={tripCode}
                onChange={(e) => setTripCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
                style={{...styles.input, ...styles.codeInput}}
                autoFocus
              />
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} style={styles.button}>
              {loading ? 'Looking up...' : 'Find Trip'}
            </button>
          </form>
        ) : (
          <div style={styles.tripCard}>
            <h3 style={styles.tripName}>{trip.name}</h3>
            <p style={styles.tripDetail}>Code: {trip.tripCode}</p>
            <p style={styles.tripDetail}>Members: {trip.members.length}</p>

            {error && <div style={styles.error}>{error}</div>}

            <button onClick={handleJoinRequest} disabled={loading} style={styles.button}>
              {loading ? 'Requesting...' : 'Request to Join'}
            </button>

            <button onClick={() => setTrip(null)} style={styles.cancelButton}>
              Try Different Code
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '500px',
    width: '100%',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 10px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: 0,
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box',
  },
  codeInput: {
    fontFamily: 'monospace',
    fontSize: '24px',
    textAlign: 'center',
    letterSpacing: '2px',
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px',
  },
  button: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tripCard: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  tripName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '15px',
  },
  tripDetail: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '10px',
  },
  cancelButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: 'transparent',
    color: '#007bff',
    border: '1px solid #007bff',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  successBox: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  },
  successIcon: {
    fontSize: '64px',
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '15px',
  },
  successText: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '30px',
    lineHeight: '1.6',
  },
};

export default JoinTrip;
