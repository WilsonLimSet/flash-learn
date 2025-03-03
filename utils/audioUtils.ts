// Audio playback utilities for Chinese flashcards

// Function to get TTS audio URL for Chinese text
export async function getAudioForChinese(text: string): Promise<{ url?: string; useFallback?: boolean; text: string }> {
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
      throw new Error(`TTS API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we should use fallback
    if (data.useFallback) {
      return { useFallback: true, text };
    }
    
    return { url: data.audioUrl, text };
  } catch (error) {
    console.error('Error fetching audio:', error);
    // Return fallback option
    return { useFallback: true, text };
  }
}

// Function to play audio using browser's speech synthesis
function playSpeechSynthesis(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN'; // Set language to Chinese
    
    // Set up event handlers
    utterance.onend = () => resolve();
    utterance.onerror = (event) => reject(new Error(`Speech synthesis error: ${event.error}`));
    
    // Speak
    window.speechSynthesis.speak(utterance);
  });
}

// Function to play audio for Chinese text
export async function playChineseAudio(text: string): Promise<void> {
  try {
    const audioData = await getAudioForChinese(text);
    
    if (audioData.useFallback) {
      // Use browser's speech synthesis as fallback
      return playSpeechSynthesis(text);
    } else if (audioData.url) {
      // Create and play audio element
      const audio = new Audio(audioData.url);
      
      // Return a promise that resolves when audio finishes playing
      return new Promise((resolve, reject) => {
        audio.onended = () => resolve();
        audio.onerror = (e) => {
          console.error('Audio playback error, falling back to speech synthesis', e);
          // Try fallback if audio fails to play
          playSpeechSynthesis(text).then(resolve).catch(reject);
        };
        audio.play().catch(error => {
          console.error('Audio play error:', error);
          // Try fallback if audio fails to play
          playSpeechSynthesis(text).then(resolve).catch(reject);
        });
      });
    } else {
      throw new Error('No audio URL returned');
    }
  } catch (error) {
    console.error('Error playing audio:', error);
    // Try fallback as last resort
    return playSpeechSynthesis(text);
  }
}

// Function to play audio for a flashcard
export async function playFlashcardAudio(chinese: string, pinyin: string): Promise<void> {
  // Play the Chinese audio
  await playChineseAudio(chinese);
} 