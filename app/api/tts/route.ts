import { NextRequest, NextResponse } from 'next/server';

// This function will handle text-to-speech requests
export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    console.log('TTS request body:', body);
    
    if (!body.text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Use the Google Translate TTS API with proper headers
    const text = encodeURIComponent(body.text);
    
    // Limit text length to avoid issues (Google TTS has a character limit)
    const limitedText = text.length > 150 ? text.substring(0, 150) : text;
    
    // Build the URL with proper parameters
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${limitedText}&tl=zh-CN&client=tw-ob&total=1&idx=0&textlen=${limitedText.length}`;
    
    try {
      // Make a test request to verify the URL works
      const response = await fetch(audioUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': 'https://translate.google.com/',
          'Accept': '*/*'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.status}`);
      }
      
      // If we get here, the URL is valid
      return NextResponse.json({ 
        success: true,
        audioUrl,
        text: body.text
      });
    } catch (fetchError) {
      console.error("Error fetching audio:", fetchError);
      
      // Fallback to a data URI with a simple message
      return NextResponse.json({
        success: false,
        error: 'Could not generate audio',
        // Fallback to browser's built-in speech synthesis
        useFallback: true,
        text: body.text
      });
    }
    
  } catch (error) {
    console.error("TTS error:", error);
    
    // We can't access body.text here because the request parsing might have failed
    return NextResponse.json({ 
      error: 'Failed to generate speech',
      details: error instanceof Error ? error.message : String(error),
      useFallback: true,
      text: 'Error occurred' // Use a default text since we can't access the original
    }, { 
      status: 500 
    });
  }
} 