// No need to import crypto or create md5 function here anymore

// Import the pinyin conversion utility
import { convertToPinyin } from '@/utils/pinyinConverter';

// Baidu Translate API configuration
// You should store these in environment variables in a production app
const BAIDU_APP_ID = process.env.NEXT_PUBLIC_BAIDU_APP_ID || 'YOUR_BAIDU_APP_ID';
const BAIDU_API_KEY = process.env.NEXT_PUBLIC_BAIDU_API_KEY || 'YOUR_BAIDU_API_KEY';

interface BaiduTranslateResponse {
  from: string;
  to: 'en';
  trans_result: Array<{
    src: string;
    dst: string;
    src_tts?: string; // Pinyin from Baidu
  }>;
}

export async function translateFromChinese(text: string): Promise<{
  chinese: string;
  pinyin: string;
  english: string;
}> {
  try {
    console.log('Attempting to translate:', text);
    
    // Call our Next.js API route instead of Baidu directly
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, type: 'translation' }),
      cache: 'no-store' // Ensure we don't get cached responses
    });
    
    console.log('API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error response:', errorText);
      throw new Error(`Translation API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json() as BaiduTranslateResponse;
    console.log('Translation API response data:', data);
    
    if (!data.trans_result || data.trans_result.length === 0) {
      throw new Error('No translation result');
    }
    
    const result = data.trans_result[0];
    const english = result.dst;
    
    // Try to get pinyin from the API response
    let pinyin = result.src_tts;
    
    // If Baidu didn't return pinyin, make a dedicated request for it
    if (!pinyin) {
      try {
        // Use the same API route but with type=pinyin
        const pinyinResponse = await fetch('/api/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, type: 'pinyin' }),
          cache: 'no-store'
        });
        
        if (pinyinResponse.ok) {
          const pinyinData = await pinyinResponse.json();
          if (pinyinData.trans_result && pinyinData.trans_result.length > 0) {
            pinyin = pinyinData.trans_result[0].src_tts;
          }
        }
      } catch (error) {
        console.error('Error fetching pinyin:', error);
      }
      
      // If we still don't have pinyin, use our local converter
      if (!pinyin) {
        pinyin = convertToPinyin(text);
      }
    }
    
    console.log('Extracted pinyin from response:', pinyin);
    
    return {
      chinese: text,
      pinyin: pinyin || getPinyinFallback(text),
      english
    };
  } catch (error) {
    console.error('Translation error:', error);
    
    // Fallback to mock data in case of error
    return {
      chinese: text,
      pinyin: text === "你好" ? "nǐ hǎo" : convertToPinyin(text) || "hàn yǔ pīn yīn",
      english: text === "你好" ? "hello" : "example translation"
    };
  }
}

// Fallback function if Baidu doesn't return pinyin
function getPinyinFallback(text: string): string {
  // Simple mapping for common words as a last resort
  const pinyinMap: Record<string, string> = {
    "你好": "nǐ hǎo",
    "谢谢": "xiè xiè",
    "再见": "zài jiàn",
    "中国": "zhōng guó",
    "学习": "xué xí",
    "语言": "yǔ yán",
    "汉语": "hàn yǔ",
    "英语": "yīng yǔ"
  };
  
  return pinyinMap[text] || convertToPinyin(text) || "hàn yǔ pīn yīn";
} 