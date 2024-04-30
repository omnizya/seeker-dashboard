import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
    /* Arabic*/
    @font-face {
        font-family: "Uthman";
        font-display: swap;
        src: url(https://quran.com/fonts/quran/hafs/uthmanic_hafs/UthmanicHafs1Ver18.woff2)
          format("woff2");
      }
    `}
  />
);

export default Fonts;
