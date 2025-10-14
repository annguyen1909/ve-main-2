import { Link, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const SummarySection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const {
    translations: t,
    locale,
    brand,
  } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 });

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
  }, [inView]);

  const categories = [
    "Still Image",
    "Animation",
    "Cinematic",
    "Product",
    "VFX",
  ];

  const images = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-4.jpg",
    "/images/hero-5.jpg",
  ];

  const [active, setActive] = useState<number>(0);

  return (
    <section className="min-h-screen relative bg-black" ref={ref} {...props}>
      <div className="absolute inset-0" />

      <div className="relative h-full">
        <div className="grid grid-cols-12 gap-8 items-center min-h-screen">
          {/* left list */}
          <div className="col-span-4 px-8 flex flex-col justify-center space-y-8">
            {categories.map((label, i) => (
              <button
                key={label}
                type="button"
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                className={`text-left group focus:outline-none transition-colors duration-200 ${
                  active === i ? "text-white" : "text-white/60"
                }`}
                aria-pressed={active === i}
              >
                <div className="flex items-center gap-4">
                  <span className="opacity-60 tabular-nums">0{i + 1}</span>
                  <span className="text-3xl sm:text-4xl font-semibold tracking-tight">
                    {label}
                  </span>
                  <img
                    src="https://impactdesign.co.in/wp-content/themes/impact3d/assets/images/arrow.svg"
                    alt=""
                    aria-hidden="true"
                    className="ml-2 w-5 h-5 transform transition-all duration-200 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-focus:opacity-100 group-focus:translate-x-0"
                  />
                </div>
              </button>
            ))}
          </div>

          {/* right panel */}
          <div className="col-span-8 relative h-[min(68vh,720px)] flex items-center justify-center">
            <div className="absolute inset-0">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={categories[i] ?? `image-${i + 1}`}
                className={`pointer-events-none absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out drop-shadow-2xl ${
                  active === i ? "opacity-100 scale-100 z-0" : "opacity-0 scale-95 z-0"
                } rounded-sm`}
                style={{ willChange: "transform, opacity" }}
              />
            ))}
            </div>

            <div className="absolute left-6 top-6">
              <img
                src={brand?.url}
                alt={brand?.description}
                className="w-40 sm:w-52 select-none"
              />
            </div>

            <div className="absolute bottom-5 left-5 flex flex-col sm:flex-row items-baseline gap-2 z-10">
              <Link
                to={localePath(locale, "works")}
                className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl font-bold uppercase text-[#d9d9d9]/70"
              >
                {t["home.hero-section.visual.slogan"]}
              </Link>
              <Link
                to={localePath(locale, "works")}
                className="uppercase inline-flex text-sm sm:text-base ml-12 items-center gap-2 text-white font-light"
              >
                {t["Explore more"]} <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SummarySection.displayName = "SummarySection";

export { SummarySection };
