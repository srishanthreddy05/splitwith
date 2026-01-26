import React, { useState } from 'react';

const GetUserTrips = () => {
  const [userId, setUserId] = useState('');
  const [trips, setTrips] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:9090/trips/user/${userId}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.data);
      } else {
        setError(data.error || 'Failed to fetch trips');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Get User Trips</h2>
      <form onSubmit={handleFetch} style={styles.form}>
        <input
          type="text"
          placeholder="User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Fetching...' : 'Get Trips'}
        </button>
      </form>

      {error && (
        <div style={{ ...styles.response, backgroundColor: '#f8d7da' }}>
          <p style={{ color: '#721c24', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {trips && (
        <div style={{ ...styles.response, backgroundColor: '#d4edda' }}>
          <h3>Trips</h3>
          {trips && trips.length > 0 ? (
            <div>
              {trips.map((trip, idx) => (
                <div key={idx} style={{ marginBottom: '15px', padding: '10px', border: '1px solid #ccc', borderRadius: '3px' }}>
                  <p><strong>Trip Name:</strong> {trip.name}</p>
                  <p><strong>Trip ID:</strong> {trip.id}</p>
                  <p><strong>Created By:</strong> {trip.createdBy}</p>
                  <p><strong>Members:</strong> {trip.members.join(', ')}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No trips found</p>
          )}
          <pre style={{ marginTop: '15px' }}>{JSON.stringify(trips, null, 2)}</pre>
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

export default GetUserTrips;
