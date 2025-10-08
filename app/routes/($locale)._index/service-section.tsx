import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { cn, localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const ServiceSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLInputElement>(null);
  const { translations: t, locale, banners } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })
  const videoRef = useRef<HTMLVideoElement>(null);

  useImperativeHandle(forwardedRef, () => ref.current as HTMLInputElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";

    if (videoRef.current) {
      videoRef.current.play()
    }
  }, [inView]);

  return (
    <section
      className="min-h-screen relative bg-black/10"
      ref={ref}
      {...props}
    >
      <video muted playsInline loop ref={videoRef} preload="auto" className={cn("object-cover h-full w-full absolute inset-0")}>
        <source src={banners.find(banner => banner.group === 'we_connect')?.url ?? ''} type="video/mp4" />
      </video>

      <div className="absolute top-0 right-5 flex flex-col items-end gap-2 pt-20">
        <Link to={localePath(locale, 'ennode')} className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold uppercase text-[#d9d9d9]/30">{t['home.hero-section.ennode.slogan']}</Link>
        <Link to={localePath(locale, 'ennode')} className="uppercase inline-flex items-center gap-2 text-white font-light text-sm sm:text-base">{t['Explore more']} <ArrowRight className="size-4" /></Link>
      </div>
    </section>
  );
});

ServiceSection.displayName = "ServiceSection";

export { ServiceSection };
