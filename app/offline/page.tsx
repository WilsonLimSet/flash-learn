"use client";

import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="container mx-auto p-6 max-w-md bg-white min-h-screen text-black">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-4">You&apos;re Offline</h1>
        <p className="mb-6">
          It looks like you're not connected to the internet. Some features may not be available.
        </p>
        <p className="mb-6">
          Your flashcards are still available for review.
        </p>
        <div className="space-y-4">
          <Link href="/" className="block w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 font-medium">
            Go to Home
          </Link>
          <Link href="/manage" className="block w-full bg-gray-200 text-black py-3 rounded-md hover:bg-gray-300 font-medium">
            Manage Flashcards
          </Link>
          <Link href="/review" className="block w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 font-medium">
            Review Flashcards
          </Link>
        </div>
      </div>
    </div>
  );
} 