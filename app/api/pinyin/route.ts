import { NextRequest, NextResponse } from 'next/server';
import chineseToPinyin from 'chinese-to-pinyin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body.text;
    
    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }
    
    // Use the chinese-to-pinyin library
    const pinyinText = chineseToPinyin(text);
    
    return NextResponse.json({ pinyin: pinyinText });
  } catch (error) {
    console.error('Pinyin API route error:', error);
    return NextResponse.json({ error: 'Failed to convert to pinyin' }, { status: 500 });
  }
} 