"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { isRunningAsPwa, getPwaInstallMessage } from '@/utils/pwaUtils';

interface PwaContextType {
  isPwa: boolean;
  showInstallPrompt: () => void;
  hideInstallPrompt: () => void;
  isPromptVisible: boolean;
}

const PwaContext = createContext<PwaContextType>({
  isPwa: false,
  showInstallPrompt: () => {},
  hideInstallPrompt: () => {},
  isPromptVisible: false,
});

export const usePwa = () => useContext(PwaContext);

interface PwaProviderProps {
  children: ReactNode;
}

export function PwaProvider({ children }: PwaProviderProps) {
  const [isPwa, setIsPwa] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const [hasShownPrompt, setHasShownPrompt] = useState(false);

  useEffect(() => {
    // Check if running as PWA
    setIsPwa(isRunningAsPwa());
    
    // Check if we've shown the prompt in this session
    const hasShown = sessionStorage.getItem('hasShownPwaPrompt') === 'true';
    setHasShownPrompt(hasShown);
  }, []);

  const showInstallPrompt = () => {
    if (!isPwa && !isPromptVisible && !hasShownPrompt) {
      setIsPromptVisible(true);
      // Mark that we've shown the prompt in this session
      sessionStorage.setItem('hasShownPwaPrompt', 'true');
      setHasShownPrompt(true);
    }
  };

  const hideInstallPrompt = () => {
    setIsPromptVisible(false);
  };

  return (
    <PwaContext.Provider value={{ isPwa, showInstallPrompt, hideInstallPrompt, isPromptVisible }}>
      {children}
      {isPromptVisible && !isPwa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-black">Install FlashLearn</h2>
            
            <div className="mb-6 text-black">
              <p className="mb-4">{getPwaInstallMessage()}</p>
              <p className="text-sm text-gray-600">For the best experience, please install the app to your device.</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={hideInstallPrompt}
                className="px-4 py-2 bg-fl-red text-white rounded-md hover:bg-fl-red/90"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </PwaContext.Provider>
  );
} 