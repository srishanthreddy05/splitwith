import React, { useState } from 'react';
import { API_BASE_URL } from '../services/apiConfig';

const CreateUser = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email })
      });
      const data = await res.json();
      setResponse(data);
      if (data.success) {
        setName('');
        setEmail('');
      }
    } catch (error) {
      setResponse({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create User</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating...' : 'Create User'}
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

export default CreateUser;
