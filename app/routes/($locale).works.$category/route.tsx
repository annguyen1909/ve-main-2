import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useLocation, useOutletContext, useSearchParams } from "@remix-run/react";
import { Container } from "~/components/ui/container";
import * as motion from "motion/react-client";
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "~/components/ui/icon";
import { MinusIcon, PlayIcon, PlusIcon } from "lucide-react";
import { Api } from "~/lib/api";
import { CategoryResource } from "~/types/categories";
import { cn, title } from "~/lib/utils";
import type { AppContext, loader as rootLoader } from "~/root";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "~/components/ui/dialog";
import { WorkResource } from "~/types/works";
import { BlurFade } from "~/components/ui/blur-fade";
import { ContactSection } from "~/components/contact-section";
import { PageScroller } from "~/components/ui/page-scroller";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.category ?? "";

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const tagId = url.searchParams.get("tag_id") ?? "";

  const locale = params.locale ?? "en";

  const api = new Api();

  const categories = await api.getCategories(locale).then((response) => response.data.data);
  const category = categories.find((category: CategoryResource) => category.slug === slug);

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  const works = await api.getWorks(locale, category.slug, query, tagId).then((response) => response.data.data);
  const tags = await api.getTags(locale).then((response) => response.data.data);

  return {
    locale,
    category,
    works,
    tags
  };
}

export const meta: MetaFunction<typeof loader, { "root": typeof rootLoader }> = ({ data, matches }) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data

  return [
    { title: title(data?.locale === 'ko' ? (data.category.slug === 'image' ? '조감도 | 투시도 | 건축CG | 분양CG' : '건축CG영상') : data?.category.title) },
    { name: "description", content: data?.category.description },
  ];
};

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { translations: t } = useOutletContext<AppContext>();
  const { works, category, tags } = useLoaderData<typeof loader>();
  const [showSearch, setShowSearch] = useState(searchParams.get('q') ?? false);
  const [currentWork, setCurrentWork] = useState<WorkResource | null>(null);
  const [currentWorkIndex, setCurrentWorkIndex] = useState<number | null>(null);
  const [openView, setOpenView] = useState<boolean>(false);
  const [fullImageLoaded, setFullImageLoaded] = useState<boolean>(false);

  function handeLoadFullImage() {
    setFullImageLoaded(true);
  }

  function handleClickOutsideView(event: React.MouseEvent) {
    event.preventDefault();

    const element = event.target as HTMLElement;
    if (element && element.classList.contains("overlay")) {
      setOpenView(false);
    }
  }

  useEffect(() => {
    if (!showSearch) {
      setSearchParams(new URLSearchParams());
    }
  }, [showSearch, setSearchParams])

  return (
    // <PageScroller>
      <section className="min-h-dvh h-auto text-white pt-20">
        <Container variant={category.slug === 'image' ? "fluid" : "xl"} className="sm:!px-10 mb-4 !py-0 flex flex-col md:flex-row md:items-center gap-5 md:gap-7">
          <div className="flex items-center gap-5 flex-none">
            <button className="font-semibold text-lg 2xl:text-xl flex items-center cursor-pointer" onClick={() => setShowSearch(!showSearch)}>{showSearch ? <MinusIcon className="size-5 mr-2" /> : <PlusIcon className="size-5 mr-2" />} {t["Search & Filter"]}</button>
            <span className="font-light text-sm 2xl:text-base">{works.length} {t["projects"]}</span>
          </div>

          <AnimatePresence>
            {showSearch ? <motion.div
              className={cn("flex-none items-center gap-7 flex max-w-full grow")}
              initial={{ translateX: '-10%', opacity: 0 }}
              animate={{ translateX: '0%', opacity: 100 }}
              exit={{ translateX: '-10%', opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 min-w-32 flex-none">
                <input type="search" className="outline-none bg-transparent border-b border-b-white py-0.5 rounded-none" placeholder={t['Search works...']} defaultValue={searchParams.get('q') ?? ''} data-koreanable onChange={(event) => {
                  const params = searchParams;
                  params.set("q", event.target.value.trim());
                  setSearchParams(params);
                }} />
                <MagnifyingGlassIcon className="-scale-x-100 text-white size-5" />
              </div>

              <div className={cn('flex items-center gap-5 font-extralight overflow-auto max-w-full')}>
                {tags.map(tag => <button type="button" key={tag.id} onClick={() => {
                  const params = searchParams;
                  params.set("tag_id", tag.id);
                  setSearchParams(params);
                }}>{tag.name}</button>)}
              </div>
            </motion.div> : null}
          </AnimatePresence>
        </Container>

        {category.slug === 'image'
          ? <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
            {works.map((work, i) => (
              <button
                type="button"
                key={i}
                onClick={() => {
                  setCurrentWork(work)
                  setCurrentWorkIndex(i)
                  setOpenView(true)
                }}
              >
                <BlurFade
                  delay={0.25 + i * 0.05}
                  offset={10}
                  direction="up"
                  className="aspect-[4/3] relative"
                >
                  <div className="w-full h-full bg-[#1b1b1b] text-white items-center  justify-center !delay-0 flex p-3">
                    <h3 className="text-xl 2xl:text-2xl xl:font-medium text-center" data-koreanable>{work.title}</h3>
                  </div>
                  <img
                    src={work.optimize_attachment_url || work.attachment_url}
                    alt={work.title}
                    className="absolute inset-0 object-cover w-full h-full hover:opacity-0 duration-100"
                    loading="lazy"
                  />
                </BlurFade>
              </button>
            ))}
          </motion.div>
          : <Container variant="xl" className="sm:!px-10 mb-4 !py-0 flex flex-col gap-2">
            {works.map((work, i) =>
              <div key={i} className="flex items-start gap-4">
                <div role="presentation" onClick={() => {
                  setCurrentWork(work)
                  setCurrentWorkIndex(i)
                  setOpenView(true)
                }} className="block grow">
                  <div className="aspect-video relative flex items-center justify-center">
                    <div className="w-1/6 aspect-square rounded-full bg-black/20 flex items-center justify-center absolute">
                      <PlayIcon className="size-1/3 fill-white" />
                    </div>
                    <img src={work.optimize_attachment_url || work.attachment_url} alt={work.title} className="object-cover w-full h-full" />
                  </div>
                </div>
                <div className="w-96 flex-none hidden md:block" data-koreanable>
                  <button className="block text-left" onClick={() => {
                    setCurrentWork(work)
                    setCurrentWorkIndex(i)
                    setOpenView(true)
                  }}>
                    <h2 className="mb-4 text-xl lg:text-xl 2xl:text-2xl font-medium">{work.title}</h2>
                  </button>
                  <p className="text-base lg:text-md 2xl:text-md font-light">{work.description}</p>
                  {work.link_video ? <p className="text-base lg:text-lg 2xl:text-md font-light">{t['Link']}: <a href={work.link_video} target="_blank" rel="noreferrer" className="link-animation">{work.link_video}</a></p> : null}
                </div>
              </div>
            )}
          </Container>
        }

        {
          currentWork && currentWorkIndex !== null ? <Dialog open={openView} onOpenChange={setOpenView}>
            <DialogContent
              onClick={handleClickOutsideView}
              className="overlay outline-none max-w-full p-0 h-[calc(100dvh_-_theme('spacing.32'))] max-h-[calc(100dvh_-_theme('spacing.32'))] flex items-center justify-center bg-transparent border-none rounded-none w-full group custom-close"
            >
              <DialogTitle className="hidden h-0">
                <DialogDescription></DialogDescription>
              </DialogTitle>
              <button
                type="button"
                className="flex-none text-white absolute left-2 cursor-pointer"
                onClick={() => {
                  setCurrentWork(works[currentWorkIndex - 1]);
                  setCurrentWorkIndex(currentWorkIndex - 1)
                  setOpenView(true)
                  setFullImageLoaded(false)
                  console.log(works[currentWorkIndex - 1])
                }}
                disabled={currentWorkIndex === 0}
              >
                <ChevronLeftIcon className={cn('size-10 drop-shadow', currentWorkIndex === 0 ? 'opacity-0' : '')} />
              </button>

              {category.slug === 'image' ? <motion.img
                key={currentWork.slug}
                src={fullImageLoaded ? currentWork.attachment_url : (currentWork.optimize_attachment_url ? currentWork.optimize_attachment_url : currentWork.attachment_url)}
                alt={currentWork.title}
                className="max-h-full mx-auto"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                fetchpriority="high"
                onLoad={handeLoadFullImage}
                exit={{ opacity: 0 }}
              /> : <motion.video
                src={currentWork.attachment_url}
                autoPlay
                controls
                playsInline
                className="max-h-full mx-auto"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  x: 0,
                }}
                exit={{ opacity: 0 }}
              />}

              <button
                type="button"
                className="flex-none text-white absolute right-2 cursor-pointer"
                onClick={() => {
                  setCurrentWork(works[currentWorkIndex + 1]);
                  setCurrentWorkIndex(currentWorkIndex + 1)
                  setOpenView(true)
                  setFullImageLoaded(false)
                  console.log(works[currentWorkIndex + 1])
                }}
                disabled={currentWorkIndex === works.length - 1}
              >
                <ChevronRightIcon className={cn("size-10 drop-shadow", currentWorkIndex === works.length - 1 ? "opacity-0" : "")} />
              </button>
              <div className="absolute text-white flex-col text-center lg:flex-row -bottom-16 !py-2 flex items-center justify-center gap-1" data-koreanable>
                <h1 className="text-sm sm:text-base font-semibold">{currentWork.title}</h1>
                <span className="text-sm sm:text-base font-extralight">{currentWork.description}</span>
              </div>
            </DialogContent>
          </Dialog> : null
        }
      </section >
      /* <ContactSection />
    </PageScroller> */
  );
}
