// ── Imports ──

import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

// ── Test Fixtures ──

const mockUser = { id: '1', email: 'a@b.com', mobile: '9999999999', name: 'Test', role: 'user' };
const mockToken = 'test-token';

// ── Setup ──
// Clear any leftover state before each test so every run starts with a clean localStorage and a fresh fetch mock.
beforeEach(() => {
  window.localStorage.clear();
  global.fetch = vi.fn();
});

// ── Test Helper ──
// A lightweight component that reads the auth context and exposes values via data-testid attributes.
// This lets us assert on loading / user / token without coupling to real UI.
function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="loading">{auth.loading ? 'true' : 'false'}</span>
      <span data-testid="user">{auth.user?.name ?? 'null'}</span>
      <span data-testid="token">{auth.token ?? 'null'}</span>
    </div>
  );
}

// Wraps any component tree inside the real AuthProvider so tests exercise the same logic production uses.
function renderWithProvider(children: ReactNode) {
  return render(<AuthProvider>{children}</AuthProvider>);
}

// ── Tests ──

describe('AuthContext', () => {
  // 1. When no token exists in localStorage, the provider should resolve immediately
  //    with loading=false and user=null — no network call is made.
  it('resolves without token', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  // 2. When a valid token is in storage, the provider fetches /auth/me,
  //    populates user state, and sets loading to false.
  it('loads user from token in localStorage', async () => {
    window.localStorage.setItem('token', mockToken);
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ user: mockUser }),
    });
    renderWithProvider(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('Test');
    expect(screen.getByTestId('token').textContent).toBe(mockToken);
  });

  // 3. When the stored token is rejected by the server (expired / forged),
  //    the provider must strip it from localStorage and fall back to the unauthenticated state.
  it('clears invalid token from localStorage', async () => {
    window.localStorage.setItem('token', 'bad-token');
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Unauthorized' }),
    });
    renderWithProvider(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('null');
    expect(window.localStorage.getItem('token')).toBeNull();
  });
});
