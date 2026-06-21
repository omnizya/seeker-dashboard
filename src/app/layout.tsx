import "./globals.css";
import { Metadata } from "next";
import { siteConfig } from "~/config/site";
import { Providers } from "~/providers";
import SimpleCookiePreference from "~/components/CookiesPreferebce";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favico.svg",
    shortcut: "/favico.svg",
    apple: "/touch.png",
  },
};

// app/layout.tsx

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>
          {children}
          <SimpleCookiePreference />
        </Providers>
      </body>
    </html>
  );
}
