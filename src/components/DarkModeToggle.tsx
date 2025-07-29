import React from 'react';

export function DarkModeToggle() {
  // Simple toggle using localStorage and document.documentElement.classList
  const [dark, setDark] = React.useState(
    () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      || localStorage.getItem('theme') === 'dark'
  );

  React.useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="ml-2 px-2 py-1 rounded border bg-gray-200 dark:bg-gray-800 dark:text-gray-100"
      onClick={() => setDark(d => !d)}
      type="button"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  );
}
