/**
 * Dashboard: Shows current active trip or allows creating/joining a new trip
 * This is the user's home page after landing
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserIdentity, tripAPI } from '../services/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const { userId, userName } = getUserIdentity();
  const [tripData, setTripData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'join'
  const [tripCode, setTripCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);

  const loadUserTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const trips = await tripAPI.getUserTrips(userId);
      console.log('Loaded trips:', trips);
      // Get first active trip (this is simplified - future could show multiple)
      if (trips && trips.length > 0) {
        const activeTrip = trips.find(t => t.status === 'ACTIVE') || trips[0];
        setTripData(activeTrip);
      } else {
        setError('No trips found');
      }
    } catch (err) {
      console.error('Error loading trips:', err);
      setError('Failed to load trips: ' + (err?.message || err));
      setTripData(null);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserTrips();
  }, [loadUserTrips]);

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    
    if (!tripCode.trim()) {
      setJoinError('Please enter a trip code');
      return;
    }

    try {
      setJoinLoading(true);
      setJoinError('');

      // Find trip by code
      const trip = await tripAPI.getByCode(tripCode.trim().toUpperCase());
      
      // Create join request instead of directly joining
      // The API will handle sending a request that the trip creator can approve
      await tripAPI.joinTrip(trip.id, userId);

      // Success message
      setJoinError(''); // Clear error
      alert(`Join request sent! The trip creator will need to approve you.`);
      setTripCode('');
      setActiveTab('active');
    } catch (err) {
      setJoinError(err || 'Trip not found or could not send join request');
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCreateTrip = () => {
    // Simple modal to create a trip
    const tripName = prompt('Enter trip name:');
    if (tripName && tripName.trim()) {
      createTrip(tripName.trim());
    }
  };

  const createTrip = async (tripName) => {
    try {
      const newTrip = await tripAPI.create(tripName, userId, userName);
      navigate(`/trip/${newTrip.id}`);
    } catch (err) {
      alert('Error creating trip: ' + err);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading trips...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error}</p>
          <button 
            onClick={() => loadUserTrips()}
            style={styles.primaryButton}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {tripData ? (
          // Show current trip
          <div style={styles.tripCard}>
            <h2 style={styles.tripTitle}>{tripData.name}</h2>
            <p style={styles.tripCode}>Code: <strong>{tripData.tripCode}</strong></p>
            <p style={styles.tripInfo}>
              {tripData.members.length} members • {tripData.status === 'ACTIVE' ? 'Active' : 'Completed'}
            </p>
            <button
              onClick={() => navigate(`/trip/${tripData.id}`)}
              style={styles.primaryButton}
            >
              Open Trip Details
            </button>
          </div>
        ) : (
          // Show empty state
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>
              You are not part of any active trip yet.
            </p>
            <p style={styles.emptySubtext}>
              Create a new trip or join an existing one!
            </p>
          </div>
        )}

        {/* Tabs for Create/Join */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('create')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'create' ? '#4299e1' : '#e2e8f0',
              color: activeTab === 'create' ? 'white' : '#4a5568',
            }}
          >
            Create Trip
          </button>
          <button
            onClick={() => setActiveTab('join')}
            style={{
              ...styles.tabButton,
              backgroundColor: activeTab === 'join' ? '#4299e1' : '#e2e8f0',
              color: activeTab === 'join' ? 'white' : '#4a5568',
            }}
          >
            Join Trip
          </button>
        </div>

        {/* Create Tab */}
        {activeTab === 'create' && (
          <div style={styles.tabContent}>
            <p style={styles.tabDescription}>
              Create a new trip and share the code with friends
            </p>
            <button
              onClick={handleCreateTrip}
              style={styles.primaryButton}
            >
              Create New Trip
            </button>
          </div>
        )}

        {/* Join Tab */}
        {activeTab === 'join' && (
          <div style={styles.tabContent}>
            <p style={styles.tabDescription}>
              Enter the trip code from a friend to join
            </p>
            <form onSubmit={handleJoinTrip} style={styles.form}>
              <input
                type="text"
                placeholder="Enter trip code (e.g., ABC123)"
                value={tripCode}
                onChange={(e) => {
                  setTripCode(e.target.value.toUpperCase());
                  setJoinError('');
                }}
                style={styles.input}
                disabled={joinLoading}
              />
              {joinError && <p style={styles.error}>{joinError}</p>}
              <button
                type="submit"
                style={styles.primaryButton}
                disabled={joinLoading}
              >
                {joinLoading ? 'Joining...' : 'Join Trip'}
              </button>
            </form>
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
  errorBox: {
    backgroundColor: '#fed7d7',
    borderRadius: '8px',
    padding: '20px',
  },
  errorText: {
    color: '#c53030',
    margin: '0 0 15px 0',
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    border: '2px solid #bee3f8',
  },
  tripTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 12px 0',
  },
  tripCode: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 12px 0',
  },
  tripInfo: {
    fontSize: '14px',
    color: '#4a5568',
    margin: '0 0 20px 0',
  },
  emptyState: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '40px 30px',
    marginBottom: '30px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  emptyText: {
    fontSize: '16px',
    fontWeight: '500',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
  tabs: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '20px',
  },
  tabButton: {
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  tabContent: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  tabDescription: {
    fontSize: '14px',
    color: '#718096',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
  },
  primaryButton: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  error: {
    color: '#f56565',
    fontSize: '12px',
    margin: '0',
  },
};

export default Dashboard;
