"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getFlashcards, deleteFlashcard, updateFlashcard } from "@/utils/localStorage";
import { Flashcard } from "@/types";
import Link from "next/link";

export default function ManagePage() {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<string | null>(null);
  const [sortByLevel, setSortByLevel] = useState(false);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [editValues, setEditValues] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
    reviewLevel: number;
  }>({ chinese: "", pinyin: "", english: "", reviewLevel: 0 });

  useEffect(() => {
    // Load flashcards from localStorage
    const cards = getFlashcards();
    setFlashcards(cards);
  }, []);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteFlashcard(id);
      setFlashcards(flashcards.filter(card => card.id !== id));
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setEditingCard(card.id);
    setEditValues({
      chinese: card.chinese,
      pinyin: card.pinyin,
      english: card.english,
      reviewLevel: card.reviewLevel
    });
  };

  const handleSaveEdit = (card: Flashcard) => {
    // Calculate next review date based on the level
    const today = new Date();
    const nextReview = new Date(today);
    
    // Use our new pattern
    let daysToAdd = 0;
    switch(editValues.reviewLevel) {
      case 0: daysToAdd = 0; break;    // today
      case 1: daysToAdd = 1; break;    // tomorrow
      case 2: daysToAdd = 2; break;    // in 2 days
      case 3: daysToAdd = 4; break;    // in 4 days
      case 4: daysToAdd = 8; break;    // in 8 days
      case 5: daysToAdd = 14; break;   // in 14 days
      default: daysToAdd = editValues.reviewLevel; // fallback
    }
    
    nextReview.setDate(today.getDate() + daysToAdd);
    
    const updatedCard: Flashcard = {
      ...card,
      chinese: editValues.chinese,
      pinyin: editValues.pinyin,
      english: editValues.english,
      reviewLevel: editValues.reviewLevel,
      nextReviewDate: nextReview.toISOString().split('T')[0]
    };
    
    updateFlashcard(updatedCard);
    
    // Update the state
    setFlashcards(flashcards.map(c => 
      c.id === card.id ? updatedCard : c
    ));
    
    // Exit edit mode
    setEditingCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCard(null);
  };

  const toggleLevelSort = () => {
    if (sortByLevel) {
      if (sortDirection === "desc") {
        // If already sorting by level descending, turn off sorting
        setSortByLevel(false);
      } else {
        // If sorting by level ascending, switch to descending
        setSortDirection("desc");
      }
    } else {
      // Start sorting by level in ascending order
      setSortByLevel(true);
      setSortDirection("asc");
    }
  };

  const getLevelLabel = (level: number): string => {
    switch(level) {
      case 0: return "New";
      case 1: return "Beginner";
      case 2: return "Basic";
      case 3: return "Intermediate";
      case 4: return "Advanced";
      case 5: return "Master";
      default: return `Level ${level}`;
    }
  };

  const getLevelDays = (level: number): string => {
    switch(level) {
      case 0: return "today";
      case 1: return "tomorrow";
      case 2: return "in 2 days";
      case 3: return "in 4 days";
      case 4: return "in 8 days";
      case 5: return "in 14 days";
      default: return `in ${level} days`;
    }
  };

  // Filter cards based on search term
  const filteredCards = searchTerm
    ? flashcards.filter(
        card =>
          card.chinese.includes(searchTerm) ||
          card.english.toLowerCase().includes(searchTerm.toLowerCase()) ||
          card.pinyin.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : flashcards;

  // Sort the filtered cards
  const sortedCards = [...filteredCards].sort((a, b) => {
    if (sortByLevel) {
      // Sort by level
      const comparison = a.reviewLevel - b.reviewLevel;
      return sortDirection === "asc" ? comparison : -comparison;
    } else {
      // Default - return in original order (by creation date)
      return 0; // No sorting
    }
  });

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Manage Flashcards</h1>
      
      <div className="mb-6">
        <Link href="/create" className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 inline-block">
          Create New Flashcard
        </Link>
      </div>
      
      {/* Search and Sort Controls */}
      {flashcards.length > 0 && (
        <div className="mb-6">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search flashcards..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border rounded-md text-black"
            />
          </div>
          
          <div className="flex items-center mb-2">
            <button 
              onClick={toggleLevelSort}
              className={`text-sm px-3 py-2 rounded-md ${
                sortByLevel 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-black hover:bg-gray-300'
              }`}
            >
              {!sortByLevel 
                ? "Sort by Level" 
                : `Level: ${sortDirection === "asc" ? "Low to High" : "High to Low"}`}
            </button>
          </div>
        </div>
      )}
      
      {flashcards.length === 0 ? (
        <div className="text-center py-8 text-black">
          <p className="mb-4 text-black">You don't have any flashcards yet.</p>
          <Link href="/create" className="text-blue-500 hover:underline">
            Create your first flashcard
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedCards.map(card => (
            <div key={card.id} className="border rounded-md p-4">
              {editingCard === card.id ? (
                // Edit mode
                <div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-black mb-1">Chinese</label>
                    <input
                      type="text"
                      value={editValues.chinese}
                      onChange={(e) => setEditValues({...editValues, chinese: e.target.value})}
                      className="w-full p-2 border rounded-md text-black"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-black mb-1">Pinyin</label>
                    <input
                      type="text"
                      value={editValues.pinyin}
                      onChange={(e) => setEditValues({...editValues, pinyin: e.target.value})}
                      className="w-full p-2 border rounded-md text-black"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-black mb-1">English</label>
                    <input
                      type="text"
                      value={editValues.english}
                      onChange={(e) => setEditValues({...editValues, english: e.target.value})}
                      className="w-full p-2 border rounded-md text-black"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-black mb-2">Review Level</label>
                    <div className="flex flex-wrap gap-2">
                      {[0, 1, 2, 3, 4, 5].map(level => (
                        <button
                          key={level}
                          onClick={() => setEditValues({...editValues, reviewLevel: level})}
                          className={`px-3 py-2 rounded-md text-sm ${
                            editValues.reviewLevel === level 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-black hover:bg-gray-300'
                          }`}
                        >
                          {level}: {getLevelLabel(level)}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      Review {getLevelDays(editValues.reviewLevel)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleSaveEdit(card)}
                      className="bg-green-500 text-white py-1 px-3 rounded-md hover:bg-green-600 text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="bg-gray-200 text-black py-1 px-3 rounded-md hover:bg-gray-300 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-black">{card.chinese}</h3>
                      <p className="text-black">{card.pinyin}</p>
                      <p className="text-black">{card.english}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(card)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(card.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        {confirmDelete === card.id ? "Confirm" : "Delete"}
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-black">
                    <div className="flex items-center">
                      <span className="mr-2">Level {card.reviewLevel}: {getLevelLabel(card.reviewLevel)}</span>
                      <span className="text-gray-600">(Review {getLevelDays(card.reviewLevel)})</span>
                    </div>
                    <p className="text-black">Next review: {card.nextReviewDate}</p>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 