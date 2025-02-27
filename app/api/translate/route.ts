import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getCachedTranslation, setCachedTranslation } from '@/utils/translationCache';
import { convertToPinyin } from '@/utils/pinyinConverter';

// Helper function to create MD5 hash
function md5(text: string): string {
  return createHash('md5').update(text).digest('hex');
}

// Replace 'any' with a more specific type
// For example:
interface TranslationResponse {
  from: string;
  to: string;
  trans_result?: Array<{
    src: string;
    dst: string;
    src_tts?: string;
  }>;
  error_code?: string | number;
  error_msg?: string;
}

export async function POST(request: NextRequest) {
  try {
    console.log('API route hit');
    
    // Parse the request body
    const body = await request.json();
    console.log('Request body:', body);
    
    if (!body.text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Check cache first
    const cachedResult = getCachedTranslation(body.text, body.type);
    if (cachedResult) {
      console.log('Using cached translation for:', body.text);
      return NextResponse.json(cachedResult);
    }
    
    const BAIDU_APP_ID = process.env.NEXT_PUBLIC_BAIDU_APP_ID;
    const BAIDU_API_KEY = process.env.NEXT_PUBLIC_BAIDU_API_KEY;
    
    if (!BAIDU_APP_ID || !BAIDU_API_KEY) {
      console.error('API credentials not configured');
      return handleMockResponse(request, body);
    }
    
    // Generate salt and sign according to Baidu API requirements
    const salt = Date.now().toString();
    const sign = md5(BAIDU_APP_ID + body.text + salt + BAIDU_API_KEY);
    
    // Determine target language based on request type
    const to = body.type === 'pinyin' ? 'zh' : 'en';
    
    // Call Baidu Translate API
    const apiUrl = `https://fanyi-api.baidu.com/api/trans/vip/translate?q=${encodeURIComponent(body.text)}&from=zh&to=${to}&appid=${BAIDU_APP_ID}&salt=${salt}&sign=${sign}`;
    
    const response = await fetch(apiUrl, { method: 'GET' });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Baidu API error response:', errorText);
      return handleMockResponse(request, body);
    }
    
    const data: TranslationResponse = await response.json();
    
    // Check for API errors
    if (data.error_code) {
      console.error(`Baidu API error: ${data.error_code} - ${data.error_msg}`);
      return handleMockResponse(request, body);
    }
    
    // Check if we have valid translation results
    if (!data.trans_result || data.trans_result.length === 0) {
      console.warn('No translation result from Baidu API, using fallback');
      return handleMockResponse(request, body);
    }
    
    // If Baidu didn't return pinyin, generate it locally
    for (const result of data.trans_result) {
      if (!result.src_tts) {
        result.src_tts = convertToPinyin(result.src);
      }
    }
    
    // Cache the result
    setCachedTranslation(body.text, body.type, data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    // Log the error for debugging
    console.error("Translation error:", error);
    return handleMockResponse(request);
  }
}

// Helper function to handle mock responses
async function handleMockResponse(request: NextRequest, body?: Record<string, string>) {
  try {
    // If we have the body already parsed, use it
    const requestBody = body || (await request.json());
    const text = requestBody.text || '';
    const type = requestBody.type || 'translation';
    
    console.log('Using mock response for:', { text, type });
    // Generate proper pinyin for the text
    const properPinyin = convertToPinyin(text);
    
    if (type === 'example') {
      return NextResponse.json({
        from: 'zh',
        to: 'en',
        trans_result: [{ 
          src: text,
          dst: `This is an example sentence using "${text}".`,
          src_tts: properPinyin
        }],
      });
    } else if (type === 'pinyin') {
      // If we're just requesting pinyin, return that
      return NextResponse.json({
        from: 'zh',
        to: 'zh',
        trans_result: [{ 
          src: text,
          dst: text,
          src_tts: properPinyin
        }]
      });
    } else {
      return NextResponse.json({
        from: 'zh',
        to: 'en',
        trans_result: [{ 
          src: text,
          dst: text === "你好" ? "hello" : "example translation",
          src_tts: properPinyin
        }]
      });
    }
  } catch (_) {
    // If we can't parse the request, return a generic mock
    return NextResponse.json({
      from: 'zh',
      to: 'en',
      trans_result: [{ 
        src: 'mock',
        dst: 'mock translation',
        src_tts: 'mò kè'
      }]
    });
  }
} 