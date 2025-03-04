"use client";

import { useState, useEffect, useRef } from "react";
import { getFlashcardsForReview, updateFlashcardReviewLevel, updateReviewStatus, getFlashcards, getCategories, getFlashcardsByCategory } from "@/utils/localStorage";
import Link from "next/link";
import { Flashcard, Category } from "@/types";
import { isRunningAsPwa, getPwaInstallMessage } from "@/utils/pwaUtils";
import PwaWrapper from "@/app/components/PwaWrapper";

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState<"chineseToEnglish" | "englishToChinese">("chineseToEnglish");
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [totalCards, setTotalCards] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null | undefined>(undefined);
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showPwaMessage, setShowPwaMessage] = useState<boolean>(false);
  const [isPwa, setIsPwa] = useState<boolean>(false);
  
  useEffect(() => {
    // Load categories
    const allCategories = getCategories();
    setCategories(allCategories);
    
    // Load all cards for total count
    const allCards = getFlashcards();
    setTotalCards(allCards.length);
    
    // Load initial cards for review (all categories)
    loadCardsForReview();
  }, []);
  
  // Effect to handle changes to the cards array
  useEffect(() => {
    // If we have cards but currentCardIndex is beyond the array length,
    // reset it to the last card in the array
    if (cards.length > 0 && currentCardIndex >= cards.length) {
      setCurrentCardIndex(cards.length - 1);
    }
    
    // If we have no cards, mark as finished
    if (cards.length === 0) {
      setIsFinished(true);
    }
  }, [cards, currentCardIndex]);
  
  // Check if running as PWA on mount
  useEffect(() => {
    setIsPwa(isRunningAsPwa());
  }, []);
  
  // Load cards for review based on selected category
  const loadCardsForReview = () => {
    let cardsToReview: Flashcard[] = [];
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    console.log("Loading cards for review date:", today);
    
    if (selectedCategory === undefined) {
      // All categories
      cardsToReview = getFlashcardsForReview(today);
    } else if (selectedCategory === null) {
      // No category
      cardsToReview = getFlashcardsForReview(today).filter(card => !card.categoryId);
    } else {
      // Specific category
      cardsToReview = getFlashcardsForReview(today).filter(card => card.categoryId === selectedCategory);
    }
    
    console.log(`Found ${cardsToReview.length} cards for review`);
    cardsToReview.forEach(card => {
      console.log(`Card: ${card.chinese}, Level: ${card.reviewLevel}, Next review: ${card.nextReviewDate}`);
    });
    
    // Shuffle the cards
    const shuffled = [...cardsToReview].sort(() => Math.random() - 0.5);
    
    setCards(shuffled);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setIsFinished(false);
    setReviewedCards(new Set());
  };
  
  // Get current card
  const currentCard = cards.length > 0 && currentCardIndex < cards.length 
    ? cards[currentCardIndex] 
    : null;
  
  const handleShowAnswer = () => {
    setShowAnswer(true);
  };
  
  const handleResult = (successful: boolean) => {
    if (!currentCard) return;
    
    // Update review status
    updateReviewStatus(currentCard.id, successful);
    
    // Update review level
    updateFlashcardReviewLevel(currentCard.id, successful);
    
    // Add to reviewed cards
    setReviewedCards(prev => new Set(prev).add(currentCard.id));
    
    if (!successful) {
      // If marked as "Again", add the card back to the end of the queue
      const cardToReview = { ...currentCard };
      
      // Update the card's review level to 0 in our local state as well
      cardToReview.reviewLevel = 0;
      cardToReview.nextReviewDate = new Date().toISOString().split('T')[0];
      
      // Add to the end of the queue
      setCards(prevCards => [...prevCards, cardToReview]);
      console.log(`Card "${cardToReview.chinese}" marked as "Again" - added back to queue`);
    }
    
    // Move to next card
    if (currentCardIndex < cards.length - 1) {
      console.log(`Moving to next card, ${cards.length - currentCardIndex - 1} cards remaining`);
      setCurrentCardIndex(prev => prev + 1);
      setShowAnswer(false);
    } else {
      // We've reached the end of the current queue
      // But we need to check if we've added any "Again" cards that we need to review
      const remainingCards = cards.slice(currentCardIndex + 1);
      if (remainingCards.length > 0) {
        console.log(`${remainingCards.length} cards remaining in the queue`);
        setCurrentCardIndex(prev => prev + 1);
        setShowAnswer(false);
      } else {
        console.log("Review session finished");
        setIsFinished(true);
      }
    }
  };

  const toggleReviewMode = () => {
    setReviewMode(prev => 
      prev === "chineseToEnglish" ? "englishToChinese" : "chineseToEnglish"
    );
  };

  // Get category for current card
  const getCurrentCardCategory = () => {
    if (!currentCard || !currentCard.categoryId) return null;
    return categories.find(cat => cat.id === currentCard.categoryId) || null;
  };
  
  // Toggle category filter modal
  const toggleCategoryFilter = () => {
    setShowCategoryFilter(!showCategoryFilter);
  };
  
  // Category filter modal
  const renderCategoryFilterModal = () => {
    if (!showCategoryFilter) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black">Filter by Category</h2>
          
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => {
                  setSelectedCategory(undefined);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === undefined
                    ? 'bg-fl-red text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                All Categories
              </button>
              
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  setShowCategoryFilter(false);
                }}
                className={`px-3 py-2 rounded-md text-sm ${
                  selectedCategory === null
                    ? 'bg-fl-red text-white'
                    : 'bg-gray-200 text-black hover:bg-gray-300'
                }`}
              >
                No Category
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowCategoryFilter(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm ${
                    selectedCategory === category.id
                      ? 'bg-fl-red text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                  style={selectedCategory === category.id ? {} : { backgroundColor: `${category.color}20`, color: category.color }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <PwaWrapper>
              <button
                onClick={() => setShowCategoryFilter(false)}
                className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
              >
                Close
              </button>
            </PwaWrapper>
          </div>
        </div>
      </div>
    );
  };

  // Render the review mode toggle button
  const renderReviewModeToggle = () => {
    return (
      <PwaWrapper>
        <button
          onClick={toggleReviewMode}
          className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-md text-black text-sm hover:bg-gray-100"
        >
          {reviewMode === "chineseToEnglish" ? (
            <>
              <span className="mr-1">中文</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="ml-1">English</span>
            </>
          ) : (
            <>
              <span className="mr-1">English</span>
              <span className="text-gray-400 mx-1">→</span>
              <span className="ml-1">中文</span>
            </>
          )}
        </button>
      </PwaWrapper>
    );
  };

  // Render the filter button
  const renderFilterButton = () => {
    return (
      <PwaWrapper>
        <button
          onClick={toggleCategoryFilter}
          className="flex items-center justify-center px-3 py-2 bg-white border border-gray-300 rounded-md text-black text-sm hover:bg-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filter
          {selectedCategory !== undefined && selectedCategory !== null && (
            <span className="ml-1 w-2 h-2 rounded-full" style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color || '#ccc' }}></span>
          )}
        </button>
      </PwaWrapper>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Review Flashcards</h1>
      
      {/* Stats */}
      <div className="bg-white rounded-lg shadow-md p-3 mb-6">
        <div className="flex justify-between items-center">
          <div className="text-center p-2 bg-fl-salmon/10 rounded-lg flex-1 mr-2">
            <p className="text-xs sm:text-sm text-black font-medium mb-1">Reviewed</p>
            <p className="text-xl sm:text-2xl font-bold text-fl-red">{reviewedCards.size}</p>
          </div>
          <div className="text-center p-2 bg-fl-yellow/10 rounded-lg flex-1 ml-2">
            <p className="text-xs sm:text-sm text-black font-medium mb-1">To Review</p>
            <p className="text-xl sm:text-2xl font-bold text-fl-yellow-DEFAULT">{cards.length}</p>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between mb-6">
        <div className="flex space-x-2">
          {renderReviewModeToggle()}
          {renderFilterButton()}
        </div>
      </div>
      
      {/* Finished state */}
      {isFinished && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <h2 className="text-xl font-bold mb-4 text-black">All Done!</h2>
          <p className="mb-6 text-gray-600">You've reviewed all the cards due for today in this category.</p>
          <div className="flex flex-col space-y-3">
            <PwaWrapper href="/">
              <button className="w-full py-3 px-4 bg-fl-salmon text-white rounded-md hover:bg-fl-salmon/90">
                Create New Flashcard
              </button>
            </PwaWrapper>
            <PwaWrapper>
              <button 
                onClick={() => {
                  setSelectedCategory(undefined);
                  loadCardsForReview();
                }}
                className="w-full py-3 px-4 bg-fl-yellow text-white rounded-md hover:bg-fl-yellow/90"
              >
                Review All Categories
              </button>
            </PwaWrapper>
          </div>
        </div>
      )}
      
      {/* Card */}
      {!isFinished && currentCard && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          {/* Card header with category if available */}
          {getCurrentCardCategory() && (
            <div 
              className="px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: getCurrentCardCategory()?.color || '#ccc' }}
            >
              {getCurrentCardCategory()?.name}
            </div>
          )}
          
          {/* Card content */}
          <div className="p-6">
            {reviewMode === "chineseToEnglish" ? (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-3xl font-bold mb-2 text-black">{currentCard.chinese}</h2>
                  <p className="text-lg text-gray-600">{currentCard.pinyin}</p>
                </div>
                
                {showAnswer && (
                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-lg font-medium text-black">{currentCard.english}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-2 text-black">{currentCard.english}</h2>
                </div>
                
                {showAnswer && (
                  <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <h3 className="text-3xl font-bold mb-2 text-black">{currentCard.chinese}</h3>
                    <p className="text-lg text-gray-600">{currentCard.pinyin}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Actions */}
      {!isFinished && currentCard && (
        <div className="flex flex-col items-center">
          {!showAnswer ? (
            <PwaWrapper>
              <button
                onClick={handleShowAnswer}
                className="w-full max-w-xs bg-gradient-to-r from-fl-salmon to-fl-red text-white py-3 px-6 rounded-lg hover:from-fl-red hover:to-fl-salmon font-medium shadow-md transition-all duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Show Answer
              </button>
            </PwaWrapper>
          ) : (
            <div className="flex space-x-4 justify-center w-full">
              <PwaWrapper>
                <button
                  onClick={() => handleResult(false)}
                  className="flex-1 max-w-xs bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-6 rounded-lg hover:from-red-600 hover:to-red-500 font-medium shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Again
                </button>
              </PwaWrapper>
              <PwaWrapper>
                <button
                  onClick={() => handleResult(true)}
                  className="flex-1 max-w-xs bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-500 font-medium shadow-md transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Got It
                </button>
              </PwaWrapper>
            </div>
          )}
        </div>
      )}
      
      {renderCategoryFilterModal()}
    </div>
  );
} 