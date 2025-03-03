"use client";

import { useState, useEffect } from 'react';
import { markPwaAsInstalled } from '@/utils/pwaUtils';

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already in standalone mode (installed)
    if (window.matchMedia('(display-mode: standalone)').matches || 
        ('standalone' in window.navigator && (window.navigator as any).standalone === true)) {
      // Mark as installed
      markPwaAsInstalled();
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      // Mark as installed when the app is installed
      markPwaAsInstalled();
      // Hide the prompt
      setShowPrompt(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    // Hide the app provided install promotion
    setShowPrompt(false);
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: {outcome: string}) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        // Mark as installed
        markPwaAsInstalled();
      } else {
        console.log('User dismissed the install prompt');
      }
      setDeferredPrompt(null);
    });
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-fl-red text-white p-4 rounded-lg shadow-lg z-50">
      <div className="flex justify-between items-center">
        <div>
          <p className="font-medium">Install FlashLearn</p>
          <p className="text-sm">Add to your home screen for the best experience with audio features</p>
        </div>
        <button 
          onClick={handleInstallClick}
          className="bg-white text-fl-red px-4 py-2 rounded-md font-medium"
        >
          Install
        </button>
      </div>
    </div>
  );
} 