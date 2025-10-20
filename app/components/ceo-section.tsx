import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { useInView } from "motion/react";

interface CEOSectionProps {
  className?: string;
}

const CEOSection = forwardRef<HTMLElement, CEOSectionProps>(
  ({ className = "" }, forwardedRef) => {
    const ref = useRef<HTMLElement>(null);
    const inView = useInView(ref, { amount: 0.3 });

    useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

    useEffect(() => {
      const headerDom = document.getElementById("header");
      if (!headerDom || !inView) return;
      headerDom.dataset.variant = "dark";
    }, [inView]);

    return (
      <section
        ref={ref}
        className={`relative max-h-[80svh] flex items-center justify-center px-4 sm:px-6 md:px-12 py-16 md:py-24 bg-[#1b1b1b] ${className}`}
      >
        <div className="max-w-7xl w-full mx-auto border border-white/5 rounded-3xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left: Profile Image */}
            <div className="md:col-span-5 flex justify-center md:justify-start">
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
                <img
                  src="/images/JIMMY CHUNG.png"
                  alt="CEO Profile"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (target && !target.dataset.fallback) {
                      target.dataset.fallback = "1";
                      target.src = "/images/visual-placeholder.png";
                    }
                  }}
                />
              </div>
            </div>

            {/* Right: CEO Info */}
            <div className="md:col-span-7 space-y-6 md:space-y-8 text-left md:pr-16 lg:pr-24">
              {/* Name & Title */}
              <div className="space-y-2">
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  YOONCHANG CHUNG
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-white/60 tracking-wide">
                  | CEO | FOUNDER
                </p>
              </div>

              {/* Message */}
              <div className="space-y-4 md:space-y-6 max-w-3xl">
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                  Visual Ennode is the crystallization between architectural art and cinema language,
                  where each frame not only reproduces the space but also tells a story. We do not
                  merely create images, but also arouse emotions, turn quiet designs into vivid,
                  attractive movies.
                </p>
                <p className="text-sm sm:text-base md:text-lg leading-relaxed text-white/80">
                  With the combination of advanced technology and sophisticated art thinking, we
                  bring a high -class visual experience, helping architects, real estate developers and
                  brands to convey ideas of the idea. I follow the strongest and most emotional way.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background circles matching the screenshot */}
        <div
          aria-hidden
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full border border-white/[0.03] pointer-events-none -z-10"
        />
        <div
          aria-hidden
          className="absolute bottom-1/4 right-1/3 w-[700px] h-[700px] rounded-full border border-white/[0.02] pointer-events-none -z-10"
        />
        <div
          aria-hidden
          className="absolute top-1/2 left-1/3 w-96 h-96 bg-white/[0.01] rounded-full blur-3xl pointer-events-none -z-10"
        />
        {/* Large rounded rectangle decorations (background) */}
        <div
          aria-hidden
          className="absolute left-6 top-6 w-[64%] h-[40vh] md:h-[48vh] bg-white/[0.01] border border-white/[0.06] rounded-[48px] pointer-events-none -z-10"
          style={{ boxShadow: 'inset 0 0 60px rgba(0,0,0,0.55)' }}
        />
        <div
          aria-hidden
          className="absolute right-6 bottom-6 w-[52%] h-[36vh] md:h-[44vh] bg-white/[0.008] border border-white/[0.04] rounded-[56px] pointer-events-none -z-10"
          style={{ boxShadow: 'inset 0 0 90px rgba(0,0,0,0.55)' }}
        />
      </section>
    );
  }
);

CEOSection.displayName = "CEOSection";

export { CEOSection };
