"use client";

import { ThemeProvider } from "next-themes";
import Fonts from "./styles/fonts";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <Fonts />
      {children}
      <Analytics framework="nextjs" />
      <SpeedInsights />
    </ThemeProvider>
  );
}
