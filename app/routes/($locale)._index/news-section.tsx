import { Link, useOutletContext } from "@remix-run/react"
import { AppContext } from "~/root"
import { Container } from "~/components/ui/container"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useInView } from "motion/react"
import { NewsResource } from "~/types/news"
import { localePath } from "~/lib/utils"
import { ChevronsRight } from "lucide-react"

interface NewsSectionProps {
  newsList: Array<NewsResource>,
  newsCount: number
}

const NewsSection = forwardRef<HTMLElement, NewsSectionProps>((props, forwardedRef) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { newsList: propsNewsList, newsCount, ...domProps } = props;
  const ref = useRef<HTMLElement>(null);
  const { translations: t, locale } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })

  const newsList = Array.isArray(propsNewsList) ? propsNewsList : [];

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";
  }, [inView]);

  return <section ref={ref} className="min-h-screen flex py-7 sm:py-14" {...domProps}>
    <Container className="flex-none m-auto min-h-full flex flex-col" variant={"fluid"}>
      <div className="text-center mt-14 mb-2">
        <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2" data-koreanable>{t['New update']}</h3>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 my-auto">
        {newsList.map((news, index) => (
          <Link to={localePath(locale, `news/${news.slug}`)} key={index} className="relative aspect-square">
            <img className="absolute inset-0 object-cover w-full h-full" src={news.optimize_attachment_url ?? news.attachment_url} alt={news.title} />
            <div className="relative flex items-end w-full h-full bg-gradient-to-b from-transparent to-[#1b1b1b]">
              <div className="p-4 xl:p-6">
                <span className="text-white font-medium text-xs mb-4 xl:mb-6 inline-block">{new Date(news.published_at).toLocaleDateString('vi-VN', {  month: '2-digit', year: 'numeric', day: '2-digit' })}</span>
                <h4 className="font-semibold text-white text-base sm:text-lg lg:text-base xl:text-xl 2xl:text-2xl line-clamp-4" data-koreanable>{news.title}</h4>
              </div>
            </div>
          </Link>
        ))}
      </div>
      
      {props.newsCount > 4 && (
        <div className="flex justify-end mt-4">
          <Link to={localePath(locale, 'news')} className="flex items-center gap-1.5 text-white uppercase text-xl font-thin"><ChevronsRight className="size-8 stroke-1" /> {t['See more']} ({props.newsCount})</Link>
        </div>
      )}
    </Container>
  </section>
});

NewsSection.displayName = "NewsSection";

export { NewsSection };