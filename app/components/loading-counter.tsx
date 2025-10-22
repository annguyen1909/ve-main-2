"use client"

import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import type { MotionValue } from "framer-motion";
import { useEffect } from "react";
import { useOutletContext } from "@remix-run/react";
import type { AppContext } from "~/root";

type LoadingCounterProps = {
  onFinish?: () => void;
};

export default function LoadingCounter({ onFinish }: LoadingCounterProps) {
  // Try to get brand from context when available; otherwise caller can render with img props.
  const ctx = (useOutletContext?.() as unknown) as AppContext | undefined;
  const brandUrl = ctx?.brand?.url ?? "/images/ennode-placeholder.png";

  const count = useMotionValue(0);

  // Respect reduced motion - detect once on mount
  const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (prefersReduced) {
      // jump directly to finished state
      count.set(100);
      onFinish?.();
      return;
    }

    // animate count from 0 to 100
    const controls = animate(count, 100, { duration: 1.25 });
    const unsubscribe = count.onChange((v) => {
      if (v >= 100) {
        // finished
        onFinish?.();
        controls.stop();
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [count, onFinish, prefersReduced]);

  // derive a clipPath motion value from the count motion value so the overlay is revealed bottom->top
  const clipPath = useTransform(count, (v) => `inset(${100 - v}% 0 0 0)`);

  // typed style object that accepts MotionValue<string> for clipPath properties
  const overlayStyle: {
    filter: string;
    WebkitClipPath: MotionValue<string> | string;
    clipPath: MotionValue<string> | string;
  } = {
    filter: "brightness(0) invert(1)",
    WebkitClipPath: clipPath,
    clipPath: clipPath,
  };

  return (
    <div
      role="img"
      aria-label="Loading"
      aria-live="polite"
      className="flex items-center justify-center"
      style={{ width: "100%", height: "100%" }}
    >
      <div className="relative w-48 h-20 sm:w-64 sm:h-28 select-none">
        {/* base (original) logo */}
        <img
          src={brandUrl}
          alt="logo"
          className="w-full h-full object-contain block"
          style={{ filter: "none" }}
        />

        {/* white overlay version revealed bottom->top via clip-path */}
        <motion.img
          src={brandUrl}
          alt="logo white"
          className="w-full h-full object-contain pointer-events-none absolute left-0 top-0"
          style={overlayStyle}
        />
      </div>
    </div>
  );
}
