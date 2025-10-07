import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { HeroSection } from "./hero-section";
import { SummarySection } from "./summary-section";
import { ServiceSection } from "./service-section";
import { PageScroller } from "~/components/ui/page-scroller";
import { cn, title } from "~/lib/utils";
import type { loader as rootLoader } from "~/root";
import { useEffect, useState } from "react";
import { ClientSection } from "~/components/client-section";
import { ContactSection } from "~/components/contact-section";
import { Api } from "~/lib/api";
import { useLoaderData } from "@remix-run/react";
import { MorphingText } from "~/components/ui/morphing-text";
import { NewsSection } from "./news-section";

export const meta: MetaFunction<unknown, { "root": typeof rootLoader }> = ({ matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  const titleText = title(rootMatch!.translations["home.page.title"], true);
  const descText = rootMatch!.translations["home.page.description"];
  const ogTitle = rootMatch!.translations["home.page.og.title"];
  const ogDesc = rootMatch!.translations["home.page.og.description"];
  const twitterTitle = rootMatch!.translations["home.page.twitter.title"];
  const twitterDesc = rootMatch!.translations["home.page.twitter.description"];

  return [
    { title: titleText },
    { name: "description", content: descText },

    { property: "og:title", content: ogTitle },
    { property: "og:description", content: ogDesc },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com" },
    { property: "og:image", content: "https://www.visualennode.com/images/og-cover.jpg" },

    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: twitterTitle },
    { name: "twitter:description", content: twitterDesc },
    { name: "twitter:image", content: "https://www.visualennode.com/images/og-cover.jpg" }
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const locale = params.locale ?? 'en';

  const api = new Api();
  
  let newsCount: number = 0;
  
  const clients = await api
    .getClients(locale)
    .then(async (response) => {
      return response.data.data;
    })
  
  const newsList = await api
    .getNewsList(locale, '', 1)
    .then(async (response) => {
      newsCount = response.data.meta.total;
      return response.data.data.splice(0, 4);
    })
  
  return {
    clients,
    newsList,
    newsCount
  };
}

export default function Index() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const { clients, newsList, newsCount } = useLoaderData<typeof loader>();

  useEffect(() => {
    if (loaded) return;

    const videos = document.querySelectorAll('video');
    let videoLoadedCount = 0;
    let autoplayVideoCount = 0;

    videos.forEach(video => {
      if (video.autoplay) {
        autoplayVideoCount++;
      }
    })

    function handleLoadedVideo() {
      videoLoadedCount++

      if (videoLoadedCount === autoplayVideoCount) {
        setLoaded(true);
      }
    }

    videos.forEach((video) => {
      if (video.autoplay) {
        if (video.readyState >= video.HAVE_FUTURE_DATA) {
          handleLoadedVideo()
          return
        }

        video.addEventListener("canplaythrough", handleLoadedVideo);
      }

    })

    return () => {
      videos.forEach((video) => {
        if (video.autoplay) {
          video.removeEventListener("canplaythrough", handleLoadedVideo);
        }
      })
    };
  }, [loaded]);

  return (
    <>
      <div className={cn('fixed inset-0 bg-[#1b1b1b] z-50 flex items-center justify-center', loaded ? 'hidden' : '')}>
        <div className="text-center max-w-screen-md w-full">
          <MorphingText className="text-white" texts={['We visualize', 'We connect']} />
          <p className="text-white/80 lg:mt-4 text-sm lg:text-xl font-light">preparing for the best...</p>
        </div>
      </div>
      <PageScroller scrollable={loaded}>
        <HeroSection ready={loaded} />
        <SummarySection />
        <ServiceSection />
        <NewsSection newsList={newsList} newsCount={newsCount} />
        <ClientSection clients={clients} />
        <ContactSection />
      </PageScroller>
    </>
  );
}
