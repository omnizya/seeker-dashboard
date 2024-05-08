import { SubCategory } from "../../types";

export const JummalApp: SubCategory = {
  name: "Jummal",
  id: "Jummal",
  children: [
    {
      name: "Abjad Calc",
      filename: "abjadToNumber",
      tags: ["beta"],
    },
    {
      name: "Kalemat Spreed",
      filename: "kalemaToHarf",
      tags: ["dev"],
    },
  ],
};
