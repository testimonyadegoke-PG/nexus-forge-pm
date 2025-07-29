import { useMemo } from 'react';

export function useFeatureFlag(flag: string): boolean {
  // Placeholder: always returns true for demo
  return useMemo(() => true, [flag]);
}
