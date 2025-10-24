import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "~/components/ui/dialog";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, CrossIcon } from "~/components/ui/icon";
import * as motion from "motion/react-client";
import { Api } from "~/lib/api";
import { title } from "~/lib/utils";

export async function loader({ params }: LoaderFunctionArgs) {
  const workSlug = params.work ?? "";
  const categorySlug = params.category ?? "";
  const locale = params.locale ?? "en";

  const api = new Api();
  let categories;
  let work;

  try {
    categories = await api.getCategories(locale).then((response) => response.data.data);
  } catch {
    throw new Response("Not Found", { status: 404 });
  }

  const category = categories.find((category) => category.slug === categorySlug);

  if (!category) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    work = await api.getWork(locale, workSlug).then((response) => response.data.data)
  } catch {
    throw new Response("Not Found", { status: 404 });
  }

  return {
    work,
    category
  };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    { title: title(data?.work.title) },
    { name: "description", content: data?.work.description },
  ];
};

export default function Works() {
  const navigate = useNavigate();
  const { work, category } = useLoaderData<typeof loader>();

  const [loaded, setLoaded] = useState<boolean>(!work.optimize_attachment_url);
  const [open, setOpen] = useState<boolean>(true);
  // dialogRef removed (not required)

  function handleClickOutside(event: React.MouseEvent) {
    event.preventDefault();

    const element = event.target as HTMLElement;
    if (element && element.classList.contains("overlay")) {
      setOpen(false);
    }
  }

  function handeLoadImage() {
    setLoaded(true);
  }

  useEffect(() => {
    if (!open) {
      navigate("../", {
        preventScrollReset: true,
        replace: true,
      });
    }
  }, [open, navigate]);

  // Keyboard navigation: only left/right to navigate
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        const left = document.querySelector<HTMLAnchorElement>(".work-nav-left");
        if (left) left.click();
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        const right = document.querySelector<HTMLAnchorElement>(".work-nav-right");
        if (right) right.click();
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="overlay outline-none max-w-full p-0 h-[calc(100dvh_-_theme('spacing.32'))] max-h-[calc(100dvh_-_theme('spacing.32'))] flex items-center justify-center bg-transparent border-none rounded-none w-full group custom-close"
        onClick={handleClickOutside}
      >
        <DialogTitle className="hidden h-0">
          <DialogDescription></DialogDescription>
        </DialogTitle>

        {/* In-image close button */}
        <button
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-6 top-6 z-50 bg-black/40 hover:bg-black/60 rounded-full p-2"
        >
          <CrossIcon className="w-4 h-4" />
        </button>
        <Link
          to={{ pathname: `/works/image/work-a` }}
          className="work-nav-left flex-none text-white absolute left-2 cursor-pointer"
          preventScrollReset
          viewTransition
        >
          <ChevronLeftIcon className="size-10 drop-shadow" />
        </Link>

        {category.slug === 'image' ? <motion.img
          src={loaded ? work.attachment_url : (work.optimize_attachment_url ? work.optimize_attachment_url : work.attachment_url)}
          alt={work.title}
          className="max-h-full mx-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: 0,
          }}
                fetchPriority="high"
          onLoad={handeLoadImage}
          exit={{ opacity: 0 }}
        /> : <motion.video
          src={work.attachment_url}
          autoPlay
          loop
          className="max-h-full mx-auto"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: 0,
          }}
          exit={{ opacity: 0 }}
        />}


        <Link
          to={{ pathname: `/works/image/work-b` }}
          className="work-nav-right flex-none text-white absolute right-2 cursor-pointer"
          preventScrollReset
          viewTransition
        >
          <ChevronRightIcon className="size-10 drop-shadow" />
        </Link>
        <div className="absolute text-white flex-col sm:flex-row -bottom-16 h-16 flex items-center justify-center gap-1">
          <h1 className="text-sm sm:text-base font-semibold">{work.title}</h1>
          <span className="text-sm sm:text-base font-extralight">{work.description}</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
