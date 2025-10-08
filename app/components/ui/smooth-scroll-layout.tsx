import React, { useEffect, useRef } from "react";
import { cn } from "~/lib/utils";

interface SmoothScrollLayoutProps {
  children: React.ReactNode;
  onIndexChange?: (currentIndex: number, totalSections: number) => void;
  className?: string;
}

export function SmoothScrollLayout({ children, onIndexChange, className }: SmoothScrollLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set up intersection observer for tracking sections
    const sections = Array.from(container.children) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.3) {
            const sectionIndex = sections.indexOf(entry.target as HTMLElement);
            if (sectionIndex !== -1 && onIndexChange) {
              onIndexChange(sectionIndex, sections.length);
            }
          }
        });
      },
      {
        threshold: [0.1, 0.3, 0.5], // Multiple thresholds for better detection
        rootMargin: '-10% 0px -10% 0px', // Trigger when section is more centered
      }
    );

    sections.forEach((section) => {
      observer.observe(section);
    });

    return () => {
      observer.disconnect();
    };
  }, [onIndexChange]);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "overflow-y-auto scroll-smooth", // Remove fixed height, let content flow naturally
        className
      )}
      style={{
        scrollBehavior: 'smooth',
        height: '100vh', // Only the container should be viewport height
      }}
    >
      {children}
    </div>
  );
}