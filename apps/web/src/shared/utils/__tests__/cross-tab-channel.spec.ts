import { crossTabSync } from '../cross-tab-channel';

describe('crossTabSync manager', () => {
  it('should allow subscribing to and unsubscribing from cross-tab events', () => {
    const listener = jest.fn();
    const unsubscribe = crossTabSync.subscribe(listener);

    expect(typeof unsubscribe).toBe('function');

    // Manually trigger notification via notifyListeners method
    (
      crossTabSync as unknown as { notifyListeners: (msg: { type: string }) => void }
    ).notifyListeners({ type: 'AUTH_LOGOUT' });
    expect(listener).toHaveBeenCalledWith({ type: 'AUTH_LOGOUT' });

    unsubscribe();
    listener.mockClear();

    (
      crossTabSync as unknown as { notifyListeners: (msg: { type: string }) => void }
    ).notifyListeners({ type: 'AUTH_LOGOUT' });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should post messages without crashing when broadcast channel is active', () => {
    expect(() => {
      crossTabSync.postMessage({ type: 'AUTH_LOGOUT' });
    }).not.toThrow();
  });
});
