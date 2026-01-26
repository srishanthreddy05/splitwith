import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestIdentity } from '../utils/guestIdentity';
import { tripAPI } from '../services/api';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [tripName, setTripName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { userId } = guestIdentity.get();
      
      if (!userId) {
        setError('Please refresh the page to initialize your account');
        setLoading(false);
        return;
      }

      const result = await tripAPI.create(tripName, userId);

      if (result.success) {
        navigate(`/trip/${result.data.id}`);
      } else {
        setError(result.error || 'Failed to create trip');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Back</button>
        
        <div style={styles.header}>
          <h1 style={styles.title}>Create a New Trip</h1>
          <p style={styles.subtitle}>You'll be added as the first member automatically</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Trip Name</label>
            <input
              type="text"
              placeholder="e.g., Weekend Getaway, Goa Trip 2026"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
              style={styles.input}
              autoFocus
            />
          </div>

          {error && (
            <div style={styles.error}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </form>

        <div style={styles.infoBox}>
          <p style={styles.infoText}>
            <strong>What happens next?</strong>
          </p>
          <ul style={styles.infoList}>
            <li>You'll get a unique trip code</li>
            <li>Share the code with friends to invite them</li>
            <li>You'll approve join requests from others</li>
            <li>Add expenses and track balances easily</li>
          </ul>
        </div>
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
    backgroundColor: '#f7f9fc'
  },
  content: {
    maxWidth: '500px',
    width: '100%'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
    padding: '5px 0'
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    margin: '0 0 10px 0'
  },
  subtitle: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: 0
  },
  form: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    boxSizing: 'border-box'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  submitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  },
  infoBox: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
  },
  infoText: {
    fontSize: '14px',
    color: '#2c3e50',
    margin: '0 0 10px 0'
  },
  infoList: {
    fontSize: '13px',
    color: '#7f8c8d',
    lineHeight: '1.8',
    paddingLeft: '20px',
    margin: 0
  }
};

export default CreateTrip;
