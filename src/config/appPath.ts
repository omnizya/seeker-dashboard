import { Category } from "../../types";
import { JummalApp } from "./jummalApp";
import { blog } from "./blog";

export const appPath: Category[] = [
  {
    name: "Alef",
    subLabel: "First Page",
    id: "page-alef",
    children: [JummalApp],
  },
  {
    name: "Beta",
    subLabel: "Blog",
    id: "page-beta",
    children: [blog],
  },
];
