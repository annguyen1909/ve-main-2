import { forwardRef, useEffect, useRef, useState } from "react";

import { AnimatePresence } from "motion/react";
import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { cn, localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const ANIMATION_DELAY_SECONDS = 3;
const CARD_ANIMATION_SECONDS = 0.5;

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  ready?: boolean
}

const HeroSection = forwardRef<HTMLElement, HeroSectionProps>((props, ref) => {
  const { brand, locale, banners } = useOutletContext<AppContext>();
  const [cardAnimationStart, setCardAnimationStart] = useState<boolean>(props.ready ?? false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [animationEnd, setAnimationEnd] = useState<boolean>(props.ready ?? false);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    headerDom.dataset.variant = "dark";
  }, []);

  useEffect(() => {
    if (props.ready) {
      setTimeout(() => {
        setAnimationEnd(true);
        setCardAnimationStart(true);

        setTimeout(() => setCardAnimationStart(false), CARD_ANIMATION_SECONDS * 0.5)
      }, ANIMATION_DELAY_SECONDS * 1000);
    }
  }, [props.ready])

  return (
    <section
      className={cn("min-h-screen relative", animationEnd && !cardAnimationStart ? '' : 'page-scroller-disabled')}
      ref={ref}
    >
      <AnimatePresence>
        {animationEnd ? null : <motion.div key="loading" className="fixed inset-0 flex items-center justify-center z-20 bg-black/30"
          transition={{ scale: { duration: 1 }, opacity: { duration: 1 } }}
          exit={{ scale: 1.5, opacity: 0 }}
        >
          <img
            src={brand.url}
            alt={brand.description}
            className="w-52 sm:w-80 select-none drop-shadow-xl"
          />
        </motion.div>}
      </AnimatePresence>
      
      {/* Background video with overlay */}
      <video muted playsInline loop autoPlay preload="none" className={cn("absolute inset-0 object-cover h-full w-full", animationEnd ? '' : 'z-10')} ref={videoRef}>
        <source src={banners.find(banner => banner.group === 'visual_ennode')?.url ?? ''} type="video/mp4" />
      </video>
      
      {/* Responsive overlay - stronger on mobile for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-black/70 via-black/50 to-black/30 sm:from-black/50 sm:via-black/30 sm:to-transparent"></div>

      {/* Main content - responsive layout */}
      <div className="relative z-10 h-full flex flex-col justify-between p-4 sm:p-8 lg:p-12">
        {/* Spacer for header */}
        <div className="h-20 sm:h-24"></div>

        {/* Main title section - responsive positioning */}
        <div className="flex-1 mt-20 flex items-center justify-center sm:justify-start">
          <div className="max-w-4xl text-center sm:text-left">
            <motion.h1 
              className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold text-white uppercase mb-4 sm:mb-6 lg:mb-8 leading-tight sm:leading-none tracking-tight px-4 sm:px-0 sm:ml-12"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.5 }}
            >
              ARCHVIZ<br />
              STUDIO
            </motion.h1>
            <motion.p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 max-w-md sm:max-w-xl leading-relaxed font-light px-4 sm:px-0 sm:ml-12"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.5 }}
            >
              We unite diverse departments for seamless collaboration
            </motion.p>
          </div>
        </div>

        {/* Bottom CTA section - mobile-optimized */}
        <div className="flex flex-col gap-6 mt-4 sm:gap-8 lg:gap-16 pb-8 sm:pb-12 lg:pb-16 px-4 sm:px-0 sm:ml-12">
          {/* Mobile: Stack vertically, Desktop: Side by side */}
          <div className="flex flex-col sm:flex-row gap-6 sm:gap-16">
            <motion.div 
              className="group cursor-pointer touch-manipulation"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.5 }}
            >
              <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mb-2 sm:mb-3 font-medium">WE VISUALIZE</p>
              <Link 
                to={localePath(locale, 'works')} 
                className="text-xl sm:text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-3 sm:gap-4 group-hover:gap-4 sm:group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
              >
                SEE WORKS <ArrowRight className="size-5 sm:size-6" />
              </Link>
            </motion.div>
            
            <motion.div 
              className="group cursor-pointer touch-manipulation"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 3.5 }}
            >
              <p className="text-xs sm:text-sm text-gray-300 uppercase tracking-wider mb-2 sm:mb-3 font-medium">WE CONNECT</p>
              <Link 
                to={localePath(locale, 'about')} 
                className="text-xl sm:text-2xl lg:text-3xl text-white font-medium inline-flex items-center gap-3 sm:gap-4 group-hover:gap-4 sm:group-hover:gap-6 transition-all duration-300 hover:text-gray-200 active:text-gray-300"
              >
                MORE ABOUT US <ArrowRight className="size-5 sm:size-6" />
              </Link>
            </motion.div>
          </div>

          {/* Mobile scroll indicator */}
          <motion.div 
            className="flex sm:hidden justify-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
          >
            <div className="flex flex-col items-center text-white/60">
              <p className="text-xs uppercase tracking-wider mb-2">Scroll to explore</p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
})

HeroSection.displayName = "HeroSection";

export { HeroSection };

