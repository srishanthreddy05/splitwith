import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestIdentity } from '../utils/guestIdentity';
import { tripAPI } from '../services/api';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const { userId } = guestIdentity.get();
      
      if (!userId) {
        setLoading(false);
        return;
      }

      const result = await tripAPI.getUserTrips(userId);

      // Handle API response with success flag
      if (result?.success && Array.isArray(result?.data)) {
        setTrips(result.data);
      } else if (Array.isArray(result)) {
        // Direct array response
        setTrips(result);
      } else {
        setTrips([]);
      }
    } catch (err) {
      console.error('Failed to load trips:', err);
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={styles.loading}>Loading your trips...</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}> Back to Home</button>
        
        <h1 style={styles.title}>My Trips</h1>

        {error && <div style={styles.error}>{error}</div>}

        {trips.length === 0 ? (
          <div style={styles.emptyState}>
            <p>You haven't created or joined any trips yet.</p>
            <button onClick={() => navigate('/create-trip')} style={styles.primaryButton}>
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {trips.map(trip => (
              <div key={trip.id} style={styles.card} onClick={() => navigate(`/trip/${trip.id}`)}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>{trip.name}</h3>
                  <span style={{...styles.statusBadge, backgroundColor: trip.status === 'ACTIVE' ? '#d4f5d4' : '#f2f2f2'}}>
                    {trip.status === 'ACTIVE' ? 'Active' : 'Completed'}
                  </span>
                </div>
                <p style={styles.cardCode}>Code: {trip.tripCode}</p>
                <p style={styles.cardMembers}>{trip.members.length} member(s)</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f7f9fc',
    padding: '20px'
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px'
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '20px'
  },
  error: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '14px'
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px'
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
  },
  primaryButton: {
    marginTop: '15px',
    padding: '12px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '15px'
  },
  card: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0
  },
  statusBadge: {
    padding: '6px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    color: '#2c3e50'
  },
  cardCode: {
    fontSize: '14px',
    color: '#7f8c8d',
    margin: '5px 0'
  },
  cardMembers: {
    fontSize: '13px',
    color: '#95a5a6'
  }
};

export default MyTrips;
