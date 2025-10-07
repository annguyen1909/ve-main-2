import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn, localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const SummarySection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLInputElement>(null);
  const { translations: t, locale, banners } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "dark";

    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [inView]);

  return (
    <section
      className="h-dvh max-h-dvh relative"
      ref={ref}
      {...props}
    >
      <video muted playsInline ref={videoRef} loop preload="auto" className={cn("object-cover h-dvh w-full max-h-dvh")}>
        <source src={banners.find(banner => banner.group === 'we_visualize')?.url ?? ''} type="video/mp4" />
      </video>

      <div className="absolute bottom-5 left-5 flex flex-col sm:flex-row items-baseline gap-2">
        <Link to={localePath(locale, 'works')} className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold uppercase text-[#d9d9d9]/30">{t['home.hero-section.visual.slogan']}</Link>
        <Link to={localePath(locale, 'works')} className="uppercase inline-flex text-sm sm:text-base items-center gap-2 text-white font-light">{t['Explore more']} <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
});

SummarySection.displayName = "SummarySection";

export { SummarySection };
