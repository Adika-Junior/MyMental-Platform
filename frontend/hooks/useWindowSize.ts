'use client';

import { useState, useEffect } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Custom hook to detect window size with real-time updates
 * Provides responsive design data for components
 */
export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 1920,
    height: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

/**
 * Breakpoint definitions based on modern web design standards (2025)
 */
export const BREAKPOINTS = {
  // Mobile devices (phones)
  mobile: 640,      // Default mobile breakpoint (Tailwind sm)
  
  // Tablets (portrait/landscape)
  tablet: 768,       // Standard tablet breakpoint (Tailwind md)
  
  // Small laptops/desktops
  laptop: 1024,      // Standard laptop breakpoint (Tailwind lg)
  
  // Large desktops
  desktop: 1280,     // Large desktop breakpoint (Tailwind xl)
  
  // Extra large screens
  wide: 1536,        // Extra wide breakpoint (Tailwind 2xl)
} as const;

/**
 * Helper function to get current screen category
 */
export function getScreenCategory(width: number): 'mobile' | 'tablet' | 'desktop' | 'wide' {
  if (width < BREAKPOINTS.tablet) return 'mobile';
  if (width < BREAKPOINTS.laptop) return 'tablet';
  if (width < BREAKPOINTS.desktop) return 'desktop';
  return 'wide';
}

