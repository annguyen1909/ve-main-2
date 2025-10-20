import { useOutletContext } from "@remix-run/react";
import { useInView } from "motion/react";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { AppContext } from "~/root";

const SummarySection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  useOutletContext<AppContext>();
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

  // no default selection on desktop; default to first image for mobile to avoid empty image area
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // track mouse position for parallax (normalized -1..1)
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  // ensure we show at least the first image by default (helps mobile where no hover occurs)
  const visibleIndex = hovered ?? selected ?? 0;

  return (
    <section
      className="relative pt-12 md:py-16 px-4 sm:px-6 md:px-12 md:min-h-screen mb-16 md:mb-0"
      ref={ref}
      {...props}
    >
      <div className="relative h-full z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 items-start md:items-center md:min-h-[70vh]">
          {/* left list (desktop) - hidden on small screens */}
          <div className="md:col-span-4 col-span-12 h-full px-2 sm:px-6 md:px-8 hidden md:flex md:flex-col justify-between md:self-end md:relative order-2 md:order-1">
            <div className="md:flex md:justify-start text-center">
              <h2 
                className="pl-12 text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold text-white/90"
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  letterSpacing: '-0.44px',
                }}
              >
                Services
              </h2>
            </div>
            <div className="md:pl-12 space-y-2 md:space-y-4">
              {categories.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onMouseEnter={(e) => {
                    // compute mouse relative position inside the label to feed parallax
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const nx = (e.clientX - cx) / (rect.width / 2);
                    const ny = (e.clientY - cy) / (rect.height / 2);
                    setMouse({
                      x: Math.max(-1, Math.min(1, nx)),
                      y: Math.max(-1, Math.min(1, ny)),
                    });
                    setHovered(i);
                    setSelected(i);
                  }}
                  onMouseMove={(e) => {
                    const rect = (
                      e.currentTarget as HTMLElement
                    ).getBoundingClientRect();
                    const cx = rect.left + rect.width / 2;
                    const cy = rect.top + rect.height / 2;
                    const nx = (e.clientX - cx) / (rect.width / 2);
                    const ny = (e.clientY - cy) / (rect.height / 2);
                    setMouse({
                      x: Math.max(-1, Math.min(1, nx)),
                      y: Math.max(-1, Math.min(1, ny)),
                    });
                  }}
                  onMouseLeave={() => {
                    setHovered(null);
                    setMouse({ x: 0, y: 0 });
                  }}
                  className={`text-left group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-colors duration-500 ease-in-out flex items-center gap-4 md:gap-6 ${
                    selected === i || hovered === i
                      ? "text-white"
                      : "text-white/60"
                  }`}
                  aria-pressed={selected === i}
                >
                  <div className="flex items-center gap-4">
                    {/* large decorative label restored inline for each item */}
                    <span
                      className={`text-[20px] md:text-5xl text-outline block transform ${
                        selected === i || hovered === i
                          ? "text-white/100"
                          : "text-white/60"
                      }`}
                      style={{
                        fontFamily: "'Gilroy', sans-serif",
                        letterSpacing: "-0.44px",
                      }}
                    >
                      {label}
                    </span>

                    <img
                      src="/images/arrow.png"
                      alt=""
                      aria-hidden="true"
                      className="ml-2 w-5 h-5 transform transition-all duration-300 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-1"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* mobile chip grid - show all categories as wrapped pills */}
          <div className="col-span-12 md:hidden">
            <div className="flex flex-wrap gap-3 justify-center px-2">
              {categories.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelected(i)}
                  className={`px-5 py-3 rounded-sm text-sm font-medium transition-colors duration-200 border border-white/6 backdrop-blur-[2px] ${
                    selected === i
                      ? "bg-white/12 text-white"
                      : "bg-transparent text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* right panel */}
          <div className="md:col-span-8 col-span-12 md:order-2 order-1 flex items-center justify-center">
            <div className="w-full max-w-[900px] overflow-hidden relative">
              {/* decorative divider for md screens */}
              <div className="hidden md:block absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-6 w-px h-3/4 bg-white/6" />

              {/* images */}
              <div className="relative h-[min(48vh,560px)] md:h-[min(80vh,720px)]">
                {/* mobile-only subtle top gradient to add depth on small screens */}
                <div className="md:hidden absolute inset-x-0 top-0 h-28 pointer-events-none z-20 bg-gradient-to-b from-[#1b1b1b] to-transparent" />
                {images.map((src, i) => {
                  // compute a parallax offset when the image corresponds to the hovered category
                  const isVisible = visibleIndex === i;
                  // smaller movement for touch or if not hovered
                  const intensity = isVisible && hovered !== null ? 18 : 6;
                  const offsetX = isVisible ? mouse.x * intensity : 0;
                  const offsetY = isVisible ? mouse.y * intensity : 0;

                  return (
                    <img
                      key={i}
                      src={src}
                      alt={categories[i] ?? `image-${i + 1}`}
                      className={`pointer-events-none absolute inset-0 h-full w-full object-cover drop-shadow-2xl transition-all will-change-[opacity,transform] ${
                        isVisible ? "opacity-100 z-10" : "opacity-0 z-0"
                      }`}
                      style={{
                        transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${
                          isVisible ? 1 : 0.98
                        })`,
                        transition: isVisible
                          ? "opacity 360ms cubic-bezier(.22,1,.36,1), transform 520ms cubic-bezier(.22,1,.36,1)"
                          : "opacity 280ms ease-out, transform 360ms ease-out",
                        objectPosition: "center",
                      }}
                    />
                  );
                })}

                {/* mobile pagination dots (tap to switch) */}
                <div className="md:hidden absolute left-0 right-0 bottom-6 flex justify-center gap-2 z-30">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelected(idx)}
                      aria-label={`Show ${
                        categories[idx] ?? `image ${idx + 1}`
                      }`}
                      className={`w-2.5 h-2.5 rounded-full transition-all outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                        visibleIndex === idx ? "bg-white" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
                {/* subtle gradient overlay to improve contrast for captions */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

SummarySection.displayName = "SummarySection";

export { SummarySection };
