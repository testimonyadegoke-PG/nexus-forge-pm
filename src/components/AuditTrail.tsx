import React from 'react';

export interface AuditTrailProps {
  entries?: { id: string; action: string; user: string; timestamp: string }[];
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ entries = [] }) => {
  return (
    <div className="border rounded p-4 bg-gray-50 mt-6">
      <h3 className="font-bold mb-2">Audit Trail (Coming Soon)</h3>
      <div className="text-muted-foreground text-sm mb-2">See all important actions and changes for this record.</div>
      <ul className="space-y-1">
        {entries.length === 0 ? (
          <li className="text-xs text-muted-foreground">No audit entries yet.</li>
        ) : (
          entries.map(e => (
            <li key={e.id} className="text-xs">
              <span className="font-semibold">{e.user}</span> {e.action} <span className="text-muted-foreground">{e.timestamp}</span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};
