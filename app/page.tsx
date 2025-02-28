"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { addFlashcard } from "@/utils/localStorage";
import { translateFromChinese } from "@/utils/translation";
import { Flashcard } from "@/types";
import isChinese from 'is-chinese';

export default function HomePage() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidChinese, setIsValidChinese] = useState(true);
  const [translation, setTranslation] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
  } | null>(null);

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
    
    const newCard: Flashcard = {
      id: uuidv4(),
      chinese: translation.chinese,
      pinyin: translation.pinyin,
      english: translation.english,
      reviewLevel: 0,
      nextReviewDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };
    
    addFlashcard(newCard);
    router.push("/manage");
  };

  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      
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
              className={`flex-1 p-3 border rounded-l-md text-lg text-black ${
                !isValidChinese && word.trim() !== "" ? "border-red-500 bg-red-50" : ""
              }`}
              placeholder="e.g. 塞翁失马"
            />
            <button
              onClick={handleTranslate}
              disabled={isLoading || !word.trim() || !isValidChinese}
              className="bg-fl-red text-white px-4 py-2 rounded-r-md hover:bg-fl-red/90 disabled:bg-fl-red/50"
            >
              {isLoading ? "..." : "Translate"}
            </button>
          </div>
          {!isValidChinese && word.trim() !== "" ? (
            <p className="mt-1 text-sm text-red-600">
              Please enter Chinese characters only
            </p>
          ) : (
            <p className="mt-1 text-sm text-gray-500">
              Input must contain Chinese characters only
            </p>
          )}
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        {translation && (
          <div className="border rounded-md p-4 mb-4">
            <div className="mb-3">
              <h3 className="text-3xl font-bold mb-1 text-black">{translation.chinese}</h3>
              <p className="text-xl text-black mb-2 font-medium">{translation.pinyin}</p>
              <p className="text-xl text-black">{translation.english}</p>
            </div>
            
            <button
              onClick={handleSave}
              className="w-full bg-fl-salmon text-white py-3 rounded-md hover:bg-fl-salmon/90 font-medium"
            >
              Save Flashcard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
