/**
 * Service Worker Registration
 * Enables PWA features, caching, and offline support
 */

export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.log('✅ Service Worker registered:', registration);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000); // Check every hour

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // New update available
                  console.log('🔄 New content available, please refresh.');
                  
                  // Optionally show a notification to user
                  if (window.confirm('New version available! Reload to update?')) {
                    window.location.reload();
                  }
                } else {
                  console.log('✅ Content cached for offline use.');
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}

/**
 * Preload critical resources
 */
export function preloadCriticalResources() {
  const resources = [
    '/src/pages/Login.jsx',
    '/src/pages/AdminDashboard.jsx',
    '/src/pages/CollegeDashboard.jsx',
    '/src/components/ChangePasswordModal.jsx'
  ];

  resources.forEach((resource) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = resource;
    document.head.appendChild(link);
  });
}

/**
 * Prefetch data for faster navigation
 */
export async function prefetchData(api, user) {
  if (!user) return;

  try {
    console.log('🚀 Prefetching data...');
    
    if (user.role === 'admin') {
      // Prefetch admin data
      Promise.all([
        api.get('/colleges?limit=10'),
        api.get('/users'),
        api.get('/logs/recent/activity')
      ]).catch(err => console.warn('Prefetch warning:', err));
    } else if (user.role === 'college') {
      // Prefetch college data
      api.get('/colleges/user/current')
        .catch(err => console.warn('Prefetch warning:', err));
    }
  } catch (error) {
    console.warn('Prefetch error:', error);
  }
}

/**
 * Cache API responses locally
 */
export class LocalCache {
  constructor(maxAge = 5 * 60 * 1000) { // 5 minutes default
    this.maxAge = maxAge;
    this.cache = new Map();
  }

  set(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  clear() {
    this.cache.clear();
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;

    const age = Date.now() - item.timestamp;
    if (age > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export a singleton instance
export const localCache = new LocalCache();
