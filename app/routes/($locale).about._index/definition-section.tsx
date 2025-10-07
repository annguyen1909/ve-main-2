import { useOutletContext } from "@remix-run/react";
import { forwardRef } from "react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";

const DefinitionSection = forwardRef<HTMLElement>((props, ref) => {
  const { translations } = useOutletContext<AppContext>();

  return (
    <section
      ref={ref}
      className="h-full bg-no-repeat bg-[length:150%_auto] bg-[position:100%_20%] lg:bg-[length:55%_auto] xl:bg-[length:55%_auto] 2xl:bg-[length:auto_50%] bg-[url(/images/definition-about.png)] lg:bg-[url(/images/definition-about.png)] lg:bg-right xl:bg-[position:80%] overflow-auto overscroll-none"
      {...props}
    >
      <div className="bg-gradient-to-t from-30% from-[#1b1b1b] via-[#1b1b1b] via-40% to-[#1b1b1b]/30 md:via-20% lg:via-0% sm:from-10% lg:bg-gradient-to-r lg:from-25% w-full h-full flex items-end lg:items-center text-white flex-col lg:flex-row">
        <div className="h-1/2 lg:hidden flex-none"></div>

        <div className="bg-gradient-to-t from-90% from-[#1b1b1b] lg:from-transparent py-20 w-full">
          <Container>
            <div className="lg:w-[28rem] flex-none text-justify" data-koreanable>
              <h2 className="font-bold text-2xl mb-7">{translations['about.definition.title']}</h2>
              {translations["about.definition.description"].split('\n').map((row, index) => <p key={index} className="font-light leading-loose text-[15px] mb-7" dangerouslySetInnerHTML={{ __html: row }}></p>)}
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
});

DefinitionSection.displayName = "DefinitionSection";

export { DefinitionSection };
