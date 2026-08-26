import { useState, useRef, useEffect } from 'react';
import { Palette } from 'lucide-react';
import { themes } from '../themes/themes.js';

export default function ThemeSwitcher({ activeTheme, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="theme-switcher" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          borderRadius: 6,
          padding: '5px 8px',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12
        }}
      >
        <Palette size={13} />
        {themes[activeTheme].label}
      </button>
      {open && (
        <div className="theme-menu">
          {Object.entries(themes).map(([key, theme]) => (
            <div
              key={key}
              className="theme-option"
              onClick={() => {
                onChange(key);
                setOpen(false);
              }}
            >
              <span className="theme-swatch" style={{ background: theme.tokens['--accent'] }} />
              <span className="theme-option-text">
                <strong>{theme.label}</strong>
                <span>{theme.description}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
