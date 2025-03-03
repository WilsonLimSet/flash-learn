"use client";

import { useState, useEffect } from "react";
import { addFlashcard, getCategories } from "@/utils/localStorage";
import { v4 as uuidv4 } from "uuid";
import { Category } from "@/types";
import { isRunningAsPwa } from "@/utils/pwaUtils";
import PwaWrapper from "@/app/components/PwaWrapper";
import { translateFromChinese } from "@/utils/translation";

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
      // Use the translateFromChinese utility function
      const result = await translateFromChinese(chinese);
      
      // Set translation result
      setTranslation(result);
      
      // Pre-fill the form fields
      setPinyin(result.pinyin);
      setEnglish(result.english);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Translation failed");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!chinese.trim() || !pinyin.trim() || !english.trim()) {
      setError("All fields are required");
      return;
    }
    
    // Create new flashcard
    const newFlashcard = {
      id: uuidv4(),
      chinese,
      pinyin,
      english,
      categoryId: selectedCategory,
      reviewLevel: 0,
      nextReviewDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    
    // Add to storage
    addFlashcard(newFlashcard);
    
    // Reset form
    setChinese("");
    setPinyin("");
    setEnglish("");
    setTranslation(null);
    setSuccess(true);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Create Flashcard</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          Flashcard created successfully!
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="chinese" className="block text-sm font-medium text-gray-700 mb-1">
            Chinese
          </label>
          <div className="flex gap-2">
            <textarea
              id="chinese"
              value={chinese}
              onChange={(e) => setChinese(e.target.value)}
              className="shadow-sm focus:ring-fl-salmon focus:border-fl-salmon block w-full sm:text-sm border-gray-300 rounded-md"
              rows={2}
              placeholder="Enter Chinese text"
            />
            <PwaWrapper>
              <button
                type="button"
                onClick={handleTranslate}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fl-salmon hover:bg-fl-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fl-salmon"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </>
                ) : (
                  "Translate"
                )}
              </button>
            </PwaWrapper>
          </div>
        </div>
        
        <div>
          <label htmlFor="pinyin" className="block text-sm font-medium text-gray-700 mb-1">
            Pinyin
          </label>
          <input
            type="text"
            id="pinyin"
            value={pinyin}
            onChange={(e) => setPinyin(e.target.value)}
            className="shadow-sm focus:ring-fl-salmon focus:border-fl-salmon block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Pinyin will appear here after translation"
          />
        </div>
        
        <div>
          <label htmlFor="english" className="block text-sm font-medium text-gray-700 mb-1">
            English
          </label>
          <input
            type="text"
            id="english"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="shadow-sm focus:ring-fl-salmon focus:border-fl-salmon block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="English will appear here after translation"
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category (optional)
          </label>
          <select
            id="category"
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || undefined)}
            className="shadow-sm focus:ring-fl-salmon focus:border-fl-salmon block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex justify-end">
          <PwaWrapper>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-fl-salmon hover:bg-fl-red focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fl-salmon"
            >
              Create Flashcard
            </button>
          </PwaWrapper>
        </div>
      </form>
    </div>
  );
} 