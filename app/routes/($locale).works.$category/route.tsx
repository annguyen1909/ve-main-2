import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import {
  useLoaderData,
  useOutletContext,
  useSearchParams,
} from "@remix-run/react";
import { Container } from "~/components/ui/container";
import * as motion from "motion/react-client";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
} from "~/components/ui/icon";
import { MinusIcon, PlusIcon } from "lucide-react";
import { Api } from "~/lib/api";
import { CategoryResource } from "~/types/categories";
import { title } from "~/lib/utils";
import type { AppContext, loader as rootLoader } from "~/root";
import { useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { 
  groupWorksByProject, 
  filterWorksByTag, 
  searchWorks,
  type OrganizedProject
} from "~/lib/api-data-processor";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const slug = params.category ?? "";

  const url = new URL(request.url);
  const query = url.searchParams.get("q") ?? "";
  const tagId = url.searchParams.get("tag_id") ?? "";

  const locale = params.locale ?? "en";

  const api = new Api();

  const categories = await api
    .getCategories(locale)
    .then((response) => response.data.data);
  const category = categories.find(
    (category: CategoryResource) => category.slug === slug
  );

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  const works = await api
    .getWorks(locale, category.slug, query, tagId)
    .then((response) => response.data.data);
  const tags = await api.getTags(locale).then((response) => response.data.data);

  return {
    locale,
    category,
    works,
    tags,
  };
}

export const meta: MetaFunction<typeof loader, { root: typeof rootLoader }> = ({
  data,
}) => {
  return [
    {
      title: title(
        data?.locale === "ko"
          ? data.category.slug === "image"
            ? "조감도 | 투시도 | 건축CG | 분양CG"
            : "건축CG영상"
          : data?.category.title
      ),
    },
    { name: "description", content: data?.category.description },
  ];
};

export default function Works() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { translations: t } = useOutletContext<AppContext>();
  const { works, tags } = useLoaderData<typeof loader>();
  const [showSearch, setShowSearch] = useState(searchParams.get("q") ?? false);
  const [selectedProject, setSelectedProject] =
    useState<OrganizedProject | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showModal, setShowModal] = useState(false);

  // Process works into organized projects
  const query = searchParams.get("q") ?? "";
  const tagId = searchParams.get("tag_id") ?? "";

  let filteredWorks = works.map(work => ({
    ...work,
    attachment: undefined,
  }));
  if (query) {
    filteredWorks = searchWorks(filteredWorks, query).map(work => ({
      ...work,
      attachment: undefined,
    }));
  }
  if (tagId) {
    filteredWorks = filterWorksByTag(filteredWorks, tagId).map(work => ({
      ...work,
      attachment: undefined,
    }));
  }

  const projects = groupWorksByProject(filteredWorks);

  function handleImageClick(project: OrganizedProject, imageIndex: number = 0) {
    setSelectedProject(project);
    setSelectedImageIndex(imageIndex);
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedProject(null);
    setSelectedImageIndex(0);
  }

  function navigateImage(direction: "prev" | "next") {
    if (!selectedProject) return;

    const totalImages = selectedProject.images.length;
    if (direction === "prev") {
      setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : totalImages - 1));
    } else {
      setSelectedImageIndex((prev) => (prev < totalImages - 1 ? prev + 1 : 0));
    }
  }

  useEffect(() => {
    if (!showSearch) {
      setSearchParams(new URLSearchParams());
    }
  }, [showSearch, setSearchParams]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "auto";
    };
  }, [showModal]);

  return (
    <section className="min-h-dvh h-auto text-white pt-20">
      {/* Search and Filter Header */}
      <Container
        variant="fluid"
        className="sm:!px-10 mt-4 !py-0 flex flex-col md:flex-row md:items-center gap-5 md:gap-7"
      >
        <div className="flex items-center gap-5 flex-none">
          <button
            className="font-semibold text-lg 2xl:text-xl flex items-center cursor-pointer"
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? (
              <MinusIcon className="size-5 mr-2" />
            ) : (
              <PlusIcon className="size-5 mr-2" />
            )}
            {t["Search & Filter"]}
          </button>
          <span className="font-light text-sm 2xl:text-base">
            {projects.length} {t["projects"]}
          </span>
        </div>

        <AnimatePresence>
          {showSearch ? (
            <motion.div
              className="flex-none items-center gap-7 flex max-w-full grow"
              initial={{ translateX: "-10%", opacity: 0 }}
              animate={{ translateX: "0%", opacity: 100 }}
              exit={{ translateX: "-10%", opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center gap-2 min-w-32 flex-none">
                <input
                  type="search"
                  className="outline-none bg-transparent border-b border-b-white py-0.5 rounded-none"
                  placeholder={t["Search works..."]}
                  defaultValue={searchParams.get("q") ?? ""}
                  data-koreanable
                  onChange={(event) => {
                    const params = searchParams;
                    params.set("q", event.target.value.trim());
                    setSearchParams(params);
                  }}
                />
                <MagnifyingGlassIcon className="-scale-x-100 text-white size-5" />
              </div>

              <div className="flex items-center gap-5 font-extralight overflow-auto max-w-full">
                {tags.map((tag) => (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => {
                      const params = searchParams;
                      params.set("tag_id", tag.id);
                      setSearchParams(params);
                    }}
                  >
                    {tag.name}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </Container>

      {/* Projects Grid - One image per project */}
      <Container variant="fluid" className="sm:!px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-2">
          {projects.map((project) => {
            const coverImage = project.images[0]; // Use first image as project cover

            return (
              <button
                key={project.title}
                type="button"
                onClick={() => handleImageClick(project, 0)}
                className="group cursor-pointer"
              >
                {/* Project Cover Image */}
                <div className="aspect-[4/3] relative overflow-hidden group-hover:shadow-2xl group-hover:bg-white/60 transition-all duration-300">
                  <img
                    src={coverImage.url}
                    alt={project.title}
                    className="w-full h-full group-hover:scale-105 group-hover:blur-[1.5px] object-cover transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Overlay with project info - only visible on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out">
                    <div className="absolute bottom-[40%] left-0 right-0 p-4 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <h3
                        className="font-medium text-lg mb-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                        data-koreanable
                      >
                        {project.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </Container>

      {/* Simplified Project Modal - Main image with thumbnails below */}
      <AnimatePresence>
        {showModal && selectedProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                closeModal();
              }
            }}
          >
            <div className="relative w-full h-full max-w-7xl max-h-full flex flex-col">
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 z-20 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Project Title */}
              <div className="text-center mb-4 px-4">
                <h2
                  className="text-2xl lg:text-3xl font-medium text-white mb-2"
                  data-koreanable
                >
                  {selectedProject.title}
                </h2>
                <p className="text-gray-300 text-sm lg:text-base font-light">
                  {selectedProject.description}
                </p>
              </div>

              {/* Main Image Display */}
              <div className="flex-1 flex items-center justify-center min-h-0 mb-6 relative">
                {selectedProject.images[selectedImageIndex] && (
                  <>
                    <img
                      src={selectedProject.images[selectedImageIndex].url}
                      alt={selectedProject.images[selectedImageIndex].title}
                      className="max-w-full max-h-full object-contain rounded-lg"
                    />

                  </>
                )}

                {/* Navigation Arrows */}
                {selectedProject.images.length > 1 && (
                  <>
                    <button
                      onClick={() => navigateImage('prev')}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                    >
                      <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => navigateImage('next')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-3"
                    >
                      <ChevronRightIcon className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnail Strip Below Main Image */}
              <div className="flex-none px-2 sm:px-4 pb-4">
                <div className="flex gap-1 sm:gap-2 justify-start sm:justify-center scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pb-2">
                  {selectedProject.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setSelectedImageIndex(index)}
                      className={`flex-none w-16 h-12 sm:w-20 sm:h-16 rounded-md overflow-hidden transition-all duration-200 hover:scale-105 ${
                        index === selectedImageIndex
                          ? 'ring-2 ring-white ring-offset-1 sm:ring-offset-2 ring-offset-black'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to attachment_url if optimize_attachment_url fails
                          const img = e.target as HTMLImageElement;
                          if (img.src.includes('optimize_attachment_url')) {
                            const fallbackSrc = image.url.replace(/optimize_attachment_url/g, 'attachment_url');
                            img.src = fallbackSrc;
                          }
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Simple Project Info */}
                <div className="mt-2 sm:mt-4 text-center text-gray-300">
                  <span className="text-xs sm:text-sm">{selectedProject.images.length} images</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
