import { Flame } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher.jsx';

export default function TitleBar({ activeTheme, onThemeChange, projectName }) {
  return (
    <div className="title-bar">
      <div className="brand">
        <Flame size={15} color="var(--accent)" />
        CodeForge
        {projectName && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> — {projectName}</span>}
      </div>
      <div className="controls">
        <ThemeSwitcher activeTheme={activeTheme} onChange={onThemeChange} />
      </div>
    </div>
  );
}
