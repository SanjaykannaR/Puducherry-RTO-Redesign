import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Ravi' }, loading: false }),
}));

describe('DashboardPage', () => {
  it('renders welcome message with user name', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/welcome.*ravi/i)).toBeInTheDocument();
  });

  it('renders all dashboard links', () => {
    render(<DashboardPage />);
    expect(screen.getByText('My Vehicles')).toBeInTheDocument();
    expect(screen.getByText('My Licenses')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Applications')).toBeInTheDocument();
    expect(screen.getByText('Challans')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });

  it('renders Sign Out button', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Sign Out')).toBeInTheDocument();
  });
});
