const API_BASE_URL = 'http://localhost:9090';

// User API calls
export const userAPI = {
  create: async (name, email) => {
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    return response.json();
  },

  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`);
    return response.json();
  },

  createGuest: async (guestId, name) => {
    const response = await fetch(`${API_BASE_URL}/users/guest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ guestId, name })
    });
    return response.json();
  },

  getByGuestId: async (guestId) => {
    const response = await fetch(`${API_BASE_URL}/users/guest/${guestId}`);
    return response.json();
  }
};

// Trip API calls
export const tripAPI = {
  create: async (name, createdBy) => {
    const response = await fetch(`${API_BASE_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, createdBy })
    });
    return response.json();
  },

  getUserTrips: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/trips/user/${userId}`);
    return response.json();
  },

  getByCode: async (tripCode) => {
    const response = await fetch(`${API_BASE_URL}/trips/code/${tripCode}`);
    return response.json();
  },

  getById: async (tripId) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}`);
    return response.json();
  },

  getBalances: async (tripId) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/balances`);
    return response.json();
  },

  getBalanceSummary: async (tripId) => {
    const response = await fetch(`${API_BASE_URL}/trips/${tripId}/balance-summary`);
    return response.json();
  }
};

// Join Request API calls
export const joinRequestAPI = {
  submit: async (tripId, userId) => {
    const response = await fetch(`${API_BASE_URL}/join-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tripId, userId })
    });
    return response.json();
  },

  getPendingForTrip: async (tripId) => {
    const response = await fetch(`${API_BASE_URL}/join-requests/trip/${tripId}/pending`);
    return response.json();
  },

  getUserPending: async (userId) => {
    const response = await fetch(`${API_BASE_URL}/join-requests/user/${userId}/pending`);
    return response.json();
  },

  approve: async (requestId, userId) => {
    const response = await fetch(`${API_BASE_URL}/join-requests/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    });
    return response.json();
  },

  reject: async (requestId, userId) => {
    const response = await fetch(`${API_BASE_URL}/join-requests/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId, userId })
    });
    return response.json();
  }
};

// Expense API calls
export const expenseAPI = {
  // Note: splitBetween must include all members sharing the cost
  create: async (tripId, paidBy, description, amount, splitBetween) => {
    const response = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tripId,
        paidBy,
        amount: parseFloat(amount),
        description,
        splitBetween
      })
    });
    return response.json();
  },

  listByTrip: async (tripId) => {
    const response = await fetch(`${API_BASE_URL}/expenses/trip/${tripId}`);
    return response.json();
  }
};
