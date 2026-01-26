/**
 * Authentication Service for Spring Security OAuth2
 * 
 * Handles session-based authentication with the Spring Boot backend.
 * Uses cookies for session management (JSESSIONID).
 */

const API_BASE_URL = 'http://localhost:9090';

const authService = {
  /**
   * Check if user is authenticated with Spring Security
   * Calls the /me endpoint with credentials to verify session
   * 
   * @returns {Promise<Object|null>} User info if authenticated, null otherwise
   */
  checkAuth: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include', // CRITICAL: Send cookies
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Auth check failed:', response.status);
        return null;
      }

      const data = await response.json();
      
      if (data.authenticated) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture,
          authenticated: true,
        };
      }

      return null;
    } catch (error) {
      console.error('Error checking auth:', error);
      return null;
    }
  },

  /**
   * Initiate Google OAuth login
   * Redirects to Spring Security's OAuth2 login endpoint
   */
  loginWithGoogle: () => {
    // Full page redirect to Spring Security OAuth2 endpoint
    window.location.href = `${API_BASE_URL}/oauth2/authorization/google`;
  },

  /**
   * Logout user
   * Calls Spring Security's logout endpoint
   */
  logout: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include', // CRITICAL: Send session cookie
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Logout failed:', response.status);
      }

      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },

  /**
   * Make authenticated API request
   * Always includes credentials to send session cookie
   * 
   * @param {string} endpoint - API endpoint (relative to API_BASE_URL)
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>}
   */
  authenticatedFetch: async (endpoint, options = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      credentials: 'include', // CRITICAL: Always send cookies
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });
  },
};

export default authService;
