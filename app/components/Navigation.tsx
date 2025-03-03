"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import PwaWrapper from "./PwaWrapper";

export default function Navigation() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<Event | null>(null);
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Store the event so it can be triggered later
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  return (
    <nav className="bg-fl-red text-white p-4 sticky top-0 z-10 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <PwaWrapper href="/">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-fl-salmon-light bg-clip-text text-transparent transition-all duration-300">
              Flash
            </span>
            <span className="text-xl font-bold tracking-tight transition-all duration-300">
              Learn
            </span>
            <span className="ml-1.5 text-[10px] bg-white text-fl-red px-1 py-0.5 rounded font-medium tracking-wide">中文</span>
          </div>
        </PwaWrapper>
        
        <div className="flex space-x-1">
          <NavLink href="/" current={pathname === "/"}>Create</NavLink>
          <NavLink href="/review" current={pathname === "/review"}>Review</NavLink>
          <NavLink href="/manage" current={pathname === "/manage"}>Manage</NavLink>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <PwaWrapper
      href={href}
      className={`px-3 py-1 rounded-md text-sm ${
        current 
          ? 'bg-fl-salmon text-white' 
          : 'text-white hover:bg-fl-salmon/80'
      }`}
    >
      {children}
    </PwaWrapper>
  );
} 