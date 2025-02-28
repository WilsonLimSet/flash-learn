"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();
  
  return (
    <nav className="bg-fl-red text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">FlashLearn</Link>
          
          <div className="flex space-x-1">
            <NavLink href="/" current={pathname === "/"}>Create</NavLink>
            <NavLink href="/review" current={pathname === "/review"}>Review</NavLink>
            <NavLink href="/manage" current={pathname === "/manage"}>Manage</NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, current, children }: { href: string; current: boolean; children: React.ReactNode }) {
  return (
    <Link 
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        current 
          ? 'bg-fl-salmon text-white' 
          : 'text-white hover:bg-fl-salmon/80'
      }`}
    >
      {children}
    </Link>
  );
} 