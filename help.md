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

---

### Option C: Deploying to Render (Free Static Site with Zero Cold Starts)

Render is an outstanding cloud deployment platform for TSOS. Because TSOS is a client-side Vite SPA backed directly by Supabase, it runs as a **Static Site** on Render.

#### Why Render is Great for TSOS:
1. **100% Free Forever**: Render Static Sites do not charge and have generous bandwidth.
2. **Zero Cold Starts / Instant Load**: Unlike Render *Web Services* (which sleep after 15 min on the free tier), Render *Static Sites* run on a global CDN and **NEVER spin down**. Customers scanning table QR codes get instant loads every single time.
3. **Automated Infrastructure-as-Code**: We have created [`render.yaml`](file:///d:/work/megatech/mega-tsos/render.yaml) at the repository root, so Render can configure everything in 1 click via Blueprints.

#### Method 1: 1-Click Deploy via Render Blueprints (Recommended)
1. Push your repository to GitHub / GitLab:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/mega-tsos.git
   git push -u origin master
   ```
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** $\rightarrow$ **Blueprint**.
4. Connect your `mega-tsos` repository.
5. Render will automatically parse [`render.yaml`](file:///d:/work/megatech/mega-tsos/render.yaml):
   - Service Type: `Static Site`
   - Build Command: `npm run build`
   - Publish Directory: `./dist`
   - Routing Rewrites: `/*` $\rightarrow$ `/index.html` (prevents 404s on table QR & POS URLs)
   - Environment Variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Click **Apply**. Your app is live with a free `onrender.com` SSL domain in ~2 minutes!

#### Method 2: Manual Setup via Render Web Dashboard
If you prefer configuring it manually without Blueprints:
1. In the [Render Dashboard](https://dashboard.render.com), click **New +** $\rightarrow$ **Static Site**.
2. Connect your Git repository.
3. Configure the build parameters:
   - **Name**: `tsos-cafe-pos`
   - **Branch**: `master` (or `main`)
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_SUPABASE_URL`: `https://vbufsuzzmehsidshopku.supabase.co`
   - `VITE_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZidWZzdXp6bWVoc2lkc2hvcGt1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyOTE0MjMsImV4cCI6MjEwNTg2NzQyM30.kymgulEpO3R7FRhrfFO-lpmYrAcOqBF82sSW4unZHBE`
5. Configure **Redirects / Rewrites** (CRITICAL for client-side routing):
   - Navigate to the **Redirects/Rewrites** tab of your static site.
   - Click **Add Rule**:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
   *(Without this, refreshing `/:slug/pos` or table QR links like `/:slug/t1` will return a 404)*
6. Click **Create Static Site**.

---

### Comparison: Vercel vs Render for TSOS

| Feature | Vercel | Render (Static Site) |
|---|---|---|
| **Cost** | 100% Free Hobby Tier | 100% Free Tier |
| **Cold Starts** | None (Edge CDN) | None (Static CDN - never sleeps) |
| **CLI Deploy** | Instant (`npx vercel`) without git push | Requires Git repo connection |
| **Config as Code** | [`vercel.json`](file:///d:/work/megatech/mega-tsos/vercel.json) | [`render.yaml`](file:///d:/work/megatech/mega-tsos/render.yaml) |
| **SPA Rewrites** | Pre-configured in `vercel.json` | Pre-configured in `render.yaml` |
| **Custom Domain + SSL** | Free automatic SSL | Free automatic SSL |
| **Backend Integration** | Serverless functions if needed | Background workers / containers if needed |

Both options are production-grade for TSOS. If you want instant command-line deployment without setting up a Git remote, use **Vercel** (`npx vercel`). If you already push to GitHub and prefer Render's unified dashboard, use **Render** (via `render.yaml`).

---

## 3. 📱 Client Architecture Policy

- **Customer Tableside Ordering**: 100% Zero-install browser experience. Customers scan the physical table QR code with their phone camera $\rightarrow$ opens `https://<DOMAIN>/<SLUG>/t<TABLE>?token=<SECRET>` in their mobile browser $\rightarrow$ authenticates a 10-minute cryptographic session (`table_sessions`). No native app downloads needed.
- **Desktop POS Terminals**: Native Windows WPF app is **FROZEN**. Desktop POS deployments focus on **Electron.js** wrapping the unified web POS terminal for cross-platform direct hardware access (raw ESC/POS WebUSB/WebSerial printers and cash drawers).


