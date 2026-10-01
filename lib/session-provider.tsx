'use client';

// This whole file is the "fake login" layer. Everything else in the app
// only calls useSession() and never touches mockAccounts directly — so
// when Supabase Auth is wired up, this is the only file that changes:
// swap the useState below for a real session fetched from supabase.auth.

import { createContext, useContext, useState, ReactNode } from 'react';
import { Account, StaffRole } from './types';
import { mockAccounts } from './mock-data';

interface SessionContextValue {
  account: Account;
  allAccounts: Account[];
  switchAccount: (id: string) => void; // dev-only, simulates logging in as someone else
  requestWorkAccess: (role: StaffRole) => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [currentId, setCurrentId] = useState(mockAccounts[0].id);

  const account = accounts.find((a) => a.id === currentId) ?? accounts[0];

  function requestWorkAccess(role: StaffRole) {
    setAccounts((prev) =>
      prev.map((a) =>
        a.id === currentId
          ? { ...a, workAccessStatus: 'pending', requestedRole: role }
          : a
      )
    );
  }

  return (
    <SessionContext.Provider
      value={{ account, allAccounts: accounts, switchAccount: setCurrentId, requestWorkAccess }}
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
