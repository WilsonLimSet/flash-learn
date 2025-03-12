"use client";

import { useState, useEffect } from 'react';
import { speakChinese, cancelSpeech } from '@/utils/audioUtils';

interface AudioButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  isPlayingExternal?: boolean;
  onPlayStateChange?: (playing: boolean) => void;
}

export default function AudioButton({ 
  text, 
  className = '', 
  size = 'md',
  showText = false,
  isPlayingExternal,
  onPlayStateChange
}: AudioButtonProps) {
  const [isPlayingInternal, setIsPlayingInternal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use external playing state if provided, otherwise use internal state
  const isPlaying = isPlayingExternal !== undefined ? isPlayingExternal : isPlayingInternal;
  
  // Sync internal state with external state if provided
  useEffect(() => {
    if (isPlayingExternal !== undefined) {
      setIsPlayingInternal(isPlayingExternal);
    }
  }, [isPlayingExternal]);

  const handlePlay = async () => {
    if (isPlaying) {
      cancelSpeech();
      setIsPlayingInternal(false);
      if (onPlayStateChange) onPlayStateChange(false);
      return;
    }

    setError(null);
    setIsPlayingInternal(true);
    if (onPlayStateChange) onPlayStateChange(true);

    try {
      // Use a slightly slower rate (0.75) for more natural pronunciation
      await speakChinese(text, 1);
    } catch (err) {
      setError('Speech failed');
      console.error('Speech error:', err);
    } finally {
      setIsPlayingInternal(false);
      if (onPlayStateChange) onPlayStateChange(false);
    }
  };

  // Determine icon size based on the size prop
  const iconSizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  }[size];

  // Determine button size based on the size prop
  const buttonSizeClass = {
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-3'
  }[size];

  return (
    <button
      onClick={handlePlay}
      className={`flex items-center justify-center ${buttonSizeClass} rounded-full bg-fl-salmon text-white hover:bg-fl-red transition-colors ${className} ${error ? 'bg-red-500' : ''}`}
      title={error || 'Play audio'}
      disabled={error !== null}
    >
      {isPlaying ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v4a1 1 0 002 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className={iconSizeClass} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
        </svg>
      )}
      {showText && <span className="ml-2">{isPlaying ? 'Stop' : 'Play'}</span>}
    </button>
  );
} 