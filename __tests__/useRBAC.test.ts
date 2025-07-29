import { renderHook } from '@testing-library/react';
import { useRBAC } from '../src/utils/useRBAC';

describe('useRBAC', () => {
  it('returns correct permissions for admin', () => {
    const { result } = renderHook(() => useRBAC('admin'));
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canDelete).toBe(true);
    expect(result.current.canView).toBe(true);
  });
  it('returns correct permissions for user', () => {
    const { result } = renderHook(() => useRBAC('user'));
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canDelete).toBe(false);
    expect(result.current.canView).toBe(true);
  });
});
