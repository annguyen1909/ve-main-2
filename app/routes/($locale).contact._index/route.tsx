import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { ContactSection } from "~/components/contact-section";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";
import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Api } from "~/lib/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { loader as rootLoader } from "~/root";
import { cn, title, localePath } from "~/lib/utils";
import { SpinnerIcon } from "~/components/ui/icon";
import { useIsMobile } from "~/components/hooks/use-mobile";

function LottieThankYou() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
  let mounted = true;
  let el: HTMLElement | null = null;
  const container = containerRef.current;

    const ensureScript = () => {
      if (document.querySelector('script[data-lottie]') || (typeof customElements !== 'undefined' && customElements.get('lottie-player'))) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve) => {
        const s = document.createElement("script");
        s.src = "https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js";
        s.async = true;
        s.setAttribute("data-lottie", "1");
        s.onload = () => resolve();
        document.body.appendChild(s);
      });
    };

    ensureScript().then(() => {
      if (!mounted) return;
      try {
        el = document.createElement("lottie-player");
        el.setAttribute("src", "/videos/waiting sand.json");
        el.setAttribute("background", "transparent");
        el.setAttribute("speed", "1");
        el.setAttribute("loop", "true");
        el.setAttribute("autoplay", "true");
        el.setAttribute("aria-hidden", "true");
        // let the container size control the player; make the player fill its container
        el.style.width = "100%";
        el.style.height = "100%";
        el.style.display = "block";
        el.className = "object-cover bg-transparent";
        if (container) container.appendChild(el);
        // No scaling: keep the Lottie SVG untouched. If you want to re-enable
        // inner-element scaling later, we can add a targeted transform here.
      } catch (e) {
        // ignore
      }
    });

    return () => {
      mounted = false;
      if (el) {
        // disconnect any observer attached previously (defensive)
        try {
          const obs = (el as unknown as { __lottieScaleObserver?: MutationObserver }).__lottieScaleObserver;
          if (obs && typeof obs.disconnect === "function") obs.disconnect();
        } catch (err) {
          /* ignore */
        }
      }
      if (el && container) container.removeChild(el);
    };
  }, []);

  // Responsive container — larger on bigger breakpoints. The mounted
  // <lottie-player> fills this container (width/height: 100%).
  return (
    <div
      ref={containerRef}
      aria-hidden
      // Reduced sizes so the animation doesn't dominate the overlay
      className="mb-4 w-32 h-44 sm:w-40 sm:h-56 md:w-48 md:h-64 lg:w-56 lg:h-80"
    />
  );
}

export const meta: MetaFunction<unknown, { root: typeof rootLoader }> = ({
  matches,
}) => {
  const rootMatch = matches.find((match) => match.id === "root")?.data;

  return [
    { title: title(rootMatch!.translations["contact.page.title"]) },
    {
      name: "description",
      content: rootMatch!.translations["contact.page.description"],
    },
    {
      property: "og:title",
      content: rootMatch!.translations["contact.page.og.title"],
    },
    {
      property: "og:description",
      content: rootMatch!.translations["contact.page.og.description"],
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://www.visualennode.com/contact" },
    {
      property: "og:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
    { name: "twitter:card", content: "summary_large_image" },
    {
      name: "twitter:title",
      content: rootMatch!.translations["contact.page.og.title"],
    },
    {
      name: "twitter:description",
      content: rootMatch!.translations["contact.page.og.description"],
    },
    {
      name: "twitter:image",
      content: "https://www.visualennode.com/images/og-cover.jpg",
    },
  ];
};

export async function action({ request, params }: ActionFunctionArgs) {
  const api = new Api();
  const formData = await request.formData();
  const locale = params.locale ?? "en";

  const name = formData.get("name") as string;
  const company_name = formData.get("company_name") as string;
  let phone = formData.get("phone") as string | null;
  // safe-normalize phone (may be null if field missing)
  phone = phone ? phone.replace(/-/g, "") : "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const emailDomain =
    (formData.get("email_domain") as string | null)?.trim() ?? "";
  const discuss = formData.get("discuss") as string;

  if (!name || !company_name || !phone || !email || !discuss || !emailDomain) {
    return {
      errorCode: 422,
    };
  }

  type CryptoWithUUID = { randomUUID?: () => string } & typeof globalThis;
  const _crypto =
    typeof crypto !== "undefined"
      ? (crypto as unknown as CryptoWithUUID)
      : undefined;
  const debugId =
    _crypto && typeof _crypto.randomUUID === "function"
      ? _crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

  const data = {
    name: name,
    email: email + "@" + emailDomain,
    phone: phone,
    company_name: company_name,
    discuss: discuss,
    debug_id: debugId,
  };

  console.log("[contact] outgoing payload", {
    debugId,
    name,
    email: data.email,
    phone: phone,
    company_name,
  });

  const wantsJson =
    (request.headers.get("Accept") || "").includes("application/json") ||
    request.headers.get("X-Requested-With") === "XMLHttpRequest";

  return await api
    .sendEmailContactApi(data, locale)
    .then((res) => {
      console.log("[contact] backend response", {
        debugId,
        status: res.status,
        data: res.data,
      });
      const ok = { errorCode: 0, debugId };
      return wantsJson ? json(ok) : ok;
    })
    .catch((err) => {
      console.log("[contact] error", { debugId, err });

      if (api.isValidationResponse(err)) {
        const resp = {
          errorCode: 422,
          message: err.response?.data.message,
          debugId,
        };
        return wantsJson ? json(resp, { status: 422 }) : resp;
      }

      if (api.isTooManyRequestsResponse(err)) {
        const resp = { errorCode: 429, debugId };
        return wantsJson ? json(resp, { status: 429 }) : resp;
      }

      const resp = { errorCode: 500, debugId };
      return wantsJson ? json(resp, { status: 500 }) : resp;
    });
}

export default function Contact() {
  const { translations: tRaw, locale } = useOutletContext<AppContext>();
  const t = tRaw as unknown as Record<string, string>;
  const emailLabel = t["Email"] ?? "Email";
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const formRef = useRef<HTMLFormElement>(null);
  const [success, setSuccess] = useState(false);
  const isMobile = useIsMobile(1024);

  useEffect(() => {
    if (!actionData) return;

    if (actionData.errorCode != 0) {
      let message: string;

      if (actionData.errorCode === 429) {
        message = t["Too many requests, please try again tomorrow"];
      } else if (actionData.errorCode === 422) {
        message =
          "message" in actionData
            ? (actionData.message as string)
            : t["Please input all required fields"];
      } else {
        message = t["An unexpected error occurred, please contact us to help"];
      }

      toast.error(message);

      return;
    }

    setSuccess(true);
    formRef.current?.reset();
  }, [actionData, t]);

  return (
    <div className={locale === "ko" ? "ko-solid" : ""}>
      <div
        className={cn(
          "fixed inset-0 bg-[#1b1b1b] flex-col justify-center items-center z-10 py-12 px-5",
          success && "flex"
        )}
      >
        <div className="w-full max-w-5xl mx-auto p-4 md:p-6 flex items-center justify-center">
          <div className="flex flex-col items-center text-center w-full">
            {/* Thank you animation: use a Lottie JSON (waiting sand) instead of video. */}
            {/* We dynamically load the lottie-player script client-side and mount the element into a container. */}
            <LottieThankYou />

            <h2 className="text-white font-extrabold text-4xl md:text-6xl tracking-tight mb-4">
              THANK YOU
            </h2>

            <p className="text-[#bcbcbc] text-base md:text-xl max-w-xl mb-6">
              <span className="md:block">{t["We have received your information,"]}</span>
              {" "}
              {t["we will contact with you soon"]}
            </p>

            <Link
              to={localePath(locale, "index")}
              className="px-4 py-2 bg-white text-[#1b1b1b] rounded-none text-xs font-semibold"
            >
              BACK TO HOME
            </Link>
          </div>
        </div>
  </div>

  <div>

        {isMobile ? (
          <>
              <section
                className="h-dvh max-w-dvh overflow-auto flex"
                data-koreanable
              >
                <Container className="!py-20 text-white my-auto">
                  <div className="flex items-start w-full 2xl:mb-14">
                    <div className="w-80 flex-none hidden lg:block"></div>
                    <div className="grow w-full">
                      <div className="flex items-baseline gap-5 mt-14 lg:mt-0 mb-14 4xl:mb-30">
                        <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">
                          {t["contact.form.title"]}
                        </h3>
                        <p className="font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase">
                          {t["contact.form.description"]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start w-full">
                    <div className="w-80 flex-none hidden lg:block">
                      <h3 className="font-semibold text-2xl mb-7">
                        {t["contact.outline.title"]}
                      </h3>

                      <div className="flex flex-col gap-7">
                        <div>
                          <p className="font-extralight text-xl">
                            {t["Hotline"]}
                          </p>
                          <p className="font-extralight text-base">
                            +82 2 515 7400
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {(t as never)["Email"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            contact@visualennode.com
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Kakaotalk"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            <a
                              href="https://pf.kakao.com/_ggesn/chat"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1"
                            >
                              visualennode
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Whatsapp"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            <a
                              href="https://wa.me/message/UPCT3MQH3LGSF1"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1"
                            >
                              +82 2 515 7400
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Instagram"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            <a
                              href="https://www.instagram.com/visual_ennode"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1"
                            >
                              visual_ennode
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Youtube"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            <a
                              href="https://www.youtube.com/@visualennode"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1"
                            >
                              visual_ennode
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grow w-full">
                      <Form method="post" ref={formRef}>
                        <div className="grid grid-cols-1 xl:grid-cols-2 md:gap-x-36 gap-y-14">
                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.name"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="name"
                                name="name"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.company"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="company_name"
                                name="company_name"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.phone"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="phone"
                                name="phone"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                                type="text"
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.email"]}
                            </div>
                            <div className="grow w-full flex items-end">
                              <input
                                id="email"
                                name="email"
                                type="text"
                                className="text-lg rounded-none py-1 pr-2 bg-transparent outline-none border-b border-[#878787] w-full"
                                spellCheck="false"
                                autoComplete="off"
                              />
                              <span className="py-1.5 inline-block border-b border-[#878787] flex-none">
                                @
                              </span>
                              <input
                                name="email_domain"
                                type="text"
                                className="text-lg rounded-none py-1 pl-2 bg-transparent outline-none border-b border-[#878787] w-full sm:w-36"
                                spellCheck="false"
                                autoComplete="off"
                                placeholder="example.com"
                              />
                            </div>
                          </div>

                          <div className="xl:col-span-2">
                            <div className="flex flex-col gap-2">
                              <div className="w-full text-base md:text-xl flex-none">
                                {t["contact.form.note"]}
                              </div>
                              <div className="grow w-full flex flex-col gap-1">
                                <textarea
                                  name="discuss"
                                  id="discuss"
                                  className="rounded-none bg-transparent outline-none border-b border-[#878787] py-1"
                                  rows={4}
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-start mt-14">
                          <button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="border-2 border-white hover:bg-transparent hover:text-white uppercase bg-white text-[#1b1b1b] flex items-center gap-2 px-3 py-2 font-medium text-2xl"
                          >
                            {navigation.state === "submitting" ? (
                              <SpinnerIcon className="size-6" />
                            ) : null}{" "}
                            {t["contact.form.submit"]}
                          </button>
                        </div>
                      </Form>
                    </div>
                  </div>
                </Container>
              </section>
              <section
                className={cn(
                  "lg:hidden h-dvh max-h-dvh overflow-auto flex py-7 sm:py-14 lg:py-20",
                  isMobile ? "page-scroller-skip" : ""
                )}
                data-koreanable
              >
                <Container className="flex-none m-auto">
                  <div className="text-center my-14">
                    <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">
                      {t["contact.outline.title"]}
                    </h3>
                  </div>

                  <div className="grid grid-cols-2 gap-7 xs:gap-14">
                    <Link
                      to="tel:+821030702402"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/hotline.svg"
                          alt="Hotline"
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {t["Hotline"]}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3]">
                        +82 2 515 7400
                      </span>
                    </Link>
                    <Link
                      to="mailto:contact@visualennode.com"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/mail.svg"
                          alt={emailLabel}
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {emailLabel}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3] font-sans">
                        contact@visualennode.com
                      </span>
                    </Link>
                    <Link
                      to="https://pf.kakao.com/_ggesn/chat"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/talk.svg"
                          alt="Kakaotalk"
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {t["Kakaotalk"]}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3] font-sans">
                        visualennode
                      </span>
                    </Link>
                    <Link
                      to="https://wa.me/+821030702402"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/whatsapp.svg"
                          alt="Whatsapp"
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {t["Whatsapp"]}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3] font-sans">
                        +82 2 515 7400
                      </span>
                    </Link>
                    <Link
                      to="https://instagram.com/visual_ennode"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/instagram.svg"
                          alt="Instagram"
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {t["Instagram"]}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3] font-sans">
                        visual_ennode
                      </span>
                    </Link>
                    <Link
                      to="https://youtube.com/visual_ennode"
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col text-center items-center"
                    >
                      <div className="mb-2">
                        <img
                          src="/images/youtube.svg"
                          alt="Youtube"
                          className="size-10 sm:size-16"
                        />
                      </div>
                      <span className="font-medium text-lg sm:text-2xl text-[#c3c3c3]">
                        {t["Youtube"]}
                      </span>
                      <span className="font-light text-sm sm:text-lg text-[#c3c3c3] font-sans">
                        visual_ennode
                      </span>
                    </Link>
                  </div>
                </Container>
              </section>
              <ContactSection />
          </>
        ) : (
          <>
              <section
                className="h-dvh max-w-dvh overflow-auto flex"
                data-koreanable
              >
                <Container className="!py-20 text-white my-auto">
                  <div className="flex items-start w-full 2xl:mb-14">
                    <div className="w-80 flex-none hidden lg:block"></div>
                    <div className="grow w-full">
                      <div className="flex items-baseline gap-5 mt-14 lg:mt-0 mb-14 4xl:mb-30">
                        <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">
                          {t["contact.form.title"]}
                        </h3>
                        <p className="font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase">
                          {t["contact.form.description"]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start w-full">
                    <div className="w-80 flex-none hidden lg:block">
                      <h3 className="font-semibold text-2xl mb-7">
                        {t["contact.outline.title"]}
                      </h3>

                      <div className="flex flex-col gap-7">
                        <div>
                          <p className="font-extralight text-xl">
                            {t["Hotline"]}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            +82 2 515 7400
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {emailLabel}
                          </p>
                          <p className="font-extralight text-base font-sans">
                            contact@visualennode.com
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Kakaotalk"]}
                          </p>
                          <p className="font-extralight text-base">
                            <a
                              href="https://pf.kakao.com/_ggesn/chat"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1 font-sans"
                            >
                              visualennode
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Whatsapp"]}
                          </p>
                          <p className="font-extralight text-base">
                            <a
                              href="https://wa.me/message/UPCT3MQH3LGSF1"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1 font-sans"
                            >
                              +82 2 515 7400
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Instagram"]}
                          </p>
                          <p className="font-extralight text-base">
                            <a
                              href="https://www.instagram.com/visual_ennode"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1 font-sans"
                            >
                              visual_ennode
                            </a>
                          </p>
                        </div>

                        <div>
                          <p className="font-extralight text-xl">
                            {t["Youtube"]}
                          </p>
                          <p className="font-extralight text-base">
                            <a
                              href="https://www.youtube.com/@visualennode"
                              target="_blank"
                              rel="noreferrer"
                              className="underline underline-offset-4 decoration-[#878787] decoration-1 font-sans"
                            >
                              visual_ennode
                            </a>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="grow w-full">
                      <Form method="post" ref={formRef}>
                        <div className="grid grid-cols-1 xl:grid-cols-2 md:gap-x-36 gap-y-14">
                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.name"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="name"
                                name="name"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.company"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="company_name"
                                name="company_name"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.phone"]}
                            </div>
                            <div className="grow w-full flex flex-col gap-1">
                              <input
                                id="phone"
                                name="phone"
                                className="text-lg rounded-none py-1 bg-transparent outline-none border-b border-[#878787]"
                                spellCheck="false"
                                autoComplete="off"
                                type="text"
                                onChange={(e) => {
                                  e.target.value = e.target.value.replace(
                                    /[^0-9]/g,
                                    ""
                                  );
                                }}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col gap-2">
                            <div className="w-full text-base md:text-xl flex-none">
                              {t["contact.form.email"]}
                            </div>
                            <div className="grow w-full flex items-end">
                              <input
                                id="email"
                                name="email"
                                type="text"
                                className="text-lg rounded-none py-1 pr-2 bg-transparent outline-none border-b border-[#878787] w-full"
                                spellCheck="false"
                                autoComplete="off"
                              />
                              <span className="py-1.5 inline-block border-b border-[#878787] flex-none">
                                @
                              </span>
                              <input
                                name="email_domain"
                                type="text"
                                className="text-lg rounded-none py-1 pl-2 bg-transparent outline-none border-b border-[#878787] w-full sm:w-36"
                                spellCheck="false"
                                autoComplete="off"
                                placeholder="example.com"
                              />
                            </div>
                          </div>

                          <div className="xl:col-span-2">
                            <div className="flex flex-col gap-2">
                              <div className="w-full text-base md:text-xl flex-none">
                                {t["contact.form.note"]}
                              </div>
                              <div className="grow w-full flex flex-col gap-1">
                                <textarea
                                  name="discuss"
                                  id="discuss"
                                  className="rounded-none bg-transparent outline-none border-b border-[#878787] py-1"
                                  rows={4}
                                ></textarea>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-start mt-14">
                          <button
                            type="submit"
                            disabled={navigation.state === "submitting"}
                            className="border-2 border-white hover:bg-transparent hover:text-white uppercase bg-white text-[#1b1b1b] flex items-center gap-2 px-3 py-2 font-medium text-2xl"
                          >
                            {navigation.state === "submitting" ? (
                              <SpinnerIcon className="size-6" />
                            ) : null}{" "}
                            {t["contact.form.submit"]}
                          </button>
                        </div>
                      </Form>
                    </div>
                  </div>
                </Container>
              </section>

              <ContactSection />
          </>
        )}
      </div>
    </div>
  );
}
