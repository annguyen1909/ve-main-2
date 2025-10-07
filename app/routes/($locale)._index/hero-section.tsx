import { forwardRef, MutableRefObject, useEffect, useRef, useState } from "react";

// eslint-disable-next-line import/no-unresolved
// eslint-disable-next-line import/no-unresolved
import visualPlaceHolder from "/images/visual-placeholder.webp";
// eslint-disable-next-line import/no-unresolved
import ennodePlaceHolder from "/images/ennode-placeholder.webp";
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
  const { brand, translations: t, locale, banners } = useOutletContext<AppContext>();
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
      className={cn("h-dvh max-h-dvh", animationEnd && !cardAnimationStart ? '' : 'page-scroller-disabled')}
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
      <video muted playsInline loop autoPlay preload="none" className={cn("fixed inset-0 object-cover h-dvh w-full max-h-dvh", animationEnd ? '' : 'z-10')} ref={videoRef}>
        <source src={banners.find(banner => banner.group === 'visual_ennode')?.url ?? ''} type="video/mp4" />
      </video>

      <div key={cardAnimationStart ? 'card-animation-restart' : ''} className="h-full overflow-hidden max-h-full grid grid-cols-1 lg:grid-cols-2">
        <motion.div
          className="hover:bg-black/60 bg-black/30 relative group"
          initial={{ translateX: "-10%" }}
          animate={{ translateX: 0 }}
          transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
        >
          <div className="h-full flex items-center justify-center" style={{
            background: `center/auto 100% no-repeat url(${visualPlaceHolder})`,
          }}>
            <div className="text-center">
              <Link to={localePath(locale, 'works')} className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-300  group-hover:mb-7">
                VISUAL
              </Link>
              <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                <p className="uppercase text-xl lg:text-2xl text-[#959595]">
                  {t['home.hero-section.visual.slogan']}
                </p>
                <Link
                  to={localePath(locale, 'works')}
                  className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
                >
                  {t['home.hero-section.visual.cta']} <ArrowRight className="size-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
        <motion.div
          className="hover:bg-black/60 bg-black/30 relative group"
          initial={{ translateX: "10%" }}
          animate={{ translateX: 0 }}
          transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
        >
          <div className="h-full flex items-center justify-center" style={{
            background: `center/auto 100% no-repeat url(${ennodePlaceHolder})`,
          }}>
            <div className="text-center">
              <Link to={localePath(locale, 'ennode')} className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-300 group-hover:mb-7">
                ENNODE
              </Link>
              <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                <p className="uppercase text-xl lg:text-2xl text-[#959595]">
                  {t['home.hero-section.ennode.slogan']}
                </p>
                <Link
                  to={localePath(locale, 'ennode')}
                  className="inline-flex items-center text-base text-white/80 opacity-65 font-light mt-1"
                >
                  {t['home.hero-section.ennode.cta']} <ArrowRight className="size-3 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section >
  );
})

HeroSection.displayName = "HeroSection";

export { HeroSection };

