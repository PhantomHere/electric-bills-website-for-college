import { Result } from './types';

export function ok<T = undefined>(value?: T): Result<T> {
  return { ok: true, value };
}

export function fail<T = undefined>(error: string): Result<T> {
  return { ok: false, error };
}
