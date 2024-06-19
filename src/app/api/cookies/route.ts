import { NextApiRequest, NextApiResponse } from "next";
import { setCookie } from "~/utils/cookies";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  setCookie(res, "seeker-dash", "api-test-middleware");
  res.end(JSON.stringify(res.getHeader("Set-Cookie")));
}
