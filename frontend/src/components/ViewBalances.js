import React, { useState } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

const ViewBalances = () => {
  const [tripId, setTripId] = useState('');
  const [balances, setBalances] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFetch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/trips/${tripId}/balances`);
      const data = await res.json();
      if (data.success) {
        setBalances(data.data);
      } else {
        setError(data.error || 'Failed to fetch balances');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>View Balances</h2>
      <form onSubmit={handleFetch} style={styles.form}>
        <input
          type="text"
          placeholder="Trip ID"
          value={tripId}
          onChange={(e) => setTripId(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Fetching...' : 'Get Balances'}
        </button>
      </form>

      {error && (
        <div style={{ ...styles.response, backgroundColor: '#f8d7da' }}>
          <p style={{ color: '#721c24', margin: 0 }}>Error: {error}</p>
        </div>
      )}

      {balances && (
        <div style={{ ...styles.response, backgroundColor: '#d4edda' }}>
          <h3>Trip Balances</h3>
          {balances && balances.length > 0 ? (
            <table style={styles.table}>
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>User Name</th>
                  <th>Balance</th>
                </tr>
              </thead>
              <tbody>
                {balances.map((balance, idx) => (
                  <tr key={idx}>
                    <td>{balance.userId}</td>
                    <td>{balance.userName}</td>
                    <td style={{ fontWeight: 'bold', color: balance.balance > 0 ? 'green' : balance.balance < 0 ? 'red' : 'black' }}>
                      {balance.balance > 0 ? '+' : ''}{balance.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No balances to display</p>
          )}
          <pre style={{ marginTop: '15px' }}>{JSON.stringify(balances, null, 2)}</pre>
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
  response: { marginTop: '15px', padding: '10px', borderRadius: '3px', overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: '15px' }
};

export default ViewBalances;
