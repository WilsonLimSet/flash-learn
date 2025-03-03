"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { addFlashcard, getCategories } from "@/utils/localStorage";
import { translateFromChinese } from "@/utils/translation";
import { Flashcard, Category } from "@/types";
import { playChineseAudio } from "@/utils/audioUtils";
import { isRunningAsPwa, getPwaInstallMessage } from "@/utils/pwaUtils";
import PwaWrapper from "@/app/components/PwaWrapper";

export default function CreatePage() {
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
  } | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showPwaMessage, setShowPwaMessage] = useState<boolean>(false);
  const [isPwa, setIsPwa] = useState<boolean>(false);

  // Load categories on component mount
  useEffect(() => {
    const loadedCategories = getCategories();
    setCategories(loadedCategories);
  }, []);

  // Check if running as PWA on mount
  useEffect(() => {
    setIsPwa(isRunningAsPwa());
  }, []);

  // Function to check if text contains Chinese characters
  const containsChinese = (text: string): boolean => {
    // Unicode ranges for Chinese characters
    const chineseRegex = /[\u4E00-\u9FFF\u3400-\u4DBF\u20000-\u2A6DF\u2A700-\u2B73F\u2B740-\u2B81F\u2B820-\u2CEAF\uF900-\uFAFF\u2F800-\u2FA1F]/;
    return chineseRegex.test(text);
  };

  const handleTranslate = async () => {
    // Reset error state
    setError(null);
    setSaveSuccess(false);
    
    if (!word.trim()) {
      setError("Please enter a word or phrase");
      return;
    }
    
    // Check if input contains Chinese characters
    if (!containsChinese(word)) {
      console.log("No Chinese characters detected in:", word);
      setError("Please enter text in Chinese characters");
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
    
    const newCard: Flashcard = {
      id: uuidv4(),
      chinese: translation.chinese,
      pinyin: translation.pinyin,
      english: translation.english,
      reviewLevel: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      categoryId: selectedCategory
    };
    
    addFlashcard(newCard);
    
    // Show success message
    setSaveSuccess(true);
    
    // Clear the form for a new entry
    setWord("");
    setTranslation(null);
    setSelectedCategory(undefined);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handlePlayAudio = async () => {
    if (!translation || isPlayingAudio) return;
    
    try {
      setIsPlayingAudio(true);
      const result = await playChineseAudio(translation.chinese);
      
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

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-fl-red">Create Flashcard</h1>
      
      <div className="mb-8">
        <div className="mb-4">
          <label className="block mb-2 text-black font-medium">Enter Chinese Word/Phrase</label>
          <div className="flex">
            <input
              type="text"
              value={word}
              onChange={(e) => {
                setWord(e.target.value);
                // Clear error when user starts typing again
                if (error) setError(null);
              }}
              className="flex-1 p-3 border rounded-l-md text-lg text-black"
              placeholder="e.g. 塞翁失马"
            />
            <PwaWrapper>
              <button
                onClick={handleTranslate}
                disabled={isLoading || !word.trim()}
                className="bg-fl-red text-white px-4 py-2 rounded-r-md hover:bg-fl-red/90 disabled:bg-fl-red/50"
              >
                {isLoading ? "..." : "Translate"}
              </button>
            </PwaWrapper>
          </div>
          <p className="mt-1 text-sm text-gray-500">Input must contain Chinese characters</p>
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {saveSuccess && (
          <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
            Flashcard saved successfully!
          </div>
        )}
        
        {translation && (
          <div className="border rounded-md p-4 mb-4">
            <div className="mb-3">
              <div className="flex items-center mb-1">
                <h3 className="text-3xl font-bold text-black">{translation.chinese}</h3>
                <PwaWrapper>
                  <button
                    onClick={handlePlayAudio}
                    disabled={isPlayingAudio}
                    className={`ml-3 px-3 py-1 rounded-full ${
                      isPlayingAudio 
                        ? 'bg-gray-300 text-gray-500' 
                        : 'bg-fl-red text-white hover:bg-fl-red/90'
                    }`}
                  >
                    {isPlayingAudio ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </button>
                </PwaWrapper>
              </div>
              <p className="text-xl text-black mb-2 font-medium">{translation.pinyin}</p>
              <p className="text-xl text-black">{translation.english}</p>
              
              {isPwa && (
                <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md text-xs">
                  <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                    </svg>
                    <span>
                      Audio uses your browser's speech synthesis. If you don't hear anything, check your volume and browser settings.
                    </span>
                  </p>
                </div>
              )}
            </div>
            
            {/* Category selection */}
            {categories.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Category (optional)</p>
                <div className="flex flex-wrap gap-2">
                  <PwaWrapper>
                    <button
                      onClick={() => setSelectedCategory(undefined)}
                      className={`px-3 py-1 rounded-md text-sm ${
                        selectedCategory === undefined
                          ? 'bg-fl-red text-white'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      Uncategorized
                    </button>
                  </PwaWrapper>
                  
                  {categories.map(category => (
                    <PwaWrapper key={category.id}>
                      <button
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
                      </button>
                    </PwaWrapper>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <PwaWrapper>
                <button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-fl-salmon to-fl-red text-white py-4 rounded-md hover:from-fl-red hover:to-fl-salmon font-medium text-lg shadow-md transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Save as Flashcard
                </button>
              </PwaWrapper>
              <p className="text-center text-xs text-gray-500 mt-2">
                This card will be added to your collection for review
              </p>
            </div>
          </div>
        )}
      </div>
      
      {renderPwaMessage()}
    </div>
  );
} 