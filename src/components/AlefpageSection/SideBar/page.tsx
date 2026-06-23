"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  BookOpen,
  Star,
  Grid3x3,
  Clock,
  Globe,
  Dumbbell,
  Bookmark,
  PenLine,
  HandHeart,
  Menu,
  Bell,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "~/components/ui/sheet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import { DefaultText } from "~/texts";

const NAV_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  a: Calculator,
  b: BookOpen,
  c: Star,
  d: Grid3x3,
  e: Clock,
  f: Globe,
  g: Dumbbell,
  h: Bookmark,
  i: PenLine,
  j: HandHeart,
};

const navItems = Object.entries(DefaultText.dashboard.navbar.links).map(
  ([key, { label, href }]) => ({
    name: label,
    icon: NAV_ICONS[key] || Calculator,
    href,
  }),
);

const SidebarContent = ({ className }: { className?: string }) => {
  return (
    <nav className={cn("flex h-full flex-col", className)}>
      <div className="flex h-20 items-center justify-between px-8">
        <span className="text-2xl font-bold">{DefaultText.app.title}</span>
      </div>
      {navItems.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className="mx-4 flex items-center gap-4 rounded-lg p-4 text-sm transition-colors hover:bg-cyan-400 hover:text-white"
        >
          <item.icon className="h-4 w-4" />
          {item.name}
        </Link>
      ))}
    </nav>
  );
};

const MobileNav = ({ onOpen }: { onOpen: () => void }) => {
  return (
    <div className="flex h-20 items-center justify-between border-b px-4 md:ms-60">
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-md p-2 md:hidden"
        aria-label="فتح القائمة"
        onClick={onOpen}
      >
        <Menu className="h-6 w-6" />
      </button>

      <span className="text-2xl font-bold md:hidden">{DefaultText.app.title}</span>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="الإشعارات">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src="https://images.unsplash.com/photo-1619946794135-5bc917a27793?ixlib=rb-0.3.5&q=80&fm=jpg&crop=faces&fit=crop&h=200&w=200&s=b616b2c5b373a80ffc9636ba24f7a4a9"
                  alt="الصورة الشخصية"
                />
                <AvatarFallback>م</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start text-sm md:flex">
                <span>المستخدم</span>
                <span className="text-xs text-muted-foreground">مدير</span>
              </div>
              <ChevronDown className="hidden h-4 w-4 md:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48" align="end">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              الملف الشخصي
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              الإعدادات
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

const SidebarWithHeader = ({ children }: { children?: React.ReactNode }) => {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="hidden flex-shrink-0 flex-col border-e bg-white dark:bg-gray-900 md:flex md:w-60">
        <SidebarContent />
      </aside>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SheetTitle className="sr-only">التنقل</SheetTitle>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <MobileNav onOpen={() => setSheetOpen(true)} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default SidebarWithHeader;
