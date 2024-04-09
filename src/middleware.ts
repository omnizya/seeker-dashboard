import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { updateSession } from "./utils/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export default createMiddleware({
  locales: ["en", "ar"],
  defaultLocale: "ar",
});

export const config = {
  matcher: [
    "/",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    "/(ar|en)/:path*",
  ],
};
