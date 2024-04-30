import type { NextApiRequest, NextApiResponse } from "next";

import Ayats from "~/data/ayats";
type ResponseData =
  | {
      id?: number;
      ayah?: string;
      grand_east?: number;
      grand_west?: number;
      small_east?: number;
      small_west?: number;
      nafsy?: number;
      error?: string;
    }
  | undefined;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  const { query } = req;
  const { id } = query;

  const result = Ayats.find(({ id }) => id === id);
  return result
    ? res.status(200).send(result)
    : res.status(404).json({ error: `Ayah with id: ${id} not found.` });
}
