/**
 * Session Management Utility
 * Handles session expiration and automatic logout on the frontend
 */

class SessionManager {
    constructor() {
        this.sessionTimeout = null;
        this.warningTimeout = null;
        this.checkInterval = null;
        this.sessionLifetime = 480 * 60 * 1000; // 8 hours in milliseconds (from config)
        this.warningTime = 5 * 60 * 1000; // Show warning 5 minutes before expiration
        this.lastActivity = Date.now();
        
        this.init();
    }
    
    init() {
        // Track user activity
        this.trackActivity();
        
        // Start session monitoring
        this.startSessionMonitoring();
        
        // Handle page visibility changes
        this.handleVisibilityChange();
    }
    
    trackActivity() {
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateLastActivity();
            }, { passive: true });
        });
    }
    
    updateLastActivity() {
        this.lastActivity = Date.now();
        
        // Reset timers
        this.resetTimers();
        this.startSessionMonitoring();
    }
    
    startSessionMonitoring() {
        this.resetTimers();
        
        // Set warning timer (5 minutes before expiration)
        this.warningTimeout = setTimeout(() => {
            this.showSessionWarning();
        }, this.sessionLifetime - this.warningTime);
        
        // Set session expiration timer
        this.sessionTimeout = setTimeout(() => {
            this.handleSessionExpiration();
        }, this.sessionLifetime);
        
        // Check server session status every 5 minutes
        this.checkInterval = setInterval(() => {
            this.checkServerSession();
        }, 5 * 60 * 1000);
    }
    
    resetTimers() {
        if (this.sessionTimeout) clearTimeout(this.sessionTimeout);
        if (this.warningTimeout) clearTimeout(this.warningTimeout);
        if (this.checkInterval) clearInterval(this.checkInterval);
    }
    
    showSessionWarning() {
        // Show a modal or notification about upcoming session expiration
        if (this.shouldShowWarning()) {
            this.createWarningModal();
        }
    }
    
    shouldShowWarning() {
        // Don't show warning if user is not active or page is hidden
        return document.visibilityState === 'visible' && 
               (Date.now() - this.lastActivity) < this.warningTime;
    }
    
    createWarningModal() {
        // Remove existing warning if any
        const existingWarning = document.getElementById('session-warning-modal');
        if (existingWarning) {
            existingWarning.remove();
        }
        
        const modal = document.createElement('div');
        modal.id = 'session-warning-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                <div class="flex items-center mb-4">
                    <div class="flex-shrink-0">
                        <svg class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 class="ml-3 text-lg font-medium text-gray-900">Session Expiring Soon</h3>
                </div>
                <p class="text-gray-600 mb-6">
                    Your session will expire in 5 minutes due to inactivity. Click "Stay Logged In" to continue your session.
                </p>
                <div class="flex justify-end space-x-3">
                    <button id="logout-btn" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200">
                        Log Out
                    </button>
                    <button id="stay-logged-btn" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700">
                        Stay Logged In
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        document.getElementById('stay-logged-btn').addEventListener('click', () => {
            this.extendSession();
            modal.remove();
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });
    }
    
    extendSession() {
        // Make a request to extend the session
        fetch('/api/extend-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
            }
        }).then(response => {
            if (response.ok) {
                this.updateLastActivity();
            } else {
                this.handleSessionExpiration();
            }
        }).catch(() => {
            this.handleSessionExpiration();
        });
    }
    
    handleSessionExpiration() {
        this.resetTimers();
        
        // Remove warning modal if exists
        const warningModal = document.getElementById('session-warning-modal');
        if (warningModal) {
            warningModal.remove();
        }
        
        // Show expiration notice and redirect
        this.showExpirationNotice();
        
        // Logout after showing notice
        setTimeout(() => {
            this.logout();
        }, 3000);
    }
    
    showExpirationNotice() {
        const notice = document.createElement('div');
        notice.className = 'fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notice.innerHTML = `
            <div class="flex items-center">
                <svg class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <p class="font-medium">Session Expired</p>
                    <p class="text-sm">You will be redirected to login...</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(notice);
        
        // Remove notice after 3 seconds
        setTimeout(() => {
            notice.remove();
        }, 3000);
    }
    
    checkServerSession() {
        // Periodically check if session is still valid on server
        fetch('/api/session-status', {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        }).then(response => {
            if (response.status === 401) {
                this.handleSessionExpiration();
            }
        }).catch(() => {
            // Network error, continue monitoring
        });
    }
    
    handleVisibilityChange() {
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                // Page became visible, check session status
                this.checkServerSession();
            }
        });
    }
    
    logout() {
        // Clear timers
        this.resetTimers();
        
        // Redirect to logout route
        window.location.href = '/logout';
    }
    
    destroy() {
        this.resetTimers();
        // Remove event listeners if needed
    }
}

// Initialize session manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if user is authenticated
    if (document.querySelector('meta[name="user-authenticated"]')) {
        window.sessionManager = new SessionManager();
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.sessionManager) {
        window.sessionManager.destroy();
    }
});

export default SessionManager;
