import Link from "next/link";
import { DefaultText } from "~/texts";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-8">
          <Link
            href="/"
            className="font-uthman text-lg font-bold text-foreground"
          >
            {DefaultText.learn.nav.home}
          </Link>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {DefaultText.learn.nav.dashboard}
          </Link>
        </div>
      </nav>
      <main className="flex-1">{children}</main>
    </div>
  );
}
