"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { getFlashcard, updateFlashcard } from "@/utils/localStorage";
import { translateFromChinese } from "@/utils/translation";
import { Flashcard } from "@/types";
import Link from "next/link";

export default function EditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [flashcard, setFlashcard] = useState<Flashcard | null>(null);
  const [chinese, setChinese] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [english, setEnglish] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const card = getFlashcard(id);
    if (card) {
      setFlashcard(card);
      setChinese(card.chinese);
      setPinyin(card.pinyin);
      setEnglish(card.english);
    } else {
      router.push("/manage");
    }
  }, [id, router]);
  
  const handleTranslate = async () => {
    if (!chinese.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await translateFromChinese(chinese);
      setPinyin(result.pinyin);
      setEnglish(result.english);
    } catch (error) {
      console.error("Translation error:", error);
      setError("Failed to translate. Please check your API keys or try again later.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSave = () => {
    if (!flashcard) return;
    
    const updatedCard: Flashcard = {
      ...flashcard,
      chinese,
      pinyin,
      english
    };
    
    updateFlashcard(updatedCard);
    router.push("/manage");
  };
  
  if (!flashcard) {
    return <div className="text-center p-8 text-black">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <h1 className="text-2xl font-bold mb-6 text-black">Edit Flashcard</h1>
      
      <div className="mb-8">
        <div className="mb-4">
          <label className="block mb-2 font-medium text-black">Chinese Word/Phrase</label>
          <div className="flex">
            <input
              type="text"
              value={chinese}
              onChange={(e) => setChinese(e.target.value)}
              className="flex-1 p-3 border rounded-l-md text-lg text-black"
            />
            <button
              onClick={handleTranslate}
              disabled={isLoading || !chinese.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:bg-blue-300"
            >
              {isLoading ? "..." : "Translate"}
            </button>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium text-black">Pinyin</label>
          <input
            type="text"
            value={pinyin}
            onChange={(e) => setPinyin(e.target.value)}
            className="w-full p-3 border rounded-md text-lg text-black"
          />
        </div>
        
        <div className="mb-4">
          <label className="block mb-2 font-medium text-black">English Translation</label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            className="w-full p-3 border rounded-md text-lg text-black"
          />
        </div>
        
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <button
          onClick={handleSave}
          className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-medium"
        >
          Save Changes
        </button>
      </div>
      
      <div className="text-center">
        <Link href="/manage" className="text-blue-500 hover:underline">
          Cancel and Return to Manage
        </Link>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  // Since this is a client-side app with data in localStorage,
  // we can't know all IDs at build time.
  // Return an empty array to satisfy the build requirement
  return [];
} 