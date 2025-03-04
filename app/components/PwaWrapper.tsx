"use client";

import React, { ReactNode } from 'react';
import { usePwa } from '@/app/context/PwaContext';

interface PwaWrapperProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  disabled?: boolean;
}

export default function PwaWrapper({
  children,
  className,
  style,
  onClick,
  href,
  disabled,
}: PwaWrapperProps) {
  const { isPwa, showInstallPrompt } = usePwa();

  const handleClick = (e: React.MouseEvent) => {
    // Check if the target is an input, textarea, or select element
    const target = e.target as HTMLElement;
    const isFormElement = 
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.tagName === 'SELECT' ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('select');
    
    // Don't intercept clicks on form elements
    if (isFormElement) {
      if (onClick && !disabled) {
        onClick(e);
      }
      return;
    }
    
    if (!isPwa) {
      // If not in PWA mode, show the install prompt
      showInstallPrompt();
      
      // If there's an href, prevent navigation
      if (href) {
        e.preventDefault();
      }
    }
    
    // Call the original onClick handler if provided
    if (onClick && !disabled) {
      onClick(e);
    }
  };

  // If it's a PWA, just render the children with the original props
  if (isPwa) {
    if (href) {
      return (
        <a href={href} className={className} style={style} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <div className={className} style={style} onClick={onClick}>
        {children}
      </div>
    );
  }

  // If not a PWA, wrap with our click handler
  if (href) {
    return (
      <a href={href} className={className} style={style} onClick={handleClick}>
        {children}
      </a>
    );
  }
  
  return (
    <div className={className} style={style} onClick={handleClick}>
      {children}
    </div>
  );
} 