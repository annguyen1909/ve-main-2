import { Link, useOutletContext } from "@remix-run/react";
// import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { motion, useAnimation, Variants } from "framer-motion";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const ServiceSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t, locale, banners } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 0.25 });
  const controls = useAnimation();
  const [rowIdxMap, setRowIdxMap] = useState<number[]>([]);
  const lottieRefs = useRef<
    Array<null | { play?: () => void; pause?: () => void }>
  >([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredTile, setHoveredTile] = useState<number | null>(null);

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
    // measure tile vertical positions and group into rows, then start animation
    requestAnimationFrame(() => {
      const container = ref.current as HTMLElement | null;
      if (!container) {
        controls.start("visible");
        return;
      }
      const nodes = Array.from(
        container.querySelectorAll("[data-tile-index]")
      ) as HTMLElement[];
      if (!nodes.length) {
        controls.start("visible");
        return;
      }

      const containerTop = container.getBoundingClientRect().top;
      const tops = nodes.map(
        (n) =>
          Math.round((n.getBoundingClientRect().top - containerTop) / 8) * 8
      );

      const rows: number[] = [];
      const rowIndexForNode: number[] = new Array(nodes.length).fill(0);
      const tolerance = 12;
      tops.forEach((t, i) => {
        let found = rows.findIndex((rTop) => Math.abs(rTop - t) <= tolerance);
        if (found === -1) {
          rows.push(t);
          found = rows.length - 1;
        }
        rowIndexForNode[i] = found;
      });

      setRowIdxMap(rowIndexForNode);
      controls.start("visible");
    });
  }, [inView, controls]);

  // create a beautiful masonry-like pattern with varied sizes for visual interest
  // pattern: large anchors (5-7) alternating with accent clusters (2-3 stacked)
  const tiles = [
    { rowSpan: 6 }, // large anchor left
    { rowSpan: 3 }, // accent upper
    { rowSpan: 3 }, // accent lower (stacks with previous)
    { rowSpan: 5 }, // mid anchor
    { rowSpan: 2 }, // small accent
    { rowSpan: 3 }, // medium accent
    { rowSpan: 7 }, // large anchor right
    { rowSpan: 2 }, // small accent
    { rowSpan: 4 }, // medium anchor
    { rowSpan: 3 }, // accent
    { rowSpan: 5 }, // large anchor right
    { rowSpan: 4 }, // small accent
    { rowSpan: 4 }, // medium anchor
    { rowSpan: 3 }, // accent
  ];

  // explicit client-side image list (place files in public/images/)
  const imgs = [
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-4.jpg",
    "/images/hero-5.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg",
    "/images/hero-2.jpg",
    "/images/hero-3.jpg",
    "/images/hero-3.jpg",
    "/images/hero-1.jpg",
  ];

  // Force local images by default. To explicitly use server banners, pass ?useServerBanners=1
  const useServerBanners =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("useServerBanners") === "1";

  const tileImgs =
    useServerBanners && Array.isArray(banners) && banners.length > 0
      ? banners.map((b) => b.url)
      : imgs;

  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("service-section using server banners:", useServerBanners);
    // eslint-disable-next-line no-console
    console.log("service-section tileImgs resolved:", tileImgs);
  }

  // Debug: allow showing tile URLs when ?showTileUrls=1 is present in the URL (removed unused variable)

  // modal state for showing clicked tile
  const [modalUrl, setModalUrl] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const MODAL_ANIM_MS = 320;

  function openModal(url: string) {
    setModalUrl(url);
    // allow mount then trigger visibility for CSS transition
    requestAnimationFrame(() => setModalVisible(true));
  }

  function closeModal() {
    setModalVisible(false);
    setTimeout(() => setModalUrl(null), MODAL_ANIM_MS);
  }

  // lock body scroll when modal is open
  useEffect(() => {
    if (typeof document === "undefined") return;
    const prev = document.body.style.overflow;
    if (modalUrl) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev;
    }
    return () => {
      document.body.style.overflow = prev;
    };
  }, [modalUrl]);

  // close modal on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Log banners and tile images to the console for debugging
  if (typeof window !== "undefined") {
    // eslint-disable-next-line no-console
    console.log("service-section banners:", banners);
    // eslint-disable-next-line no-console
    console.log("service-section tileImgs:", tileImgs);
  }

  return (
    <section
      className="min-h-screen px-2 sm:px-4 lg:px-28 relative bg-[#1b1b1b]"
      ref={ref}
      {...props}
      onMouseMove={(e) => {
        // Track mouse position across the entire section for global parallax
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const normalizedX = (x - centerX) / centerX;
        const normalizedY = (y - centerY) / centerY;

        setMousePos({ x: normalizedX * 0.5, y: normalizedY * 0.5 }); // Reduced intensity for global movement
      }}
      onMouseLeave={() => {
        setMousePos({ x: 0, y: 0 });
        setHoveredTile(null);
      }}
    >
      {/* heading */}
      <div
        className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 pt-8 sm:pt-12 cursor-pointer"
        onMouseEnter={() => setHoveredTile(-1)} // Use -1 to indicate heading hover
        onMouseLeave={() => setHoveredTile(null)}
      >
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white transition-all duration-300 hover:text-red-500">
          Selected <span className="text-red-500">works</span>
          <span className="ml-3 align-middle hidden md:inline-block">
            <img
              src="/images/down-right.png"
              alt=""
              className="w-10 h-10 inline-block"
            />
          </span>
        </h2>
        <p className="mt-3 sm:mt-4 max-w-[68rem] text-base sm:text-lg md:text-xl text-white leading-relaxed">
          Explore the impressive portfolio of Our 3D Rendering Company to see
          how VISUAL ENNODE brings architectural visions to life with precision
          and creativity. Dive into our projects to experience the high-quality
          visualizations that set us apart.
        </p>
      </div>

      {/* mosaic grid (full-bleed) */}
      <div className="mt-6 sm:mt-8 md:mt-10 w-full px-0 pb-12 sm:pb-16 md:pb-20">
        <div className="w-full relative overflow-hidden max-h-screen bg-[#1b1b1b]">
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px sm:gap-2 lg:gap-px auto-rows-fr">
            {tiles.map((tile, idx) => {
              const url = tileImgs[idx % tileImgs.length];
              const rowForThis =
                typeof rowIdxMap[idx] === "number"
                  ? rowIdxMap[idx]
                  : Math.floor(idx / 4);

              const tileVariants: Variants = {
                hidden: { opacity: 0, scale: 0.9, y: 30 },
                visible: (row = 0) => ({
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  transition: {
                    delay: row * 0.15,
                    duration: 0.8,
                    ease: [0.22, 1, 0.36, 1], // custom easing for smooth entry
                  },
                }),
              };

              // Calculate parallax offset based on mouse position
              const handleMouseMove = (
                e: React.MouseEvent<HTMLButtonElement>
              ) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Normalize to -1 to 1 range
                const normalizedX = (x - centerX) / centerX;
                const normalizedY = (y - centerY) / centerY;

                setMousePos({ x: normalizedX, y: normalizedY });
                setHoveredTile(idx);
              };

              const handleMouseLeave = () => {
                setMousePos({ x: 0, y: 0 });
                setHoveredTile(null);
              };

              // Calculate image transform based on mouse position
              const isHovered = hoveredTile === idx;
              const isHeadingHovered = hoveredTile === -1;

              // Use global mouse position when heading is hovered, local when tile is hovered
              const moveX = isHovered
                ? mousePos.x * 20 // Stronger movement for direct tile hover
                : isHeadingHovered
                ? mousePos.x * 8 // Subtle global movement when hovering heading
                : 0;
              const moveY = isHovered
                ? mousePos.y * 20
                : isHeadingHovered
                ? mousePos.y * 8
                : 0;

              const scale = isHovered ? 1.15 : isHeadingHovered ? 1.05 : 1;

              return (
                <motion.button
                  data-tile-index={idx}
                  key={idx}
                  type="button"
                  onClick={() => openModal(url)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => {
                    handleMouseLeave();
                    lottieRefs.current[idx]?.pause?.();
                  }}
                  onMouseEnter={() => {
                    lottieRefs.current[idx]?.play?.();
                    setHoveredTile(idx);
                  }}
                  onFocus={() => lottieRefs.current[idx]?.play?.()}
                  onBlur={() => lottieRefs.current[idx]?.pause?.()}
                  className={`relative overflow-hidden rounded-none bg-gray-800 block group transition-all duration-300`}
                  style={{ gridRowEnd: `span ${tile.rowSpan}` }}
                  custom={rowForThis}
                  initial="hidden"
                  animate={controls}
                  variants={tileVariants}
                >
                  <div
                    className="w-full h-full"
                    style={{
                      transform: `translate(${moveX}px, ${moveY}px) scale(${scale})`,
                      transition: isHovered
                        ? "transform 0.2s ease-out"
                        : "transform 0.5s ease-out",
                    }}
                  >
                    <img
                      src={url}
                      alt={`work-${idx + 1}`}
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target && target.src && !target.dataset.fallback) {
                          target.dataset.fallback = "1";
                          target.src = "/images/visual-placeholder.webp";
                        }
                      }}
                      className="block w-full h-full object-cover"
                    />
                  </div>
                  {/* per-tile gradient removed — using a single overlay for the whole mosaic */}
                </motion.button>
              );
            })}
          </div>

          <div
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-[40%] bg-gradient-to-b from-transparent to-[#1b1b1b] pointer-events-none z-40"
          />
        </div>

        {/* CTA centered at bottom */}
        <div className="mt-6 sm:mt-8 md:mt-12 flex justify-center">
          <Link
            to={localePath(locale, "works")}
            className="px-6 sm:px-8 py-2 sm:py-3 bg-white/10 hover:bg-white/20 rounded-full text-white uppercase text-xs sm:text-sm tracking-wide transition-all duration-300"
          >
            {t["Explore more"] ?? "explore more"}
          </Link>
        </div>
        {/* section-level shadow removed; using a single overlay directly above the grid for reliability */}
      </div>
      {modalUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <div
            className={`absolute inset-0 bg-black/70 transition-opacity duration-300 ${
              modalVisible ? "opacity-100" : "opacity-0"
            }`}
            onClick={() => closeModal()}
            aria-hidden
          />
          <div
            className={`relative max-w-[90vw] max-h-[90vh] w-[min(1100px,90vw)] p-4 transform transition-all duration-300 ease-out ${
              modalVisible
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 "
            }`}
          >
            <button
              onClick={() => closeModal()}
              className="absolute top-5 bg-black/10 right-5 z-10 text-white rounded-sm px-2"
              aria-label="Close"
            >
              ✕
            </button>
            <img
              src={modalUrl}
              alt="tile"
              className="w-full h-full object-contain rounded-md bg-black"
            />
          </div>
        </div>
      )}
    </section>
  );
});

ServiceSection.displayName = "ServiceSection";

export { ServiceSection };
