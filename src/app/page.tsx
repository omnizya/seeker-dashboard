import {  Link } from "@nextui-org/react";

import { button as buttonStyles } from "@nextui-org/theme";
import { subtitle, title } from "~/components/common/primitives";

export default function Home() {
  return (
    <section className="flex flex-col items-center h-full justify-center gap-4 ">
      <div className="inline-block text-center justify-center font-uthman  ">
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
          className={buttonStyles({ radius: "md", size: "lg", color: "primary", variant: "bordered" })}
          href={"/dashboard"}
        >
          ولوج للمنصة
        </Link>
      </div>


    </section>
  );
}
