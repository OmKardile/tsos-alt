# Changelog

All notable changes to **TSOS (The Cafe Operating System)** are recorded in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.2.0] — 2026-09-25 — Realtime WebSockets & Comparative Feature Migration

### Real-Time Synchronization & Offline Resiliency
- **Supabase Realtime WebSockets**: Integrated `realtimeService.subscribeToTenantRealtime` for instant zero-reload KDS ticket progression, live order arrivals with synthesized Web Audio chimes, and automatic floor table occupancy syncing.
- **Offline Order Queue**: Implemented localStorage-backed queue (`tsos_pending_offline_orders`) ensuring continuous checkout operations during network dropouts, with automatic background synchronization on browser `'online'` reconnection.

### Hardware & Operations Hub
- **Hardware Integration & Downloads Modal**: Added centralized hub accessible via Header and Settings for downloading the Windows Desktop POS client (.exe), Android Tablet APK, and thermal printer ESC/POS driver documentation.
- **Fast Touchscreen Staff PIN Pad**: Integrated `StaffPinPadModal` featuring an on-screen numeric keypad for 2-tap cashier and barista shift transitions on counter touchscreens.

### Testing & Table QR Hardening
- **Storefront Testing Toggles**: Added `[Expire (Test History)]` and `[Tamper]` buttons to easily simulate and test browser history protections and anti-spoofing guards.
- **Table Card Guidance**: Updated table card modal with security advisories on short-lived sessions and anti-tamper QR protocols.

---

## [2.1.0] — 2026-09-25 — 10-Minute Ephemeral Table QR Session Security

### Security & Anti-Fraud
- **Ephemeral Session Tokens**: Implemented a dual-token architecture where scanning a table's physical QR code (`GET /api/table/:slug/:tableNumber?token=:permanentQrToken`) verifies the permanent secret and issues a cryptographically signed HMAC-SHA256 session token with `expires_at = now() + INTERVAL '10 minutes'`.
- **Database Backed Session Store**: Created `table_sessions` table with foreign keys, indexes, and RLS policies for tenant staff and anonymous diners.
- **Order Submission Guard**: Added enforcement requiring `X-Table-Session-Token` header on `POST /api/orders`. Rejects with 401/403 if signature is invalid, table ID is spoofed (`TABLE_MISMATCH`), session is expired (`SESSION_EXPIRED`), or the table is settled (`TABLE_SETTLED`).
- **PostgreSQL Session RPCs**:
  - `issue_ephemeral_table_session`: Verifies physical token, revokes stale sessions, issues fresh 600s token.
  - `verify_and_consume_table_session`: Validates token signature, table ID, and table dining status.
  - `renew_ephemeral_table_session`: Re-scans physical token for renewal handshake.
  - `purge_expired_table_sessions`: Maintenance procedure to purge sessions older than 24 hours.

### Storefront UI / UX
- **Live Countdown Timer**: Integrated a real-time `mm:ss` countdown badge in the storefront header.
- **Warning States**:
  - Amber warning banner appears at $\le$ 2 minutes remaining with instant `[Renew Now]` action.
  - Pulsing red badge at $\le$ 30 seconds remaining.
- **Security Auto-Lock Screen**: Fullscreen backdrop overlay triggers automatically when the timer reaches 00:00, disabling item selection and checkout with instructions to scan the physical QR sticker to renew.

---

## [2.0.0] — 2026-09-25 — Multi-Tenant Cloud Architecture & Obsidian Mode

### Multi-Tenant Core & Backend
- **PostgreSQL Schema (Migration 001)**: Deployed 24 core tables to Supabase with strict `tenant_id` foreign keys and cascading deletes.
- **Row-Level Security (RLS)**: Enforced tenant isolation across all tables using session-based `current_tenant_id()` extraction.
- **Dynamic Scoped Routing**: Implemented path-based URL routing (`/:slug/pos`, `/:slug/kds`, `/:slug/orders`, `/:slug/inventory`, `/:slug/reports`, `/:slug/settings`, `/:slug/t:tableNumber`, `/superadmin`).
- **SuperAdmin Workspace Impersonation**: One-click "Enter Tenant Workspace" hook for operator support.

### Prototype Chrome Purge & Production Hardening
- **Removed Prototype Chrome**: Eliminated top "SURFACES" switcher bar, mock network sliders, fake latency toggles, tutorial purple dots (`GuidanceTooltip`), and demo reset handlers.
- **Production Store Bindings**: Connected POS actions, cart workflows, and customer lookup directly to persistent Zustand stores and live Supabase queries.

### Design System & Obsidian Mode
- **System-Wide Obsidian Terminal Theme**: Added global high-contrast industrial dark mode (`#0C0A09` background, `#292524` borders, phosphor amber `#F59E0B` and safety emerald `#10B981` accents).
- **Single-Button Header Toggle**: Added header Sun/Moon button toggling the entire system between Warm Cafe Cream and Obsidian Dark Terminal.

---

## [1.0.0] — 2026-09-24 — Initial Offline-First POS Prototype

### Added
- Core POS billing terminal with category selection, search, variant customization, and order type selector (Dine-In, Takeaway, Delivery).
- Kitchen Display System (KDS) board with stage filtering (`new`, `preparing`, `ready`, `completed`) and SLA timers.
- Loyalty & Customer CRM engine with 1 pt per ₹10 accrual, 1 pt = ₹1 redemption, and tier progression.
- Multi-mode payment engine: Dynamic UPI QR code generator, cash tender calculator, card terminal mock.
- Thermal receipt preview and printing generator.
- Inventory recipe depletion tracking on order completion.
