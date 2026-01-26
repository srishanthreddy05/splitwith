// Guest Identity Management using localStorage
const GUEST_ID_KEY = 'splitwith_guest_id';
const GUEST_NAME_KEY = 'splitwith_guest_name';
const USER_ID_KEY = 'splitwith_user_id';

/**
 * Generate a unique guest ID
 */
function generateGuestId() {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Get or create guest identity
 */
export const guestIdentity = {
  
  /**
   * Initialize guest user - creates if doesn't exist
   */
  initialize: async () => {
    let guestId = localStorage.getItem(GUEST_ID_KEY);
    let guestName = localStorage.getItem(GUEST_NAME_KEY);
    let userId = localStorage.getItem(USER_ID_KEY);

    // If user already exists, return it
    if (userId && guestId) {
      return { guestId, userId, guestName, isNew: false };
    }

    // Create new guest
    if (!guestId) {
      guestId = generateGuestId();
      guestName = 'Guest User';
      localStorage.setItem(GUEST_ID_KEY, guestId);
      localStorage.setItem(GUEST_NAME_KEY, guestName);
    }

    // Register guest with backend
    try {
      const response = await fetch('http://localhost:9090/users/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestId, name: guestName })
      });

      const data = await response.json();
      
      if (data.success) {
        userId = data.data.id;
        localStorage.setItem(USER_ID_KEY, userId);
        return { guestId, userId, guestName, isNew: true };
      }
    } catch (error) {
      console.error('Failed to initialize guest:', error);
    }

    return null;
  },

  /**
   * Get current user identity
   */
  get: () => {
    return {
      guestId: localStorage.getItem(GUEST_ID_KEY),
      userId: localStorage.getItem(USER_ID_KEY),
      guestName: localStorage.getItem(GUEST_NAME_KEY)
    };
  },

  /**
   * Update guest name
   */
  updateName: async (newName) => {
    // eslint-disable-next-line no-unused-vars
    const { userId } = guestIdentity.get();
    localStorage.setItem(GUEST_NAME_KEY, newName);
    
    // TODO: Update name on backend when user profile API is ready
    return { success: true };
  },

  /**
   * Clear identity (logout)
   */
  clear: () => {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_NAME_KEY);
    localStorage.removeItem(USER_ID_KEY);
  },

  /**
   * Check if user is guest
   */
  isGuest: () => {
    return !!localStorage.getItem(GUEST_ID_KEY);
  }
};
