import { render, screen } from '@testing-library/react';
import { KanbanBoard } from '../src/components/KanbanBoard';

describe('KanbanBoard', () => {
  it('renders columns', () => {
    render(<KanbanBoard tasks={[]} />);
    expect(screen.getByText('To Do')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Done')).toBeInTheDocument();
  });
});
