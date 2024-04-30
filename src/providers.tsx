// app/providers.tsx
"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ChakraProvider } from "@chakra-ui/react";
import { theme } from "./styles/theme";
import Fonts from "./styles/fonts";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChakraProvider theme={theme}>
      <Fonts />
      {children}
      <Analytics />
      <SpeedInsights />
    </ChakraProvider>
  );
}
