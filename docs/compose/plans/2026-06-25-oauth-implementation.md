# OAuth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use compose:subagent (recommended) or compose:execute to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add OAuth sign-in (Google, GitHub) to seeker-dashboard via seeker-api proxy.

**Architecture:** seeker-api constructs Supabase OAuth redirect URLs. Dashboard redirects user to provider, then handles callback by parsing tokens from URL hash.

**Tech Stack:** Hono (seeker-api), Next.js App Router (dashboard), Supabase OAuth, Zustand

---

### Task 1: Add OAuth endpoint to seeker-api

**Covers:** OAuth initiation

**Files:**
- Modify: `schemas/auth.ts`
- Modify: `lib/responses.ts`
- Modify: `routes/auth.ts`

- [ ] **Step 1: Add OAuth schema**

```typescript
// schemas/auth.ts — add after confirmEmailSchema

export const oauthProviderSchema = z.enum(["google", "github"]);

export type OAuthProviderInput = z.infer<typeof oauthProviderSchema>;
```

- [ ] **Step 2: Add OAuth response type**

```typescript
// lib/responses.ts — add after confirmEmailResponse

export const oauthResponse = z.object({ url: z.string() });
```

- [ ] **Step 3: Add OAuth route definition**

```typescript
// routes/auth.ts — add imports for oauthProviderSchema and oauthResponse

const oauthRouteDef = createRoute({
  method: "get",
  path: "/api/auth/oauth/{provider}",
  tags: ["Auth"],
  request: {
    params: z.object({
      provider: z.enum(["google", "github"]),
    }),
    query: z.object({
      redirect_to: z.string().optional(),
    }),
  },
  responses: {
    200: { description: "OAuth redirect URL", content: { "application/json": { schema: oauthResponse } } },
    400: { description: "Invalid provider", content: { "application/json": { schema: errorSchema } } },
  },
});
```

- [ ] **Step 4: Add OAuth handler**

```typescript
// routes/auth.ts — add after confirmEmailHandler

const oauthHandler: any = async (c: any) => {
  const { provider } = c.req.valid("param");
  const { redirect_to } = c.req.valid("query");

  const redirectTo = redirect_to ?? `${c.req.header("origin") ?? "http://localhost:3000"}/auth/callback`;

  const params = new URLSearchParams({
    provider,
    redirect_to: redirectTo,
  });

  const url = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;

  return c.json({ url });
};
```

- [ ] **Step 5: Register OAuth route**

```typescript
// routes/auth.ts — in registerAuthRoutes()

app.openapi(oauthRouteDef, oauthHandler);
```

- [ ] **Step 6: Build and verify**

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add schemas/auth.ts lib/responses.ts routes/auth.ts
git commit -m "feat: add OAuth redirect endpoint for Google and GitHub"
```

---

### Task 2: Add OAuth callback route to dashboard

**Covers:** OAuth callback handling

**Files:**
- Create: `src/app/auth/callback/route.ts`

- [ ] **Step 1: Create callback route**

```typescript
// src/app/auth/callback/route.ts

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
```

- [ ] **Step 2: Update dashboard page to handle OAuth tokens**

```typescript
// src/app/dashboard/page.tsx — add to useEffect

useEffect(() => {
  // Check for OAuth tokens in URL params
  const params = new URLSearchParams(window.location.search);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (accessToken && refreshToken) {
    setTokens(accessToken, refreshToken);
    // Clean URL
    window.history.replaceState({}, "", "/dashboard");
  }

  initAuth();
}, [initAuth]);
```

- [ ] **Step 3: Import setTokens in dashboard page**

```typescript
// src/app/dashboard/page.tsx — add import

import { useAuthStore } from "~/stores/authStore";
import { setTokens } from "~/lib/api";
```

- [ ] **Step 4: Build and verify**

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 5: Commit**

```bash
git add src/app/auth/callback/route.ts src/app/dashboard/page.tsx
git commit -m "feat: add OAuth callback route and token handling"
```

---

### Task 3: Update OAuthButtons to use seeker-api

**Covers:** OAuth initiation from dashboard

**Files:**
- Modify: `src/app/auth/_components/OAuthButtons.tsx`

- [ ] **Step 1: Update OAuthButtons**

```typescript
// src/app/auth/_components/OAuthButtons.tsx

"use client";

import * as React from "react";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";
import { api } from "~/lib/api";

interface OAuthButtonsProps {
  mode?: "login" | "register";
  className?: string;
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12 24 5.37 18.63 0 12 0z" />
    </svg>
  );
}

interface OAuthProvider {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const providers: OAuthProvider[] = [
  { id: "google", label: "Google", icon: GoogleIcon },
  { id: "github", label: "GitHub", icon: GitHubIcon },
];

export default function OAuthButtons({
  mode = "login",
  className,
}: OAuthButtonsProps) {
  const [loading, setLoading] = React.useState<string | null>(null);
  const prefix = mode === "register" ? "التسجيل عبر" : "المتابعة عبر";

  async function handleOAuth(provider: string) {
    setLoading(provider);
    try {
      const data = await api.get<{ url: string }>(`/api/auth/oauth/${provider}`, {
        params: { redirect_to: `${window.location.origin}/auth/callback` },
      });
      window.location.href = data.url;
    } catch {
      setLoading(null);
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid gap-3">
        {providers.map((provider) => {
          const Icon = provider.icon;
          return (
            <Button
              key={provider.id}
              type="button"
              variant="outline"
              className="h-11 w-full gap-3 border-border bg-background text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
              onClick={() => handleOAuth(provider.id)}
              disabled={loading !== null}
            >
              {loading === provider.id ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <Icon className="h-[18px] w-[18px] shrink-0" />
              )}
              <span>
                {prefix} {provider.label}
              </span>
            </Button>
          );
        })}
      </div>

      <div className="relative">
        <Separator className="bg-border/60" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
          أو
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Build and verify**

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 7: Commit**

```bash
git add src/app/auth/_components/OAuthButtons.tsx
git commit -m "feat: wire OAuthButtons to seeker-api OAuth endpoint"
```

---

### Task 4: Wire OAuthButtons into login and register pages

**Covers:** OAuth UI integration

**Files:**
- Modify: `src/app/auth/login/page.tsx`
- Modify: `src/app/auth/register/page.tsx`

- [ ] **Step 1: Add OAuthButtons to login page**

```typescript
// src/app/auth/login/page.tsx — add import and render

import OAuthButtons from "../_components/OAuthButtons";

// In the CardFooter, after the login button and before the register link:
<OAuthButtons mode="login" />
```

- [ ] **Step 2: Add OAuthButtons to register page**

```typescript
// src/app/auth/register/page.tsx — add import and render

import OAuthButtons from "../_components/OAuthButtons";

// In the AuthCard footer, before the "已有账户？" link:
<OAuthButtons mode="register" />
```

- [ ] **Step 3: Build and verify**

Run: `bun run build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/app/auth/login/page.tsx src/app/auth/register/page.tsx
git commit -m "feat: add OAuthButtons to login and register pages"
```
