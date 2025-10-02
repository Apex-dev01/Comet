/**
 * Comet Edge Proxy (CEP) - Client Bundle
 * Single-line CDN import for zero-configuration developer integration
 * Includes Service Worker registration, client rewriting logic, and global dev API
 */

(function() {
  'use strict';

  // Global Comet API for developer interaction
  window.comet = window.comet || {};

  // Configuration
  const COMET_CONFIG = {
    proxyEndpoint: '/proxy/',
    swPath: '/sw-handler',
    version: '1.0.0',
  };

  /**
   * URL Encoding/Decoding utilities
   */
  const URLUtils = {
    encode(url) {
      try {
        // Convert relative URLs to absolute
        const absolute = new URL(url, window.location.origin).href;
        return encodeURIComponent(absolute);
      } catch (e) {
        console.warn('CEP: Failed to encode URL', url, e);
        return url;
      }
    },

    decode(encoded) {
      try {
        return decodeURIComponent(encoded);
      } catch (e) {
        console.warn('CEP: Failed to decode URL', encoded, e);
        return encoded;
      }
    },

    rewrite(url) {
      if (!url || url.startsWith('data:') || url.startsWith('javascript:') || url.startsWith('blob:')) {
        return url;
      }
      return `${COMET_CONFIG.proxyEndpoint}${this.encode(url)}`;
    },
  };

  /**
   * Service Worker registration
   */
  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('CEP: Service Workers not supported in this browser');
      return Promise.resolve(null);
    }

    return navigator.serviceWorker
      .register(COMET_CONFIG.swPath, { scope: '/' })
      .then(registration => {
        console.log('CEP: Service Worker registered successfully', registration);
        return registration;
      })
      .catch(error => {
        console.error('CEP: Service Worker registration failed', error);
        return null;
      });
  }

  /**
   * Eruda DevTools Integration
   */
  window.comet.activateEruda = function() {
    if (window.eruda) {
      try {
        eruda.init();
        eruda.show();
        console.log('CEP: Eruda DevTools activated');
      } catch (e) {
        console.error('CEP: Failed to activate Eruda', e);
      }
    } else {
      console.warn('CEP: Eruda library not loaded');
    }
  };

  /**
   * Theme management
   */
  window.comet.setTheme = function(theme) {
    const validThemes = ['light', 'dark', 'auto'];
    if (!validThemes.includes(theme)) {
      console.warn('CEP: Invalid theme. Use: light, dark, or auto');
      return;
    }
    
    document.documentElement.setAttribute('data-comet-theme', theme);
    localStorage.setItem('comet-theme', theme);
    console.log(`CEP: Theme set to ${theme}`);
  };

  /**
   * Network performance monitoring
   */
  window.comet.getPerformance = function() {
    if (!window.performance || !window.performance.timing) {
      console.warn('CEP: Performance API not available');
      return null;
    }

    const timing = window.performance.timing;
    const metrics = {
      dns: timing.domainLookupEnd - timing.domainLookupStart,
      tcp: timing.connectEnd - timing.connectStart,
      ttfb: timing.responseStart - timing.requestStart,
      download: timing.responseEnd - timing.responseStart,
      domReady: timing.domContentLoadedEventEnd - timing.navigationStart,
      total: timing.loadEventEnd - timing.navigationStart,
    };

    console.table(metrics);
    return metrics;
  };

  /**
   * Proxy status check
   */
  window.comet.checkStatus = function() {
    const status = {
      version: COMET_CONFIG.version,
      serviceWorker: 'serviceWorker' in navigator,
      registered: navigator.serviceWorker?.controller !== null,
      eruda: typeof window.eruda !== 'undefined',
    };

    console.log('CEP Status:', status);
    return status;
  };

  /**
   * Clear proxy cache
   */
  window.comet.clearCache = async function() {
    if (!('caches' in window)) {
      console.warn('CEP: Cache API not available');
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('CEP: Cache cleared successfully');
    } catch (e) {
      console.error('CEP: Failed to clear cache', e);
    }
  };

  /**
   * Export utilities for advanced users
   */
  window.comet.utils = {
    encodeUrl: URLUtils.encode.bind(URLUtils),
    decodeUrl: URLUtils.decode.bind(URLUtils),
    rewriteUrl: URLUtils.rewrite.bind(URLUtils),
  };

  /**
   * Initialize on DOM ready
   */
  function init() {
    console.log(`CEP v${COMET_CONFIG.version} initializing...`);

    // Register Service Worker
    registerServiceWorker();

    // Apply saved theme
    const savedTheme = localStorage.getItem('comet-theme');
    if (savedTheme) {
      window.comet.setTheme(savedTheme);
    }

    // Expose status to console
    console.log('CEP: Ready! Use window.comet for developer API');
    console.log('CEP: Available methods:', Object.keys(window.comet));
  }

  // Auto-initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
