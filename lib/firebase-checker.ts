/**
 * Utility for checking Firebase initialization status
 * This is used to verify Firebase configuration when the app loads
 */

import { isFirebaseInitialized } from '@/lib/firebase';

/**
 * Checks if Firebase environment variables are defined
 * @returns true if all required Firebase environment variables are present
 */
export function checkFirebaseConfig(): boolean {
  const requiredVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  ];

  // Check if all required variables are defined
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error(`Missing Firebase environment variables: ${missingVars.join(', ')}`);
    return false;
  }
  
  return true;
}

/**
 * Checks if Firebase initialization is complete and services are available
 * @returns true if Firebase is initialized, false otherwise
 */
export function isFirebaseReady(): boolean {
  // Check if Firebase is initialized according to our tracker
  return isFirebaseInitialized();
}

/**
 * Diagnose Firebase initialization issues and return helpful information
 * @returns An object with diagnostic information about Firebase initialization
 */
export function diagnoseFirebaseIssues() {
  const configExists = checkFirebaseConfig();
  const isInitialized = isFirebaseReady();
  
  const issues = [];
  
  if (!configExists) {
    issues.push('Firebase configuration missing');
  }
  
  if (!isInitialized) {
    issues.push('Firebase services not initialized');
  }
  
  return {
    isReady: configExists && isInitialized,
    configExists,
    isInitialized,
    issues,
    browserInfo: typeof window !== 'undefined' ? {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      platform: window.navigator.platform,
    } : null,
  };
}

/**
 * Add a Firebase health check button to the DOM for debugging
 * Only works in development mode
 */
export function addFirebaseDebugger() {
  if (process.env.NODE_ENV !== 'production' && typeof document !== 'undefined') {
    const debuggerExists = document.getElementById('firebase-debugger');
    if (debuggerExists) return;
    
    const debugButton = document.createElement('button');
    debugButton.id = 'firebase-debugger';
    debugButton.innerHTML = 'Firebase Status';
    debugButton.style.position = 'fixed';
    debugButton.style.bottom = '40px';
    debugButton.style.right = '10px';
    debugButton.style.zIndex = '9999';
    debugButton.style.padding = '5px 10px';
    debugButton.style.fontSize = '12px';
    debugButton.style.background = isFirebaseReady() ? '#4CAF50' : '#F44336';
    debugButton.style.color = 'white';
    debugButton.style.border = 'none';
    debugButton.style.borderRadius = '4px';
    debugButton.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    debugButton.style.cursor = 'pointer';
    
    debugButton.onclick = () => {
      const info = diagnoseFirebaseIssues();
      console.log('Firebase Diagnostics:', info);
      alert(`Firebase Status: ${info.isReady ? 'Ready' : 'Not Ready'}\nIssues: ${info.issues.length ? info.issues.join(', ') : 'None'}`);
    };
    
    document.body.appendChild(debugButton);
  }
} 