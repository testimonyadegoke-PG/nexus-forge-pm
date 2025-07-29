import { render, screen } from '@testing-library/react';
import { DashboardWidgets } from '../src/components/DashboardWidgets';

describe('DashboardWidgets', () => {
  it('renders widget labels and values', () => {
    render(<DashboardWidgets widgets={[{ id: '1', label: 'Projects', value: 5 }]} />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });
});
