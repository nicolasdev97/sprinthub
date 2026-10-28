import '@testing-library/jest-dom';

// Polyfill or Mock BroadcastChannel for jsdom environment
if (typeof globalThis.BroadcastChannel === 'undefined') {
  class MockBroadcastChannel {
    name: string;
    onmessage: ((event: MessageEvent) => void) | null = null;
    onmessageerror: ((event: MessageEvent) => void) | null = null;

    constructor(name: string) {
      this.name = name;
    }

    postMessage(_data: unknown) {}
    close() {}
    addEventListener(_event: string, _callback: EventListenerOrEventListenerObject) {}
    removeEventListener(_event: string, _callback: EventListenerOrEventListenerObject) {}
    dispatchEvent(_event: Event): boolean {
      return true;
    }
  }

  globalThis.BroadcastChannel = MockBroadcastChannel as unknown as typeof BroadcastChannel;
}
