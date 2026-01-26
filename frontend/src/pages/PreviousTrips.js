/**
 * Previous Trips: Shows completed/past trips
 * Placeholder for MVP
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdentity, tripAPI } from '../services/apiClient';

const PreviousTrips = () => {
  const navigate = useNavigate();
  const { userId } = getUserIdentity();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadTrips = useCallback(async () => {
    try {
      setLoading(true);
      const allTrips = await tripAPI.getUserTrips(userId);
      // Filter completed trips
      const completedTrips = allTrips.filter(t => t.status === 'COMPLETED');
      setTrips(completedTrips);
    } catch (err) {
      console.error('Error loading previous trips:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>Previous Trips</h1>
        
        {trips.length > 0 ? (
          <div style={styles.tripsList}>
            {trips.map(trip => (
              <div 
                key={trip.id}
                style={styles.tripCard}
                onClick={() => navigate(`/trip/${trip.id}`)}
              >
                <h3 style={styles.tripName}>{trip.name}</h3>
                <p style={styles.tripMeta}>
                  {trip.members.length} members • Completed
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No completed trips yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              style={styles.primaryButton}
            >
              Start a New Trip
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    padding: '40px 20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#718096',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a202c',
    marginBottom: '30px',
    margin: '0 0 30px 0',
  },
  tripsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '1px solid #e2e8f0',
  },
  tripName: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  tripMeta: {
    fontSize: '12px',
    color: '#718096',
    margin: '0',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '60px 30px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  emptyText: {
    fontSize: '16px',
    color: '#718096',
    marginBottom: '20px',
  },
  primaryButton: {
    padding: '12px 32px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
};

export default PreviousTrips;
