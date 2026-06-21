"use client";

import { Button } from "~/components/ui/button";
import Footer from "~/components/Footer/appFooter";
import { DefaultText } from "~/texts";
import { track } from "@vercel/analytics/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <>
      <div className="flex h-screen w-full bg-[url('/cube.jpg')] bg-cover bg-center bg-fixed">
        <div className="flex w-full items-center justify-center bg-gradient-to-b from-black/60 to-purple-600 px-4 md:px-8">
          <div className="flex flex-col items-start gap-6">
            <div className="mx-auto max-w-6xl">
              <div className="flex flex-col items-center gap-8 py-20 text-center md:gap-10 md:py-28">
                <h1 className="font-uthman drop-shadow-lg shadow-purple-600 text-2xl leading-[150%] text-white sm:text-4xl md:text-6xl">
                  وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَىٰ فَادْعُوهُ بِهَا ۖ وَذَرُوا
                  الَّذِينَ يُلْحِدُونَ فِي أَسْمَائِهِ ۚ سَيُجْزَوْنَ مَا
                  كَانُوا يَعْمَلُونَ
                </h1>

                <div className="flex gap-6">
                  <Button
                    size="lg"
                    className="rounded-full bg-orange-400 px-6 text-white hover:bg-orange-500"
                    onClick={() => {
                      track("Get Started");
                      router.push("/dashboard");
                    }}
                  >
                    {DefaultText.landingPage.callToActions.getStarted}
                  </Button>
                  <Button
                    size="lg"
                    className="rounded-full px-6"
                    onClick={() => {
                      track("Pressed Learn More");
                      router.push("/learn");
                    }}
                  >
                    {DefaultText.landingPage.callToActions.learnMore}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*   <Features /> */}
      <Footer />
    </>
  );
}
