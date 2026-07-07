import { render, screen } from '@testing-library/react';
import ExamPage from './page';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test' }, loading: false }),
}));

describe('ExamPage', () => {
  it('renders start screen when exam not started', () => {
    render(<ExamPage />);
    expect(screen.getByText(/start exam/i)).toBeInTheDocument();
  });

  it('shows proctoring warning text', () => {
    render(<ExamPage />);
    expect(screen.getAllByText(/ai proctoring/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/violations/i)).toBeInTheDocument();
  });
});
