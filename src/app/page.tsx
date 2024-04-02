import { Code, Link } from "@nextui-org/react";

import { button as buttonStyles } from "@nextui-org/theme";
import { subtitle, title } from "~/components/common/primitives";
import { Snippet } from "@nextui-org/snippet";
import { GithubIcon, Logo } from "~/components/Icons";
import { siteConfig } from "~/config/site";
export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block max-w-lg text-center justify-center font-uthman">
        <h1 className={title()}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</h1>
        <h1 className={title({ color: "violet", size: "lg", class: "m-4" })}>
          وَلِلَّهِ
        </h1>
        <h1 className={title()}>الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ</h1>
        <h2 className={subtitle()}>
          <span>وَذَرُوا الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ</span>
          <span>سَيُجْزَوْنَ مَا كَانُوا يَعْمَلُونَ</span>
        </h2>
      </div>

      <div className="flex gap-3">
        <Link
          href={"/login"}
          className={buttonStyles({
            color: "primary",
            radius: "full",
            variant: "shadow",
          })}
        >
          Auth
        </Link>
        <Link
          className={buttonStyles({ variant: "bordered", radius: "full" })}
          href={"/dashboard"}
        >
          <Logo size={20} />
          Dashboard
        </Link>
      </div>

      <div className="mt-8">
        <Snippet hideSymbol hideCopyButton variant="flat">
          <span>Work in Progress</span>
        </Snippet>
      </div>
    </section>
  );
}
