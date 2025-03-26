// This is a utility script to help reset authentication state
// Run this in the browser console or load it via a script tag

function resetAuth() {
  // Clear all cookies
  document.cookie.split(';').forEach(function(c) {
    document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  });
  
  // Clear localStorage
  localStorage.clear();
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Reload page
  console.log('Auth state cleared! Redirecting to login page...');
  window.location.href = '/auth/login';
}

// Auto-run when included via script tag
if (typeof window !== 'undefined') {
  console.log('Auth reset utility loaded. Call resetAuth() to clear your auth state.');
} 