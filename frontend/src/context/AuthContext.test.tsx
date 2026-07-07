import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';
import { ReactNode } from 'react';

const mockUser = { id: '1', email: 'a@b.com', mobile: '9999999999', name: 'Test', role: 'user' };
const mockToken = 'test-token';

beforeEach(() => {
  window.localStorage.clear();
  global.fetch = vi.fn();
});

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

function renderWithProvider(children: ReactNode) {
  return render(<AuthProvider>{children}</AuthProvider>);
}

describe('AuthContext', () => {
  it('resolves without token', async () => {
    renderWithProvider(<TestConsumer />);
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

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
