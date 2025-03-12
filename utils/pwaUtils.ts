// Utilities for PWA-specific functionality

/**
 * Checks if the app is running as an installed PWA
 * This uses multiple methods to detect PWA status for better cross-browser compatibility
 */
export function isRunningAsPwa(): boolean {
  if (typeof window === 'undefined') {
    return false; // Server-side rendering
  }

  // Allow localhost to bypass PWA check for development
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return true;
  }

  // Method 1: Check for display-mode: standalone
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }

  // Method 2: Check for iOS standalone mode
  if (
    'standalone' in window.navigator && 
    (window.navigator as any).standalone === true
  ) {
    return true;
  }

  // Method 3: Check for PWA installation event
  if (
    window.localStorage.getItem('pwaInstalled') === 'true'
  ) {
    return true;
  }

  return false;
}

/**
 * Records that the PWA has been installed
 * Call this when the app is installed
 */
export function markPwaAsInstalled(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem('pwaInstalled', 'true');
  }
}

/**
 * Shows a message encouraging users to install the PWA
 * @returns JSX element with installation instructions
 */
export function getPwaInstallMessage(): string {
  // Detect platform
  const isMobile = /iPhone|iPad|iPod|Android/i.test(
    typeof navigator !== 'undefined' ? navigator.userAgent : ''
  );
  
  if (isMobile) {
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      return "For the best experience including audio features, please install this app to your home screen. Tap the share button and select 'Add to Home Screen'.";
    } else {
      return "For the best experience including audio features, please install this app. Tap the menu button and select 'Install App' or 'Add to Home Screen'.";
    }
  } else {
    return "For the best experience including audio features, please install this app. Click the install icon in your browser's address bar.";
  }
} 