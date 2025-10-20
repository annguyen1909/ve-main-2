import { cn } from "~/lib/utils";
import * as motion from "motion/react-client";

interface ScrollProgressProps {
  currentIndex: number;
  totalSections: number;
  className?: string;
  labels?: string[];
}

export function ScrollProgress({ currentIndex, totalSections, className, labels }: ScrollProgressProps) {
  return (
    // hide on small screens, show from md up
    <div className={cn("hidden md:block fixed right-8 lg:right-12 top-1/2 -translate-y-1/2 z-40", className)}>
      <div className="relative flex flex-col gap-4">
        {/* Progress numbers */}
        {Array.from({ length: totalSections }, (_, index) => (
          <motion.div
            key={index}
            className={cn(
              "relative text-right text-lg font-medium cursor-pointer min-h-[24px] flex items-center justify-end",
              index === currentIndex 
                ? "text-white" 
                : "text-white/60 hover:text-white/80"
            )}
            initial={{ opacity: 0, x: 30 }}
            animate={{ 
              opacity: 1, 
              x: index === currentIndex ? 0 : 10,
              scale: index === currentIndex ? 1.5 : 1,
            }}
            transition={{ 
              duration: 0.5, 
              ease: "easeOut",
              scale: { duration: 0.15 }
            }}
          >
            {/* Horizontal line - only shows for active section */}
            {index === currentIndex && (
              <motion.div
                className="absolute w-16 lg:w-20 h-[0.5px] bg-white/60 left-full ml-2 top-1/2 -translate-y-1/2"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ 
                  scaleX: 1, 
                  opacity: 1
                }}
                transition={{ 
                  duration: 0.2,
                  ease: "easeInOut"
                }}
                style={{ transformOrigin: "right center" }}
              />
            )}
            {/** Render provided label if available, otherwise fallback to number */}
            {labels && labels[index] ? labels[index] : (index + 1).toString().padStart(1, '0')}
          </motion.div>
        ))}
      </div>
    </div>
  );
}