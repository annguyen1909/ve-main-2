import { useOutletContext } from "@remix-run/react";
import { forwardRef } from "react";
import { Container } from "~/components/ui/container";
import { AppContext } from "~/root";

const ValueSection = forwardRef<HTMLElement>((props, ref) => {
  const { translations: t } = useOutletContext<AppContext>();

  return (
    <section
      ref={ref}
      className="h-full flex lg:block bg-no-repeat bg-top bg-[length:auto_70%] xs:bg-[length:auto_60%] sm:bg-[length:auto_70%] md:bg-[length:100%_auto] lg:bg-[length:auto_100%] lg:bg-[position:calc(100%_+_24rem)_100%] xl:lg:bg-[position:calc(100%_+_14rem)_100%] bg-[url(/images/value-about.jpg)] overflow-auto overscroll-none"
      {...props}
    >
      <div className="bg-gradient-to-t from-30% via-[#1b1b1b] via-40% to-[#1b1b1b]/30 lg:bg-gradient-to-r from-[#1b1b1b] lg:from-20% w-full flex items-end lg:items-center text-white flex-none flex-col lg:flex-row min-h-full">
        <div className="h-1/2 lg:hidden flex-none"></div>

        <div className="bg-gradient-to-t from-90% from-[#1b1b1b] lg:from-transparent py-20 flex-none w-full min-h-full" data-koreanable>
          <Container className="bg-[#1b1b1b] lg:bg-transparent">
            <div className="lg:w-[28rem] flex-none text-justify">
              <h2 className="font-bold text-2xl mb-7">{t['about.value.title']}</h2>
              {t["about.value.description"].split('\n').map((row, index) => <p key={index} className="font-light text-[15px] leading-loose mb-7" dangerouslySetInnerHTML={{ __html: row }}></p>)}
              <div className="w-9/12 bg-[url(/images/sign.png)] bg-no-repeat bg-contain aspect-[3/1] pointer-events-none">
              </div>
              <span className="text-lg sm:text-[25px] font-extrabold mt-14 block" data-koreanable>“ {t['STORY MAKE VALUE']} ”</span>
            </div>
          </Container>
        </div>
      </div>
    </section>
  );
});

ValueSection.displayName = "ValueSection";

export { ValueSection };
