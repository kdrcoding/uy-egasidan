# Uy Egasidan 🏡

**Direct from the property owner.** A mobile real-estate marketplace for
Uzbekistan — rent **or buy** directly from verified owners. No agencies, no
broker commission.

> Frontend MVP built with Expo + React Native + TypeScript + Expo Router.
> Accounts, verification and user listings persist on-device (AsyncStorage);
> a real backend comes in the next phase.

## Get started

```bash
npm install
npm start
```

Then open the app in **Expo Go** (Android-first), an Android emulator, or an iOS
simulator from the Expo CLI output.

## Key features

- **Rent & sale listings** — Zillow-style browsing with price-per-m² on sales.
- **Identity verification before posting** — owners register with a phone
  number (demo SMS code: `123456`), then upload a **passport/ID photo and a
  selfie**. Posting is locked until verification is approved (simulated
  review, auto-approves after ~15 s).
- **One listing per user** — each verified owner can have exactly one listing;
  it must be deleted (or completed) before posting another. Managed from the
  **My listing** screen (mark rented/sold, reactivate, delete).
- **Real contact actions** — call the owner (`tel:`) or open their Telegram
  (`t.me/…`) straight from a listing.
- **Uzbekistan-wide coverage** — 13 cities with city-specific district lists,
  UZS/USD prices, Uzbek (default) / Russian / English UI.
- **Persistent state** — favorites, language, currency, account and your
  listing all survive app restarts.

## Quality checks

```bash
npx tsc --noEmit   # strict type-check
npm run lint       # ESLint (eslint-config-expo)
```

Both are expected to pass with no errors.

## What's inside

- **Home / Search / Post / Favorites / Profile** tabs, plus Property Details,
  Sign-in, Identity Verification and My Listing screens.
- Reusable design system (`constants/`), components (`components/`), pure logic
  (`utils/`), hooks (`hooks/`), and persistent state via React Context
  (`context/`: language, auth, listings, favorites).
- 19 mock listings (rent + sale) across Tashkent, Samarqand and other regions.
  Only `published` listings are shown to browsers.

## Documentation

See [`docs/`](./docs):

- [`PRODUCT_REQUIREMENTS.md`](./docs/PRODUCT_REQUIREMENTS.md)
- [`APP_STRUCTURE.md`](./docs/APP_STRUCTURE.md)
- [`MVP_FEATURES.md`](./docs/MVP_FEATURES.md)
- [`FUTURE_BACKEND_PLAN.md`](./docs/FUTURE_BACKEND_PLAN.md)
