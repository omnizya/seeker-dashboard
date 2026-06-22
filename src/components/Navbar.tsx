"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X, Bell, LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import { DefaultText } from "~/texts";

interface Props {
  children: React.ReactNode;
  to: string;
}

const Links = [
  DefaultText.dashboard.navbar.links.a,
  DefaultText.dashboard.navbar.links.b,
  DefaultText.dashboard.navbar.links.c,
  DefaultText.dashboard.navbar.links.d,
  DefaultText.dashboard.navbar.links.e,
  DefaultText.dashboard.navbar.links.f,
  DefaultText.dashboard.navbar.links.g,
  DefaultText.dashboard.navbar.links.h,
  DefaultText.dashboard.navbar.links.i,
  DefaultText.dashboard.navbar.links.j,
];

const NavLink = (props: Props) => {
  const { children, to } = props;

  return (
    <Link
      href={to}
      className="rounded-md px-2 py-1 text-sm hover:bg-purple-200 dark:hover:bg-purple-700"
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-gray-100 px-4 dark:bg-gray-900">
      <div className="flex h-16 items-center justify-between">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:text-gray-900 md:hidden dark:text-gray-200 dark:hover:text-white"
          aria-label="Open Menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        <div className="flex items-center gap-8">
          <Link href="/">
            <Image src="/favico.svg" alt="logo" height={44} width={44} />
          </Link>

          <nav className="hidden items-center gap-4 md:flex">
            {Links.map((link, i) => (
              <NavLink key={i} to={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="" alt="User avatar" />
                  <AvatarFallback className="bg-purple-600 text-white">
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48" align="end">
              <DropdownMenuItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>TBD</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>TBD</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>TBD</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isOpen && (
        <div className="pb-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {Links.map((link, i) => (
              <NavLink key={link.href + i} to={link.href}>
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      )}
    </div>
  );
}
