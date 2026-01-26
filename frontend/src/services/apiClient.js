/**
 * Centralized API client with axios
 * Handles all HTTP requests with user identity (userId, userName) in headers
 * 
 * User identity is stored in localStorage:
 * - userId: UUID generated on first visit
 * - userName: Name provided by user
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:9090';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // CRITICAL: Send session cookies for OAuth
});

/**
 * Get current user identity from localStorage
 * Returns { userId, userName }
 */
export const getUserIdentity = () => {
  return {
    userId: localStorage.getItem('userId') || null,
    userName: localStorage.getItem('userName') || null,
  };
};

/**
 * Set user identity in localStorage
 */
export const setUserIdentity = (userId, userName) => {
  localStorage.setItem('userId', userId);
  localStorage.setItem('userName', userName);
};

/**
 * Check if user has set their identity
 */
export const hasUserIdentity = () => {
  const { userId, userName } = getUserIdentity();
  return userId && userName;
};

/**
 * Interceptor: Add user identity to all requests
 * Supports both localStorage-based identity (guest/email) and OAuth users
 */
apiClient.interceptors.request.use((config) => {
  const { userId, userName } = getUserIdentity();
  
  // Only add user identity headers if they exist (localStorage users)
  // OAuth users are authenticated via session cookie
  if (userId) {
    // For requests with body, add user info to request body ONLY if not already present
    if (config.data && typeof config.data === 'object') {
      if (!config.data.userId) {
        config.data.userId = userId;
      }
      if (!config.data.userName) {
        config.data.userName = userName;
      }
    }
    
    // Also add as headers for GET requests
    config.headers['X-User-Id'] = userId;
    config.headers['X-User-Name'] = userName;
  }
  
  return config;
});

/**
 * Interceptor: Handle errors consistently
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Ensure consistent error response format
    if (error.response?.data?.success === false) {
      return Promise.reject(error.response.data.error);
    }
    return Promise.reject(error.message || 'An error occurred');
  }
);

// ============= USER APIs =============
export const userAPI = {
  /**
   * Get or create user with lightweight identity (UUID + name)
   * POST /users/identity
   */
  getOrCreateIdentity: async (userId, userName) => {
    const response = await apiClient.post('/users/identity', {
      userId,
      userName,
    });
    return response.data.data;
  },

  /**
   * Get user by ID
   * GET /users/{id}
   */
  getById: async (userId) => {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data.data;
  },
};

// ============= TRIP APIs =============
export const tripAPI = {
  /**
   * Create new trip
   * POST /trips
   * Body: { name, createdBy, createdByName }
   */
  create: async (tripName, userId, userName) => {
    const response = await apiClient.post('/trips', {
      name: tripName,
      createdBy: userId,
      createdByName: userName,
    });
    return response.data.data;
  },

  /**
   * Get trip by trip code (TUID)
   * GET /trips/code/{tripCode}
   */
  getByCode: async (tripCode) => {
    const response = await apiClient.get(`/trips/code/${tripCode}`);
    return response.data.data;
  },

  /**
   * Get trip by ID
   * GET /trips/{tripId}
   */
  getById: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}`);
    return response.data.data;
  },

  /**
   * Get lightweight trip summary (for dashboard/landing)
   * GET /trips/{tripId}/summary
   * Returns: tripId, tripCode, name, memberCount, totalExpensesAmount, memberNames
   */
  getSummary: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/summary`);
    return response.data.data;
  },

  /**
   * Get all trips for current user
   * GET /trips/user/{userId}
   */
  getUserTrips: async (userId) => {
    const response = await apiClient.get(`/trips/user/${userId}`);
    return response.data.data;
  },

  /**
   * Join user to existing trip
   * POST /trips/{tripId}/join
   * Body: { userId }
   */
  joinTrip: async (tripId, userId) => {
    const response = await apiClient.post(`/trips/${tripId}/join`, {
      userId,
    });
    return response.data.data;
  },

  /**
   * Update trip status
   * PUT /trips/{tripId}/status
   * Body: { status }
   */
  updateStatus: async (tripId, status) => {
    const response = await apiClient.put(`/trips/${tripId}/status`, {
      status,
    });
    return response.data.data;
  },

  /**
   * Get balance summary for trip
   * GET /trips/{tripId}/balance-summary
   */
  getBalanceSummary: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/balance-summary`);
    return response.data.data;
  },

  /**
   * Get detailed balances
   * GET /trips/{tripId}/balances
   */
  getBalances: async (tripId) => {
    const response = await apiClient.get(`/trips/${tripId}/balances`);
    return response.data.data;
  },
};

// ============= JOIN REQUEST APIs =============
export const joinRequestAPI = {
  /**
   * Submit a join request
   * POST /join-requests
   */
  submit: async (tripId, userId) => {
    const response = await apiClient.post('/join-requests', {
      tripId,
      userId,
    });
    return response.data.data;
  },

  /**
   * Get pending requests for trip (creator view)
   * GET /join-requests/trip/{tripId}/pending
   */
  getPendingForTrip: async (tripId) => {
    const response = await apiClient.get(`/join-requests/trip/${tripId}/pending`);
    return response.data.data;
  },

  /**
   * Get pending requests for user (member view)
   * GET /join-requests/user/{userId}/pending
   */
  getPendingForUser: async (userId) => {
    const response = await apiClient.get(`/join-requests/user/${userId}/pending`);
    return response.data.data;
  },

  /**
   * Approve a join request (creator action)
   * POST /join-requests/approve
   */
  approve: async (requestId, userId) => {
    const response = await apiClient.post('/join-requests/approve', {
      requestId,
      userId,
    });
    return response.data.data;
  },

  /**
   * Reject a join request
   * POST /join-requests/reject
   */
  reject: async (requestId, userId) => {
    const response = await apiClient.post('/join-requests/reject', {
      requestId,
      userId,
    });
    return response.data.data;
  },
};

// ============= EXPENSE APIs =============
export const expenseAPI = {
  /**
   * Create new expense
   * POST /expenses
   */
  create: async (expense) => {
    const response = await apiClient.post('/expenses', expense);
    return response.data.data;
  },

  /**
   * Get expenses for trip
   * GET /expenses/trip/{tripId}
   */
  getTripExpenses: async (tripId) => {
    const response = await apiClient.get(`/expenses/trip/${tripId}`);
    return response.data.data;
  },
};

export default apiClient;
