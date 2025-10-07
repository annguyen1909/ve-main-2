import { Attachment } from "~/types/resources";
import { Container } from "./ui/container";
import {
  CrossIcon,
  GlobeIcon,
  HamburgerMenuIcon,
  MagnifyingGlassIcon,
} from "./ui/icon";
import { useEffect, useState } from "react";
import { cn, localePath } from "~/lib/utils";
import { Link, useLocation, useNavigate, useNavigation } from "@remix-run/react";
import { Footer } from "./footer";
import * as motion from "motion/react-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AppContext } from "~/root";
import { ContactCtaSection } from "./contact-cta-section";

interface HeaderProps {
  brand: Attachment;
  translations: AppContext['translations'];
  locale: string;
}

export default function Header({ brand, translations: t, locale }: HeaderProps) {
  const [collapse, setCollapse] = useState<boolean>(true);
  const navigation = useNavigation();
  const [lastHeaderVariant, setLastHeaderVariant] = useState<string | undefined>();
  const navigate = useNavigate();
  const location = useLocation();

  function switchLocale(newLocale: string) {
    return navigate(localePath(newLocale, location.pathname.replace('/' + locale, '').replace(/\/$/g, '')));
  }

  useEffect(() => {
    setCollapse(true);

    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add('opacity-50');
    } else {
      headerDom.classList.remove('opacity-50');
    }

    setLastHeaderVariant(headerDom.dataset.variant);
    headerDom.dataset.variant = "light";
  }, [navigation.state]);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    if (!collapse) {
      headerDom.dataset.variant = lastHeaderVariant ?? 'light';
      return;
    }

    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add('opacity-50');
    } else {
      headerDom.classList.remove('opacity-50');
    }
  }, [collapse, lastHeaderVariant]);

  useEffect(() => {
    function determineIfHeaderBlurred() {
      const headerDom = document.getElementById("header");

      if (!headerDom) {
        return
      }

      if (window.scrollY > 0 && collapse) {
        headerDom.classList.add('opacity-50');
      } else {
        headerDom.classList.remove('opacity-50');
      }
    }

    document.addEventListener('scroll', determineIfHeaderBlurred);

    return () => {
      document.removeEventListener('scroll', determineIfHeaderBlurred);
    };
  }, [collapse])

  return (
    <header
      className={cn(
        "fixed top-0 w-full h-20 left-0 z-30 group",
        !collapse
          ? "text-white"
          : "text-white data-[variant=dark]:!text-[#646464]",
      )}
      id="header"
    >
      <Container
        variant="fluid"
        className="flex item-center h-full relative z-10 py-0 gap-7"
      >
        <Link to={localePath(locale, '')} className="flex items-center gap-1 flex-none">
          <img
            src={brand.url}
            alt={brand.description}
            className={cn(
              "w-8 h-6",
              !collapse ? "" : "group-data-[variant=dark]:invert-[.6]"
            )}
          />
          <h1
            className={cn(
              "font-sans font-semibold uppercase tracking-wide text-sm",
              !collapse ? "hidden sm:block" : ""
            )}
          >
            Visual Ennode
          </h1>
        </Link>

        <div className="ml-auto flex items-center gap-7">
          {!collapse ? (
            <motion.div
              initial={{ translateX: '4rem', opacity: 0 }}
              whileInView={{ translateX: 0, opacity: 1 }}
              transition={{ duration: 1, deplay: 3 }}
              className="flex items-center gap-7"
            >
              <div className="flex items-center h-10 relative grow w-auto lg:w-64">
                <MagnifyingGlassIcon className="size-5 absolute top-2.5 left-4" />
                <input
                  type="text"
                  className="bg-[#484848]/20 rounded-full w-full h-full pl-12 pr-4 !text-white font-light text-lg"
                  placeholder=""
                />
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer gap-2 flex-none uppercase">
                    <GlobeIcon className="size-7" /> {locale}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-14 mt-2">
                  <DropdownMenuItem onClick={() => switchLocale('en')}>English</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchLocale('ko')}>Korean</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CrossIcon
                className="size-6 cursor-pointer select-none flex-none"
                onClick={() => setCollapse(true)}
              />
            </motion.div>
          ) : (
            <HamburgerMenuIcon
              className="size-9 cursor-pointer select-none flex-none"
              onClick={() => setCollapse(false)}
            />
          )}
        </div>
      </Container>

      <motion.div
        initial={{ opacity: 0, }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1 }}
        className={cn("fixed inset-0 w-full pt-20 h-dvh max-h-screen bg-[#1B1B1B] @container/header", collapse ? "hidden" : "block")}
        style={{ containerType: "size" }}
      >
        <div className="flex flex-col h-full pb-14">
          <div className="p-0 lg:p-7 grow h-full flex items-center justify-center">
            <ul className="font-normal text-3xl tracking-wide flex flex-col items-center gap-10">
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to={localePath(locale, "")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t['component.header.home']}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "works")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t['component.header.works']}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "news")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t['News']}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Link
                  to={localePath(locale, "about")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t['component.header.about']}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.3 }}
              >
                <Link
                  to={localePath(locale, "career")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["component.header.career"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: '-2rem', opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.4 }}
              >
                <Link
                  to={localePath(locale, "contact")}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["component.header.contact"]}
                </Link>
              </motion.li>
            </ul>
          </div>
          <Container
            variant="xl"
            className="flex-none mt-auto hidden lg:block"
            id="header-footer"
          >
            <motion.div
              initial={{ translateY: '4rem', opacity: 0 }}
              whileInView={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 1, deplay: 3 }}
            >
              <ContactCtaSection externalTranslations={t} externalLocale={locale} />
            </motion.div>
          </Container>
          <Footer />
        </div>
      </motion.div>
    </header >
  );
}
