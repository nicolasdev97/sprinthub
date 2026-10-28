import {
  hasClientSessionCookie,
  setClientSessionCookie,
  clearClientSessionCookie,
  SESSION_COOKIE_NAME,
} from '../session-cookie';

describe('session-cookie utilities', () => {
  beforeEach(() => {
    // Clear cookies before each test
    Object.defineProperty(document, 'cookie', {
      writable: true,
      value: '',
    });
  });

  it('should return false when session cookie is absent', () => {
    document.cookie = 'other_cookie=value; foo=bar';
    expect(hasClientSessionCookie()).toBe(false);
  });

  it('should return true when session cookie is present', () => {
    document.cookie = `${SESSION_COOKIE_NAME}=active; other_cookie=123`;
    expect(hasClientSessionCookie()).toBe(true);
  });

  it('should set the client session cookie with proper attributes', () => {
    setClientSessionCookie();
    expect(document.cookie).toContain(`${SESSION_COOKIE_NAME}=active`);
  });

  it('should clear the client session cookie with max-age=0', () => {
    document.cookie = `${SESSION_COOKIE_NAME}=active`;
    clearClientSessionCookie();
    expect(document.cookie).toContain('max-age=0');
  });
});

