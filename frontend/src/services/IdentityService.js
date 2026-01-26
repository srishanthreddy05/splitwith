/**
 * IdentityService: Manage user identity in localStorage and handle authentication.
 * 
 * This is the single source of truth for user identity on the frontend.
 * 
 * Storage:
 * - splitwith_user_id: userId string (UUID)
 * - splitwith_auth_token: Optional JWT or session token (for future use)
 * 
 * Rules:
 * - Always sync localStorage with backend
 * - On app load, check localStorage first
 * - Call GET /users/{id} to verify user exists
 * - Only store what's strictly necessary
 */

const API_BASE_URL = 'http://localhost:9090';

const STORAGE_KEYS = {
  USER_ID: 'splitwith_user_id',
  AUTH_TOKEN: 'splitwith_auth_token',
  IS_GUEST: 'splitwith_is_guest',
};

export const IdentityService = {
  /**
   * Get current user ID from localStorage.
   */
  getUserId: () => localStorage.getItem(STORAGE_KEYS.USER_ID),

  /**
   * Get current user ID + token.
   */
  getIdentity: () => ({
    userId: localStorage.getItem(STORAGE_KEYS.USER_ID),
    authToken: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
  }),

  /**
   * Set user identity in localStorage.
   * Called after successful auth.
   */
  setIdentity: (userId, isGuest = false, authToken = null) => {
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
    localStorage.setItem(STORAGE_KEYS.IS_GUEST, isGuest ? 'true' : 'false');
    if (authToken) {
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
    }
  },

  /**
   * Clear identity (logout).
   */
  clearIdentity: () => {
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.IS_GUEST);
  },

  /**
   * Check if user is authenticated.
   */
  isAuthenticated: () => !!localStorage.getItem(STORAGE_KEYS.USER_ID),

  /**
   * Check if user is a guest.
   */
  isGuest: () => localStorage.getItem(STORAGE_KEYS.IS_GUEST) === 'true',

  /**
   * Bootstrap identity on app load:
   * 1. Check localStorage for userId
   * 2. If exists, verify with backend (GET /users/{id})
   * 3. If backend returns user, user is logged in
   * 4. If backend 404, clear storage and return null
   */
  bootstrap: async () => {
    const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);

    if (!userId) {
      return null; // No user
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        credentials: 'include', // Send cookies if available
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return {
            userId: data.data.id,
            displayName: data.data.displayName,
            email: data.data.email,
            authProvider: data.data.authProvider,
          };
        }
      }
    } catch (err) {
      console.error('Failed to bootstrap identity:', err);
    }

    // Backend returned 404 or error: clear storage
    IdentityService.clearIdentity();
    return null;
  },

  /**
   * Guest signup: Create guest user with display name.
   * POST /auth/guest
   */
  signupGuest: async (displayName) => {
    const response = await fetch(`${API_BASE_URL}/auth/guest`, {
      method: 'POST',
      credentials: 'include', // Include credentials
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Guest signup failed');
    }

    // Store identity
    IdentityService.setIdentity(data.data.userId, true);

    return data.data;
  },

  /**
   * Google OAuth: Send ID token to backend.
   * POST /auth/google
   * 
   * Args:
   *   googleIdToken: JWT token from Google SDK (credential field)
   *   currentUserId: Optional. If provided, backend will upgrade this guest user to Google auth
   */
  authenticateGoogle: async (googleIdToken, currentUserId = null) => {
    const payload = {
      idToken: googleIdToken, // Use idToken (the actual JWT from Google)
    };

    // If upgrading a guest user, include the guest's userId
    if (currentUserId) {
      payload.currentUserId = currentUserId;
    }

    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Google authentication failed');
    }

    // Store identity (not a guest anymore after Google auth)
    IdentityService.setIdentity(data.data.userId, false);

    return data.data;
  },

  /**
   * Google OAuth (Redirect Flow): Send authorization code to backend
   * POST /auth/google/code
   * 
   * This is for redirect-based OAuth where Google redirects back with an auth code
   * Backend exchanges the code for user info with Google's servers
   * 
   * Args:
   *   code: Authorization code from Google OAuth redirect
   *   currentUserId: Optional. If provided, backend will upgrade this guest user to Google auth
   */
  authenticateGoogleWithCode: async (code, currentUserId = null) => {
    const payload = {
      code: code,
      redirectUri: `${window.location.origin}/auth/google/callback`
    };

    // If upgrading a guest user, include the guest's userId
    if (currentUserId) {
      payload.currentUserId = currentUserId;
    }

    const response = await fetch(`${API_BASE_URL}/auth/google/code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Google authentication with code failed');
    }

    // Store identity (not a guest anymore after Google auth)
    IdentityService.setIdentity(data.data.userId, false);

    return data.data;
  },

  /**
   * Email+OTP: Step 1 - Send OTP to email.
   * POST /auth/email/send-otp
   */
  sendOtp: async (email) => {
    const response = await fetch(`${API_BASE_URL}/auth/email/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to send OTP');
    }

    return data;
  },

  /**
   * Email+OTP: Step 2 - Verify OTP and create/login user.
   * POST /auth/email/verify-otp
   */
  verifyOtp: async (email, otp, password = null, displayName = null, isSignup = false) => {
    const response = await fetch(`${API_BASE_URL}/auth/email/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        otp,
        password,
        displayName,
        isSignup,
      }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'OTP verification failed');
    }

    // Store identity
    IdentityService.setIdentity(data.data.userId, false);

    return data.data;
  },

  /**
   * Update user profile.
   * PUT /users/{id}/profile
   */
  updateProfile: async (userId, displayName, email) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ displayName, email }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to update profile');
    }

    return data.data;
  },

  /**
   * Upgrade guest to email auth.
   * POST /users/{id}/upgrade/email
   */
  upgradeGuestToEmail: async (userId, email, password, displayName) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/upgrade/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, displayName }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Upgrade failed');
    }

    return data.data;
  },

  /**
   * Upgrade guest to Google auth.
   * POST /users/{id}/upgrade/google
   */
  upgradeGuestToGoogle: async (userId, googleId, email, displayName) => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/upgrade/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ googleId, email, displayName }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Upgrade failed');
    }

    return data.data;
  },

  /**
   * Logout: Clear local storage.
   */
  logout: () => {
    IdentityService.clearIdentity();
  },
};

export default IdentityService;
