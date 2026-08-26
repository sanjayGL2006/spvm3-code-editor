import MonacoEditor from '@monaco-editor/react';
import { X, FileCode, Play, Sparkles, FolderOpen, AlertCircle } from 'lucide-react';
import { themes } from '../themes/themes.js';

const EXT_TO_LANG = {
  // Web & React
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  html: 'html', htm: 'html', css: 'css', scss: 'scss', less: 'less',
  svg: 'xml', xml: 'xml', json: 'json', jsonc: 'json',
  
  // High Level & OOP Languages
  py: 'python', pyw: 'python', java: 'java', jav: 'java',
  cs: 'csharp', csx: 'csharp', c: 'c', cpp: 'cpp', cxx: 'cpp', cc: 'cpp',
  h: 'c', hpp: 'cpp', hxx: 'cpp', php: 'php', rb: 'ruby',
  go: 'go', rs: 'rust', swift: 'swift', kt: 'kotlin', kts: 'kotlin',
  
  // Data, Config & Documentation
  md: 'markdown', markdown: 'markdown', mdown: 'markdown',
  txt: 'plaintext', text: 'plaintext', log: 'plaintext', env: 'plaintext',
  yml: 'yaml', yaml: 'yaml', ini: 'ini', conf: 'ini', toml: 'ini',
  dockerfile: 'dockerfile', makefile: 'makefile',
  
  // Shell & Query
  sh: 'shell', bash: 'shell', zsh: 'shell', ps1: 'powershell', bat: 'bat', cmd: 'bat',
  sql: 'sql'
};

function langFor(fileName) {
  if (!fileName) return 'plaintext';
  const basename = fileName.toLowerCase();
  if (basename === 'dockerfile') return 'dockerfile';
  if (basename === 'makefile') return 'makefile';
  const parts = fileName.split('.');
  if (parts.length === 1) return 'plaintext';
  const ext = parts.pop().toLowerCase();
  return EXT_TO_LANG[ext] || 'plaintext';
}

export default function EditorWorkspace({
  openTabs,
  activeTab,
  activeTheme,
  onSelectTab,
  onCloseTab,
  onChange,
  onRunCode,
  onOpenFolder,
  onToggleAgent,
  diagnosticsError
}) {
  const monacoBase = themes[activeTheme]?.monacoBase || 'vs-dark';
  const activeFile = openTabs.find((t) => t.path === activeTab);

  return (
    <div className="editor-workspace">
      <div className="tab-bar">
        {openTabs.map((tab) => {
          const isActive = tab.path === activeTab;
          return (
            <div
              key={tab.path}
              className={`tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.path)}
            >
              <FileCode size={13} className="tab-icon" />
              <span className="tab-name">{tab.name}</span>
              {tab.dirty && <span className="dirty-dot">●</span>}
              <button
                className="close-tab-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.path);
                }}
              >
                <X size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {activeFile ? (
        <div className="editor-container">
          <div className="breadcrumbs-bar">
            <FileCode size={12} />
            <span className="breadcrumb-path">{activeFile.path}</span>
            <span className="lang-badge">{langFor(activeFile.name).toUpperCase()}</span>
          </div>

          <MonacoEditor
            key={activeFile.path}
            height="100%"
            theme={monacoBase}
            language={langFor(activeFile.name)}
            value={activeFile.content}
            onChange={(value) => onChange(activeFile.path, value ?? '')}
            options={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: 13,
              minimap: { enabled: true },
              smoothScrolling: true,
              padding: { top: 12 },
              automaticLayout: true,
              scrollBeyondLastLine: false,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on'
            }}
          />

          {diagnosticsError && (
            <div className="error-banner">
              <AlertCircle size={14} color="var(--danger)" />
              <span>{diagnosticsError.message || diagnosticsError.explanation}</span>
              <button className="banner-fix-btn" onClick={onToggleAgent}>
                <Sparkles size={12} /> Explain & Fix with AI
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="editor-empty-splash">
          <div className="splash-card">
            <div className="splash-logo">SPVM3</div>
            <h2>SPVM3 Code Editor</h2>
            <p>Local-First Desktop IDE & Interactive AI Development Platform</p>

            <div className="splash-actions">
              <button className="splash-btn primary" onClick={onOpenFolder}>
                <FolderOpen size={16} /> Open Folder
              </button>
              <button className="splash-btn secondary" onClick={onToggleAgent}>
                <Sparkles size={16} /> Open SPVM3 AI Agent
              </button>
            </div>

            <div className="splash-shortcuts">
              <div><kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> Command Palette</div>
              <div><kbd>Ctrl</kbd> + <kbd>S</kbd> Save File</div>
              <div><kbd>F5</kbd> / <kbd>Ctrl</kbd> + <kbd>R</kbd> Run Code</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
