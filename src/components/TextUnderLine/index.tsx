"use client";

import { type ReactNode } from "react";

interface TextUnderlineProps {
  children: ReactNode;
}

export const TextUnderline = ({ children }: TextUnderlineProps) => {
  return (
    <span className="relative z-10 text-orange-400 dark:text-orange-300 after:absolute after:left-0 after:bottom-0 after:w-full after:h-[10%] after:bg-orange-100 dark:after:bg-orange-900 after:-z-10">
      {children}
    </span>
  );
};
