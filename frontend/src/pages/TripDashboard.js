import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { guestIdentity } from '../utils/guestIdentity';
import { tripAPI, joinRequestAPI, expenseAPI } from '../services/api';

const TripDashboard = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [balanceSummary, setBalanceSummary] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [splitMode, setSplitMode] = useState('all');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [formError, setFormError] = useState('');

  const { userId } = guestIdentity.get();
  const isCreator = trip?.createdBy === userId;

  useEffect(() => {
    loadTripData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tripId]);

  useEffect(() => {
    if (trip?.members) {
      setSelectedMembers(trip.members);
      setSplitMode('all');
    }
  }, [trip]);

  const loadTripData = async () => {
    try {
      const tripResult = await tripAPI.getById(tripId);
      
      if (tripResult.success) {
        setTrip(tripResult.data);
        const [balanceResult, expensesResult] = await Promise.all([
          tripAPI.getBalanceSummary(tripId),
          expenseAPI.listByTrip(tripId)
        ]);

        if (balanceResult.success) setBalanceSummary(balanceResult.data);
        if (expensesResult.success && Array.isArray(expensesResult.data)) {
          setExpenses(expensesResult.data);
        }
        
        if (tripResult.data.createdBy === userId) {
          const requestsResult = await joinRequestAPI.getPendingForTrip(tripId);
          if (requestsResult.data) setPendingRequests(requestsResult.data);
        }
      }
    } catch (err) {
      console.error('Failed to load trip:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    const result = await joinRequestAPI.approve(requestId, userId);
    if (result.success) loadTripData();
  };

  const toggleMemberSelection = (memberId) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    setFormError('');
    const formData = new FormData(e.target);
    const splitBetween = splitMode === 'all' ? trip.members : selectedMembers;

    if (!splitBetween || splitBetween.length === 0) {
      setFormError('Select at least one member to split this expense with.');
      return;
    }
    
    const result = await expenseAPI.create(
      tripId,
      userId,
      formData.get('description'),
      parseFloat(formData.get('amount')),
      splitBetween
    );

    if (result.success) {
      setShowAddExpense(false);
      e.target.reset();
      setSplitMode('all');
      setSelectedMembers(trip.members);
      loadTripData();
    }
  };

  const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const totalEntries = expenses.length;

  const formatPaidBy = (paidById) => paidById === userId ? 'You' : `Member ${paidById.substring(0, 8)}`;

  if (loading) return <div style={styles.container}>Loading...</div>;
  if (!trip) return <div style={styles.container}>Trip not found</div>;

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/')} style={styles.backButton}>← Back</button>

        <div style={styles.header}>
          <h1 style={styles.title}>{trip.name}</h1>
          <div style={styles.tripCode}>Trip Code: <strong>{trip.tripCode}</strong></div>
        </div>

        {isCreator && pendingRequests.length > 0 && (
          <div style={styles.alert}>
            🔔 {pendingRequests.length} pending join request(s)
            <button onClick={() => setShowJoinRequests(!showJoinRequests)} style={styles.linkButton}>
              {showJoinRequests ? 'Hide' : 'Review'}
            </button>
          </div>
        )}

        {showJoinRequests && (
          <div style={styles.section}>
            <h3>Pending Join Requests</h3>
            {pendingRequests.map(req => (
              <div key={req.id} style={styles.requestCard}>
                <span>{req.userName} wants to join</span>
                <button onClick={() => handleApproveRequest(req.id)} style={styles.approveButton}>
                  Approve
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.section}>
          <h3>Balance Summary</h3>
          {balanceSummary && balanceSummary.instructions.length > 0 ? (
            balanceSummary.instructions.map((instruction, idx) => (
              <div key={idx} style={styles.balanceItem}>
                {instruction.message}
              </div>
            ))
          ) : (
            <p>No balances yet. Add an expense to get started!</p>
          )}
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h3>Expenses</h3>
            <div style={styles.summaryRow}>
              <span>Total entries: {totalEntries}</span>
              <span>Total amount: ₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>
          {expenses.length === 0 ? (
            <p>No expenses added yet.</p>
          ) : (
            <div style={styles.expenseList}>
              {expenses.map((exp) => (
                <div key={exp.id} style={styles.expenseCard}>
                  <div style={styles.expenseMain}>
                    <div style={styles.expenseTitle}>{exp.description}</div>
                    <div style={styles.expenseAmount}>₹{exp.amount?.toFixed(2)}</div>
                  </div>
                  <div style={styles.expenseMeta}>Paid by {formatPaidBy(exp.paidBy)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.section}>
          <h3>Members ({trip.members.length})</h3>
          <div style={styles.membersList}>
            {trip.members.map(memberId => (
              <span key={memberId} style={styles.member}>
                Member {memberId.substring(0, 8)} {memberId === userId && '(You)'}
              </span>
            ))}
          </div>
        </div>

        <div style={styles.section}>
          <button onClick={() => setShowAddExpense(!showAddExpense)} style={styles.addButton}>
            {showAddExpense ? 'Cancel' : '+ Add Expense'}
          </button>

          {showAddExpense && (
            <form onSubmit={handleAddExpense} style={styles.form}>
              <input
                name="description"
                placeholder="Description (e.g., Hotel, Food)"
                required
                style={styles.input}
              />
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Amount"
                required
                style={styles.input}
              />
              <div style={styles.splitControls}>
                <div style={styles.splitHeader}>
                  <span style={styles.splitLabel}>Split with</span>
                  <div style={styles.radioGroup}>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="splitMode"
                        value="all"
                        checked={splitMode === 'all'}
                        onChange={() => {
                          setSplitMode('all');
                          setSelectedMembers(trip.members);
                        }}
                      />
                      All members
                    </label>
                    <label style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="splitMode"
                        value="custom"
                        checked={splitMode === 'custom'}
                        onChange={() => setSplitMode('custom')}
                      />
                      Select members
                    </label>
                  </div>
                </div>

                {splitMode === 'custom' && (
                  <div style={styles.memberSelector}>
                    {trip.members.map((memberId) => (
                      <label key={memberId} style={styles.memberCheckbox}>
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(memberId)}
                          onChange={() => toggleMemberSelection(memberId)}
                        />
                        <span>
                          Member {memberId.substring(0, 8)} {memberId === userId && '(You)'}
                        </span>
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedMembers(trip.members)}
                      style={styles.inlineLink}
                    >
                      Select all
                    </button>
                  </div>
                )}
              </div>
              {formError && <div style={styles.formError}>{formError}</div>}
              <button type="submit" style={styles.submitButton}>Add Expense</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    backgroundColor: '#f7f9fc',
  },
  content: {
    maxWidth: '800px',
    margin: '0 auto',
  },
  backButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  tripCode: {
    fontSize: '18px',
    color: '#7f8c8d',
    marginTop: '10px',
  },
  alert: {
    backgroundColor: '#fff3cd',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  section: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  summaryRow: {
    display: 'flex',
    gap: '16px',
    color: '#4a5568',
    fontSize: '14px',
  },
  requestCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  approveButton: {
    padding: '8px 16px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  balanceItem: {
    padding: '10px',
    backgroundColor: '#f8f9fa',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  expenseList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  expenseCard: {
    padding: '12px',
    backgroundColor: '#f8f9fa',
    borderRadius: '8px',
  },
  expenseMain: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expenseTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2d3748',
  },
  expenseAmount: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#2b6cb0',
  },
  expenseMeta: {
    marginTop: '6px',
    fontSize: '13px',
    color: '#4a5568',
  },
  membersList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
  },
  member: {
    padding: '8px 12px',
    backgroundColor: '#e9ecef',
    borderRadius: '20px',
    fontSize: '14px',
  },
  addButton: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  splitControls: {
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '12px',
    backgroundColor: '#f8fafc',
  },
  splitHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  splitLabel: {
    fontWeight: '600',
    color: '#2d3748',
  },
  radioGroup: {
    display: 'flex',
    gap: '12px',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '14px',
    color: '#4a5568',
  },
  memberSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  memberCheckbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#2d3748',
  },
  inlineLink: {
    alignSelf: 'flex-start',
    background: 'none',
    border: 'none',
    color: '#2b6cb0',
    cursor: 'pointer',
    padding: 0,
    fontSize: '14px',
    textDecoration: 'underline',
  },
  input: {
    padding: '12px',
    fontSize: '16px',
    border: '1px solid #ddd',
    borderRadius: '6px',
  },
  formError: {
    color: '#c53030',
    fontSize: '14px',
    backgroundColor: '#fff5f5',
    border: '1px solid #fed7d7',
    borderRadius: '6px',
    padding: '10px',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default TripDashboard;
