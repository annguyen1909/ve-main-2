import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { PageScroller } from "~/components/ui/page-scroller";
import type { AppContext, loader as rootLoader } from "~/root";
import { ContactSection } from "~/components/contact-section";
import { Api } from "~/lib/api";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { NewsResource } from "~/types/news";
import { title } from "~/lib/utils";
import { Container } from "~/components/ui/container";
import { generateHTML } from '@tiptap/html'
import { Image } from '@tiptap/extension-image'
import StarterKit from '@tiptap/starter-kit'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const locale = params.locale ?? "en";
  const slug = params.slug;
  let news: NewsResource;

  if (!slug) {
    throw new Response("Not Found", { status: 404 });
  }

  const api = new Api();

  try {
    news = await api
      .getNews(locale, slug)
      .then(async (response) => {
        return response.data.data;
      })
  } catch {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    news,
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: title(data?.news.title) },
    { name: "description", content: data?.news.description },
  ];
};

export default function NewsDetailPage() {
  const { news } = useLoaderData<typeof loader>();
  const { translations: t, locale } = useOutletContext<AppContext>();

  return (
    <PageScroller scrollable={true}>
      <section className="h-dvh overflow-auto">
        <div className="w-full h-full max-h-[65%] relative flex items-center justify-center bg-no-repeat bg-top bg-fixed" style={{ backgroundImage: `url(${news.attachment_url})` }}>
          {/* <img src={news.attachment_url} alt={news.title} className="max-h-full max-w-full w-full h-full object-cover absolute inset-0" /> */}
          <div className="bg-gradient-to-t from-[#1b1b1b]/0 to-[#1b1b1b] absolute inset-0"></div>
          <Container className="relative" variant="lg">
            <span className="text-white font-extralight text-xs mb-5 xl:mb-7 inline-block">{new Date(news.published_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric', day: '2-digit' })}</span>
            <h1 className="text-4xl xl:text-5xl font-black text-white" data-koreanable>{news.title}</h1>
          </Container>
        </div>
        <Container className="prose prose-invert prose-md py-7 sm:py-14 xl:py-20" data-koreanable variant="lg" dangerouslySetInnerHTML={{
          __html: generateHTML(JSON.parse(news.content), [
            StarterKit,
            Image,
          ])
        }}>
        </Container>
      </section>
      <ContactSection />
    </PageScroller>
  );
}
