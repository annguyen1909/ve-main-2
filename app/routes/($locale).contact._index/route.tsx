import {
  Form,
  Link,
  useActionData,
  useNavigation,
  useOutletContext,
} from "@remix-run/react";
import { ContactSection } from "~/components/contact-section";
import { Footer } from "~/components/footer";
import { Container } from "~/components/ui/container";
import { PageScroller } from "~/components/ui/page-scroller";
import { AppContext } from "~/root";
import { ActionFunctionArgs, MetaFunction, json } from "@remix-run/node";
import { Api } from "~/lib/api";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { loader as rootLoader } from "~/root";
import { cn, title } from "~/lib/utils";
import { SpinnerIcon } from "~/components/ui/icon";
import { useIsMobile } from "~/components/hooks/use-mobile";

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
  const { translations: tRaw, brand } = useOutletContext<AppContext>();
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
    <>
      <div
        className={cn(
          "fixed inset-0 bg-[#1b1b1b] flex-col justify-between z-10 py-20 px-5 hidden",
          success && "flex"
        )}
      >
        <div></div>
        <div className="flex flex-col items-center">
          <img
            src={brand.url}
            alt={brand.description}
            className={"w-20 mb-10 lg:w-32 lg:mb-14"}
          />
          <h3 className="text-[#bcbcbc] text-center font-semibold text-3xl md:text-5xl mb-2 md:mb-5">
            {t["Thank you for your information"]}
          </h3>
          <p className="text-[#959595] text-xl md:text-3xl font-light text-center">
            <span className="md:block">
              {t["We have received your information,"]}
            </span>{" "}
            {t["we will contact with you soon"]}
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div className="inline-flex items-center text-[#959595]">
            <span className="text-xl mr-4 md:text-3xl md:mr-7">
              {t["See us at"]}
            </span>
            <div className="flex items-center gap-6 ml-auto">
              <div className="flex items-center gap-2">
                <Link
                  to="https://instagram.com/visual_ennode"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/instagram.svg"
                    className="size-6 md:size-8"
                    alt="Instagram"
                  />
                </Link>
                <Link
                  to="https://www.youtube.com/@visualennode"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/youtube-square.svg"
                    className="size-6 md:size-8"
                    alt="YouTube"
                  />
                </Link>
                <Link
                  to="https://pf.kakao.com/_ggesn/chat"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/talk.svg"
                    className="size-6 md:size-8"
                    alt="Talk"
                  />
                </Link>
                <Link
                  to="https://www.facebook.com/profile.php?id=61573221556208"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/fb.svg"
                    className="size-6 md:size-8"
                    alt="Facebook"
                  />
                </Link>
                <Link
                  to="https://blog.naver.com/visualennode"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src="/images/blog.svg"
                    className="size-6 md:size-8"
                    alt="Blog"
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>

      <div>

        {isMobile ? (
          <>
            <PageScroller>
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
                            +82 10 3070 2402
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
                              +82 10 3070 2402
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
                        +82 10 3070 2402
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
                        +82 10 3070 2402
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
            </PageScroller>
          </>
        ) : (
          <>
            <PageScroller>
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
                            +82 10 3070 2402
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
                              +82 10 3070 2402
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
            </PageScroller>
          </>
        )}
        <Footer />
      </div>
    </>
  );
}
