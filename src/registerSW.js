// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => {
        console.log('✅ Service Worker registered successfully');
        
        // Update available
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🔄 New version available, please refresh');
            }
          });
        });
      })
      .catch((error) => {
        console.log('❌ Service Worker registration failed:', error);
      });
  });
}