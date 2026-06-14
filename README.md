# RPSSubs — Subscription & Trial Radar

A retro-futuristic neon arcade app for tracking subscriptions and free trials. Built with React, Vite, TypeScript, Tailwind CSS, and TanStack Query.

## Getting started

```bash
npm install
npm run dev
```

## Environment variables

Copy `.env.example` to `.env` and fill in your Brandfetch credentials:

```
VITE_BRANDFETCH_CLIENT_ID=   # from developers.brandfetch.com
VITE_BRANDFETCH_API_KEY=     # Bearer token for Brand API
```

## Features

- **Hero card** — next upcoming charge with large urgency-coded countdown
- **Subscription grid** — cards sorted by soonest or priciest; color escalates as charge nears (green → cyan → orange → red)
- **Free trials** — magenta badge with cancel reminder; trial end date tracked separately
- **Brandfetch integration** — live brand search in the add modal; logos loaded from Brandfetch CDN automatically
- **Custom frequency** — weekly, monthly, every N days/weeks/months/years
- **Multi-currency** — GHS (₵), USD, GBP, EUR, NGN, ZAR, KES, CAD, INR; monthly spend totals shown in header
- **Dark / Light theme** — toggle in header, persists across sessions
- **LocalStorage persistence** — all data survives page reloads; empty state shown until first subscription is added

## Tech stack

| Layer | Library |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Data fetching | TanStack Query |
| Icons | Lucide React |
| Brand logos | Brandfetch CDN + Search API |

## Stashed / upcoming

### Notifications

Four options evaluated, ordered from simplest to most capable:

**Option 1 — Browser Notifications (no backend)**
- Web `Notification` API + Service Worker with Periodic Background Sync
- Fires OS-level alerts when the browser is running
- Checks localStorage on app open for upcoming charges
- Zero infrastructure; ships fast
- Limitation: doesn't fire when browser is fully closed; weak iOS Safari support

**Option 2 — PWA + Web Push (VAPID, needs push relay)**
- Make app installable (add `manifest.json` + service worker)
- Browser registers a VAPID push endpoint; stored alongside subscription data
- Requires a server/cron to call the endpoint at the right time (e.g. Vercel Cron)
- Also requires syncing subscription data server-side — ties into Export/Import or cloud save
- True background delivery on Android; limited on iOS

**Option 3 — Email via Resend ← recommended next step**
- User provides email once; stored in localStorage
- Vercel serverless cron runs daily, reads subscription data from a lightweight store (Vercel KV or free Supabase table), sends styled reminder emails
- Resend free tier: 3,000 emails/month
- Works on all devices, no permission prompts, most reliable delivery
- Natural pairing with the Export/Import + user-account work

**Option 4 — WhatsApp / SMS via Twilio**
- Highest open rate, most reliable
- Requires phone number collection and paid Twilio plan
- Overkill until user base exists

**Decision:** Start with Option 1 (browser notifications + PWA shell) for zero-infrastructure wins, then layer Option 3 (Resend email) once user accounts or cloud save is in place.

### Export & Import
Download subscriptions as a `.json` file and re-import on any device or URL to restore your data.

**Plan:**
- Export → `neonsubs-backup.json` (Blob download, no dependencies)
- Import → hidden `<input type="file" accept=".json">`, validates + runs migration, replaces localStorage and live state
- UI → two icon buttons (↓ ↑) in the Header next to the theme toggle
- Import replaces all data (no merge); old-format data is auto-migrated
