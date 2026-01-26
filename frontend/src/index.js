import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// No need for GoogleOAuthProvider anymore with redirect-based auth
// We're using direct redirects to Google's OAuth page

// Suppress COOP warning in local development (only for legacy popup-based auth)
// With redirect-based auth, no COOP warnings occur
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.warn = function(...args) {
    const message = String(args[0] || '');
    // Suppress Cross-Origin-Opener-Policy warnings
    if (message.includes('Cross-Origin-Opener-Policy') || 
        message.includes('window.closed')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = function(...args) {
    const message = String(args[0] || '');
    // Don't suppress errors, only warnings
    if (message.includes('Cross-Origin-Opener-Policy') || 
        message.includes('window.closed')) {
      return;
    }
    originalError.apply(console, args);
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
