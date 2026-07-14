import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { VERIFICATION_REVIEW_MS, type UserAccount } from '@/types/user';
import { readJson, removeKey, STORAGE_KEYS, writeJson } from '@/utils/storage';

/**
 * Account + identity verification state, persisted in AsyncStorage.
 *
 * Verification is a two-step trust gate before posting: the owner submits an
 * ID document photo and a selfie, the submission goes into `pending`, and a
 * simulated moderation review approves it after a short delay (surviving app
 * restarts by re-deriving the deadline from `verificationSubmittedAt`).
 */
interface AuthContextValue {
  account: UserAccount | null;
  /** True until the persisted account has been loaded. */
  hydrating: boolean;
  signIn: (fullName: string, phone: string, telegramUsername?: string) => void;
  signOut: () => void;
  submitVerification: (idDocumentUri: string, selfieUri: string) => void;
  isVerified: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function generateId(): string {
  return `u-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [hydrating, setHydrating] = useState(true);
  const approvalTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearApprovalTimer = useCallback(() => {
    if (approvalTimer.current) {
      clearTimeout(approvalTimer.current);
      approvalTimer.current = null;
    }
  }, []);

  const persist = useCallback((next: UserAccount | null) => {
    setAccount(next);
    if (next) {
      void writeJson(STORAGE_KEYS.account, next);
    } else {
      void removeKey(STORAGE_KEYS.account);
    }
  }, []);

  /** Approves a pending verification, either now or after the remaining review time. */
  const scheduleApproval = useCallback(
    (pending: UserAccount) => {
      if (pending.verificationStatus !== 'pending' || !pending.verificationSubmittedAt) {
        return;
      }
      const elapsed = Date.now() - new Date(pending.verificationSubmittedAt).getTime();
      const remaining = Math.max(0, VERIFICATION_REVIEW_MS - elapsed);
      clearApprovalTimer();
      approvalTimer.current = setTimeout(() => {
        setAccount((current) => {
          if (!current || current.verificationStatus !== 'pending') {
            return current;
          }
          const approved: UserAccount = { ...current, verificationStatus: 'verified' };
          void writeJson(STORAGE_KEYS.account, approved);
          return approved;
        });
      }, remaining);
    },
    [clearApprovalTimer],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await readJson<UserAccount>(STORAGE_KEYS.account);
      if (!cancelled && stored) {
        setAccount(stored);
        scheduleApproval(stored);
      }
      if (!cancelled) {
        setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
      clearApprovalTimer();
    };
  }, [scheduleApproval, clearApprovalTimer]);

  const signIn = useCallback(
    (fullName: string, phone: string, telegramUsername?: string) => {
      const next: UserAccount = {
        id: generateId(),
        fullName: fullName.trim(),
        phone: phone.trim(),
        telegramUsername: telegramUsername?.trim().replace(/^@/, '') || undefined,
        verificationStatus: 'unverified',
        createdAt: new Date().toISOString(),
      };
      persist(next);
    },
    [persist],
  );

  const signOut = useCallback(() => {
    clearApprovalTimer();
    persist(null);
  }, [persist, clearApprovalTimer]);

  const submitVerification = useCallback(
    (idDocumentUri: string, selfieUri: string) => {
      setAccount((current) => {
        if (!current) {
          return current;
        }
        const next: UserAccount = {
          ...current,
          verificationStatus: 'pending',
          idDocumentUri,
          selfieUri,
          verificationSubmittedAt: new Date().toISOString(),
        };
        void writeJson(STORAGE_KEYS.account, next);
        scheduleApproval(next);
        return next;
      });
    },
    [scheduleApproval],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      account,
      hydrating,
      signIn,
      signOut,
      submitVerification,
      isVerified: account?.verificationStatus === 'verified',
    }),
    [account, hydrating, signIn, signOut, submitVerification],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
