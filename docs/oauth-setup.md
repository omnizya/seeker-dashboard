# OAuth Setup Guide

## Overview

This guide covers setting up Google and GitHub OAuth for seeker-dashboard via Supabase.

## Prerequisites

- Google Cloud Console account
- GitHub account
- Supabase project (kghepssuwlpbmpirhzmz)

## Google OAuth Setup

### 1. Create Google OAuth App

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth client ID**
5. Application type: **Web application**
6. Name: `seeker-dashboard`
7. Authorized redirect URIs:
   - `https://kghepssuwlpbmpirhzmz.supabase.co/auth/v1/callback`
   - `http://localhost:54321/auth/v1/callback` (local Supabase)
8. Copy the **Client ID** and **Client Secret**

### 2. Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/kghepssuwlpbmpirhzmz)
2. Navigate to **Authentication → Providers**
3. Enable **Google**
4. Enter the Client ID and Client Secret
5. Save

## GitHub OAuth Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Application name: `seeker-dashboard`
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `https://kghepssuwlpbmpirhzmz.supabase.co/auth/v1/callback`
6. Click **Register application**
7. Copy the **Client ID**
8. Generate a new **Client Secret** and copy it

### 2. Configure in Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/kghepssuwlpbmpirhzmz)
2. Navigate to **Authentication → Providers**
3. Enable **GitHub**
4. Enter the Client ID and Client Secret
5. Save

## Supabase Redirect URLs

Add these to **Authentication → URL Configuration → Redirect URLs**:

- `http://localhost:3000/auth/callback` (development)
- `https://your-production-domain.com/auth/callback` (production)

## Testing

1. Start seeker-api: `cd /home/m7r/Projects/seeker-api && bun run dev`
2. Start seeker-dashboard: `cd /home/m7r/Projects/seeker-dashboard && bun run dev`
3. Go to `http://localhost:3000/auth/login`
4. Click "Continue with Google" or "Continue with GitHub"
5. Authorize on the provider
6. You should be redirected back to the dashboard

## Troubleshooting

### "Invalid redirect_uri" error

- Ensure the redirect URI in Google/GitHub matches exactly what's in Supabase
- Check that the URL has no trailing slash

### OAuth callback doesn't work

- Check that `/auth/callback` route exists in the dashboard
- Verify the Supabase project URL is correct in `.env.local`

### Tokens not stored

- Check browser console for errors
- Verify the callback route is parsing the URL hash correctly
