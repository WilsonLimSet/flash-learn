// Audio playback utilities for Chinese flashcards
import { isRunningAsPwa } from './pwaUtils';

// Function to get TTS audio URL for Chinese text
export async function getAudioForChinese(text: string): Promise<{ url?: string; useFallback?: boolean; text: string; pwaOnly?: boolean }> {
  // Check if running as PWA
  const isPwa = isRunningAsPwa();
  
  // If not running as PWA, return with pwaOnly flag
  if (!isPwa) {
    return { useFallback: true, text, pwaOnly: true };
  }
  
  try {
    // Call our API endpoint
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      console.warn(`TTS API error: ${response.status}`);
      return { useFallback: true, text };
    }
    
    const data = await response.json();
    
    // Check if we should use fallback
    if (data.useFallback || !data.success) {
      console.log('Using fallback speech synthesis');
      return { useFallback: true, text: data.text || text };
    }
    
    return { url: data.audioUrl, text: data.text || text };
  } catch (error) {
    console.error('Error fetching audio:', error);
    // Return fallback option
    return { useFallback: true, text };
  }
}

// Function to play audio using browser's speech synthesis
function playSpeechSynthesis(text: string): Promise<void> {
  // Check if running as PWA
  const isPwa = isRunningAsPwa();
  
  // If not running as PWA, don't play audio
  if (!isPwa) {
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is available
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not supported in this browser');
      resolve(); // Resolve without playing to avoid blocking the UI
      return;
    }
    
    try {
      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN'; // Set language to Chinese
      
      // Set up event handlers
      utterance.onend = () => resolve();
      utterance.onerror = (event) => {
        console.error(`Speech synthesis error:`, event);
        resolve(); // Resolve anyway to avoid blocking the UI
      };
      
      // Speak
      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      resolve(); // Resolve without playing to avoid blocking the UI
    }
  });
}

// Function to play audio for Chinese text
export async function playChineseAudio(text: string): Promise<{ played: boolean; pwaOnly?: boolean }> {
  if (!text || text.trim() === '') {
    console.warn('Empty text provided to playChineseAudio');
    return { played: false };
  }
  
  try {
    const audioData = await getAudioForChinese(text);
    
    // If pwaOnly flag is set, return without playing
    if (audioData.pwaOnly) {
      return { played: false, pwaOnly: true };
    }
    
    if (audioData.useFallback) {
      // Use browser's speech synthesis as fallback
      await playSpeechSynthesis(audioData.text);
      return { played: true };
    } else if (audioData.url) {
      // Create and play audio element
      const audio = new Audio(audioData.url);
      
      // Return a promise that resolves when audio finishes playing
      return new Promise((resolve) => {
        audio.onended = () => resolve({ played: true });
        audio.onerror = (e) => {
          console.error('Audio playback error, falling back to speech synthesis', e);
          // Try fallback if audio fails to play
          playSpeechSynthesis(audioData.text).then(() => resolve({ played: true }));
        };
        
        // Add a timeout in case the audio never loads or plays
        const timeout = setTimeout(() => {
          console.warn('Audio playback timeout, falling back to speech synthesis');
          playSpeechSynthesis(audioData.text).then(() => resolve({ played: true }));
        }, 3000);
        
        audio.onplaying = () => {
          clearTimeout(timeout);
        };
        
        audio.play().catch(error => {
          console.error('Audio play error:', error);
          clearTimeout(timeout);
          // Try fallback if audio fails to play
          playSpeechSynthesis(audioData.text).then(() => resolve({ played: true }));
        });
      });
    } else {
      console.warn('No audio URL returned, using fallback');
      await playSpeechSynthesis(text);
      return { played: true };
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    // Try fallback as last resort
    try {
      await playSpeechSynthesis(text);
      return { played: true };
    } catch {
      // If even the fallback fails, just resolve to avoid blocking the UI
      console.error('Fallback speech synthesis failed');
      return { played: false };
    }
  }
}

// Function to play audio for a flashcard
export async function playFlashcardAudio(chinese: string, pinyin: string): Promise<{ played: boolean; pwaOnly?: boolean }> {
  // Play the Chinese audio
  if (!chinese || chinese.trim() === '') {
    return { played: false };
  }
  
  try {
    return await playChineseAudio(chinese);
  } catch {
    // If there's an error, just resolve to avoid blocking the UI
    return { played: false };
  }
} 