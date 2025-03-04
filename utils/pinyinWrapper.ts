// Create a wrapper for the library
// const chineseToPinyin = require('chinese-to-pinyin');

// Simple mapping for common characters
const pinyinMap: Record<string, string> = {
  "你": "nǐ",
  "好": "hǎo",
  "谢": "xiè",
  "再": "zài",
  "见": "jiàn",
  "中": "zhōng",
  "国": "guó",
  "学": "xué",
  "习": "xí",
  "语": "yǔ",
  "言": "yán",
  "汉": "hàn",
  "英": "yīng",
  // Add more common characters as needed
};

export function convertChineseToPinyin(text: string, options?: {
  toneNumbers?: boolean;
  noTone?: boolean;
  useV?: boolean;
  spaces?: boolean;
}): string {
  // Try to use the window.pinyinFn if available (loaded from CDN)
  if (typeof window !== 'undefined' && (window as any).pinyinFn) {
    return (window as any).pinyinFn(text);
  }
  
  // Fallback to character-by-character conversion using our map
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (pinyinMap[char]) {
      result += pinyinMap[char] + ' ';
    } else {
      // If we don't have a mapping, just use the character
      result += char + ' ';
    }
  }
  
  return result.trim();
} 