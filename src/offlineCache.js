// Simple offline functionality without service worker
export const enableOfflineMode = () => {
  // Cache app state
  const cacheApp = () => {
    try {
      // Store current app HTML
      const appHTML = document.documentElement.outerHTML;
      localStorage.setItem('vault_cached_app', appHTML);
      
      // Store timestamp
      localStorage.setItem('vault_cache_time', Date.now().toString());
      
      console.log('✅ App cached for offline use');
    } catch (error) {
      console.log('Cache failed:', error);
    }
  };

  // Check if we're offline and have cached version
  const loadFromCache = () => {
    if (!navigator.onLine) {
      const cachedApp = localStorage.getItem('vault_cached_app');
      if (cachedApp) {
        console.log('📱 Loading from offline cache');
        return true;
      }
    }
    return false;
  };

  // Cache after page loads
  if (document.readyState === 'complete') {
    setTimeout(cacheApp, 1000);
  } else {
    window.addEventListener('load', () => {
      setTimeout(cacheApp, 1000);
    });
  }

  // Handle offline state
  window.addEventListener('offline', () => {
    console.log('📴 App is now offline');
  });

  window.addEventListener('online', () => {
    console.log('🌐 App is back online');
  });

  return { cacheApp, loadFromCache };
};