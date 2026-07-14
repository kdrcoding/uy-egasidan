# Uy Egasidan — Future Backend Plan (Supabase)

> This document is a **plan only**. No backend code is implemented in this MVP.
> The frontend is deliberately structured so that adding Supabase touches the
> data hooks and a thin API layer, not the screens.

## Why Supabase

Postgres + Row Level Security (RLS) + Auth + Storage + Edge Functions cover
every backend need below in one platform, which fits a lean marketplace MVP.

## Integration seam

Today, screens consume `useProperties()` / `useFavorites()` and pure helpers in
`utils/`. When the backend lands:

- `useProperties` swaps mock data for Supabase queries (same `Property[]` shape).
- `FavoritesContext` reads/writes a `favorites` table instead of an in-memory
  `Set` (keeping the same API).
- A new `lib/supabase.ts` client and typed `services/*` layer are added; screens
  stay unchanged.

## Data model (tables)

| Table | Key columns | Notes |
| --- | --- | --- |
| `profiles` | `id` (→ auth.users), `full_name`, `phone`, `phone_verified`, `role`, `owner_verified` | `role` restricted to `renter` / `owner`; **no agency role**. |
| `properties` | mirrors the `Property` type + `owner_id`, `status` | RLS: owners see their own; everyone sees `published`. |
| `property_images` | `id`, `property_id`, `url`, `position` | Backed by Storage objects. |
| `favorites` | `user_id`, `property_id` | Composite PK; per-user saved listings. |
| `viewing_requests` | `id`, `property_id`, `renter_id`, `status`, `requested_at` | Powers "Request viewing". |
| `reports` | `id`, `property_id`, `reporter_id`, `reason`, `status` | Powers "Report listing". |
| `owner_verifications` | `id`, `owner_id`, `document_url`, `status`, `reviewed_by` | Passport/ownership document review. |

## Feature-by-feature plan

### Authentication
- Supabase Auth with phone OTP (primary for Uzbekistan) and email fallback.
- Session stored via the Supabase client; gate Add Property and favorites sync
  behind an authenticated session.

### Profiles
- `profiles` row created on sign-up (trigger on `auth.users`).
- `role` and `owner_verified` drive who can publish. **Enforce the owner-only
  rule in RLS**: only rows where the author's role is `owner` may insert into
  `properties`.

### Properties
- CRUD through PostgREST with RLS.
- Read policy: `status = 'published'` for anonymous/renter; owners read their own
  drafts/pending. Insert/update limited to the owning `owner_id`.
- Server-side default `status = 'pending'` on insert (admin review required).

### Images
- Supabase Storage bucket `property-images` (public read, owner write).
- Replace the simulated uploader with real multi-image upload; store URLs in
  `property_images`. `PropertyImage` already handles broken/missing URLs.

### Favorites
- `favorites` table with RLS scoped to `auth.uid()`.
- On login, hydrate the favorites context from the table; writes upsert/delete.

### Admin approval
- Admin dashboard (separate surface) updates `properties.status` to
  `published` / `rejected`.
- Optional Edge Function to notify the owner on status change.
- RLS: only service role / admin claims may transition status.

### Reports
- Insert into `reports` from the details screen (currently a mock alert).
- Admin triage queue; status transitions and optional auto-hide on threshold.

### Owner verification
- Upload ownership/passport documents to a private Storage bucket.
- `owner_verifications` review sets `profiles.owner_verified = true`, which
  unlocks the verified-owner badge and publishing.

## Security & rollout notes

- All access mediated by **RLS**; the anon key is safe to ship because policies,
  not the client, enforce access. No secrets in the app bundle.
- Add pagination + full-text search server-side (replacing the in-memory
  `filterProperties`) once data volume grows.
- Introduce migrations (`supabase/migrations`) and typed database types
  generated from the schema to keep the `Property` type in sync.
