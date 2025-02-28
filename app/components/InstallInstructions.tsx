"use client";

import { useState, useEffect } from 'react';

export default function InstallInstructions() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    // Check if it's iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
    
    // Check if already installed
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);
  }, []);
  
  // Don't show for non-iOS or already installed
  if (!isIOS || isStandalone) return null;
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-fl-yellow-DEFAULT text-black p-3 rounded-full shadow-lg z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold mb-4 text-black">Add to Home Screen</h2>
        
        <div className="mb-6 text-black">
          <p className="mb-2">To install FlashLearn on your iOS device:</p>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Tap the Share button in Safari</li>
            <li>Scroll down and tap "Add to Home Screen"</li>
            <li>Tap "Add" in the top right corner</li>
          </ol>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={() => setIsOpen(false)}
            className="bg-fl-red text-white px-4 py-2 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 