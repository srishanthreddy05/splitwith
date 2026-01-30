import React, { useState } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

const CreateExpense = () => {
  const [tripId, setTripId] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitBetween, setSplitBetween] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const splitArray = splitBetween.split(',').map(id => id.trim());
      const res = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tripId,
          paidBy,
          amount: parseFloat(amount),
          description,
          splitBetween: splitArray
        })
      });
      const data = await res.json();
      setResponse(data);
      if (data.success) {
        setTripId('');
        setPaidBy('');
        setAmount('');
        setDescription('');
        setSplitBetween('');
      }
    } catch (error) {
      setResponse({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create Expense</h2>
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
          placeholder="Paid By (User ID)"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="Split Between (comma-separated User IDs)"
          value={splitBetween}
          onChange={(e) => setSplitBetween(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating...' : 'Create Expense'}
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

export default CreateExpense;
