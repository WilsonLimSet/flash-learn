// Create a wrapper for the library
const chineseToPinyin = require('chinese-to-pinyin');

export function convertChineseToPinyin(text: string, options?: {
  toneNumbers?: boolean;
  noTone?: boolean;
  useV?: boolean;
  spaces?: boolean;
}): string {
  return chineseToPinyin(text, options);
} 