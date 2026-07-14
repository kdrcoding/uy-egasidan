# Uy Egasidan — MVP Features

## Completed frontend features

### Navigation & shell
- Bottom tab navigation: Home, Search, **Add** (prominent raised button),
  Favorites, Profile.
- Root stack hosting the tabs and the property details screen.
- Safe-area handling on every screen; graceful `+not-found` route.

### Home
- Brand + greeting, hero heading and subheading (Uzbek by default).
- Tap-to-search field and horizontal district chips (pre-fill Search).
- Trust indicators: verified owners, no commission, fresh listings.
- Featured (verified) listings carousel and latest listings list.
- "How it works" section.
- Loading skeletons and an error state with retry.

### Search
- Free-text query, district, property type, rooms (incl. 4+), min/max price,
  currency, furnished and pets filters.
- Sort: newest, price ↑, price ↓, largest area.
- Live results count, clear-filters action, empty state.
- All filtering/sorting via reusable pure functions in `utils/propertyFilters`.

### Property details
- Swipeable image gallery with paging dots and broken-image fallback.
- Floating back and favorite controls.
- Price, location, title, verified-owner / property-verified / no-commission
  badges, confirmed-availability card.
- Rooms/bedrooms/bathrooms/area/floor stats, description, amenities grid.
- Rental conditions (deposit, utilities, available date, max occupants,
  commission = 0).
- Safety warning and report action.
- Bottom action bar: Call owner, Telegram, Request viewing (mock alerts).
- Handles unknown ids gracefully (not-found state).

### Add Property (owner)
- 6-step form with progress bar: type → location → details → price/terms →
  description/photos → review.
- Owner-only rule shown throughout; agent commission fixed at 0 (read-only).
- Simulated photo add/remove with placeholders.
- Reusable validation; success / draft / validation-error alerts; form reset
  after successful submit with a "pending admin review" explanation.

### Favorites
- Add/remove from cards and details; session-persistent via React Context.
- Saved-count header and empty state.

### Profile
- Mock avatar, name, phone-verified badge.
- Owner-only rule section.
- Language selector (Uzbek Latin / Russian / English) via modal.
- Currency preference (UZS / USD).
- Menu rows (my properties, viewing requests, owner verification, safety, help,
  about, etc.) and a login placeholder; app version.

### Cross-cutting
- Centralized design system (colors, spacing, radii, typography, shadows).
- Localization scaffold for 3 languages with UZ default and fallback.
- Reusable currency formatting (`5 500 000 UZS / oy`, `$450 / oy`).
- FlatList-based lists, memoized components, stable keys.
- Strict TypeScript; passes `npx tsc --noEmit` and `npm run lint`.

## Not yet implemented

- Real backend, authentication, or user accounts.
- Persistent storage (favorites, language, currency reset on relaunch).
- Real photo uploads, maps, chat, SMS, phone dialing, document/passport upload.
- Currency conversion (each listing keeps its own currency; no FX).
- Admin approval workflow, reports handling, notifications.
- Complete translations for every string (RU/EN are partial by design).

## Future phases

1. **Backend foundation** — Supabase auth, profiles, properties, images,
   favorites, admin approval (see `FUTURE_BACKEND_PLAN.md`).
2. **Owner verification** — document/passport upload and review pipeline.
3. **Communication** — in-app chat and viewing-request scheduling.
4. **Trust & safety** — report triage, fraud signals, deposit guidance.
5. **Localization** — full RU/EN coverage and locale-aware formatting.
6. **Persistence & polish** — offline caching, saved searches, push
   notifications, map view.
