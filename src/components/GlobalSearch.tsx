import React from 'react';

export function GlobalSearch() {
  return (
    <div className="flex items-center gap-2 w-full max-w-lg mx-auto my-4">
      <input
        type="text"
        className="w-full px-3 py-2 border rounded"
        placeholder="Search projects, tasks, users... (Coming soon)"
        aria-label="Global Search"
        disabled
      />
      <button className="px-3 py-2 bg-gray-300 rounded text-gray-700" disabled>
        🔍
      </button>
    </div>
  );
}
