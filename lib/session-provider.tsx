'use client';

// This whole file is the auth layer. It's real logic — a wrong password
// actually fails, a new registration actually persists, an admin approval
// actually changes what the account can see — it's only the *storage*
// that's stationary (localStorage instead of Supabase). When Supabase Auth
// is wired up, this file is what gets replaced; nothing that imports
// useSession() needs to change.

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Account, StaffRole } from './types';
import { mockAccounts } from './mock-data';

const ACCOUNTS_KEY = 'volt.accounts';
const SESSION_KEY = 'volt.session';

interface Result {
  ok: boolean;
  error?: string;
}

interface SessionContextValue {
  account: Account | null;
  hydrated: boolean; // false until localStorage has been read, client-side
  allAccounts: Account[];
  login: (email: string, password: string) => Result;
  register: (fullName: string, email: string, password: string) => Result;
  logout: () => void;
  requestWorkAccess: (role: StaffRole) => void;
  resolveWorkAccess: (accountId: string, decision: 'approved' | 'rejected') => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Read persisted state once, client-side only (avoids SSR/client mismatch).
  useEffect(() => {
    try {
      const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
      if (storedAccounts) setAccounts(JSON.parse(storedAccounts));
      setCurrentId(localStorage.getItem(SESSION_KEY));
    } catch {
      // localStorage unavailable (private mode, etc.) — fall back to mock data, logged out.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (currentId) localStorage.setItem(SESSION_KEY, currentId);
    else localStorage.removeItem(SESSION_KEY);
  }, [currentId, hydrated]);

  const account = accounts.find((a) => a.id === currentId) ?? null;

  function login(email: string, password: string): Result {
    const match = accounts.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!match || match.password !== password) {
      return { ok: false, error: 'Incorrect email or password.' };
    }
    setCurrentId(match.id);
    return { ok: true };
  }

  function register(fullName: string, email: string, password: string): Result {
    const cleanEmail = email.trim().toLowerCase();
    if (!fullName.trim()) return { ok: false, error: 'Enter your full name.' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    if (password.length < 4) return { ok: false, error: 'Password must be at least 4 characters.' };
    if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'An account with that email already exists.' };
    }
    const newAccount: Account = {
      id: `acc-${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      password,
      role: 'customer',
      workAccessStatus: 'none',
    };
    setAccounts((prev) => [...prev, newAccount]);
    setCurrentId(newAccount.id);
    return { ok: true };
  }

  function logout() {
    setCurrentId(null);
  }

  function requestWorkAccess(role: StaffRole) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === currentId ? { ...a, workAccessStatus: 'pending', requestedRole: role } : a
      )
    );
  }

  function resolveWorkAccess(accountId: string, decision: 'approved' | 'rejected') {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === accountId
          ? {
              ...a,
              workAccessStatus: decision,
              role: decision === 'approved' && a.requestedRole ? a.requestedRole : a.role,
            }
          : a
      )
    );
  }

  return (
    <SessionContext.Provider
      value={{ account, hydrated, allAccounts: accounts, login, register, logout, requestWorkAccess, resolveWorkAccess }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
