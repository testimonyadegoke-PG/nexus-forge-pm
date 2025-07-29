import { renderHook } from '@testing-library/react';
import { useFeatureFlag } from '../src/utils/useFeatureFlag';

describe('useFeatureFlag', () => {
  it('always returns true for demo', () => {
    const { result } = renderHook(() => useFeatureFlag('any'));
    expect(result.current).toBe(true);
  });
});
