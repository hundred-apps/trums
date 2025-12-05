import FingerprintJS from '@fingerprintjs/fingerprintjs';

export default defineNuxtPlugin(async (nuxtApp) => {
  // Hanya berjalan di client side
  if (!process.client) return;

  let visitorId: string | null = null;
  let fingerprintLoaded = false;

  const loadFingerprint = async () => {
    try {
      // Initialize dengan konfigurasi optimal
      const fp = await FingerprintJS.load({
        delayFallback: 1000, // Timeout fallback
        debug: process.env.NODE_ENV === 'development' // Debug mode hanya di development
      });

      // Get result dengan extended data
      const result = await fp.get();
      
      visitorId = result.visitorId;
      fingerprintLoaded = true;
      
      // Simpan di localStorage untuk cache
      if (visitorId) {
        localStorage.setItem('fp-visitor-id', visitorId);
        localStorage.setItem('fp-last-updated', Date.now().toString());
        
        // Juga simpan components untuk keperluan matching
        localStorage.setItem('fp-components', JSON.stringify(result.components));
      }
      
      return result;
    } catch (error) {
      console.error('FingerprintJS error:', error);
      return await getFallbackFingerprint();
    }
  };

  const getFallbackFingerprint = async () => {
    // Fallback menggunakan metode sederhana
    const fallbackId = generateFallbackId();
    visitorId = fallbackId;
    
    localStorage.setItem('fp-fallback-id', fallbackId);
    return {
      visitorId: fallbackId,
      components: {},
      confidence: { score: 0.5, comment: 'Using fallback fingerprint' }
    };
  };

  const generateFallbackId = () => {
    const components = [
      navigator.userAgent,
      navigator.platform,
      screen.width + 'x' + screen.height,
      navigator.language,
      new Date().getTimezoneOffset().toString(),
      navigator.hardwareConcurrency?.toString() || 'unknown'
    ];
    
    // Simple hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'fallback-' + Math.abs(hash).toString(36);
  };

  // Load fingerprint saat plugin diinisialisasi
  const fingerprintResult = await loadFingerprint();

  // Provide ke seluruh aplikasi
  nuxtApp.provide('fingerprint', {
    // Visitor ID yang konsisten
    getVisitorId: () => visitorId,
    
    // Get full result
    getResult: () => fingerprintResult,
    
    // Reload fingerprint
    reload: async () => {
      const result = await loadFingerprint();
      return result.visitorId;
    },
    
    // Check if fingerprint is loaded
    isLoaded: () => fingerprintLoaded,
    
    // Get cached visitor ID (tanpa load)
    getCachedVisitorId: () => {
      return localStorage.getItem('fp-visitor-id');
    }
  });
});

// Type definitions untuk TypeScript
declare module '#app' {
  interface NuxtApp {
    $fingerprint: {
      getVisitorId: () => string | null;
      getResult: () => any;
      reload: () => Promise<string | null>;
      isLoaded: () => boolean;
      getCachedVisitorId: () => string | null;
    };
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $fingerprint: {
      getVisitorId: () => string | null;
      getResult: () => any;
      reload: () => Promise<string | null>;
      isLoaded: () => boolean;
      getCachedVisitorId: () => string | null;
    };
  }
}