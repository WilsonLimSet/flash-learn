"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstallable(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  const handleInstallClick = () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: {outcome: string}) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    });
  };
  
  return (
    <nav className="bg-fl-red text-white p-4 sticky top-0 z-10">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          FlashLearn
        </Link>
        
        <div className="flex space-x-1">
          <NavLink href="/" current={pathname === "/"}>Create</NavLink>
          <NavLink href="/review" current={pathname === "/review"}>Review</NavLink>
          <NavLink href="/manage" current={pathname === "/manage"}>Manage</NavLink>
          
          {isInstallable && (
            <button 
              onClick={handleInstallClick}
              className="bg-white text-fl-red px-3 py-1 rounded-md text-sm font-medium ml-2"
            >
              Install App
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-md text-sm ${
        current 
          ? 'bg-fl-salmon text-white' 
          : 'text-white hover:bg-fl-salmon/80'
      }`}
    >
      {children}
    </Link>
  );
} 