"use client";

import { ThemeProvider } from "next-themes";
import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";
import Fonts from "./styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { theme } from "./styles/theme";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Fonts />
          {children}
          <Analytics framework="nextjs" disableAutoTrack={false} />
          <SpeedInsights />
        </ThemeProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
