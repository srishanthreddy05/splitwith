import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getUserIdentity, tripAPI, joinRequestAPI } from '../services/apiClient';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userId, userName } = getUserIdentity();
  const [activeTrips, setActiveTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('create');
  const [tripCode, setTripCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [completeLoading, setCompleteLoading] = useState({});

  const loadUserTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const trips = await tripAPI.getUserTrips(userId);
      const active = Array.isArray(trips) ? trips.filter(t => t.status === 'ACTIVE') : [];
      setActiveTrips(active);
    } catch (err) {
      setError('Failed to load trips: ' + (err?.message || err));
      setActiveTrips([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadUserTrips();
  }, [loadUserTrips, location]);

  const handleCreateTrip = async () => {
    const tripName = window.prompt('Name your trip:');
    if (!tripName || !tripName.trim()) return;

    setError('');
    try {
      const newTrip = await tripAPI.create(tripName.trim(), userId, userName);
      navigate(`/trip/${newTrip.id}`);
    } catch (err) {
      setError('Failed to create trip: ' + (err?.message || err));
    }
  };

  const handleJoinTrip = async (e) => {
    e.preventDefault();
    setJoinError('');
    setJoinMessage('');
    const code = tripCode.trim().toUpperCase();
    if (!code) {
      setJoinError('Enter a trip code');
      return;
    }

    setJoinLoading(true);
    try {
      const trip = await tripAPI.getByCode(code);
      if (!trip?.id) {
        setJoinError('Trip not found');
        return;
      }

      await joinRequestAPI.submit(trip.id, userId);
      setJoinMessage('Join request sent. The creator will approve it soon.');
      setTripCode('');
    } catch (err) {
      setJoinError('Failed to join: ' + (err?.message || err));
    } finally {
      setJoinLoading(false);
    }
  };

  const handleCompleteTrip = async (tripId) => {
    // Only creators can complete trips
    const targetTrip = activeTrips.find(t => t.id === tripId);
    if (!targetTrip || targetTrip.createdBy !== userId) {
      setError('Only the trip creator can complete this trip.');
      return;
    }

    setCompleteLoading(prev => ({ ...prev, [tripId]: true }));
    setError('');
    try {
      await tripAPI.updateStatus(tripId, 'COMPLETED');
      await loadUserTrips();
    } catch (err) {
      setError('Failed to complete trip: ' + (err?.message || err));
    } finally {
      setCompleteLoading(prev => ({ ...prev, [tripId]: false }));
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {loading && (
          <div style={styles.loadingBox}>Loading your trips...</div>
        )}

        {error && (
          <div style={styles.errorBox}>
            <p style={styles.errorText}>{error}</p>
          </div>
        )}

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
                  setJoinMessage('');
                }}
                style={styles.input}
                disabled={joinLoading}
              />
              {joinError && <p style={styles.error}>{joinError}</p>}
              {joinMessage && <p style={styles.success}>{joinMessage}</p>}
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

        <div style={styles.tripsSection}>
          <h2 style={styles.sectionTitle}>Your Active Trips</h2>
          {activeTrips && activeTrips.length > 0 ? (
            <div style={styles.tripsGrid}>
              {activeTrips.map(trip => (
                <div key={trip.id} style={styles.tripCard}>
                  <h3 style={styles.tripTitle}>{trip.name}</h3>
                  <p style={styles.tripCode}>Code: <strong>{trip.tripCode}</strong></p>
                  <p style={styles.tripInfo}>
                    {trip.members?.length || 0} members • {trip.status === 'ACTIVE' ? '✅ Active' : 'Completed'}
                  </p>
                  <div style={styles.tripActions}>
                    <button
                      onClick={() => navigate(`/trip/${trip.id}`)}
                      style={styles.primaryButton}
                    >
                      View Details
                    </button>
                    {trip.createdBy === userId && (
                      <button
                        onClick={() => handleCompleteTrip(trip.id)}
                        disabled={completeLoading[trip.id]}
                        style={styles.completeButton}
                      >
                        {completeLoading[trip.id] ? 'Completing...' : 'Complete'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                You are not part of any active trip yet.
              </p>
              <p style={styles.emptySubtext}>
                Create a new trip or join an existing one!
              </p>
            </div>
          )}
        </div>
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
    marginBottom: '20px',
  },
  errorText: {
    color: '#c53030',
    margin: '0',
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
    marginBottom: '20px',
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
  completeButton: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  tripsSection: {
    marginBottom: '30px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    marginBottom: '16px',
  },
  tripsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
    marginBottom: '30px',
  },
  tripTitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  tripActions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
  },
  tripTag: {
    padding: '4px 8px',
    fontSize: '12px',
    fontWeight: '600',
    color: '#234e52',
    backgroundColor: '#c6f6d5',
    borderRadius: '999px',
    whiteSpace: 'nowrap',
  },
  error: {
    color: '#f56565',
    fontSize: '12px',
    margin: '0',
  },
  success: {
    color: '#2f855a',
    fontSize: '12px',
    margin: '0',
  },
};

export default Dashboard;
