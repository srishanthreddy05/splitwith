import React, { useState } from 'react';
import { tripAPI } from '../services/api';

const CreateTrip = () => {
  const [tripName, setTripName] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [createdByName, setCreatedByName] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await tripAPI.create(tripName, createdBy, createdByName);
      setResponse(data);
      if (data.success) {
        setTripName('');
        setCreatedBy('');
        setCreatedByName('');
      }
    } catch (error) {
      setResponse({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.contentWrapper}>
        <h2 style={styles.title}>Create a New Trip</h2>
        <p style={styles.subtitle}>Start planning your next adventure</p>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Trip Name</label>
            <input
              type="text"
              placeholder="e.g., Summer Vacation to Europe"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Creator User ID</label>
            <input
              type="text"
              placeholder="Your user ID"
              value={createdBy}
              onChange={(e) => setCreatedBy(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Creator Name</label>
            <input
              type="text"
              placeholder="Your name"
              value={createdByName}
              onChange={(e) => setCreatedByName(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          
          <button type="submit" disabled={loading} style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? '✓ Creating...' : '+ Create Trip'}
          </button>
        </form>
        
        {response && (
          <div style={{
            ...styles.response,
            backgroundColor: response.success ? '#d4edda' : '#f8d7da',
            borderLeft: `4px solid ${response.success ? '#28a745' : '#dc3545'}`
          }}>
            <div style={{ color: response.success ? '#28a745' : '#721c24', fontWeight: 'bold', marginBottom: '8px' }}>
              {response.success ? '✓ Trip created successfully!' : '✗ Error creating trip'}
            </div>
            {!response.success && <p style={{ margin: 0 }}>{response.error}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '24px',
    marginBottom: '20px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '12px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
  },
  contentWrapper: {
    background: 'white',
    padding: '32px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  title: {
    margin: '0 0 8px 0',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Arial, sans-serif'
  },
  subtitle: {
    margin: '0 0 24px 0',
    fontSize: '14px',
    color: '#888',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#555',
    fontFamily: 'Arial, sans-serif'
  },
  input: {
    padding: '12px 16px',
    fontSize: '15px',
    border: '2px solid #e0e0e0',
    borderRadius: '6px',
    fontFamily: 'Arial, sans-serif',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box',
    width: '100%',
    outlineColor: 'transparent'
  },
  button: {
    padding: '14px 24px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontFamily: 'Arial, sans-serif',
    marginTop: '8px',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
  },
  response: {
    marginTop: '20px',
    padding: '16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontFamily: 'Arial, sans-serif'
  }
};

export default CreateTrip;
