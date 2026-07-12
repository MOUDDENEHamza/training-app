import { Injectable, signal } from '@angular/core';

export interface TrackingEntry {
  done: boolean;
  actual?: string;
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
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, done: !current.done } }));
    safePersist(this.state());
  }

  setActual(key: string, actual: string): void {
    const current = this.entry(key);
    this.state.update((s) => ({ ...s, [key]: { ...current, actual } }));
    safePersist(this.state());
  }
}
