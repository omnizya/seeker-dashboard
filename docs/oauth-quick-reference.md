# OAuth Quick Reference

## URLs to Configure

| Service | URL | Purpose |
|---------|-----|---------|
| Google OAuth | `https://kghepssuwlpbmpirhzmz.supabase.co/auth/v1/callback` | Redirect URI |
| GitHub OAuth | `https://kghepssuwlpbmpirhzmz.supabase.co/auth/v1/callback` | Callback URL |
| Supabase Redirect | `http://localhost:3000/auth/callback` | Dashboard callback |

## Environment Variables

No new env vars needed - OAuth is handled by Supabase.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/oauth/google` | GET | Get Google OAuth redirect URL |
| `/api/auth/oauth/github` | GET | Get GitHub OAuth redirect URL |

## Flow

```
User → OAuthButtons → seeker-api → Supabase → Provider → Supabase → /auth/callback → /dashboard
```
