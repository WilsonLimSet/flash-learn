"use client";

import { useState, useEffect } from "react";
import { addFlashcard, getCategories } from "@/utils/localStorage";
import { v4 as uuidv4 } from "uuid";
import { Category } from "@/types";
import { isRunningAsPwa } from "@/utils/pwaUtils";
import PwaWrapper from "@/app/components/PwaWrapper";

export default function CreatePage() {
  const [chinese, setChinese] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [translation, setTranslation] = useState<{ chinese: string; pinyin: string; english: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isPwa, setIsPwa] = useState(false);
  
  // Load categories on mount
  useEffect(() => {
    setCategories(getCategories());
    setIsPwa(isRunningAsPwa());
  }, []);
  
  // Reset success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  // Check if text contains Chinese characters
  const containsChinese = (text: string): boolean => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(text);
  };
  
  // Handle translation
  const handleTranslate = async () => {
    // Reset states
    setError(null);
    setTranslation(null);
    
    // Validate input
    if (!chinese.trim()) {
      setError("Please enter Chinese text to translate");
      return;
    }
    
    // Check if input contains Chinese characters
    if (!containsChinese(chinese)) {
      setError("Please enter valid Chinese characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Call translation API
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: chinese }),
      });
      
      if (!response.ok) {
        throw new Error(`Translation failed: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Set translation result
      setTranslation({
        chinese: data.chinese,
        pinyin: data.pinyin,
        english: data.english
      });
      
      // Pre-fill the form fields
      setPinyin(data.pinyin);
      setEnglish(data.english);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle save
  const handleSave = () => {
    // Validate input
    if (!chinese.trim() || !pinyin.trim() || !english.trim()) {
      setError("Please fill in all fields");
      return;
    }
    
    try {
      // Create new flashcard
      const newCard = {
        id: uuidv4(),
        chinese: chinese.trim(),
        pinyin: pinyin.trim(),
        english: english.trim(),
        categoryId: selectedCategory,
        reviewLevel: 0,
        nextReviewDate: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      // Add to storage
      addFlashcard(newCard);
      
      // Reset form
      setChinese("");
      setPinyin("");
      setEnglish("");
      setTranslation(null);
      setSelectedCategory(undefined);
      
      // Show success message
      setSuccess(true);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save flashcard");
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Create Flashcard</h1>
      
      {/* Input form */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chinese Text
        </label>
        <textarea
          value={chinese}
          onChange={(e) => setChinese(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fl-red focus:border-transparent text-black"
          rows={2}
          placeholder="输入中文"
        />
      </div>
      
      <div className="mb-6">
        <PwaWrapper
          onClick={handleTranslate}
          className={`w-full py-3 px-4 rounded-md font-medium flex items-center justify-center ${
            isLoading 
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
            <p className="text-lg font-medium text-black">{translation.pinyin}</p>
          </div>
          
          <div className="mb-3">
            <p className="text-sm text-gray-600 mb-1">English</p>
            <p className="text-lg font-medium text-black">{translation.english}</p>
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pinyin (edit if needed)
            </label>
            <input
              type="text"
              value={pinyin}
              onChange={(e) => setPinyin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fl-red focus:border-transparent text-black"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              English (edit if needed)
            </label>
            <input
              type="text"
              value={english}
              onChange={(e) => setEnglish(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fl-red focus:border-transparent text-black"
            />
          </div>
          
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category (optional)
            </label>
            <select
              value={selectedCategory || ""}
              onChange={(e) => setSelectedCategory(e.target.value === "" ? undefined : e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-fl-red focus:border-transparent text-black"
            >
              <option value="">No Category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mt-6">
            <PwaWrapper
              onClick={handleSave}
              className="w-full py-3 px-4 bg-fl-red text-white rounded-md hover:bg-fl-red/90 font-medium"
            >
              Save Flashcard
            </PwaWrapper>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
          Flashcard saved successfully!
        </div>
      )}
    </div>
  );
} 