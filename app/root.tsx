
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useMatches,
  useRouteError,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useChangeLanguage } from "remix-i18next/react";
import { useTranslation } from "react-i18next";
import i18next from "~/i18next.server";
import "./tailwind.css";
import { Api } from "./lib/api";
import Header from "./components/header";
import { Attachment } from "./types/resources";
import { redirect } from "@remix-run/node";
import { GlobalProgressIndicator } from "./components/global-progress-indicator";
import { cn } from "./lib/utils";
import genericTranslations from "public/locales/en/common.json"
import i18n from "~/i18n";
import { useEffect } from "react";
import { Toaster } from "./components/ui/sonner";


export const links: LinksFunction = () => [
  {
    rel: "icon",
    href: "/favicon-dark.jpg",
    type: "image/jpeg",
    id: "light-scheme-icon"
  },
  {
    rel: "icon",
    href: "/favicon.jpg",
    type: "image/jpeg",
    id: "dark-scheme-icon"
  }
];

export const handle = {
  i18n: "common",
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  const api = new Api();
  const url = new URL(request.url);
  const locale = params.locale ?? "en";

  if (!i18n.supportedLngs.includes(locale)) {
    return redirect(url.toString().replace(locale, ""));
  }

  if (new RegExp(`.*/${i18n.fallbackLng}/.*`).test(url.toString())) {
    return redirect(url.toString().replace(locale, ""));
  }

  const t = await i18next.getFixedT(locale);

  const banners = await api.getBanners().then(res => res.data.data) ?? [];

  return {
    configuration: await api.getConfiguration(),
    translations: Object.fromEntries(Object.keys(genericTranslations).map(key => [key, t(key)])) as typeof genericTranslations,
    locale,
    banners
  };
}

export interface AppContext {
  brand: Attachment;
  heroCover: Attachment;
  translations: typeof genericTranslations;
  locale: typeof i18n.supportedLngs[number];
  banners: Array<{ group: string; url: string }>;
}

export default function App() {
  const { locale, configuration, translations, banners } = useLoaderData<typeof loader>();
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const { i18n } = useTranslation();

  const scrollableRouteIds = [
    "routes/($locale).works.$category",
    "routes/($locale).works.$category.$work",
    "routes/($locale).career._index",
    "routes/($locale).contact._index",
    "routes/($locale).about._index",
  ];

  const scrollable = scrollableRouteIds.includes(lastMatch.id);

  useChangeLanguage(locale);

  useEffect(() => {
    if (!document) return;

    const lightSchemeIcon = document.querySelector('link#light-scheme-icon')!;
    const darkSchemeIcon = document.querySelector('link#dark-scheme-icon')!;

    const matcher = window.matchMedia('(prefers-color-scheme: dark)');
    matcher.addEventListener('change', onUpdate);

    function onUpdate() {
      if (matcher.matches) {
        lightSchemeIcon.remove();
        document.head.append(darkSchemeIcon);
      } else {
        document.head.append(lightSchemeIcon);
        darkSchemeIcon?.remove();
      }
    }

    return () => {
      matcher.removeEventListener('change', onUpdate);
    };
  }, []);

  return (
    <html lang={locale} dir={i18n.dir()} className={cn("overscroll-none scroll-smooth", locale === 'ko' ? '[&_[data-koreanable]]:font-korean' : '')} translate="no" style={{ scrollBehavior: 'smooth' }}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, minimal-ui" />

        <meta property="og:title" content="Visual Ennode: We visualize - We connect" />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://visualennode.com/images/thumbnail.jpg" />
        <meta property="og:url" content="https://visualennode.com/" />
        <meta property="og:description" content="Contact us today to discuss your next project and transform your ideas into stunning visual realities." />
        <meta property="og:site_name" content="Visual Ennode Co., LTD" />
        <meta name="google" content="notranslate" />
        
        <Meta />
        <Links />
      </head>
      <body
        className={cn(
          scrollable ? "" : "lock-scroll"
        )}
      >
        <GlobalProgressIndicator />
        <Header brand={configuration.brand.data} translations={translations} locale={locale} />
        <Outlet
          context={{
            brand: configuration.brand.data,
            translations,
            locale,
            banners,
          }}
        />
        <Toaster richColors position="top-right" icons={{
          error: <svg data-testid="geist-icon" className="size-5" strokeLinejoin="round" viewBox="0 0 16 16" ><path fillRule="evenodd" clipRule="evenodd" d="M8.55846 0.5C9.13413 0.5 9.65902 0.829456 9.90929 1.34788L15.8073 13.5653C16.1279 14.2293 15.6441 15 14.9068 15H1.09316C0.355835 15 -0.127943 14.2293 0.192608 13.5653L6.09065 1.34787C6.34092 0.829454 6.86581 0.5 7.44148 0.5H8.55846ZM8.74997 4.75V5.5V8V8.75H7.24997V8V5.5V4.75H8.74997ZM7.99997 12C8.55226 12 8.99997 11.5523 8.99997 11C8.99997 10.4477 8.55226 10 7.99997 10C7.44769 10 6.99997 10.4477 6.99997 11C6.99997 11.5523 7.44769 12 7.99997 12Z" fill="currentColor"></path></svg>
        }} />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data}</p>
      </>
    );
  }

  return (
    <>
      <h1>Error!</h1>
      <p>{(error as Error)?.message ?? "Unknown error"}</p>
    </>
  );
}
