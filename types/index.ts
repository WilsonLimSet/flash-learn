export interface Flashcard {
  id: string;
  chinese: string;
  pinyin: string;
  english: string;
  example?: {
    chinese: string;
    pinyin: string;
    english: string;
  };
  nextReviewDate: string;
  reviewLevel: number; // 0, 1, 2, 4, 8, 16, etc. (days)
  createdAt: string;
} 