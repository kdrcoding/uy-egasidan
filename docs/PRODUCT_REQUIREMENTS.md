# Uy Egasidan — Product Requirements

## Product purpose

**Uy Egasidan** ("Direct from the property owner") is a rental marketplace for
Uzbekistan that connects property **owners** directly with **renters**. It
removes agencies and brokers from the rental process so that renters never pay
an agent commission and always know they are talking to the real owner.

The three promises the product is built around:

- **Rent directly from owners** — no middlemen.
- **No agencies, no commission** — renters pay the owner, nothing else.
- **Verified owner listings** — trust signals on every listing.

## The owner-only rule

This is the core, non-negotiable product rule:

> Only property owners may publish listings. Agencies and brokers are prohibited.

Consequences that shape the whole app:

- The data model has **no agency entity**. Every listing links to an owner and
  carries owner/property verification fields directly.
- The **Add Property** flow is framed as an owner action and repeats the
  owner-only rule; agent commission is fixed at **0** and is not editable.
- Trust surfaces (badges, verification, safety warnings) reinforce that the
  counterparty is the owner.

## User roles

| Role | In this MVP | Notes |
| --- | --- | --- |
| **Renter** | Browse, search, favorite, view details, contact owner (mocked) | No login required to browse. |
| **Owner** | Create a listing via the multi-step form (mocked submission) | Listings enter `pending` admin review. |
| **Admin** | Not in the frontend MVP | Approval/rejection is described in the backend plan. |

## Main user journeys

1. **Discover** — Renter opens Home, sees the value proposition, featured and
   latest verified listings, and quick district access.
2. **Search & filter** — Renter narrows listings by district, price, rooms,
   type, currency, furnished/pets, and sorts the results.
3. **Evaluate** — Renter opens a listing, reviews photos, price, amenities,
   rental conditions, verification badges, and the safety warning.
4. **Contact (mocked)** — Renter taps Call owner / Telegram / Request viewing.
5. **Save** — Renter favorites listings and reviews them on the Favorites tab.
6. **Publish (owner)** — Owner completes the 6-step Add Property form and
   submits for review, or saves a draft.

## Marketplace trust goals

- **Owner verification** — `ownerVerified` badge shows a vetted owner.
- **Property verification** — `propertyVerified` badge shows a checked listing.
- **Freshness** — `confirmedAvailableAt` communicates the owner recently
  confirmed availability.
- **No commission** — a persistent, explicit "No commission" badge.
- **Safety** — every listing repeats: *Never send a deposit before viewing the
  property and verifying the owner.* Listings can be reported.

## MVP limitations

This version is a **frontend-only** build on mock data. Intentionally excluded:

- No Supabase / backend, authentication, or real user accounts.
- No payments, deposits, or commission handling beyond display.
- No maps, real chat, SMS, phone calls, or passport / document uploads.
- Photo upload is simulated (placeholders only).
- Favorites and language/currency choices are **session-only** (reset on
  relaunch); no persistent storage.
- Only listings with `status = published` are shown; admin approval is mocked.
