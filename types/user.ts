/**
 * Account and identity-verification types.
 *
 * Posting a listing requires a verified identity: the owner uploads a photo
 * of their ID document (passport / ID card) and a selfie. In this frontend
 * MVP the review is simulated locally; the shape mirrors what a real
 * moderation backend would store.
 */

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface UserAccount {
  id: string;
  fullName: string;
  /** E.164-ish local format, e.g. +998901234567. */
  phone: string;
  /** Telegram username without the @, optional. */
  telegramUsername?: string;
  verificationStatus: VerificationStatus;
  /** Local URIs of the submitted documents (never leave the device in the MVP). */
  idDocumentUri?: string;
  selfieUri?: string;
  /** ISO timestamp of when verification was submitted. */
  verificationSubmittedAt?: string;
  createdAt: string;
}

/** Simulated moderation delay before a submitted verification is approved. */
export const VERIFICATION_REVIEW_MS = 15_000;
