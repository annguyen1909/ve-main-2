import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useOutletContext } from "@remix-run/react";
import { ArrowRight } from "lucide-react";
import * as motion from "motion/react-client";
import { Api } from "~/lib/api";
import { cn, localePath, title } from "~/lib/utils";
import { AppContext } from "~/root";
import type { loader as rootLoader } from "~/root";
import { ContactSection } from "~/components/contact-section";
import { PageScroller } from "~/components/ui/page-scroller";

const CARD_ANIMATION_SECONDS = 0.5;

export async function loader({ params }: LoaderFunctionArgs) {
  const api = new Api()
  const locale = params.locale ?? 'en';
  const categories = await api.getCategories(locale).then(res => res.data.data);

  const imageCategory = categories.find(category => category.slug === 'image');
  const cinematicCategory = categories.find(category => category.slug === 'cinematic');

  return {
    imageCategory,
    cinematicCategory
  };
}

export const meta: MetaFunction<unknown, { "root": typeof rootLoader }> = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch!.translations['work.page.title']) },
    { name: "description", content: rootMatch!.translations['work.page.description'] },

    // ✅ Open Graph
    { property: "og:title", content: rootMatch!.translations['work.page.og.title'] },
    { property: "og:description", content: rootMatch!.translations['work.page.og.description'] },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/works" },
    { property: "og:image", content: "https://www.visualennode.com/images/og-cover.jpg" },

    // ✅ Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: rootMatch!.translations['work.page.og.title'] },
    { name: "twitter:description", content: rootMatch!.translations['work.page.og.description'] },
    { name: "twitter:image", content: "https://www.visualennode.com/images/og-cover.jpg" },
  ];
};

export default function Works() {
  const { translations: t, locale } = useOutletContext<AppContext>()
  const { imageCategory, cinematicCategory } = useLoaderData<typeof loader>()

  return (
    <PageScroller>
      <section className="h-dvh overflow-hidden max-h-dvh grid grid-cols-1 lg:grid-cols-2">
        <div className="relative">
          {imageCategory?.attachment_url ? <video muted playsInline autoPlay loop preload="auto" className={cn("absolute inset-0 object-cover h-dvh w-full max-h-dvh")}>
            <source src={imageCategory.attachment_url} type="video/mp4" />
          </video> : null}

          <motion.div
            className="hover:bg-black/60 bg-black/30 relative group h-full"
            initial={{ translateX: "-10%" }}
            animate={{ translateX: 0 }}
            transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
          >
            <div className="h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40">
              <div className="">
                <Link
                  to={localePath(locale, '/works/image')}
                  className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7"
                >
                  {imageCategory?.title ?? 'IMAGE'}
                </Link>
                <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                  <p className="text-3xl hidden lg:block text-white/80">
                    {imageCategory?.description ?? 'We visualize your imagination'}
                  </p>
                  <Link
                    to={localePath(locale, '/works/image')}
                    className="hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7"
                  >
                    {t['See works']} <ArrowRight className="size-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="relative">
          {cinematicCategory?.attachment_url ? <video muted playsInline autoPlay loop preload="auto" className={cn("absolute inset-0 object-cover h-dvh w-full max-h-dvh")}>
            <source src={cinematicCategory.attachment_url} type="video/mp4" />
          </video> : null}

          <motion.div
            className="hover:bg-black/60 bg-black/30 relative group h-full"
            initial={{ translateX: "10%" }}
            animate={{ translateX: 0 }}
            transition={{ translateX: { duration: CARD_ANIMATION_SECONDS } }}
          >
            <div className="h-full flex items-center justify-center lg:items-end lg:justify-start lg:px-24 lg:py-40">
              <div>
                <Link
                  to={localePath(locale, '/works/cinematic')}
                  className="inline-block text-5xl xl:text-6xl font-semibold text-white uppercase drop-shadow duration-500 lg:group-hover:mb-7"
                >
                  {cinematicCategory?.title ?? 'CINEMATIC'}
                </Link>
                <div className="opacity-0 translate-y-4 h-0 group-hover:h-auto group-hover:translate-y-0 group-hover:opacity-100 duration-300">
                  <p className="text-3xl hidden lg:block text-white/80">
                    {cinematicCategory?.description ?? 'We weave soul into the story'}
                  </p>
                  <Link
                    to={localePath(locale, '/works/cinematic')}
                    className="hidden lg:inline-flex items-center text-xl text-white/80 font-light mt-7"
                  >
                    {t["See works"]} <ArrowRight className="size-3 ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section >
      <ContactSection />
    </PageScroller>
  );
}