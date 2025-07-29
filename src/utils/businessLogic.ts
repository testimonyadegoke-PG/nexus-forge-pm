// Centralized business logic for Nexus Forge PPM
// Move calculations here for consistency and security

/**
 * Calculate project progress (example: based on completed tasks)
 */
export function calculateProjectProgress(tasks: { status: string }[]): number {
  if (!tasks.length) return 0;
  const completed = tasks.filter(t => t.status === 'completed').length;
  return Math.round((completed / tasks.length) * 100);
}

/**
 * Detect budget overrun (example logic)
 */
export function isBudgetOverrun(budget: number, spent: number): boolean {
  return spent > budget;
}
