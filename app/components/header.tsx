import { Attachment } from "~/types/resources";
import { Container } from "./ui/container";
import { CrossIcon, GlobeIcon, HamburgerMenuIcon } from "./ui/icon";
import { useEffect, useState } from "react";
import { cn, localePath } from "~/lib/utils";
import {
  Link,
  useLocation,
  useNavigate,
  useNavigation,
} from "@remix-run/react";
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
  translations: AppContext["translations"];
  locale: string;
}

export default function Header({
  brand,
  translations: t,
  locale,
}: HeaderProps) {
  const [collapse, setCollapse] = useState<boolean>(true);
  const navigation = useNavigation();
  const [lastHeaderVariant, setLastHeaderVariant] = useState<
    string | undefined
  >();
  const navigate = useNavigate();
  const location = useLocation();

  function switchLocale(newLocale: string) {
    return navigate(
      localePath(
        newLocale,
        location.pathname.replace("/" + locale, "").replace(/\/$/g, "")
      )
    );
  }

  useEffect(() => {
    setCollapse(true);

    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add("opacity-50");
    } else {
      headerDom.classList.remove("opacity-50");
    }

    setLastHeaderVariant(headerDom.dataset.variant);
    headerDom.dataset.variant = "light";
  }, [navigation.state]);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom) return;

    if (!collapse) {
      headerDom.dataset.variant = lastHeaderVariant ?? "light";
      return;
    }

    if (document.documentElement.scrollTop > 0) {
      headerDom.classList.add("opacity-50");
    } else {
      headerDom.classList.remove("opacity-50");
    }
  }, [collapse, lastHeaderVariant]);

  useEffect(() => {
    function determineIfHeaderBlurred() {
      const headerDom = document.getElementById("header");

      if (!headerDom) {
        return;
      }

      if (window.scrollY > 0 && collapse) {
        headerDom.classList.add("opacity-50");
      } else {
        headerDom.classList.remove("opacity-50");
      }
    }

    document.addEventListener("scroll", determineIfHeaderBlurred);

    return () => {
      document.removeEventListener("scroll", determineIfHeaderBlurred);
    };
  }, [collapse]);

  return (
    <header
      className={cn(
        "fixed top-0 w-full h-20 left-0 z-40 group text-white overflow-hidden min-w-0 transition-colors motion-safe:transition-colors duration-300 ease-out hover:bg-black/20 hover:backdrop-blur-sm",
        !collapse
      )}
      id="header"
    >
      <Container
        variant="fluid"
        className="flex items-center bg-transparent h-full relative z-10 py-0 gap-7 min-w-0"
      >
        {/* extended underline removed per design request */}

        {/* Mobile Logo - visible on mobile only */}
        <Link
          to={localePath(locale, "")}
          className="flex items-center gap-2 flex-none lg:hidden"
        >
          <img
            src={brand.url}
            alt={brand.description}
            className="w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105"
          />
          <h1 className="font-sans font-semibold uppercase tracking-wide text-sm motion-safe:transition-colors motion-reduce:transition-none group-hover:text-white/90">
            Visual Ennode
          </h1>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-20 flex-1 justify-center relative">
          <Link
            to={localePath(locale, "")}
            className={cn(
              "flex items-center gap-1 flex-none relative lg:hidden",
              location.pathname === localePath(locale, "") ||
                location.pathname === `/${locale}` ||
                location.pathname === `/${locale}/`
                ? "after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-[#fff]"
                : ""
            )}
          >
            <img
              src={brand.url}
              alt={brand.description}
              className={cn(
                "w-8 h-6 max-w-full motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
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
          <Link
            to={localePath(locale, "")}
            className={cn(
              "flex items-center gap-1 flex-none relative",
              location.pathname === localePath(locale, "") ||
                location.pathname === `/${locale}` ||
                location.pathname === `/${locale}/`
                ? "after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-[#fff]"
                : ""
            )}
          >
            <img
              src={brand.url}
              alt={brand.description}
              className={cn(
                "w-8 h-6 motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none group-hover:scale-105",
                !collapse ? "" : "group-data-[variant=dark]:invert-[.6]"
              )}
            />
            <h1
              className={cn(
                "font-sans font-semibold uppercase tracking-wide text-sm",
                /* hide when expanded */
                !collapse ? "hidden sm:block" : "",
                /* make the text follow the header variant so it matches the img logo color */
                /* when header has data-variant=dark the img uses an invert filter; mirror color for text */
                "group-data-[variant=dark]:invert-[.6]"
              )}
            >
              Visual Ennode
            </h1>
          </Link>
          <Link
            to={localePath(locale, "")}
            className={cn(
              "font-light text-white/50 text-sm uppercase tracking-wide hover:opacity-70 transition-all duration-300 relative",
              location.pathname === localePath(locale, "") ||
                location.pathname === `/${locale}` ||
                location.pathname === `/${locale}/`
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.home"]}
          </Link>
          <Link
            to={localePath(locale, "works")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 transition-all duration-300 relative",
              location.pathname.includes("/works")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.works"]}
          </Link>
          <Link
            to={localePath(locale, "about")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 transition-all duration-300 relative",
              location.pathname.includes("/about")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.about"]}
          </Link>
          <Link
            to={localePath(locale, "news")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 transition-all duration-300 relative",
              location.pathname.includes("/news")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["News"]}
          </Link>
          <Link
            to={localePath(locale, "career")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 hover:text-white transition-all duration-300 relative",
              location.pathname.includes("/career")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.career"]}
          </Link>
          <Link
            to={localePath(locale, "contact")}
            className={cn(
              "font-light text-white/50  text-sm uppercase tracking-wide hover:opacity-70 transition-all duration-300 relative",
              location.pathname.includes("/contact")
                ? "text-white after:absolute after:bottom-[-1.875rem] after:left-0 after:right-0 after:h-px after:bg-white"
                : ""
            )}
          >
            {t["component.header.contact"]}
          </Link>
          {/* Desktop Language Selector */}
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    "flex items-center cursor-pointer gap-2 flex-none uppercase font-light text-sm tracking-wide hover:opacity-70 transition-opacity relative"
                  )}
                >
                  <GlobeIcon className="size-5" /> {locale}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32 mt-2">
                <DropdownMenuItem onClick={() => switchLocale("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => switchLocale("ko")}>
                  Korean
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </nav>

        {/* Mobile Controls */}
        <div className="ml-auto flex items-center gap-7">
          {!collapse ? (
            <motion.div
              initial={{ translateX: "4rem", opacity: 0 }}
              whileInView={{ translateX: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.25 }}
              className="flex items-center gap-7 lg:hidden"
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center cursor-pointer gap-2 flex-none uppercase">
                    <GlobeIcon className="size-7" /> {locale}
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-14 mt-2">
                  <DropdownMenuItem onClick={() => switchLocale("en")}>
                    English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => switchLocale("ko")}>
                    Korean
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <CrossIcon
                className="size-6 cursor-pointer select-none flex-none"
                onClick={() => setCollapse(true)}
              />
            </motion.div>
          ) : (
            <HamburgerMenuIcon
              className="size-9 cursor-pointer select-none flex-none lg:hidden"
              onClick={() => setCollapse(false)}
            />
          )}
        </div>
      </Container>

      <motion.div
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        whileInView={{ opacity: 1 }}
        className={cn(
          "fixed inset-0 w-full pt-20 h-dvh max-h-screen bg-[#1B1B1B] @container/header overflow-hidden min-w-0",
          collapse ? "hidden" : "block"
        )}
        style={{ containerType: "size" }}
      >
        <div className="flex flex-col h-full pb-14">
          <div className="p-0 lg:p-7 grow h-full flex items-center justify-center">
            <ul className="font-normal text-3xl tracking-wide flex flex-col items-center gap-10">
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Link
                  to={localePath(locale, "")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["component.header.home"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "works")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["component.header.works"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Link
                  to={localePath(locale, "news")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["News"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
                whileInView={{ translateY: 0, opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Link
                  to={localePath(locale, "about")}
                  prefetch="render"
                  preventScrollReset={false}
                  className="link-animation after:h-0.5 after:-bottom-1"
                >
                  {t["component.header.about"]}
                </Link>
              </motion.li>
              <motion.li
                initial={{ translateY: "-2rem", opacity: 0 }}
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
                initial={{ translateY: "-2rem", opacity: 0 }}
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
              initial={{ translateY: "4rem", opacity: 0 }}
              whileInView={{ translateY: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 3 }}
            >
              <ContactCtaSection
                externalTranslations={t}
                externalLocale={locale}
              />
            </motion.div>
          </Container>
          <Footer />
        </div>
      </motion.div>
    </header>
  );
}
