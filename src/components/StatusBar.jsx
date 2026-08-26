import { GitBranch, AlertTriangle, Cpu, Sparkles, Check } from 'lucide-react';

export default function StatusBar({
  ollamaRunning,
  activeFile,
  problemsCount,
  diagnostics,
  onTogglePanel,
  onToggleAgent
}) {
  const lang = activeFile ? activeFile.name.split('.').pop().toUpperCase() : 'PLAIN TEXT';

  return (
    <div className="status-bar">
      <div className="status-left">
        <button className="status-item git-item" title="Git Branch">
          <GitBranch size={13} />
          <span>main</span>
        </button>

        <button className="status-item prob-item" title="Toggle Problems Panel" onClick={onTogglePanel}>
          <AlertTriangle size={13} color={problemsCount > 0 ? 'var(--danger)' : 'var(--text-muted)'} />
          <span>{problemsCount} Problems</span>
        </button>

        {diagnostics && (
          <span className="status-item muted-item">
            <Cpu size={12} />
            <span>Python {diagnostics.python !== 'Not Found' ? '3' : 'N/A'} | GCC {diagnostics.gcc !== 'Not Found' ? 'Ready' : 'N/A'}</span>
          </span>
        )}
      </div>

      <div className="status-right">
        <button className="status-item ai-status" onClick={onToggleAgent}>
          <Sparkles size={13} color={ollamaRunning ? 'var(--success)' : 'var(--text-muted)'} />
          <span>{ollamaRunning ? 'Ollama AI Ready' : 'AI Offline (Local Mode)'}</span>
        </button>

        <span className="status-item">UTF-8</span>
        <span className="status-item">Spaces: 4</span>
        <span className="status-item lang-tag">{lang}</span>
      </div>
    </div>
  );
}
