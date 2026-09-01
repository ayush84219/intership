import React, { useEffect, useState } from 'react';
import { Moon, Sun, Eye } from 'lucide-react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('portal_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('portal_theme', theme);
  }, [theme]);

  return (
    <div className="theme-switch-container" title="Select Visual Theme">
      <button
        type="button"
        className={`theme-switch-btn ${theme === 'dark' ? 'active' : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark Mode (Sleek Contrast)"
      >
        <Moon size={14} />
        <span>Dark</span>
      </button>

      <button
        type="button"
        className={`theme-switch-btn ${theme === 'light' ? 'active' : ''}`}
        onClick={() => setTheme('light')}
        title="Light Mode (Crisp & Bright)"
      >
        <Sun size={14} />
        <span>Light</span>
      </button>

      <button
        type="button"
        className={`theme-switch-btn ${theme === 'comfort' ? 'active' : ''}`}
        onClick={() => setTheme('comfort')}
        title="Eye Comfort Mode (Warm Amber / Blue Light Filter)"
      >
        <Eye size={14} />
        <span>Comfort</span>
      </button>
    </div>
  );
}
