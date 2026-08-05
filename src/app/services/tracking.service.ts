import { Injectable, signal } from '@angular/core';

export interface TrackingEntry {
  done: boolean;
  actual?: string;
  reps?: number;
}

const STORAGE_KEY = 'training-app:tracking';

function safeLoad(): Record<string, TrackingEntry> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function safePersist(state: Record<string, TrackingEntry>): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage unavailable (e.g. private browsing) — keep in-memory only
  }
}

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private readonly state = signal<Record<string, TrackingEntry>>(safeLoad());

  entry(key: string): TrackingEntry {
    return this.state()[key] ?? { done: false };
  }

  toggleDone(key: string): void {
    this.setDone(key, !this.entry(key).done);
  }

  setDone(key: string, done: boolean): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, done } }));
    safePersist(this.state());
  }

  setReps(key: string, reps: number): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, reps } }));
    safePersist(this.state());
  }

  /**
   * Unticks every entry whose key starts with the prefix, in one write.
   * Recorded actuals and rep counts are left untouched — only `done` moves.
   */
  clearDone(keyPrefix: string): void {
    this.state.update((s) => {
      const next: Record<string, TrackingEntry> = { ...s };
      for (const key of Object.keys(next)) {
        if (key.startsWith(keyPrefix) && next[key].done) {
          next[key] = { ...next[key], done: false };
        }
      }
      return next;
    });
    safePersist(this.state());
  }

  setActual(key: string, actual: string): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, actual } }));
    safePersist(this.state());
  }
}
