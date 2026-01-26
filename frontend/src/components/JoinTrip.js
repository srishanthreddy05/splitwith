import React, { useState } from 'react';

const JoinTrip = () => {
  const [tripId, setTripId] = useState('');
  const [userId, setUserId] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:9090/trips/${tripId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      setResponse(data);
      if (data.success) {
        setTripId('');
        setUserId('');
      }
    } catch (error) {
      setResponse({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Join Trip</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Trip ID"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Joining...' : 'Join Trip'}
        </button>
      </form>
      {response && (
        <div style={{ ...styles.response, backgroundColor: response.success ? '#d4edda' : '#f8d7da' }}>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { padding: '20px', border: '1px solid #ddd', borderRadius: '5px', marginBottom: '20px' },
  form: { display: 'flex', flexDirection: 'column', gap: '10px' },
  input: { padding: '8px', fontSize: '14px', borderRadius: '3px', border: '1px solid #ccc' },
  button: { padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  response: { marginTop: '15px', padding: '10px', borderRadius: '3px', overflow: 'auto' }
};

export default JoinTrip;
