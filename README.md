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
- **LocalStorage persistence** — all data survives page reloads; preloaded with sample subscriptions

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

### Export & Import
Download subscriptions as a `.json` file and re-import on any device or URL to restore your data.

**Plan:**
- Export → `neonsubs-backup.json` (Blob download, no dependencies)
- Import → hidden `<input type="file" accept=".json">`, validates + runs migration, replaces localStorage and live state
- UI → two icon buttons (↓ ↑) in the Header next to the theme toggle
- Import replaces all data (no merge); old-format data is auto-migrated
