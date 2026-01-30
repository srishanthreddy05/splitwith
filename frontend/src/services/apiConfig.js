// Centralized API base URL configuration
// Uses REACT_APP_API_BASE_URL when provided (e.g., Vercel), falls back to local dev.
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090';
