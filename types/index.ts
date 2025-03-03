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
  categoryId?: string; // Optional category ID
}

export interface Category {
  id: string;
  name: string;
  color: string; // For visual distinction
  createdAt: string;
} 