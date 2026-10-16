'use client';

// The auth layer, now backed by Supabase. Passwords never touch this code:
// Supabase Auth checks them and keeps the session in cookies. Roles, the
// linked abonent and "Work here?" requests live in the `users` profile table
// and are changed only through the checked SQL functions from
// 07_auth_functions.sql — the browser can't just write its own role.
//
// useSession() keeps the same shape the pages already use, except that the
// methods that talk to the database are now async and return a Result.

import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { supabase } from './supabase';
import { Account, AccountRole, Result, StaffRole, WorkAccessStatus } from './types';
import { fail, ok } from './result';

interface Row {
  user_id: number;
  auth_user_id: string | null;
  login: string;
  full_name: string;
  role: AccountRole;
  abonent_id: number | null;
  work_access_status: WorkAccessStatus;
  requested_role: StaffRole | null;
}

interface AuthUser {
  id: string;
  created_at: string;
}

// TEMPORARY BRIDGE: bills, contracts and meters still come from the local
// seed (ids like "ab-1"), while the database uses numeric ids. This lines
// them up for abonents 1 and 2. It goes away when the data layer moves to
// Supabase.
const toLocalAbonentId = (id: number | null) => (id == null ? undefined : `ab-${id}`);

function toAccount(r: Row, createdAt: string): Account {
  return {
    id: String(r.user_id),
    fullName: r.full_name,
    email: r.login,
    role: r.role,
    workAccessStatus: r.work_access_status,
    requestedRole: r.requested_role ?? undefined,
    abonentId: toLocalAbonentId(r.abonent_id),
    createdAt,
  };
}

interface SessionContextValue {
  account: Account | null;
  hydrated: boolean;
  allAccounts: Account[]; // what the signed-in user is allowed to see (admins: everyone)
  login: (email: string, password: string) => Promise<Result>;
  register: (fullName: string, email: string, password: string) => Promise<Result<{ needsConfirmation: boolean }>>;
  logout: () => void;
  requestWorkAccess: (role: StaffRole) => Promise<Result>;
  resolveWorkAccess: (accountId: string, decision: 'approved' | 'rejected') => Promise<Result>;
  revokeStaff: (accountId: string) => Promise<Result>;
  linkAbonent: (accountNumber: string, contractNumber: string) => Promise<Result>;
  updateName: (fullName: string) => Promise<Result>;
  changePassword: (current: string, next: string) => Promise<Result>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const userRef = useRef<AuthUser | null>(null);

  // Load the profile row(s). Row-level security decides what comes back:
  // a customer gets only their own row, an admin gets everyone's.
  const load = useCallback(async (user: AuthUser | null) => {
    userRef.current = user;
    if (!user) {
      setAccount(null);
      setAllAccounts([]);
      return;
    }
    const { data, error } = await supabase.from('users').select('*').order('user_id');
    if (error || !data) {
      setAccount(null);
      setAllAccounts([]);
      return;
    }
    const rows = data as Row[];
    const created = user.created_at.slice(0, 10);
    setAllAccounts(rows.map((r) => toAccount(r, r.auth_user_id === user.id ? created : '')));
    const mine = rows.find((r) => r.auth_user_id === user.id);
    setAccount(mine ? toAccount(mine, created) : null);
  }, []);

  const refresh = useCallback(async () => {
    if (userRef.current) await load(userRef.current);
  }, [load]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        await load(data.session?.user ?? null);
      } catch {
        /* offline or misconfigured — treat as signed out */
      }
      if (active) setHydrated(true);
    })();

    // Fires on sign-in/out (also from other tabs) and password changes.
    // Don't await Supabase calls inside this callback — defer them.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return; // handled above
      setTimeout(() => {
        load(session?.user ?? null);
      }, 0);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [load]);

  async function call(fn: string, args: Record<string, unknown>): Promise<Result> {
    const { error } = await supabase.rpc(fn, args);
    if (error) return fail(error.message);
    await refresh();
    return ok();
  }

  const value: SessionContextValue = {
    account,
    hydrated,
    allAccounts,

    async login(email, password) {
      const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error || !data.user) {
        if (error?.message.toLowerCase().includes('not confirmed')) {
          return fail('Confirm your email first — check your inbox for the link.');
        }
        return fail('Incorrect email or password.');
      }
      await load(data.user);
      return ok();
    },

    async register(fullName, email, password) {
      const cleanEmail = email.trim().toLowerCase();
      if (!fullName.trim()) return fail('Enter your full name.');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return fail('Enter a valid email address.');
      if (password.length < 6) return fail('Password must be at least 6 characters.');
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: { data: { full_name: fullName.trim().replace(/\s+/g, ' ') } },
      });
      if (error) return fail(error.message);
      // Supabase answers "success" for an already-registered email but returns
      // a user with no identities — that's how to tell.
      if (data.user && data.user.identities?.length === 0) {
        return fail('An account with that email already exists.');
      }
      if (data.session && data.user) {
        await load(data.user);
        return ok({ needsConfirmation: false });
      }
      return ok({ needsConfirmation: true });
    },

    logout() {
      void load(null);
      void supabase.auth.signOut();
    },

    requestWorkAccess: (role) => call('request_work_access', { p_role: role }),

    resolveWorkAccess: (accountId, decision) =>
      call('resolve_work_access', { p_user_id: Number(accountId), p_decision: decision }),

    revokeStaff: (accountId) => call('revoke_staff', { p_user_id: Number(accountId) }),

    linkAbonent: (accountNumber, contractNumber) =>
      call('link_abonent', { p_account_number: accountNumber, p_contract_number: contractNumber }),

    async updateName(fullName) {
      if (fullName.trim().length < 2) return fail('Enter your full name.');
      return call('update_my_name', { p_name: fullName });
    },

    async changePassword(current, next) {
      if (!account) return fail('Not signed in.');
      if (next.length < 6) return fail('New password must be at least 6 characters.');
      // Re-check the current password before allowing a change.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: current,
      });
      if (authError) return fail('Your current password is incorrect.');
      const { error } = await supabase.auth.updateUser({ password: next });
      if (error) return fail(error.message);
      return ok();
    },
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used inside <SessionProvider>');
  return ctx;
}
