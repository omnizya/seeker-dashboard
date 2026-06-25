import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, hash } = new URL(request.url);

  // Supabase redirects with tokens in URL hash: #access_token=...&refresh_token=...
  // Also handle query params for some flows
  const accessToken = searchParams.get("access_token") ?? parseHash(hash, "access_token");
  const refreshToken = searchParams.get("refresh_token") ?? parseHash(hash, "refresh_token");
  const error = searchParams.get("error") ?? parseHash(hash, "error");

  if (error) {
    return NextResponse.redirect(new URL(`/auth/login?error=${error}`, request.url));
  }

  if (accessToken && refreshToken) {
    // Store tokens and redirect to dashboard
    // The tokens will be picked up by authStore.initAuth() on the dashboard page
    const callbackUrl = new URL("/dashboard", request.url);
    callbackUrl.searchParams.set("access_token", accessToken);
    callbackUrl.searchParams.set("refresh_token", refreshToken);
    return NextResponse.redirect(callbackUrl);
  }

  // No tokens — redirect to login
  return NextResponse.redirect(new URL("/auth/login", request.url));
}

function parseHash(hash: string, key: string): string | null {
  if (!hash) return null;
  const params = new URLSearchParams(hash.slice(1)); // Remove leading #
  return params.get(key);
}
