import { useState, useEffect, useRef } from 'react';
import { Search, Play, FileCode, Sparkles, Terminal, Settings, RefreshCw, FolderOpen } from 'lucide-react';

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenFolder,
  onNewFile,
  onSaveFile,
  onRunCode,
  onTogglePanel,
  onToggleAgent,
  onThemeChange,
  onDiagnose
}) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const commands = [
    { id: 'run', label: 'Run: Run Current File', category: 'Run', icon: Play, action: onRunCode },
    { id: 'open-folder', label: 'File: Open Folder…', category: 'File', icon: FolderOpen, action: onOpenFolder },
    { id: 'new-file', label: 'File: New File', category: 'File', icon: FileCode, action: onNewFile },
    { id: 'save-file', label: 'File: Save Current File', category: 'File', icon: FileCode, action: onSaveFile },
    { id: 'toggle-agent', label: 'View: Toggle AI Agent Panel', category: 'AI', icon: Sparkles, action: onToggleAgent },
    { id: 'toggle-panel', label: 'View: Toggle Bottom Terminal Panel', category: 'View', icon: Terminal, action: onTogglePanel },
    { id: 'theme-ember', label: 'Preferences: Switch to Ember Dark Theme', category: 'Theme', icon: Settings, action: () => onThemeChange('ember') },
    { id: 'theme-cyberpunk', label: 'Preferences: Switch to Cyberpunk Neon Theme', category: 'Theme', icon: Settings, action: () => onThemeChange('cyberpunk') },
    { id: 'theme-obsidian', label: 'Preferences: Switch to Obsidian Jet Theme', category: 'Theme', icon: Settings, action: () => onThemeChange('obsidian') },
    { id: 'theme-nightshade', label: 'Preferences: Switch to Nightshade Violet Theme', category: 'Theme', icon: Settings, action: () => onThemeChange('nightshade') },
    { id: 'theme-glacier', label: 'Preferences: Switch to Glacier Light Theme', category: 'Theme', icon: Settings, action: () => onThemeChange('glacier') },
    { id: 'diagnose', label: 'Help: Diagnose SPVM3 Environment Tools', category: 'Help', icon: RefreshCw, action: onDiagnose }
  ];

  const filtered = commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="command-palette-backdrop" onClick={onClose}>
      <div className="command-palette-modal" onClick={(e) => e.stopPropagation()}>
        <div className="palette-input-row">
          <Search size={18} className="search-icon" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search actions… (e.g. Run, Theme, Open)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
            }}
          />
          <kbd className="esc-kbd">ESC</kbd>
        </div>

        <div className="palette-list">
          {filtered.length > 0 ? (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  className="palette-item"
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                >
                  <Icon size={16} className="item-icon" />
                  <span className="item-label">{cmd.label}</span>
                  <span className="item-cat">{cmd.category}</span>
                </button>
              );
            })
          ) : (
            <div className="palette-empty">No matching SPVM3 commands found</div>
          )}
        </div>
      </div>
    </div>
  );
}
