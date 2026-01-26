import React from 'react';

const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <nav style={styles.nav}>
      <h1 style={styles.title}>Splitwith - Phase 1 Frontend</h1>
      <div style={styles.tabs}>
        {['Users', 'Trips', 'Join', 'Expenses', 'Balances', 'UserTrips'].map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            style={{
              ...styles.tab,
              backgroundColor: activeTab === tab ? '#007bff' : '#f0f0f0',
              color: activeTab === tab ? 'white' : 'black',
              fontWeight: activeTab === tab ? 'bold' : 'normal'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </nav>
  );
};

const styles = {
  nav: { padding: '20px', backgroundColor: '#f5f5f5', borderBottom: '2px solid #ddd' },
  title: { margin: '0 0 15px 0', fontSize: '24px', color: '#333' },
  tabs: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tab: { padding: '10px 15px', border: 'none', borderRadius: '3px', cursor: 'pointer', fontSize: '14px' }
};

export default Navigation;
