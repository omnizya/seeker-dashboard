"use client";

const Fonts = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    @font-face {
        font-family: "Uthman";
        font-display: swap;
        src: url(https://quran.com/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2)
          format("woff2");
      }
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
    `,
    }}
  />
);

export default Fonts;
