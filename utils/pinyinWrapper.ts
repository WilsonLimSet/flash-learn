// Create a wrapper for the library
const chineseToPinyin = require('chinese-to-pinyin');

// Simple mapping for fallback only when the library fails
const fallbackPinyinMap: Record<string, string> = {
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
  "英": "yīng"
};

// Common phrases with their pinyin for fallback
const commonPhrases: Record<string, string> = {
  "你好": "nǐ hǎo",
  "谢谢": "xiè xiè",
  "再见": "zài jiàn",
  "中国": "zhōng guó",
  "学习": "xué xí",
  "语言": "yǔ yán",
  "汉语": "hàn yǔ",
  "英语": "yīng yǔ"
};

export function convertChineseToPinyin(text: string, options?: {
  toneNumbers?: boolean;
  noTone?: boolean;
  useV?: boolean;
  spaces?: boolean;
}): string {
  console.log("Converting to pinyin:", text);
  
  try {
    // First check if we have a direct mapping for common phrases
    if (commonPhrases[text]) {
      console.log("Found common phrase match:", commonPhrases[text]);
      return commonPhrases[text];
    }
    
    // Use the pinyin library
    const result = chineseToPinyin(text, options);
    console.log("Used pinyin library:", result);
    return result;
  } catch (error) {
    console.error("Error using pinyin library:", error);
    
    // Fallback to character-by-character conversion using our map
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (fallbackPinyinMap[char]) {
        result += fallbackPinyinMap[char] + ' ';
      } else {
        // If we don't have a mapping, just use the character
        result += char + ' ';
      }
    }
    
    console.log("Fallback pinyin conversion:", result.trim());
    return result.trim();
  }
} 