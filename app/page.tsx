"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { addFlashcard, getCategories } from "@/utils/localStorage";
import { translateFromChinese } from "@/utils/translation";
import { Flashcard, Category } from "@/types";
import isChinese from 'is-chinese';
import PwaWrapper from "@/app/components/PwaWrapper";
import { usePwa } from "@/app/context/PwaContext";

export default function HomePage() {
  const { isPwa, showInstallPrompt } = usePwa();
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidChinese, setIsValidChinese] = useState(true);
  const [translation, setTranslation] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Load categories on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  }, []);

  // Check if the input is valid Chinese text
  const isValidChineseText = (text: string): boolean => {
    // Allow empty strings
    if (!text.trim()) return true;
    
    // Remove spaces
    const trimmedText = text.replace(/\s+/g, '');
    
    // Check if all characters are Chinese
    for (let i = 0; i < trimmedText.length; i++) {
      if (!isChinese(trimmedText[i])) {
        return false;
      }
    }
    
    return true;
  };

  // Check for Chinese characters as the user types
  useEffect(() => {
    setIsValidChinese(isValidChineseText(word));
  }, [word]);

  const handleTranslate = async () => {
    // Reset error state
    setError(null);
    setSaveSuccess(false);
    
    if (!word.trim()) {
      setError("Please enter a word or phrase");
      return;
    }
    
    // Check if input is valid Chinese text
    if (!isValidChineseText(word)) {
      console.log("Invalid Chinese input:", word);
      setError("Please enter text in Chinese characters only");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await translateFromChinese(word);
      setTranslation(result);
    } catch (err) {
      console.error("Translation error:", err);
      setError("Failed to translate. Please check your API keys or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!translation) return;
    
    const today = new Date().toISOString().split('T')[0];
    
    const newCard: Flashcard = {
      id: uuidv4(),
      chinese: translation.chinese,
      pinyin: translation.pinyin,
      english: translation.english,
      // New fields for separate reading and listening practice
      readingReviewLevel: 0,
      readingNextReviewDate: today,
      listeningReviewLevel: 0,
      listeningNextReviewDate: today,
      createdAt: new Date().toISOString(),
      categoryId: selectedCategory
    };
    
    addFlashcard(newCard);
    
    // Show success message
    setSaveSuccess(true);
    
    // Clear the form for a new entry
    setWord("");
    setTranslation(null);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleInputClick = () => {
    if (!isPwa) {
      showInstallPrompt();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white min-h-screen text-black">      
      <div className="mb-6">
        <label htmlFor="word" className="block text-sm font-medium text-black mb-1">
          Enter Chinese Word or Phrase
        </label>
        <div className="relative">
          <input
            type="text"
            id="word"
            value={word}
            onChange={(e) => isPwa ? setWord(e.target.value) : null}
            onClick={handleInputClick}
            className={`w-full p-2 border rounded-md ${!isPwa ? 'bg-gray-100 cursor-not-allowed' : ''} text-black ${!isValidChinese ? 'border-red-500' : 'border-gray-300'}`}
            placeholder={isPwa ? "输入中文" : "Install app to use this feature"}
            disabled={!isPwa}
          />
          {!isValidChinese && isPwa && (
            <p className="text-red-500 text-xs mt-1">
              Please enter Chinese characters only
            </p>
          )}
          {!isPwa && (
            <p className="text-fl-salmon text-xs mt-1">
              Install the app to use all features
            </p>
          )}
        </div>
      </div>
      
      <div className="mb-6">
        <PwaWrapper
          onClick={handleTranslate}
          disabled={isLoading || !isValidChinese || !word.trim()}
          className={`w-full py-2 px-4 rounded-md ${
            isLoading || !isValidChinese || !word.trim() || !isPwa
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-fl-salmon text-white hover:bg-fl-salmon/90'
          }`}
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </PwaWrapper>
      </div>
      
      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      {!isPwa && (
        <div className="mb-6 p-4 border border-fl-salmon/20 rounded-md bg-fl-salmon/5 shadow-sm">
          <h2 className="text-lg font-semibold mb-2 text-fl-salmon">Install FlashLearn App</h2>
          <p className="text-black mb-3">
            Install the app to access all features including:
          </p>
          <ul className="list-disc pl-5 mb-4 text-black">
            <li>Translate Chinese words and phrases</li>
            <li>Create and save flashcards</li>
            <li>Review your flashcards with spaced repetition</li>
            <li>Organize cards with categories</li>
            <li>Use offline when available</li>
          </ul>
         
        </div>
      )}
      
      {translation && (
        <div className="mb-6 p-4 border border-gray-200 rounded-md bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-black">Translation Result</h2>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Chinese</p>
            <p className="text-lg font-medium text-black">{translation.chinese}</p>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">Pinyin</p>
            <p className="text-black">{translation.pinyin}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-1">English</p>
            <p className="text-black">{translation.english}</p>
          </div>
          
          {/* Category selection */}
          {categories.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Category (optional)</p>
              <div className="flex flex-wrap gap-2">
                <PwaWrapper
                  onClick={() => setSelectedCategory(undefined)}
                  className={`px-3 py-1 rounded-md text-sm ${
                    selectedCategory === undefined
                      ? 'bg-fl-red text-white'
                      : 'bg-gray-200 text-black hover:bg-gray-300'
                  }`}
                >
                  Uncategorized
                </PwaWrapper>
                
                {categories.map(category => (
                  <PwaWrapper
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1 rounded-md text-sm flex items-center ${
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
                  </PwaWrapper>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6">
            <PwaWrapper
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-fl-salmon to-fl-red text-white py-4 rounded-md hover:from-fl-red hover:to-fl-salmon font-medium text-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Save as Flashcard
            </PwaWrapper>
            <p className="text-center text-xs text-gray-500 mt-2">
              This card will be added to your collection for review
            </p>
          </div>
        </div>
      )}
      
      {saveSuccess && (
        <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          Flashcard saved successfully!
        </div>
      )}
    </div>
  );
}
