/**
 * ProfilePage: User profile management and account settings.
 * Shows:
 * - Display name (editable)
 * - Email (if exists)
 * - Account type (Guest, Google, Email)
 * - Upgrade options (if guest)
 * - Logout
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import IdentityService from '../services/IdentityService';
import authService from '../services/authService';
import UpgradeAccountModal from '../components/UpgradeAccountModal';
import { API_BASE_URL } from '../services/apiConfig';

const ProfilePage = ({ user: userProp }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingName, setEditingName] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Support both OAuth users (from props) and localStorage users
  const localUserId = IdentityService.getUserId();
  const userId = userProp?.id || localUserId;
  const isOAuthUser = userProp?.authenticated === true;

  const loadProfile = useCallback(async () => {
    // For OAuth users, use the data from props directly
    if (isOAuthUser && userProp) {
      setUser({
        id: userProp.id,
        displayName: userProp.name,
        email: userProp.email,
        picture: userProp.picture,
        authType: 'GOOGLE',
      });
      setNewDisplayName(userProp.name);
      setLoading(false);
      return;
    }
    
    // For localStorage users, fetch from backend
    if (!userId) {
      setError('No user found');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/${userId}`);
      const data = await response.json();
      if (data.success) {
        setUser(data.data);
        setNewDisplayName(data.data.displayName);
      } else {
        setError('Failed to load profile');
      }
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId, isOAuthUser, userProp]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleUpdateName = async () => {
    if (!newDisplayName || newDisplayName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setUpdateLoading(true);
    setError('');

    try {
      const updatedUser = await IdentityService.updateProfile(
        userId,
        newDisplayName.trim(),
        user.email
      );

      setUser(updatedUser);
      setEditingName(false);
    } catch (err) {
      setError(err.message || 'Failed to update name');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to logout?')) {
      if (isOAuthUser) {
        // OAuth logout
        await authService.logout();
      } else {
        // LocalStorage logout
        IdentityService.logout();
      }
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={styles.container}>
        <p>Profile not found</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ← Back to Dashboard
        </button>

        <h1 style={styles.title}>My Profile</h1>

        {error && <div style={styles.errorBox}>{error}</div>}

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Account Information</h3>

          {/* Display Name */}
          <div style={styles.field}>
            <label style={styles.label}>Display Name</label>
            {editingName ? (
              <div style={styles.editField}>
                <input
                  type="text"
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  style={styles.input}
                  disabled={updateLoading}
                />
                <button
                  onClick={handleUpdateName}
                  style={styles.saveButton}
                  disabled={updateLoading}
                >
                  {updateLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewDisplayName(user.displayName);
                  }}
                  style={{ ...styles.button, ...styles.cancelButton }}
                  disabled={updateLoading}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div style={styles.fieldValue}>
                <p style={styles.value}>{user.displayName}</p>
                <button
                  onClick={() => setEditingName(true)}
                  style={styles.editButton}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <p style={styles.value}>
              {user.email || '(Not set)'}
            </p>
          </div>

          {/* Account Type */}
          <div style={styles.field}>
            <label style={styles.label}>Account Type</label>
            <p style={styles.value}>{getAccountTypeLabel(user.authProvider)}</p>
          </div>
        </div>

        {/* Upgrade options for guests */}
        {user.authProvider === 'GUEST' && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Upgrade Account</h3>
            <p style={styles.description}>
              Secure your account by upgrading from guest to email or Google
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              style={styles.upgradeButton}
            >
              Upgrade Account
            </button>
          </div>
        )}

        {/* Logout */}
        <div style={styles.section}>
          <button onClick={handleLogout} style={styles.logoutButton}>
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <UpgradeAccountModal
          userId={userId}
          onSuccess={() => {
            setShowUpgradeModal(false);
            loadProfile();
          }}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}
    </div>
  );
};

const getAccountTypeLabel = (authProvider) => {
  const labels = {
    GUEST: '👤 Guest',
    EMAIL: '✉️ Email',
    GOOGLE: '🔵 Google',
  };
  return labels[authProvider] || authProvider;
};

const styles = {
  container: {
    minHeight: 'calc(100vh - 80px)',
    backgroundColor: '#f7f9fc',
    padding: '40px 20px',
  },
  content: {
    maxWidth: '600px',
    margin: '0 auto',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#4299e1',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 30px 0',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 20px 0',
  },
  description: {
    fontSize: '14px',
    color: '#718096',
    margin: '0 0 16px 0',
  },
  field: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#4a5568',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  value: {
    fontSize: '16px',
    color: '#1a202c',
    margin: '0',
  },
  fieldValue: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  editField: {
    display: 'flex',
    gap: '8px',
  },
  input: {
    flex: 1,
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '8px',
    outline: 'none',
  },
  editButton: {
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  saveButton: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    backgroundColor: '#48bb78',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 16px',
    fontSize: '13px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  cancelButton: {
    backgroundColor: '#e2e8f0',
    color: '#4a5568',
  },
  upgradeButton: {
    width: '100%',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  logoutButton: {
    width: '100%',
    padding: '14px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: '#f56565',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    color: '#c53030',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '13px',
  },
};

export default ProfilePage;
