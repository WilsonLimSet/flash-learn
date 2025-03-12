// Audio utilities for text-to-speech functionality

/**
 * Speaks the provided Chinese text using the Web Speech API
 * @param text The Chinese text to speak
 * @param rate Speech rate (0.1 to 10, default 0.8)
 * @param pitch Speech pitch (0 to 2, default 1)
 * @returns Promise that resolves when speech is complete or rejects on error
 */
export function speakChinese(text: string, rate: number = 0.9, pitch: number = 1): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is available
    if (!('speechSynthesis' in window)) {
      console.error('Text-to-speech not supported in this browser');
      reject(new Error('Text-to-speech not supported in this browser'));
      return;
    }

    // Create a new utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Try to use the best available Chinese voice
    const bestVoice = getBestChineseVoice();
    if (bestVoice) {
      utterance.voice = bestVoice;
    } else {
      // Fallback to language setting
      utterance.lang = 'zh-CN';
    }
    
    // Adjust rate and pitch for better quality
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Handle events
    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      reject(new Error('Speech synthesis failed'));
    };

    // Speak the text
    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Checks if text-to-speech is supported in the current browser
 * @returns boolean indicating if speech synthesis is available
 */
export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Gets available voices for speech synthesis
 * @returns Array of available SpeechSynthesisVoice objects
 */
export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  
  // Some browsers (like Chrome) load voices asynchronously
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) {
    // If no voices are available yet, try to force loading them
    window.speechSynthesis.cancel();
    return window.speechSynthesis.getVoices();
  }
  
  return voices;
}

/**
 * Gets Chinese voices available for speech synthesis
 * @returns Array of Chinese SpeechSynthesisVoice objects
 */
export function getChineseVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSupported()) return [];
  const allVoices = getAvailableVoices();
  return allVoices.filter(voice => 
    voice.lang.includes('zh') || 
    voice.lang.includes('cmn') || 
    voice.name.includes('Chinese')
  );
}

/**
 * Priority list of known good Chinese voices
 * These are voices that are known to sound better for Chinese
 */
const PREFERRED_CHINESE_VOICES = [
  // Google voices (generally good quality)
  'Google 普通话（中国大陆）',
  'Google 國語（臺灣）',
  'Google 粤語（香港）',
  // Microsoft voices (good quality on Windows)
  'Microsoft Xiaoxiao Online (Natural) - Chinese (Mainland)',
  'Microsoft Yunxi Online (Natural) - Chinese (Mainland)',
  'Microsoft Yunyang Online (Natural) - Chinese (Mainland)',
  'Microsoft Kangkang Online (Natural) - Chinese (Mainland)',
  'Microsoft Yaoyao Online (Natural) - Chinese (Mainland)',
  'Microsoft HuihuiRUS - Chinese (Simplified, PRC)',
  'Microsoft Yaoyao - Chinese (Simplified, PRC)',
  'Microsoft Tracy - Chinese (Traditional, Hong Kong S.A.R.)',
  'Microsoft Danny - Chinese (Traditional, Hong Kong S.A.R.)',
  'Microsoft Hanhan - Chinese (Traditional, Taiwan)',
  'Microsoft Yating - Chinese (Traditional, Taiwan)',
  'Microsoft Zhiwei - Chinese (Traditional, Taiwan)',
  // Apple voices (good quality on macOS/iOS)
  'Ting-Ting',
  'Sin-ji',
  'Mei-Jia',
  'Mei-Ling'
];

/**
 * Gets the best available Chinese voice based on a priority list
 * @returns The best available Chinese voice or null if none are available
 */
export function getBestChineseVoice(): SpeechSynthesisVoice | null {
  const chineseVoices = getChineseVoices();
  if (chineseVoices.length === 0) return null;
  
  // First try to find a voice from our preferred list
  for (const preferredVoiceName of PREFERRED_CHINESE_VOICES) {
    const voice = chineseVoices.find(v => 
      v.name === preferredVoiceName || 
      v.voiceURI === preferredVoiceName
    );
    if (voice) return voice;
  }
  
  // If no preferred voice is found, return the first Chinese voice
  return chineseVoices[0];
}

/**
 * Cancels any ongoing speech
 */
export function cancelSpeech(): void {
  if (isSpeechSupported()) {
    window.speechSynthesis.cancel();
  }
} 