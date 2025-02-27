declare module 'chinese-to-pinyin';

declare module 'chinese-to-pinyin' {
  const chineseToPinyin: {
    (text: string, options?: {
      /**
       * Whether to include tone numbers instead of tone marks
       * @default false
       */
      toneNumbers?: boolean;
      /**
       * Whether to remove tone marks completely
       * @default false
       */
      noTone?: boolean;
      /**
       * Whether to use v instead of ü
       * @default false
       */
      useV?: boolean;
      /**
       * Whether to separate syllables with spaces
       * @default true
       */
      spaces?: boolean;
    }): string;
  };
  
  export default chineseToPinyin;
} 