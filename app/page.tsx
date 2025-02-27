"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getFlashcardsForReview, getFlashcards } from "@/utils/localStorage";

export default function Home() {
  const [cardsForReview, setCardsForReview] = useState(0);
  const [totalCards, setTotalCards] = useState(0);

  useEffect(() => {
    const reviewCards = getFlashcardsForReview();
    const allCards = getFlashcards();
    setCardsForReview(reviewCards.length);
    setTotalCards(allCards.length);
  }, []);

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <div className="text-center mb-8">
        <p className="text-black font-medium">Chinese Vocabulary Flashcards</p>
      </div>

      <div className="bg-blue-50 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <div className="flex justify-between items-center">
          <div className="text-center p-4 bg-white rounded-lg flex-1 mr-2 shadow-sm">
            <p className="text-sm text-black font-medium mb-1">To Review</p>
            <p className="text-3xl font-bold text-blue-600">{cardsForReview}</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg flex-1 ml-2 shadow-sm">
            <p className="text-sm text-black font-medium mb-1">Total Cards</p>
            <p className="text-3xl font-bold">{totalCards}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link 
          href="/review" 
          className={`bg-blue-500 text-white p-4 rounded-lg text-center hover:bg-blue-600 transition-colors ${cardsForReview === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="font-bold text-lg mb-1">Review</div>
          <div className="text-sm">{cardsForReview} cards due</div>
        </Link>
        <Link 
          href="/create" 
          className="bg-green-500 text-white p-4 rounded-lg text-center hover:bg-green-600 transition-colors"
        >
          <div className="font-bold text-lg mb-1">Create</div>
          <div className="text-sm">Add new cards</div>
        </Link>
        <Link 
          href="/manage" 
          className="bg-purple-500 text-white p-4 rounded-lg text-center hover:bg-purple-600 transition-colors col-span-2"
        >
          <div className="font-bold text-lg mb-1">Manage</div>
          <div className="text-sm">Edit your flashcard collection</div>
        </Link>
      </div>
      
      </div>
  );
}
