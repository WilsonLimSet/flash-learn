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
  // Legacy fields (kept for backward compatibility)
  nextReviewDate?: string;
  reviewLevel?: number; // 0, 1, 2, 4, 8, 16, etc. (days)
  
  // New fields for separate reading and listening practice
  readingReviewLevel: number;
  readingNextReviewDate: string;
  listeningReviewLevel: number;
  listeningNextReviewDate: string;
  
  createdAt: string;
  categoryId?: string; // Optional category ID
}

export interface Category {
  id: string;
  name: string;
  color: string; // For visual distinction
  createdAt: string;
} 