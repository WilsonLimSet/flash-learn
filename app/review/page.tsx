"use client";

import { useState, useEffect, useRef } from "react";
import { getFlashcardsForReview, updateFlashcardReviewLevel, updateReviewStatus, getFlashcards, getCategories, getFlashcardsByCategory } from "@/utils/localStorage";
import Link from "next/link";
import { Flashcard, Category } from "@/types";
import { useSwipeable } from "react-swipeable";
import { playFlashcardAudio, playChineseAudio } from "@/utils/audioUtils";
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
  const [audioMode, setAudioMode] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
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
  
  // Check if running as PWA on mount
  useEffect(() => {
    setIsPwa(isRunningAsPwa());
  }, []);
  
  // Load cards for review based on selected category
  const loadCardsForReview = () => {
    let cardsToReview: Flashcard[] = [];
    
    if (selectedCategory === undefined) {
      // All cards
      cardsToReview = getFlashcardsForReview();
    } else if (selectedCategory === null) {
      // Cards with no category
      const allReviewCards = getFlashcardsForReview();
      cardsToReview = allReviewCards.filter(card => !card.categoryId);
    } else {
      // Cards from specific category
      const categoryCards = getFlashcardsByCategory(selectedCategory);
      const allReviewCards = getFlashcardsForReview();
      cardsToReview = allReviewCards.filter(card => 
        categoryCards.some(catCard => catCard.id === card.id)
      );
    }
    
    setCards(cardsToReview);
    setCurrentCardIndex(0);
    setShowAnswer(false);
    setReviewedCards(new Set());
    
    if (cardsToReview.length === 0) {
      setIsFinished(true);
    } else {
      setIsFinished(false);
    }
  };
  
  // When category selection changes, reload cards
  useEffect(() => {
    loadCardsForReview();
  }, [selectedCategory]);

  const currentCard = cards[currentCardIndex];

  const handleShowAnswer = () => {
    setShowAnswer(true);
    
    // If in audio mode, play the audio when showing the answer
    if (audioMode && currentCard) {
      playCardAudio();
    }
  };

  // Function to play the current card's audio
  const playCardAudio = async () => {
    if (!currentCard || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      const result = await playChineseAudio(currentCard.chinese);
      
      // If pwaOnly flag is set, show the PWA message
      if (result.pwaOnly) {
        setShowPwaMessage(true);
      }
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const handleResult = (successful: boolean) => {
    if (!currentCard) return;

    // Update the card's review level
    updateFlashcardReviewLevel(currentCard.id, successful);
    
    if (successful) {
      // If successful, remove this card from the current review session
      // and mark it as reviewed
      const newReviewed = new Set(reviewedCards);
      newReviewed.add(currentCard.id);
      setReviewedCards(newReviewed);
      
      // Remove the card from the current session
      const updatedCards = cards.filter(card => card.id !== currentCard.id);
      setCards(updatedCards);
      
      // Check if we've finished all cards
      if (updatedCards.length === 0) {
        setIsFinished(true);
        return;
      }
      
      // Adjust current index if needed
      if (currentCardIndex >= updatedCards.length) {
        setCurrentCardIndex(0);
      }
      
      // Reset answer state
      setShowAnswer(false);
    } else {
      // If unsuccessful, keep the card in the queue but move to the next card
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
      } else {
        setCurrentCardIndex(0);
      }
      setShowAnswer(false);
    }
  };

  const toggleReviewMode = () => {
    setReviewMode(prev => 
      prev === "chineseToEnglish" ? "englishToChinese" : "chineseToEnglish"
    );
  };

  const toggleAudioMode = () => {
    // If not running as PWA, show the message
    if (!isPwa) {
      setShowPwaMessage(true);
      return;
    }
    
    setAudioMode(prev => !prev);
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
                All Cards
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
                Uncategorized Cards
              </button>
              
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setShowCategoryFilter(false);
                  }}
                  className={`px-3 py-2 rounded-md text-sm flex items-center ${
                    selectedCategory === category.id
                      ? 'bg-fl-red text-white'
                      : 'text-black hover:bg-gray-300'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id 
                      ? undefined 
                      : `${category.color}40` // 40 is for 25% opacity in hex
                  }}
                >
                  <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: category.color }}></span>
                  {category.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowCategoryFilter(false)}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Add this to the JSX where you want to show the toggle for audio mode
  const renderAudioModeToggle = () => {
    return (
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center">
          <PwaWrapper>
            <button
              onClick={toggleAudioMode}
              className={`flex items-center px-3 py-2 rounded-md text-sm ${
                audioMode
                  ? 'bg-fl-red text-white'
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828a1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              {audioMode ? "Audio Mode: ON" : "Audio Mode: OFF"}
            </button>
          </PwaWrapper>
        </div>
        
        <div className="flex items-center">
          <PwaWrapper>
            <button
              onClick={toggleReviewMode}
              className="flex items-center px-3 py-2 rounded-md text-sm bg-gray-200 text-black hover:bg-gray-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              {reviewMode === "chineseToEnglish" ? "Chinese → English" : "English → Chinese"}
            </button>
          </PwaWrapper>
        </div>
      </div>
    );
  };

  // Add a play button to the card
  const renderPlayButton = () => {
    if (!currentCard || !audioMode) return null;
    
    return (
      <PwaWrapper>
        <button
          onClick={playCardAudio}
          disabled={isPlayingAudio}
          className={`mt-2 px-4 py-2 rounded-full ${
            isPlayingAudio 
              ? 'bg-gray-300 text-gray-500' 
              : 'bg-fl-red text-white hover:bg-fl-red/90'
          }`}
        >
          {isPlayingAudio ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Playing...
            </span>
          ) : (
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Play Audio
            </span>
          )}
        </button>
      </PwaWrapper>
    );
  };

  // Render the PWA install message
  const renderPwaMessage = () => {
    if (!showPwaMessage) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-xl font-bold mb-4 text-black">Install FlashLearn</h2>
          
          <div className="mb-6 text-black">
            <p className="mb-4">{getPwaInstallMessage()}</p>
            <p className="text-sm text-gray-600">Audio features are only available in the installed app version.</p>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setShowPwaMessage(false)}
              className="px-4 py-2 bg-fl-red text-white rounded-md hover:bg-fl-red/90"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (isFinished) {
    return (
      <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Review Complete!</h1>
        
        <div className="text-center mb-8 text-black">
          <p className="mb-4 text-black">
            {selectedCategory !== undefined 
              ? (selectedCategory === null 
                ? "You've reviewed all uncategorized flashcards for today." 
                : `You've reviewed all flashcards in the "${categories.find(c => c.id === selectedCategory)?.name}" category for today.`)
              : "You've reviewed all your due flashcards for today."}
          </p>
          
          <div className="mt-8">
            <button
              onClick={toggleCategoryFilter}
              className="px-5 py-3 bg-gradient-to-r from-fl-yellow-DEFAULT to-fl-yellow-light text-black rounded-md hover:from-fl-yellow-light hover:to-fl-yellow-DEFAULT font-medium shadow-md transition-all duration-300 flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Review Another Category
            </button>
          </div>
        </div>
        
        {renderCategoryFilterModal()}
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">No Cards to Review</h1>
        
        <div className="text-center mb-8 text-black">
          <p className="mb-4 text-black">
            {selectedCategory !== undefined 
              ? (selectedCategory === null 
                ? "There are no uncategorized flashcards due for review today." 
                : `There are no flashcards in the "${categories.find(c => c.id === selectedCategory)?.name}" category due for review today.`)
              : "You don't have any flashcards due for review today."}
          </p>
          
          <div className="mt-8">
            <button
              onClick={toggleCategoryFilter}
              className="px-5 py-3 bg-gradient-to-r from-fl-yellow-DEFAULT to-fl-yellow-light text-black rounded-md hover:from-fl-yellow-light hover:to-fl-yellow-DEFAULT font-medium shadow-md transition-all duration-300 flex items-center justify-center mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Try Another Category
            </button>
          </div>
        </div>
        
        {renderCategoryFilterModal()}
      </div>
    );
  }

  const currentCategory = getCurrentCardCategory();

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Review Cards</h1>
        <PwaWrapper>
          <button
            onClick={toggleCategoryFilter}
            className="flex items-center text-sm text-fl-red hover:text-fl-red/80"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>
            Filter
          </button>
        </PwaWrapper>
      </div>
      
      {/* Add the audio mode toggle */}
      {renderAudioModeToggle()}
      
      {audioMode && isPwa && (
        <div className="mb-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
          <p className="flex items-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
            </svg>
            <span>
              Audio mode uses your browser's speech synthesis. If you don't hear anything, check that your volume is on and your browser supports speech synthesis.
            </span>
          </p>
        </div>
      )}
      
      <div className="mb-4 text-sm text-gray-500">
        {reviewedCards.size} of {cards.length} cards reviewed
      </div>
      
      {currentCard && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 relative">
          {/* Category badge if available */}
          {getCurrentCardCategory() && (
            <div 
              className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs"
              style={{ 
                backgroundColor: `${getCurrentCardCategory()?.color}40`,
                color: getCurrentCardCategory()?.color
              }}
            >
              {getCurrentCardCategory()?.name}
            </div>
          )}
          
          <div className="mb-6">
            {reviewMode === "chineseToEnglish" ? (
              <>
                <h2 className="text-3xl font-bold mb-2 text-black">{currentCard.chinese}</h2>
                {renderPlayButton()}
              </>
            ) : (
              <h2 className="text-2xl font-bold mb-2 text-black">{currentCard.english}</h2>
            )}
          </div>
          
          {!showAnswer ? (
            <PwaWrapper>
              <button
                onClick={handleShowAnswer}
                className="w-full bg-fl-red text-white py-3 rounded-md hover:bg-fl-red/90 font-medium"
              >
                Show Answer
              </button>
            </PwaWrapper>
          ) : (
            <div>
              {reviewMode === "chineseToEnglish" ? (
                <div className="mb-6">
                  <p className="text-xl text-black mb-2">{currentCard.pinyin}</p>
                  <p className="text-xl text-black">{currentCard.english}</p>
                </div>
              ) : (
                <div className="mb-6">
                  <h3 className="text-3xl font-bold mb-2 text-black">{currentCard.chinese}</h3>
                  <p className="text-xl text-black mb-2">{currentCard.pinyin}</p>
                  {renderPlayButton()}
                </div>
              )}
              
              <div className="flex space-x-4">
                <PwaWrapper>
                  <button
                    onClick={() => handleResult(false)}
                    className="flex-1 bg-gray-200 text-black py-3 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Again
                  </button>
                </PwaWrapper>
                <PwaWrapper>
                  <button
                    onClick={() => handleResult(true)}
                    className="flex-1 bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-medium"
                  >
                    Got It
                  </button>
                </PwaWrapper>
              </div>
            </div>
          )}
        </div>
      )}
      
      {renderPwaMessage()}
      {renderCategoryFilterModal()}
    </div>
  );
} 