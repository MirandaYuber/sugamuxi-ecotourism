import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

const THEME_KEY = 'sugamuxi-theme';

export function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  return <button type="button" onClick={() => setDarkMode((current) => !current)} className="flex h-10 w-10 items-center justify-center rounded-full border border-green-800/15 bg-white text-green-900 transition hover:border-green-800/40 hover:bg-green-50 dark:border-white/15 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800" aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'} title={darkMode ? 'Modo claro' : 'Modo oscuro'}>
    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
  </button>;
}
