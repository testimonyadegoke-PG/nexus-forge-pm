// Placeholder for frontend audit logging utility
// Connect this to backend audit API or Supabase function later

export function logAudit(action: string, entity: string, details?: Record<string, any>) {
  // TODO: Implement actual logging
  console.log(`[AUDIT] ${action} on ${entity}`, details);
}
