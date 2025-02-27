"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { addFlashcard } from "@/utils/localStorage";
import { translateFromChinese } from "@/utils/translation";
import { Flashcard } from "@/types";

export default function CreatePage() {
  const router = useRouter();
  const [word, setWord] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translation, setTranslation] = useState<{
    chinese: string;
    pinyin: string;
    english: string;
  } | null>(null);

  const handleTranslate = async () => {
    if (!word.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await translateFromChinese(word);
      setTranslation(result);
    } catch (error) {
      console.error("Translation error:", error);
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
      <h1 className="text-2xl font-bold mb-6 text-black">Create Flashcard</h1>
      
      <div className="mb-8">
        <div className="mb-4">
          <label className="block mb-2 text-black font-medium">Enter Chinese Word/Phrase</label>
          <div className="flex">
            <input
              type="text"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className="flex-1 p-3 border rounded-l-md text-lg text-black"
              placeholder="e.g. 你好"
            />
            <button
              onClick={handleTranslate}
              disabled={isLoading || !word.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "..." : "Translate"}
            </button>
          </div>
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
              className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-medium"
            >
              Save Flashcard
            </button>
          </div>
        )}
      </div>
      
        
    </div>
  );
} 