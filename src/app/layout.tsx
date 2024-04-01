"use client";
import "./globals.css";
import Loader from "~/components/common/Loader";
import { useState, useEffect } from "react";
import { classNames } from "~/utils";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => setLoading(false), 666);
  }, []);
  return (
    <html lang="ar" dir="rtl">
      <body
        suppressHydrationWarning={true}
        className={classNames(["dark:bg-boxdark-2", "dark:text-bodydark"])}
      >
        <main className="flex justify-center align-middle max-h-screen">
          {loading ? <Loader /> : children}
        </main>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
