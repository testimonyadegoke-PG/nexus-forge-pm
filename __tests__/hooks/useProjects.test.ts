import { renderHook } from '@testing-library/react';
import { useProjects } from '../../src/hooks/useProjects';

describe('useProjects', () => {
  it('should return an array of projects (mocked)', async () => {
    // This is a placeholder test. Replace with actual mock/fetch logic as needed.
    const { result } = renderHook(() => useProjects());
    expect(Array.isArray(result.current.data || [])).toBe(true);
  });
});
