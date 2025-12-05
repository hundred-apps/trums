// import FingerprintJS from '@fingerprintjs/fingerprintjs';
// const getUAParser = async () => {
//   if (process.client) {
//     const UAParser = (await import('ua-parser-js')).default;
//     return UAParser;
//   }
//   return null;
// };
// export const useDeviceIdentifier = () => {
//   // Generate device ID yang sangat stabil
//   const getStableDeviceId = async (): Promise<string> => {
//     if (!process.client) return 'server-device-id';

//     // 1. Cek apakah sudah ada di cache
//     const cachedId = getPersistentCache();
//     if (cachedId) {
//       const isValid = await validateCache(cachedId);
//       if (isValid) return cachedId;
//     }

//     // 2. Generate fingerprint
//     const fingerprint = await generateEnhancedFingerprint();
    
//     // 3. Create stable ID dari fingerprint
//     const deviceId = createStableIdFromFingerprint(fingerprint);
    
//     // 4. Simpan ke persistent storage
//     saveToPersistentStorage(deviceId, fingerprint);
    
//     return deviceId;
//   };

//   const getPersistentCache = (): string | null => {
//     try {
//       // Coba dari localStorage
//       const cached = localStorage.getItem('device-id-v2');
//       const cachedFingerprint = localStorage.getItem('device-fingerprint-v2');
      
//       if (cached && cachedFingerprint) {
//         const age = Date.now() - parseInt(localStorage.getItem('device-timestamp') || '0');
        
//         // Cache valid 180 hari
//         if (age < 180 * 24 * 60 * 60 * 1000) {
//           return cached;
//         }
//       }
//     } catch (e) {
//       console.warn('Cache read failed:', e);
//     }
//     return null;
//   };

//   const validateCache = async (cachedId: string): Promise<boolean> => {
//     try {
//       const currentFingerprint = await generateEnhancedFingerprint();
//       const cachedFingerprint = localStorage.getItem('device-fingerprint-v2');
      
//       if (!cachedFingerprint) return false;
      
//       const cachedData = JSON.parse(cachedFingerprint);
      
//       // Bandingkan komponen kunci yang stabil
//       const matchScore = calculateFingerprintMatch(currentFingerprint, cachedData);
      
//       // Jika 70% match, anggap device sama
//       return matchScore >= 0.7;
//     } catch (e) {
//       return false;
//     }
//   };

//   const generateEnhancedFingerprint = async () => {
//     try {
//       // Gunakan FingerprintJS jika available
//       const fp = await FingerprintJS.load();
//       const result = await fp.get();
      
//       // Ambil komponen yang stabil
//       const stableComponents = extractStableComponents(result.components);
      
//       return {
//         visitorId: result.visitorId,
//         components: stableComponents,
//         source: 'fingerprintjs'
//       };
//     } catch (error) {
//       // Fallback ke custom fingerprint
//       return await generateCustomFingerprint();
//     }
//   };

//   const extractStableComponents = (components: any) => {
//     // Hanya ambil komponen yang stabil
//     const stableKeys = [
//       'platform', 'osVersion', 'screenResolution', 'timezone',
//       'hardwareConcurrency', 'colorDepth', 'deviceMemory'
//     ];
    
//     const stable: any = {};
//     stableKeys.forEach(key => {
//       if (components[key]?.value) {
//         stable[key] = {
//           value: components[key].value,
//           duration: components[key].duration
//         };
//       }
//     });
    
//     return stable;
//   };

//   const generateCustomFingerprint = async () => {
//     // Custom fingerprint yang stabil
//     const components: any = {};
    
//     // Platform info
//     const UAParser = await getUAParser();
//     const parser = new UAParser()
//     const ua = parser.getResult();
    
//     components.platform = { value: ua.os.name || 'Unknown' };
//     components.osVersion = { value: ua.os.version || 'Unknown' };
    
//     // Screen (dibulatkan ke 100px)
//     components.screenResolution = {
//       value: `${Math.round(screen.width / 100) * 100}x${Math.round(screen.height / 100) * 100}`
//     };
    
//     // Timezone
//     components.timezone = {
//       value: Intl.DateTimeFormat().resolvedOptions().timeZone
//     };
    
//     // Hardware
//     components.hardwareConcurrency = {
//       value: navigator.hardwareConcurrency?.toString() || 'unknown'
//     };
    
//     components.colorDepth = {
//       value: screen.colorDepth?.toString() || 'unknown'
//     };
    
//     components.deviceMemory = {
//       value: (navigator as any).deviceMemory?.toString() || 'unknown'
//     };
    
//     // WebGL vendor (jika ada)
//     try {
//       const canvas = document.createElement('canvas');
//       const gl = canvas.getContext('webgl');
//       if (gl) {
//         const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
//         if (debugInfo) {
//           components.webglVendor = {
//             value: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || ''
//           };
//         }
//       }
//     } catch (e) {}
    
//     return {
//       visitorId: await generateVisitorIdFromComponents(components),
//       components,
//       source: 'custom'
//     };
//   };

//   const generateVisitorIdFromComponents = async (components: any): Promise<string> => {
//     const componentStrings = [];
    
//     // Urutkan keys untuk konsistensi
//     const sortedKeys = Object.keys(components).sort();
    
//     for (const key of sortedKeys) {
//       if (components[key]?.value) {
//         componentStrings.push(`${key}:${components[key].value}`);
//       }
//     }
    
//     const combined = componentStrings.join('|');
//     return await hashString(combined);
//   };

//   const createStableIdFromFingerprint = (fingerprint: any): string => {
//     // Buat ID yang deterministic dari fingerprint
//     const components = fingerprint.components;
    
//     // Ambil nilai-nilai yang paling stabil
//     const stableValues = [
//       components.platform?.value || '',
//       components.osVersion?.value || '',
//       components.timezone?.value || '',
//       components.hardwareConcurrency?.value || '',
//       components.colorDepth?.value || '',
//       fingerprint.visitorId || ''
//     ];
    
//     // Gabungkan dan hash
//     const combined = stableValues
//       .map(v => v.toString().toLowerCase().trim())
//       .filter(v => v.length > 0)
//       .join(':');
    
//     return 'dev-' + simpleDeterministicHash(combined).substring(0, 20);
//   };

//   const calculateFingerprintMatch = (current: any, cached: any): number => {
//     const currentComps = current.components;
//     const cachedComps = cached.components;
    
//     const keys = new Set([
//       ...Object.keys(currentComps || {}),
//       ...Object.keys(cachedComps || {})
//     ]);
    
//     if (keys.size === 0) return 0;
    
//     let matches = 0;
//     let total = 0;
    
//     for (const key of keys) {
//       const currentVal = currentComps?.[key]?.value;
//       const cachedVal = cachedComps?.[key]?.value;
      
//       if (currentVal && cachedVal) {
//         total++;
        
//         // Fuzzy matching untuk beberapa komponen
//         if (shouldFuzzyMatch(key)) {
//           if (fuzzyCompare(currentVal, cachedVal)) {
//             matches++;
//           }
//         } else if (currentVal === cachedVal) {
//           matches++;
//         }
//       }
//     }
    
//     return total > 0 ? matches / total : 0;
//   };

//   const shouldFuzzyMatch = (key: string): boolean => {
//     // Komponen yang boleh fuzzy match
//     return [
//       'screenResolution',
//       'osVersion',
//       'browserVersion'
//     ].includes(key);
//   };

//   const fuzzyCompare = (a: string, b: string): boolean => {
//     // Simple fuzzy comparison
//     if (a === b) return true;
    
//     // Untuk version numbers, bandingkan major version
//     const versionRegex = /(\d+)\.(\d+)/;
//     const aMatch = a.match(versionRegex);
//     const bMatch = b.match(versionRegex);
    
//     if (aMatch && bMatch && aMatch[1] === bMatch[1]) {
//       return true; // Major version sama
//     }
    
//     // Untuk screen resolution, bandingkan group
//     const screenRegex = /(\d+)x(\d+)/;
//     const aScreen = a.match(screenRegex);
//     const bScreen = b.match(screenRegex);
    
//     if (aScreen && bScreen) {
//       const aGroup = `${Math.floor(parseInt(aScreen[1]) / 100)}xx`;
//       const bGroup = `${Math.floor(parseInt(bScreen[2]) / 100)}xx`;
//       return aGroup === bGroup;
//     }
    
//     return false;
//   };

//   const saveToPersistentStorage = (deviceId: string, fingerprint: any) => {
//     try {
//       // LocalStorage
//       localStorage.setItem('device-id-v2', deviceId);
//       localStorage.setItem('device-fingerprint-v2', JSON.stringify(fingerprint));
//       localStorage.setItem('device-timestamp', Date.now().toString());
      
//       // Cookie untuk server access
//       useCookie('device-id', {
//         maxAge: 180 * 24 * 60 * 60, // 180 hari
//         sameSite: 'strict',
//         secure: process.env.NODE_ENV === 'production'
//       }).value = deviceId;
      
//       // IndexedDB untuk backup (optional)
//       saveToIndexedDB(deviceId, fingerprint);
//     } catch (e) {
//       console.warn('Failed to save device ID:', e);
//     }
//   };

//   const saveToIndexedDB = async (deviceId: string, fingerprint: any) => {
//     if (!('indexedDB' in window)) return;
    
//     try {
//       const dbName = 'deviceStorage';
//       const request = indexedDB.open(dbName, 1);
      
//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         if (!db.objectStoreNames.contains('devices')) {
//           db.createObjectStore('devices', { keyPath: 'id' });
//         }
//       };
      
//       request.onsuccess = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result;
//         const transaction = db.transaction(['devices'], 'readwrite');
//         const store = transaction.objectStore('devices');
        
//         store.put({
//           id: 'current-device',
//           deviceId,
//           fingerprint,
//           timestamp: Date.now()
//         });
//       };
//     } catch (e) {
//       // Ignore IndexedDB errors
//     }
//   };

//   const hashString = async (str: string): Promise<string> => {
//     // Menggunakan Web Crypto API untuk hash yang lebih baik
//     if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
//       try {
//         const encoder = new TextEncoder();
//         const data = encoder.encode(str);
//         const hashBuffer = await crypto.subtle.digest('SHA-1', data);
//         const hashArray = Array.from(new Uint8Array(hashBuffer));
//         return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
//       } catch (e) {
//         // Fallback
//       }
//     }
    
//     // Simple deterministic hash
//     return simpleHash(str);
//   };

//   const simpleHash = (str: string): string => {
//     let hash = 0;
//     const prime1 = 31;
//     const prime2 = 37;
    
//     for (let i = 0; i < str.length; i++) {
//       const char = str.charCodeAt(i);
//       hash = ((hash * prime1) ^ (char * prime2)) >>> 0;
//     }
    
//     return hash.toString(36).padStart(10, '0');
//   };

//   const simpleDeterministicHash = (str: string): string => {
//     // Hash yang sangat deterministic
//     let hash = 5381;
    
//     for (let i = 0; i < str.length; i++) {
//       hash = ((hash << 5) + hash) + str.charCodeAt(i);
//     }
    
//     return Math.abs(hash).toString(36);
//   };

//   // Get device info untuk login
//   const getDeviceInfo = async () => {
//     const deviceId = await getStableDeviceId();
    
//     // Parse user agent
//     const parser = new (await import('ua-parser-js')).default();
//     const ua = parser.getResult();
    
//     // Dapatkan fingerprint dari cache
//     const cachedFp = localStorage.getItem('device-fingerprint-v2');
//     const fingerprint = cachedFp ? JSON.parse(cachedFp) : null;
    
//     return {
//       identifier: deviceId,
//       platform: ua.os.name || 'Unknown',
//       version: ua.os.version || 'Unknown',
//       browser: ua.browser.name || 'Unknown',
//       browserVersion: ua.browser.version || 'Unknown',
//       deviceType: ua.device.type || 'desktop',
//       userAgent: navigator.userAgent.substring(0, 500), // Limit length
//       screenResolution: `${screen.width}x${screen.height}`,
//       timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
//       language: navigator.language,
//       visitorId: fingerprint?.visitorId || deviceId,
//       source: fingerprint?.source || 'unknown',
//       hasFingerprintJS: fingerprint?.source === 'fingerprintjs'
//     };
//   };

//   // Reset device ID (untuk testing)
//   const resetDeviceId = () => {
//     ['device-id-v2', 'device-fingerprint-v2', 'device-timestamp', 'fp-data'].forEach(key => {
//       localStorage.removeItem(key);
//     });
    
//     useCookie('device-id').value = null;
//   };

//   return {
//     getStableDeviceId,
//     getDeviceInfo,
//     resetDeviceId,
//     validateCache
//   };
// };