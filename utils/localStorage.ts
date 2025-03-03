import { Flashcard, Category } from "@/types";

const FLASHCARDS_KEY = "flashcards";
const CATEGORIES_KEY = "categories";

export function getFlashcards(): Flashcard[] {
  if (typeof window === "undefined") return [];
  
  const storedCards = localStorage.getItem(FLASHCARDS_KEY);
  if (!storedCards) return [];
  
  try {
    return JSON.parse(storedCards);
  } catch (error) {
    console.error("Error parsing flashcards:", error);
    return [];
  }
}

export function addFlashcard(card: Flashcard): void {
  if (typeof window === "undefined") return;
  
  const cards = getFlashcards();
  cards.push(card);
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
}

export function updateFlashcard(updatedCard: Flashcard): void {
  if (typeof window === "undefined") return;
  
  const cards = getFlashcards();
  const index = cards.findIndex(card => card.id === updatedCard.id);
  
  if (index !== -1) {
    cards[index] = updatedCard;
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
  }
}

export function deleteFlashcard(id: string): void {
  if (typeof window === "undefined") return;
  
  const cards = getFlashcards();
  const filteredCards = cards.filter(card => card.id !== id);
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(filteredCards));
}

export function clearAllFlashcards(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(FLASHCARDS_KEY);
}

export function getFlashcardsForReview(dateString: string = new Date().toISOString().split('T')[0]): Flashcard[] {
  const cards = getFlashcards();
  const today = new Date(dateString);
  today.setHours(0, 0, 0, 0); // Set to beginning of day
  
  return cards.filter(card => {
    // Level 0 cards should always be included
    if (card.reviewLevel === 0) return true;
    
    // For other cards, compare dates properly
    const reviewDate = new Date(card.nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0); // Set to beginning of day
    
    return reviewDate <= today;
  });
}

export function updateReviewStatus(id: string, successful: boolean): void {
  const cards = getFlashcards();
  const index = cards.findIndex(card => card.id === id);
  
  if (index !== -1) {
    const card = cards[index];
    
    // Calculate next review date based on spaced repetition
    const today = new Date();
    let nextLevel: number;
    
    if (successful) {
      // If review was successful, increase the level (up to level 5)
      nextLevel = Math.min(card.reviewLevel + 1, 5);
    } else {
      // If review failed, reset to level 0
      nextLevel = 0;
    }
    
    // Use our new pattern to determine days until next review
    let daysToAdd = 0;
    switch(nextLevel) {
      case 0: daysToAdd = 0; break;    // today
      case 1: daysToAdd = 1; break;    // tomorrow
      case 2: daysToAdd = 2; break;    // in 2 days
      case 3: daysToAdd = 4; break;    // in 4 days
      case 4: daysToAdd = 8; break;    // in 8 days
      case 5: daysToAdd = 14; break;   // in 14 days
      default: daysToAdd = nextLevel;  // fallback
    }
    
    // Set the next review date
    const nextReview = new Date(today);
    nextReview.setDate(today.getDate() + daysToAdd);
    
    // Update the card
    cards[index] = {
      ...card,
      reviewLevel: nextLevel,
      nextReviewDate: nextReview.toISOString().split('T')[0]
    };
    
    localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(cards));
  }
}

export function getFlashcard(id: string): Flashcard | null {
  const cards = getFlashcards();
  return cards.find(card => card.id === id) || null;
}

/**
 * Updates a flashcard's review level based on whether the review was successful
 * @param id The flashcard ID
 * @param successful Whether the review was successful
 */
export function updateFlashcardReviewLevel(id: string, successful: boolean): void {
  const flashcards = getFlashcards();
  const cardIndex = flashcards.findIndex(card => card.id === id);
  
  if (cardIndex === -1) return;
  
  const card = flashcards[cardIndex];
  
  // Update the review level
  if (successful) {
    // If successful, move up one level (max level is 5)
    card.reviewLevel = Math.min(card.reviewLevel + 1, 5);
  } else {
    // If unsuccessful, decrease by 1 level (min level is 0)
    card.reviewLevel = Math.max(card.reviewLevel - 1, 0);
  }
  
  // Calculate the next review date based on the new level
  const today = new Date();
  const nextReview = new Date(today);
  
  // Set the next review date based on the new level using a more consistent progression
  let daysToAdd = 0;
  switch(card.reviewLevel) {
    case 0: daysToAdd = 0; break;    // today (review again in the same session)
    case 1: daysToAdd = 1; break;    // tomorrow
    case 2: daysToAdd = 3; break;    // in 3 days
    case 3: daysToAdd = 7; break;    // in 1 week
    case 4: daysToAdd = 14; break;   // in 2 weeks
    case 5: daysToAdd = 30; break;   // in 1 month
    default: daysToAdd = 1; // fallback to 1 day
  }
  
  nextReview.setDate(today.getDate() + daysToAdd);
  card.nextReviewDate = nextReview.toISOString();
  
  // Save the updated flashcards
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(flashcards));
}

// Category Management Functions
export function getCategories(): Category[] {
  if (typeof window === "undefined") return [];
  
  const storedCategories = localStorage.getItem(CATEGORIES_KEY);
  if (!storedCategories) return [];
  
  try {
    return JSON.parse(storedCategories);
  } catch (error) {
    console.error("Error parsing categories:", error);
    return [];
  }
}

export function addCategory(category: Category): void {
  if (typeof window === "undefined") return;
  
  const categories = getCategories();
  categories.push(category);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export function updateCategory(updatedCategory: Category): void {
  if (typeof window === "undefined") return;
  
  const categories = getCategories();
  const index = categories.findIndex(category => category.id === updatedCategory.id);
  
  if (index !== -1) {
    categories[index] = updatedCategory;
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }
}

export function deleteCategory(id: string): void {
  if (typeof window === "undefined") return;
  
  // Remove the category
  const categories = getCategories();
  const filteredCategories = categories.filter(category => category.id !== id);
  localStorage.setItem(CATEGORIES_KEY, JSON.stringify(filteredCategories));
  
  // Update all flashcards that had this category
  const flashcards = getFlashcards();
  const updatedFlashcards = flashcards.map(card => {
    if (card.categoryId === id) {
      return { ...card, categoryId: undefined };
    }
    return card;
  });
  
  localStorage.setItem(FLASHCARDS_KEY, JSON.stringify(updatedFlashcards));
}

export function getCategory(id: string): Category | null {
  const categories = getCategories();
  return categories.find(category => category.id === id) || null;
}

export function getFlashcardsByCategory(categoryId: string | null): Flashcard[] {
  const flashcards = getFlashcards();
  
  if (categoryId === null) {
    // Return cards without a category
    return flashcards.filter(card => !card.categoryId);
  }
  
  return flashcards.filter(card => card.categoryId === categoryId);
} 