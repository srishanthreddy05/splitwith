/**
 * Main App Component
 * 
 * Architecture:
 * 1. Check if user identity (userId + userName) exists in localStorage
 * 2. If not, show NameModal to collect name and generate UUID
 * 3. Once identity is set, show Navbar and routes
 * 
 * Routes:
 * / - Landing page
 * /dashboard - Dashboard (active trip or create/join)
 * /trip/:tripId - Trip detail page
 * /previous-trips - Completed trips
 * /profile - User profile
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { hasUserIdentity } from './services/apiClient';
import NameModal from './components/NameModal';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import TripPage from './pages/TripPage';
import PreviousTrips from './pages/PreviousTrips';
import Profile from './pages/Profile';

function App() {
  const [identitySet, setIdentitySet] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user identity is already set in localStorage
    const hasIdentity = hasUserIdentity();
    setIdentitySet(hasIdentity);
    setLoading(false);
  }, []);

  const handleNameSet = () => {
    setIdentitySet(true);
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  // Show name modal if identity not set
  if (!identitySet) {
    return <NameModal onNameSet={handleNameSet} />;
  }

  // Main app with navbar and routes
  return (
    <Router>
      <Navbar />
      <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: '#f7f9fc' }}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/trip/:tripId" element={<TripPage />} />
          <Route path="/previous-trips" element={<PreviousTrips />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
