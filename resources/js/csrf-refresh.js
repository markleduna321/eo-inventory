// Auto-refresh CSRF token every 30 minutes to prevent expiration
export function initCsrfTokenRefresh() {
  const refreshInterval = 30 * 60 * 1000; // 30 minutes in milliseconds
  
  const refreshCsrfToken = async () => {
    try {
      const response = await fetch('/csrf-refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
        },
        credentials: 'same-origin'
      });
      
      if (response.ok) {
        const data = await response.json();
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
          csrfMeta.setAttribute('content', data.csrf_token);
          console.log('CSRF token refreshed automatically');
        }
      }
    } catch (error) {
      console.error('Failed to refresh CSRF token:', error);
    }
  };
  
  // Refresh immediately on page load
  refreshCsrfToken();
  
  // Set up periodic refresh
  setInterval(refreshCsrfToken, refreshInterval);
}

// Call this when the app loads
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initCsrfTokenRefresh);
}
