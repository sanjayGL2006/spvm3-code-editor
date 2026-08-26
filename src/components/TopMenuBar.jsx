import { useState, useRef, useEffect } from 'react';
import { Sparkles, Terminal, Play, Settings, Command } from 'lucide-react';

export default function TopMenuBar({
  projectName,
  onOpenFolder,
  onNewFile,
  onSaveFile,
  onRunCode,
  onToggleCommandPalette,
  onTogglePanel,
  onToggleAgent,
  activeTheme,
  onThemeChange
}) {
  const [activeMenu, setActiveMenu] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    }
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menus = [
    {
      label: 'File',
      items: [
        { label: 'New File', shortcut: 'Ctrl+N', action: onNewFile },
        { label: 'Open Folder…', shortcut: 'Ctrl+O', action: onOpenFolder },
        { label: 'Save', shortcut: 'Ctrl+S', action: onSaveFile },
        { type: 'divider' },
        { label: 'Exit SPVM3', shortcut: 'Alt+F4', action: () => window.close() }
      ]
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z' },
        { label: 'Redo', shortcut: 'Ctrl+Y' },
        { type: 'divider' },
        { label: 'Cut', shortcut: 'Ctrl+X' },
        { label: 'Copy', shortcut: 'Ctrl+C' },
        { label: 'Paste', shortcut: 'Ctrl+V' },
        { label: 'Select All', shortcut: 'Ctrl+A' }
      ]
    },
    {
      label: 'View',
      items: [
        { label: 'Toggle Command Palette', shortcut: 'Ctrl+Shift+P', action: onToggleCommandPalette },
        { label: 'Toggle Bottom Panel', shortcut: 'Ctrl+`', action: onTogglePanel },
        { label: 'Toggle AI Agent Panel', shortcut: 'Ctrl+Alt+A', action: onToggleAgent }
      ]
    },
    {
      label: 'Run',
      items: [
        { label: 'Run Current File', shortcut: 'F5 / Ctrl+R', action: onRunCode }
      ]
    },
    {
      label: 'Help',
      items: [
        { label: 'SPVM3 Product Vision & Docs' },
        { label: 'Check System Diagnostics', action: onToggleCommandPalette },
        { label: 'About SPVM3 Code Editor' }
      ]
    }
  ];

  return (
    <div className="top-menu-bar" ref={menuRef}>
      <div className="brand-logo">
        <Sparkles size={16} className="brand-icon" />
        <span className="brand-title">SPVM3</span>
        <span className="brand-badge">PROD V1</span>
      </div>

      <div className="menu-items">
        {menus.map((m) => (
          <div key={m.label} className="menu-item-wrap">
            <button
              className={`menu-btn ${activeMenu === m.label ? 'active' : ''}`}
              onClick={() => setActiveMenu(activeMenu === m.label ? null : m.label)}
            >
              {m.label}
            </button>
            {activeMenu === m.label && (
              <div className="menu-dropdown">
                {m.items.map((item, idx) =>
                  item.type === 'divider' ? (
                    <div key={idx} className="menu-divider" />
                  ) : (
                    <button
                      key={item.label}
                      className="menu-dropdown-item"
                      onClick={() => {
                        setActiveMenu(null);
                        if (item.action) item.action();
                      }}
                    >
                      <span>{item.label}</span>
                      {item.shortcut && <span className="shortcut">{item.shortcut}</span>}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="title-center">
        {projectName ? (
          <span className="project-tag">
            Workspace: <strong>{projectName}</strong>
          </span>
        ) : (
          <span className="project-tag muted">No Folder Opened</span>
        )}
      </div>

      <div className="top-actions">
        <button className="icon-action-btn" title="Command Palette (Ctrl+Shift+P)" onClick={onToggleCommandPalette}>
          <Command size={14} />
        </button>
        <button className="icon-action-btn run-btn" title="Run Current File (Ctrl+R)" onClick={onRunCode}>
          <Play size={14} />
          <span>Run</span>
        </button>
        <button className="icon-action-btn" title="Toggle AI Agent" onClick={onToggleAgent}>
          <Sparkles size={14} />
        </button>
        <button className="icon-action-btn" title="Toggle Terminal Panel" onClick={onTogglePanel}>
          <Terminal size={14} />
        </button>
      </div>
    </div>
  );
}
