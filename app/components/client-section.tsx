import { useOutletContext } from "@remix-run/react"
import { AppContext } from "~/root"
import { Container } from "./ui/container"
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import { useInView } from "motion/react"
import { ClientResource } from "~/types/clients"

interface ClientSectionProps {
  clients: Array<ClientResource>
}

const ClientSection = forwardRef<HTMLElement, ClientSectionProps>((props, forwardedRef) => {
  const ref = useRef<HTMLElement>(null);
  const { translations: t } = useOutletContext<AppContext>();
  const inView = useInView(ref, { amount: 1 })

  const clients = Array.isArray(props.clients) ? props.clients : [];

  useImperativeHandle(forwardedRef, () => ref.current as HTMLElement);

  useEffect(() => {
    const headerDom = document.getElementById("header");

    if (!headerDom || !inView) return;

    headerDom.dataset.variant = "light";
  }, [inView]);

  return <section ref={ref} className="min-h-screen flex py-7 sm:py-14 lg:py-20" {...props}>
    <Container className="flex-none m-auto min-h-full flex flex-col">
      <div className="text-center mt-14 mb-2">
        <h3 className="font-semibold text-3xl sm:text-4xl md:text-5xl uppercase text-white mb-2 md:mb-3">{t['component.client.title']}</h3>
        <p className="font-normal text-sm sm:text-base md:text-lg text-[#959595] uppercase" data-koreanable>{t['component.client.description']}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-14 my-auto">
        {clients.length > 0 ? (
          clients.map((client, index) => (
            <div key={index} className="flex items-center justify-center w-full h-full">
              <img
                src={client.attachment_url}
                alt={client.name}
                loading="lazy"
                className="max-h-20 max-w-full object-contain mx-auto"
              />
            </div>
          ))
        ) : (
          <p className="text-white">No clients available</p>
        )}
      </div>
    </Container>
  </section>
});

ClientSection.displayName = "ClientSection";

export { ClientSection };