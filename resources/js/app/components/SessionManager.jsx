import { useEffect } from 'react';

const SessionManager = ({ user }) => {
    useEffect(() => {
        // Only initialize session manager if user is authenticated
        if (user) {
            // Set meta tag for session manager
            const metaTag = document.createElement('meta');
            metaTag.name = 'user-authenticated';
            metaTag.content = 'true';
            document.head.appendChild(metaTag);
            
            // Dynamically import and initialize session manager
            import('@/utils/sessionManager.js').then((module) => {
                if (!window.sessionManager) {
                    window.sessionManager = new module.default();
                }
            });
            
            // Cleanup function
            return () => {
                if (window.sessionManager) {
                    window.sessionManager.destroy();
                    window.sessionManager = null;
                }
                
                // Remove meta tag
                const existingMeta = document.querySelector('meta[name="user-authenticated"]');
                if (existingMeta) {
                    existingMeta.remove();
                }
            };
        }
    }, [user]);
    
    // This component doesn't render anything
    return null;
};

export default SessionManager;
