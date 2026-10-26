/**
 * Cross-Tab Communication Channel
 *
 * Uses the native BroadcastChannel API (supported in all modern browsers)
 * with a fallback to localStorage events for older/restricted environments.
 * Allows instant synchronization between different tabs of the same origin.
 */

import { AuthUser } from '@/features/auth/types';

export type CrossTabEvent =
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_LOGIN'; user: AuthUser }
  | { type: 'AUTH_USER_UPDATED'; user: AuthUser }
  | { type: 'QUERY_INVALIDATE'; queryKeys: string[][] };

const CHANNEL_NAME = 'sprinthub:cross-tab';
const STORAGE_FALLBACK_KEY = 'sprinthub:cross-tab-fallback';

type CrossTabListener = (event: CrossTabEvent) => void;

class CrossTabSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners = new Set<CrossTabListener>();

  constructor() {
    if (typeof window !== 'undefined') {
      if ('BroadcastChannel' in window) {
        try {
          this.channel = new BroadcastChannel(CHANNEL_NAME);
          this.channel.onmessage = (event: MessageEvent<CrossTabEvent>) => {
            if (event.data && typeof event.data === 'object' && 'type' in event.data) {
              this.notifyListeners(event.data);
            }
          };
        } catch {
          this.channel = null;
        }
      }

      // Storage event listener as fallback / redundancy
      window.addEventListener('storage', (event) => {
        if (event.key === STORAGE_FALLBACK_KEY && event.newValue) {
          try {
            const data = JSON.parse(event.newValue) as CrossTabEvent;
            this.notifyListeners(data);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  private notifyListeners(event: CrossTabEvent) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('[CrossTabSync] Error in listener:', err);
      }
    });
  }

  /**
   * Broadcast an event to all other open tabs of SprintHub.
   */
  public postMessage(event: CrossTabEvent): void {
    if (this.channel) {
      try {
        this.channel.postMessage(event);
      } catch {
        // BroadcastChannel failed, fallback to storage
      }
    }

    if (typeof window !== 'undefined') {
      try {
        // Writing to localStorage triggers the 'storage' event in other tabs
        window.localStorage.setItem(STORAGE_FALLBACK_KEY, JSON.stringify({ ...event, _t: Date.now() }));
      } catch {
        // Ignore quota or restricted storage errors
      }
    }
  }

  /**
   * Subscribe to events broadcast from other tabs.
   */
  public subscribe(listener: CrossTabListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const crossTabSync = new CrossTabSyncManager();

