import { convertChineseToPinyin } from './pinyinWrapper';

// Common phrases with their pinyin for fallback
export const commonPhrases: Record<string, string> = {
  "你好": "nǐ hǎo",
  "谢谢": "xiè xiè",
  "再见": "zài jiàn",
  "中国": "zhōng guó",
  "学习": "xué xí",
  "语言": "yǔ yán",
  "汉语": "hàn yǔ",
  "英语": "yīng yǔ",
  // Add more common phrases as needed
};

// Function to convert Chinese text to pinyin using an external API
export async function fetchPinyinFromAPI(text: string): Promise<string> {
  try {
    // Call a dedicated pinyin conversion API
    const response = await fetch('https://api.mandarincantonese.com/pinyin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    
    if (!response.ok) {
      throw new Error(`Pinyin API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.pinyin;
  } catch (error) {
    console.error('Error fetching pinyin:', error);
    // Fall back to our local converter
    return convertToPinyin(text);
  }
}

// Convert Chinese text to pinyin using the chinese-to-pinyin library
export function convertToPinyin(text: string): string {
  // Check if we have a direct mapping for the whole phrase
  if (commonPhrases[text]) {
    return commonPhrases[text];
  }
  
  try {
    // Use our wrapper function
    return convertChineseToPinyin(text);
  } catch (error) {
    console.error('Error using pinyin library:', error);
    
    // Return the original text if conversion fails
    return text;
  }
}

// Add a script tag to load the pinyin library from a CDN
if (typeof document !== 'undefined') {
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/pinyin@3/dist/index.js';
  script.onload = () => {
    // Initialize the global pinyin function
    (window as any).pinyinFn = (text: string) => {
      const result = (window as any).pinyin(text, {
        style: (window as any).pinyin.STYLE_TONE,
        heteronym: false
      });
      return result.map((item: string[]) => item[0]).join(' ');
    };
  };
  document.head.appendChild(script);
}

// Function to get pinyin for a specific word or phrase
export async function getPinyinForWord(word: string): Promise<string> {
  // Check if we have a direct mapping for the whole phrase
  if (commonPhrases[word]) {
    return commonPhrases[word];
  }
  
  // Otherwise, convert using the library
  return convertToPinyin(word);
} 