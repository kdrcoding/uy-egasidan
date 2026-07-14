# Uy Egasidan — App Structure

## Folder structure

```text
app/                         # Expo Router routes (file-based navigation)
  _layout.tsx                # Root: providers + Stack (tabs + property details)
  +not-found.tsx             # Graceful fallback for unknown routes
  (tabs)/
    _layout.tsx              # Bottom tab navigator (Add tab is prominent)
    index.tsx                # Home
    search.tsx               # Search + filters
    add-property.tsx         # Multi-step listing form
    favorites.tsx            # Saved listings
    profile.tsx              # Profile, language + currency selectors
  property/
    [id].tsx                 # Property details

components/                  # Reusable, presentational components
  Badge.tsx  FavoriteButton.tsx  FilterChip.tsx  FormInput.tsx
  EmptyState.tsx  LoadingCard.tsx  PrimaryButton.tsx  SecondaryButton.tsx
  PropertyCard.tsx  PropertyImage.tsx  SectionHeader.tsx

constants/                   # Centralized design system + static data
  colors.ts  spacing.ts  typography.ts  districts.ts  amenities.ts
  translations.ts

context/                     # React Context providers (session state)
  FavoritesContext.tsx  LanguageContext.tsx

data/
  mockProperties.ts          # 14+ mock listings (2 non-published on purpose)

hooks/
  useFavorites.ts  useProperties.ts

types/
  property.ts  filters.ts  language.ts

utils/                       # Pure business logic (no React)
  currency.ts  validation.ts  propertyFilters.ts

docs/                        # This documentation
```

Path alias: `@/*` resolves to the project root (see `tsconfig.json`), so
imports read like `@/components/PropertyCard`.

## Navigation

- **Expo Router** with typed routes and file-based routing.
- The root `Stack` hosts two entries: the `(tabs)` group and the
  `property/[id]` details screen (pushed on top, with its own back button).
- The `(tabs)` group is a bottom `Tabs` navigator with five tabs: Home, Search,
  **Add** (a raised, visually prominent center button), Favorites, Profile.
- Deep-linking between tabs is used to pre-fill search — Home district chips
  call `router.push({ pathname: '/(tabs)/search', params: { district } })`.

## State management

State is intentionally lightweight and lives at the smallest reasonable scope:

- **Language + currency** — `LanguageContext`. Holds the active language, the
  `t(key)` translation function (UZ → key fallback), and the preferred
  currency. Provided once at the root.
- **Favorites** — `FavoritesContext`. A `Set<string>` of property ids with
  O(1) toggle/lookup, exposed through `useFavorites`. Session-only.
- **Screen-local state** — `useState`/`useMemo` inside screens for filters, the
  add-property draft, gallery index, and modal visibility.
- **Derived data** — `useProperties` simulates an async load of the published
  listings and derives `featured` / `latest`; filtering is done by pure
  functions in `utils/propertyFilters.ts` and memoized by the caller.

## Reusable components

All components are presentational, `memo`-wrapped where useful, and styled only
through the design-system constants (no ad-hoc colors or magic numbers):

- **PropertyCard** — the primary listing card (cover, price, district, rooms,
  area, verified/no-commission badges, favorite button, confirmed availability).
- **PropertyImage** — remote image with graceful empty/broken-image fallback.
- **Badge**, **FilterChip**, **FormInput**, **PrimaryButton**,
  **SecondaryButton**, **SectionHeader**, **EmptyState**, **LoadingCard**,
  **FavoriteButton** — small building blocks reused across every screen.

## Data flow

```text
data/mockProperties.ts
        │  (getPublishedProperties)
        ▼
hooks/useProperties  ──►  screens (Home / Search / Favorites / Details)
        │                          │
        │                          ├─ utils/propertyFilters (filter + sort)
        │                          ├─ utils/currency (formatting)
        │                          └─ context (favorites, language)
        ▼
     memoized, typed Property[] rendered via FlatList
```

The `useProperties` hook is the single seam to the future backend: only its
implementation changes when Supabase is introduced — consumers keep their
`Property[]` contract.
