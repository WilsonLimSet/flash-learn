"use client";

import { useState, useEffect, useRef } from "react";
import { getFlashcardsForReview, updateFlashcardReviewLevel, updateReviewStatus, getFlashcards } from "@/utils/localStorage";
import Link from "next/link";
import { Flashcard } from "@/types";
import { useSwipeable } from "react-swipeable";

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState<"chineseToEnglish" | "englishToChinese">("chineseToEnglish");
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());
  const [totalCards, setTotalCards] = useState(0);
  
  useEffect(() => {
    const cardsToReview = getFlashcardsForReview();
    const allCards = getFlashcards();
    
    setCards(cardsToReview);
    setTotalCards(allCards.length);
    
    if (cardsToReview.length === 0) {
      setIsFinished(true);
    }
  }, []);

  const currentCard = cards[currentCardIndex];

  const handleShowAnswer = () => {
    setShowAnswer(true);
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

  if (isFinished) {
    return (
      <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Review Complete!</h1>
        
        <div className="text-center mb-8 text-black">
          <p className="mb-4 text-black">You've reviewed all your due flashcards for today.</p>
          
          <div className="flex flex-col space-y-4 mt-8">
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">No Cards to Review</h1>
        
        <div className="text-center mb-8 text-black">
          <p className="mb-4 text-black">You don't have any flashcards due for review today.</p>
          
          <div className="flex flex-col space-y-4 mt-8">
            <Link href="/" className="bg-fl-red text-white py-3 px-4 rounded-md hover:bg-fl-red/90 text-center">
              Create New Flashcards
            </Link>
            
            <Link href="/manage" className="bg-fl-yellow-DEFAULT text-black py-3 px-4 rounded-md hover:bg-fl-yellow-DEFAULT/90 text-center">
              Manage Flashcards
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-center text-black">Review Flashcards</h1>
      
      <div className="flex justify-between items-center mb-6">
        <span className="mr-3 text-black font-medium">
          {reviewedCards.size} completed, {cards.length} remaining
        </span>
        <button 
          onClick={toggleReviewMode}
          className="bg-fl-yellow-DEFAULT text-black py-2 px-4 rounded-md hover:bg-fl-yellow-DEFAULT/90 text-sm font-medium"
        >
          {reviewMode === "chineseToEnglish" ? "Chinese → English" : "English → Chinese"}
        </button>
      </div>
      
      <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6 relative">
        <div className="text-center mb-8">
          <p className="text-black mb-2 font-medium">Card {currentCardIndex + 1} of {cards.length}</p>
          
          {reviewMode === "chineseToEnglish" ? (
            <div>
              <h2 className="text-3xl font-bold mb-2">{currentCard.chinese}</h2>
              <p className="text-xl text-black font-medium">{currentCard.pinyin}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-bold">{currentCard.english}</h2>
            </div>
          )}
        </div>
        
        {showAnswer ? (
          <div className="text-center mb-8">
            <h3 className="text-xl font-semibold mb-2">Answer:</h3>
            {reviewMode === "chineseToEnglish" ? (
              <p className="text-2xl">{currentCard.english}</p>
            ) : (
              <div>
                <p className="text-2xl font-bold mb-1">{currentCard.chinese}</p>
                <p className="text-xl text-black font-medium">{currentCard.pinyin}</p>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={handleShowAnswer}
            className="w-full bg-fl-red text-white py-3 rounded-md hover:bg-fl-red/90 font-medium mt-4"
          >
            Show Answer
          </button>
        )}
        
        {showAnswer && (
          <div className="flex space-x-4 mt-4">
            <button
              onClick={() => handleResult(false)}
              className="flex-1 bg-gray-400 text-white py-3 rounded-md hover:bg-gray-500 font-medium"
            >
              Incorrect
            </button>
            <button
              onClick={() => handleResult(true)}
              className="flex-1 bg-fl-salmon text-white py-3 rounded-md hover:bg-fl-salmon/90 font-medium"
            >
              Correct
            </button>
          </div>
        )}
      </div>
      
      <div className="text-center text-black font-medium">
        <p>Review Level: {currentCard.reviewLevel}</p>
      </div>
    </div>
  );
} 