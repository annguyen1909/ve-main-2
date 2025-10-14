import { Link, useOutletContext } from "@remix-run/react";
// import { ArrowRight } from "lucide-react";
import { useInView } from "motion/react";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { localePath } from "~/lib/utils";
import { AppContext } from "~/root";

const ServiceSection = forwardRef<HTMLElement>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t, locale, banners } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 0.25 });

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");
    if (!headerDom || !inView) return;
    headerDom.dataset.variant = "dark";
  }, [inView]);

  // create a masonry-like pattern using grid row/span config
  const tiles = [
    { rowSpan: 3 },
    { rowSpan: 5 },
    { rowSpan: 4 },
    { rowSpan: 6 },
    { rowSpan: 4 },
    { rowSpan: 3 },
    { rowSpan: 4 },
    { rowSpan: 3 },
    { rowSpan: 5 },
    { rowSpan: 3 },
  ];

  // map banners or fallback grey tiles
  const imgs = (Array.isArray(banners) && banners.length > 0)
    ? banners.map(b => b.url)
    : tiles.map(() => "/images/placeholder-vertical.jpg");

  return (
    <section className="min-h-screen relative bg-black" ref={ref} {...props}>
      {/* heading */}
      <div className="max-w-7xl mx-auto px-6 pt-12">
  <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white">Selected works</h2>
  <p className="mt-4 max-w-3xl text-white/70">Explore the impressive portfolio of Our 3D Rendering Company to see how VISUAL ENNODE brings architectural visions to life with precision and creativity.</p>
      </div>

      {/* mosaic grid */}
      <div className="mt-10 max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-5 gap-4 auto-rows-fr">
          {tiles.map((tile, idx) => (
            <div key={idx} className={`relative overflow-hidden rounded-sm bg-gray-800`} style={{ gridRowEnd: `span ${tile.rowSpan}` }}>
              <img
                src={imgs[idx % imgs.length]}
                alt={`work-${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-700 ease-out transform hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          ))}
        </div>

        {/* CTA centered at bottom */}
        <div className="mt-12 flex justify-center">
          <Link to={localePath(locale, 'works')} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white uppercase text-sm tracking-wide">{t['Explore more'] ?? 'explore more'}</Link>
        </div>
      </div>
    </section>
  );
});

ServiceSection.displayName = "ServiceSection";

export { ServiceSection };
