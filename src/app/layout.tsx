"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import Loader from "~/components/common/Loader";
import { useState, useEffect } from "react";
import { classNames } from "~/utils";

const inter = Inter({ subsets: ["latin"] });

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
        className={classNames([
          inter.className,
          "dark:bg-boxdark-2",
          "dark:text-bodydark",
        ])}
      >
        <main className="flex justify-center align-middle max-h-screen">
          {loading ? <Loader /> : children}
        </main>
      </body>
    </html>
  );
}
