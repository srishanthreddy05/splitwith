import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { guestIdentity } from '../utils/guestIdentity';
import { tripAPI } from '../services/api';

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

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
      if (result?.success && Array.isArray(result?.data)) {
        setTrips(result.data);
      } else if (Array.isArray(result)) {
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
    return (
      <div style={styles.container}>
        <div style={styles.content}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Back</button>

        <div style={styles.header}>
          <h1 style={styles.title}>My Trips</h1>
        </div>

        {trips.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>You haven't joined any trips yet</p>
            <button onClick={() => navigate('/create-trip')} style={styles.createButton}>
              Create Your First Trip
            </button>
          </div>
        ) : (
          <div style={styles.tripsGrid}>
            {trips.map(trip => (
              <div
                key={trip.id}
                style={styles.tripCard}
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <h3 style={styles.tripName}>{trip.name}</h3>
                <p style={styles.tripCode}>Code: {trip.tripCode}</p>
                <p style={styles.tripMembers}>{trip.members.length} members</p>
                <span style={{
                  ...styles.statusBadge,
                  ...(trip.status === 'ACTIVE' ? styles.activeBadge : styles.completedBadge)
                }}>
                  {trip.status}
                </span>
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
    padding: '20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '1000px',
    margin: '0 auto',
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
    marginBottom: '40px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: '60px 40px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  emptyText: {
    fontSize: '16px',
    color: '#7f8c8d',
    marginBottom: '30px',
  },
  createButton: {
    padding: '14px 28px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  tripsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
  },
  tripCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    position: 'relative',
  },
  tripName: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: '10px',
  },
  tripCode: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '5px',
    fontFamily: 'monospace',
  },
  tripMembers: {
    fontSize: '14px',
    color: '#7f8c8d',
    marginBottom: '15px',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  activeBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  completedBadge: {
    backgroundColor: '#d1ecf1',
    color: '#0c5460',
  },
};

export default MyTrips;
