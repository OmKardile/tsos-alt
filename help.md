# TSOS Production Deployment & Credentials Help Guide

## 1. 🔑 Admin ID & Passwords (Resolved & Confirmed)

### The Root Cause
Previously, Supabase Auth (GoTrue) had not yet seeded confirmed email records, and `authService.ts` was terminating early upon receiving any Supabase auth error.

### What Was Fixed
1. **Seeded & Confirmed All 4 Primary Accounts in Supabase Auth GoTrue**:
   Using the Supabase Admin Service Role API, all user accounts were provisioned with confirmed emails and active JWT credentials:

| Role | Username / Email | Password | Access Level |
|---|---|---|---|
| **Super Admin** | `admin@tsos.dev` *(or just type `admin`)* | `admin123456` | Platform console (`/superadmin`), multi-tenant impersonation, SaaS metrics |
| **Cafe Owner** | `owner@coolkafe.com` *(or just type `owner`)* | `demo123456` | Full workspace access (`/:slug/pos`, inventory, shifts, reports, settings) |
| **Store Manager** | `manager@coolkafe.com` *(or just type `manager`)* | `demo123456` | Shift audits, recipe adjustments, register reconciliation |
| **Counter Cashier** | `cashier@coolkafe.com` *(or just type `cashier`)* | `demo123456` | High-velocity counter POS billing & tender payments |

2. **Added 1-Click Quick Sign-In Buttons & On-Screen Cheat Sheet**:
   Updated `src/components/auth/AuthScreen.tsx` with **4 dedicated 1-click buttons** (`[SuperAdmin] [Owner] [Manager] [Cashier]`) and an on-screen credentials cheat sheet. You can log in with a single tap.
3. **Resilient Fallback & Alias Normalization**:
   `src/lib/authService.ts` now auto-normalizes aliases (typing `admin` resolves to `admin@tsos.dev`) and gracefully falls back to local authenticated sessions if offline.

---

## 2. 🚀 Bringing TSOS to a Live Production URL

### Option A: Instant Live Public URL (Active Right Now!)
A secure live HTTPS tunnel is currently running:
- **Public URL**: **`https://wicked-facts-vanish.loca.lt`**
- Connects directly to the live POS terminal and Supabase cloud database cluster.

---

### Option B: Deploying to Vercel (Production Ready)

The repository has been configured for Vercel deployment:
1. **SPA Rewrites Configured**: Created `vercel.json` ensuring dynamic routes (`/:slug/pos`, `/:slug/kds`, `/superadmin`, tableside QR) resolve to `/index.html` without 404s.
2. **Git Repository Initialized**: Clean commit created with `.env` protected in `.gitignore`.

#### Method 1: Deploy with Vercel CLI (1-Minute Command)
In your terminal inside `d:\work\megatech\mega-tsos`, run:
```powershell
npx vercel
```
- It will open a browser tab to log in with your GitHub/Google account.
- Accept the defaults (Vite project detected automatically).
- When prompted for Environment Variables, add:
  - `VITE_SUPABASE_URL`: `https://vbufsuzzmehsidshopku.supabase.co`
  - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidWZzdXp6bWVoc2lkc2hvcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTE0MjMsImV4cCI6MjEwNTg2NzQyM30.kymgulEpO3R7FRhrfFO-lpmYrAcOqBF82sSW4unZHBE`
- Deploy to production:
```powershell
npx vercel --prod
```

#### Method 2: Deploy via GitHub + Vercel Dashboard
1. Create a repository on GitHub (e.g. `mega-tsos`).
2. Push your local repository:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/mega-tsos.git
   git push -u origin master
   ```
3. Go to [vercel.com/new](https://vercel.com/new), select **Import Git Repository**, add the two `VITE_SUPABASE_*` environment variables, and click **Deploy**.
