/**
 * Trip Page: Detailed view of a specific trip
 * Shows: Trip name, members, trip code, expenses, and balances
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { tripAPI, expenseAPI } from '../services/apiClient';

const TripPage = () => {
  const { tripId } = useParams();
  const [tripSummary, setTripSummary] = useState(null);
  const [trip, setTrip] = useState(null);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Expense modal state
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: '', // Will be set when modal opens
    splitType: 'all', // 'all' or 'selected'
    selectedMembers: [],
  });
  const [expenseLoading, setExpenseLoading] = useState(false);
  const [expenseError, setExpenseError] = useState('');

  const loadTripData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Load trip summary
      console.log('Loading trip summary for:', tripId);
      const summary = await tripAPI.getSummary(tripId);
      console.log('Trip summary loaded:', summary);
      setTripSummary(summary);

      // Load full trip details
      console.log('Loading trip details...');
      const tripDetails = await tripAPI.getById(tripId);
      console.log('Trip details loaded:', tripDetails);
      setTrip(tripDetails);

      // Load balances
      console.log('Loading trip balances...');
      const tripBalances = await tripAPI.getBalances(tripId);
      console.log('Trip balances loaded:', tripBalances);
      setBalances(tripBalances || []);
    } catch (err) {
      setError(err || 'Failed to load trip');
      console.error('Error loading trip:', err);
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  // Store member map in state so we can use it in expense form
  const [memberIdMap, setMemberIdMap] = useState({});

  // Load trip data on mount
  useEffect(() => {
    loadTripData();
  }, [loadTripData]);

  // Fetch member IDs when trip data changes
  useEffect(() => {
    const fetchMemberIds = async () => {
      try {
        // If we have trip summary with member names, fetch their user data
        if (tripSummary?.memberNames && tripSummary.memberNames.length > 0) {
          const mapData = {};
          
          // For each member name, try to fetch their user ID from the trip
          // The balances endpoint returns userName, so we can use that
          if (balances && balances.length > 0) {
            balances.forEach(balance => {
              if (balance.userId && balance.userName) {
                mapData[balance.userName] = balance.userId;
              }
            });
          }
          
          setMemberIdMap(mapData);
          console.log('Member ID map:', mapData);
        }
      } catch (err) {
        console.error('Error building member map:', err);
      }
    };
    
    fetchMemberIds();
  }, [tripSummary, balances]);

  const handleRefresh = () => {
    loadTripData();
  };

  const formatCurrency = (amount) => {
    // Amount might be in paise or might be returned in unexpected format
    if (!amount) return '0.00';
    
    // If the amount ends in 00 and is very large (suggesting it's been multiplied by 100 twice)
    // we need to handle it. Check if dividing by 10000 makes more sense.
    if (amount > 100000 && amount % 100 === 0 && Math.abs(amount / 10000) < 100000) {
      // Looks like it might have been multiplied by 100 extra
      return (amount / 10000).toFixed(2);
    }
    
    // Standard case: divide by 100 (paise to rupees)
    return (amount / 100).toFixed(2);
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    
    if (!expenseForm.description.trim()) {
      setExpenseError('Please enter expense description');
      return;
    }
    
    if (!expenseForm.amount || parseFloat(expenseForm.amount) <= 0) {
      setExpenseError('Please enter valid amount');
      return;
    }

    if (!expenseForm.paidBy) {
      setExpenseError('Please select who paid for this expense');
      return;
    }
    
    if (expenseForm.splitType === 'selected' && expenseForm.selectedMembers.length === 0) {
      setExpenseError('Please select at least one member to split with');
      return;
    }

    try {
      setExpenseLoading(true);
      setExpenseError('');

      // Use the memberIdMap we already built from balances data
      console.log('Using memberIdMap:', memberIdMap);
      console.log('Paid By:', expenseForm.paidBy);

      // Get the user ID for paidBy - must have a mapping
      let paidByUserId = memberIdMap[expenseForm.paidBy];
      if (!paidByUserId) {
        setExpenseError(`Could not find user ID for "${expenseForm.paidBy}". Please refresh and try again.`);
        setExpenseLoading(false);
        return;
      }

      // Determine split between - MUST use mapped IDs, not names
      let splitBetween = [];
      if (expenseForm.splitType === 'all') {
        // Get all member IDs from the map
        splitBetween = (tripSummary?.memberNames || []).map(name => {
          const id = memberIdMap[name];
          if (!id) {
            console.warn(`Could not map member name: ${name}`);
          }
          return id;
        }).filter(id => id); // Remove undefined values
      } else {
        // Map selected member names to user IDs
        splitBetween = expenseForm.selectedMembers.map(name => {
          const id = memberIdMap[name];
          if (!id) {
            console.warn(`Could not map selected member name: ${name}`);
          }
          return id;
        }).filter(id => id); // Remove undefined values
      }

      if (splitBetween.length === 0) {
        setExpenseError('Could not resolve member IDs. Please refresh the page and try again.');
        setExpenseLoading(false);
        return;
      }

      console.log('Expense data:', { tripId, paidByUserId, splitBetween });

      // Create expense (amount in paise)
      await expenseAPI.create({
        tripId,
        paidBy: paidByUserId,
        amount: Math.round(parseFloat(expenseForm.amount) * 100), // Convert to paise
        description: expenseForm.description,
        splitBetween, // Send user IDs only
      });

      // Reset form and reload data
      setShowExpenseModal(false);
      setExpenseForm({
        description: '',
        amount: '',
        paidBy: '',
        splitType: 'all',
        selectedMembers: [],
      });
      loadTripData();
    } catch (err) {
      setExpenseError(err || 'Failed to add expense');
    } finally {
      setExpenseLoading(false);
    }
  };

  const handleMemberToggle = (memberName) => {
    setExpenseForm(prev => {
      const selected = prev.selectedMembers.includes(memberName)
        ? prev.selectedMembers.filter(m => m !== memberName)
        : [...prev.selectedMembers, memberName];
      return { ...prev, selectedMembers: selected };
    });
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingBox}>Loading trip...</div>
      </div>
    );
  }

  if (error || !tripSummary) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>
          <p style={styles.errorText}>{error || 'Trip not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>{tripSummary.name}</h1>
          <p style={styles.tripCode}>
            Trip Code: <strong>{tripSummary.tripCode}</strong>
          </p>
        </div>

        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Members</p>
            <p style={styles.summaryValue}>{tripSummary.memberCount}</p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Total Expenses</p>
            <p style={styles.summaryValue}>
              ₹{formatCurrency(tripSummary.totalExpensesAmount)}
            </p>
          </div>
          <div style={styles.summaryCard}>
            <p style={styles.summaryLabel}>Status</p>
            <p style={styles.summaryValue}>
              {trip?.status === 'ACTIVE' ? 'Active' : 'Completed'}
            </p>
          </div>
        </div>

        {/* Members */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Members</h2>
          <div style={styles.membersList}>
            {tripSummary.memberNames && tripSummary.memberNames.length > 0 ? (
              tripSummary.memberNames.map((name, idx) => (
                <div key={idx} style={styles.memberItem}>
                  <span style={styles.memberAvatar}>👤</span>
                  <span style={styles.memberName}>{name}</span>
                </div>
              ))
            ) : (
              <p style={styles.emptyText}>No members yet</p>
            )}
          </div>
        </div>

        {/* Balances */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Who Owes What</h2>
          {balances && balances.length > 0 ? (
            <div style={styles.balancesList}>
              {balances.map((balance, idx) => (
                <div key={idx} style={styles.balanceItem}>
                  <div style={styles.balanceLeft}>
                    <p style={styles.balanceName}>{balance.userName}</p>
                    <p style={styles.balanceStatus}>
                      {balance.balance > 0
                        ? `Gets back ₹${formatCurrency(Math.abs(balance.balance))}`
                        : `Owes ₹${formatCurrency(Math.abs(balance.balance))}`}
                    </p>
                  </div>
                  <div
                    style={{
                      ...styles.balanceAmount,
                      color: balance.balance > 0 ? '#22863a' : '#f56565',
                    }}
                  >
                    {balance.balance > 0 ? '+' : ''}
                    ₹{formatCurrency(balance.balance)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={styles.emptyText}>All balanced!</p>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.actions}>
          <button
            onClick={handleRefresh}
            style={styles.secondaryButton}
          >
            Refresh
          </button>
          <button
            onClick={() => {
              // Find current user's name from trip summary
              const currentUserName = tripSummary?.memberNames?.[0] || '';
              setExpenseForm(prev => ({
                ...prev,
                paidBy: currentUserName,
              }));
              setShowExpenseModal(true);
            }}
            style={styles.primaryButton}
          >
            Add Expense
          </button>
        </div>

        {/* Expense Modal */}
        {showExpenseModal && (
          <div style={styles.modalOverlay} onClick={() => setShowExpenseModal(false)}>
            <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
              <h2 style={styles.modalTitle}>Add Expense</h2>
              
              {expenseError && <div style={styles.errorBox}>
                <p style={styles.errorText}>{expenseError}</p>
              </div>}

              <form onSubmit={handleAddExpense} style={styles.form}>
                {/* Description */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Hotel, Food, Transport"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({...expenseForm, description: e.target.value})}
                    style={styles.input}
                  />
                </div>

                {/* Amount */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
                    style={styles.input}
                  />
                </div>

                {/* Paid By */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Paid By</label>
                  {tripSummary?.memberNames && tripSummary.memberNames.length > 0 ? (
                    <select
                      value={expenseForm.paidBy}
                      onChange={(e) => setExpenseForm({...expenseForm, paidBy: e.target.value})}
                      style={styles.input}
                    >
                      <option value="">Select a member</option>
                      {tripSummary.memberNames.map((name, idx) => (
                        <option key={idx} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div style={{...styles.input, padding: '10px', backgroundColor: '#f0f0f0'}}>
                      Loading members...
                    </div>
                  )}
                </div>

                {/* Split Type */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Split</label>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="splitType"
                        value="all"
                        checked={expenseForm.splitType === 'all'}
                        onChange={(e) => setExpenseForm({...expenseForm, splitType: e.target.value, selectedMembers: []})}
                      />
                      Among All Members
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="splitType"
                        value="selected"
                        checked={expenseForm.splitType === 'selected'}
                        onChange={(e) => setExpenseForm({...expenseForm, splitType: e.target.value})}
                      />
                      Select Members
                    </label>
                  </div>
                </div>

                {/* Member Selection */}
                {expenseForm.splitType === 'selected' && (
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Select Members</label>
                    <div style={styles.memberCheckboxes}>
                      {tripSummary.memberNames.map((name, idx) => (
                        <label key={idx} style={styles.checkboxLabel}>
                          <input
                            type="checkbox"
                            checked={expenseForm.selectedMembers.includes(name)}
                            onChange={() => handleMemberToggle(name)}
                          />
                          {name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Buttons */}
                <div style={styles.modalActions}>
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    style={styles.cancelButton}
                    disabled={expenseLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={expenseLoading}
                  >
                    {expenseLoading ? 'Adding...' : 'Add Expense'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
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
    maxWidth: '700px',
    margin: '0 auto',
  },
  loadingBox: {
    textAlign: 'center',
    padding: '40px',
    fontSize: '16px',
    color: '#718096',
    maxWidth: '700px',
    margin: '0 auto',
  },
  errorBox: {
    backgroundColor: '#fed7d7',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '700px',
    margin: '0 auto',
  },
  errorText: {
    color: '#c53030',
    margin: '0',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 8px 0',
  },
  tripCode: {
    fontSize: '14px',
    color: '#718096',
    margin: '0',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '16px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  },
  summaryLabel: {
    fontSize: '12px',
    color: '#718096',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    margin: '0 0 8px 0',
  },
  summaryValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 16px 0',
  },
  membersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  memberItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: '#f7f9fc',
    borderRadius: '8px',
  },
  memberAvatar: {
    fontSize: '20px',
  },
  memberName: {
    fontSize: '14px',
    color: '#1a202c',
    fontWeight: '500',
  },
  balancesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  balanceItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    backgroundColor: '#f7f9fc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0',
  },
  balanceLeft: {
    flex: 1,
  },
  balanceName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a202c',
    margin: '0 0 4px 0',
  },
  balanceStatus: {
    fontSize: '12px',
    color: '#718096',
    margin: '0',
  },
  balanceAmount: {
    fontSize: '16px',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#718096',
    fontSize: '14px',
    padding: '20px',
    margin: '0',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
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
  },
  secondaryButton: {
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    backgroundColor: 'white',
    color: '#4299e1',
    border: '2px solid #4299e1',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
  },
  modalTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a202c',
    margin: '0 0 20px 0',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2d3748',
  },
  input: {
    padding: '10px 12px',
    fontSize: '14px',
    border: '1px solid #cbd5e0',
    borderRadius: '6px',
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  radioGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  memberCheckboxes: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#f7fafc',
    borderRadius: '6px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '20px',
  },
  cancelButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#edf2f7',
    color: '#2d3748',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
  submitButton: {
    flex: 1,
    padding: '10px',
    backgroundColor: '#4299e1',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
  },
};

export default TripPage;
