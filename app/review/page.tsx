"use client";

import { useState, useEffect } from "react";
import { getFlashcardsForReview, updateFlashcardReviewLevel, updateReviewStatus, getFlashcards } from "@/utils/localStorage";
import Link from "next/link";
import { Flashcard } from "@/types";

export default function ReviewPage() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [reviewMode, setReviewMode] = useState<"chineseToEnglish" | "englishToChinese">("chineseToEnglish");
  const [reviewedCards, setReviewedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const cardsToReview = getFlashcardsForReview();
    console.log("Cards to review:", cardsToReview);
    
    // Also log all cards to compare
    const allCards = getFlashcards();
    console.log("All cards:", allCards);
    
    setCards(cardsToReview);
    
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

    // Update the card's review status in localStorage
    updateReviewStatus(currentCard.id, successful);
    
    // Update the card's review level
    updateFlashcardReviewLevel(currentCard.id, successful);
    
    if (successful) {
      // If successful, mark as reviewed and move to next card
      const newReviewed = new Set(reviewedCards);
      newReviewed.add(currentCard.id);
      setReviewedCards(newReviewed);
      
      // Move to next unreviewed card or finish
      moveToNextUnreviewedCard(newReviewed);
    } else {
      // If unsuccessful, update the card's status but keep it in the queue
      // Move to next card, but we'll come back to this one
      if (currentCardIndex < cards.length - 1) {
        setCurrentCardIndex(currentCardIndex + 1);
        setShowAnswer(false);
      } else {
        // If we're at the end, start from the beginning to review failed cards
        setCurrentCardIndex(0);
        setShowAnswer(false);
      }
    }
  };
  
  const moveToNextUnreviewedCard = (reviewed: Set<string>) => {
    // Check if all cards have been successfully reviewed
    if (reviewed.size >= cards.length) {
      setIsFinished(true);
      return;
    }
    
    // Find the next unreviewed card
    let nextIndex = currentCardIndex;
    let found = false;
    
    // Try to find an unreviewed card after the current one
    for (let i = 1; i < cards.length; i++) {
      const checkIndex = (currentCardIndex + i) % cards.length;
      if (!reviewed.has(cards[checkIndex].id)) {
        nextIndex = checkIndex;
        found = true;
        break;
      }
    }
    
    if (found) {
      setCurrentCardIndex(nextIndex);
      setShowAnswer(false);
    } else {
      // If no unreviewed cards found, we're done
      setIsFinished(true);
    }
  };

  const toggleReviewMode = () => {
    setReviewMode(reviewMode === "chineseToEnglish" ? "englishToChinese" : "chineseToEnglish");
  };

  if (isFinished) {
    return (
      <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
        <h1 className="text-2xl font-bold mb-6 text-center text-black">Review Complete!</h1>
        
        <div className="text-center mb-8 text-black">
          <p className="mb-4 text-black">You've completed all your reviews for today.</p>
          
          <div className="flex flex-col space-y-4 mt-8">
            <Link href="/create" className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 text-center">
              Create New Flashcards
            </Link>
            
            <Link href="/" className="bg-gray-200 text-black py-3 px-4 rounded-md hover:bg-gray-300 text-center">
              Back to Home
            </Link>
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
            <Link href="/create" className="bg-blue-500 text-white py-3 px-4 rounded-md hover:bg-blue-600 text-center">
              Create New Flashcards
            </Link>
            
            <Link href="/" className="bg-gray-200 text-black py-3 px-4 rounded-md hover:bg-gray-300 text-center">
              Back to Home
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
          {reviewedCards.size}/{cards.length} completed
        </span>
        <button 
          onClick={toggleReviewMode}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          {reviewMode === "chineseToEnglish" ? "中 → En" : "En → 中"}
        </button>
      </div>
      
      <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6">
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
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 mb-4 font-medium"
          >
            Show Answer
          </button>
        )}
        
        {showAnswer && (
          <div className="flex gap-3">
            <button
              onClick={() => handleResult(false)}
              className="flex-1 bg-red-100 text-red-700 py-3 rounded-md hover:bg-red-200 font-medium"
            >
              Again
            </button>
            <button
              onClick={() => handleResult(true)}
              className="flex-1 bg-green-100 text-green-700 py-3 rounded-md hover:bg-green-200 font-medium"
            >
              Got It
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