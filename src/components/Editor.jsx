import MonacoEditor from '@monaco-editor/react';
import { X, FileCode2 } from 'lucide-react';
import { themes } from '../themes/themes.js';

const EXT_TO_LANG = {
  js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', rb: 'ruby', go: 'go', rs: 'rust', java: 'java',
  c: 'c', cpp: 'cpp', h: 'c', cs: 'csharp', php: 'php',
  html: 'html', css: 'css', scss: 'scss', json: 'json',
  md: 'markdown', yml: 'yaml', yaml: 'yaml', sh: 'shell', sql: 'sql'
};

function langFor(fileName) {
  const ext = fileName.split('.').pop();
  return EXT_TO_LANG[ext] || 'plaintext';
}

export default function Editor({ openTabs, activeTab, activeTheme, onSelectTab, onCloseTab, onChange }) {
  const monacoBase = themes[activeTheme].monacoBase;
  const active = openTabs.find((t) => t.path === activeTab);

  return (
    <div className="editor-area">
      <div className="tab-bar">
        {openTabs.map((tab) => (
          <div
            key={tab.path}
            className={`tab ${tab.path === activeTab ? 'active' : ''}`}
            onClick={() => onSelectTab(tab.path)}
          >
            <FileCode2 size={13} />
            {tab.name}
            {tab.dirty && <span style={{ color: 'var(--accent)' }}>●</span>}
            <span
              className="close-btn"
              onClick={(e) => {
                e.stopPropagation();
                onCloseTab(tab.path);
              }}
            >
              <X size={12} />
            </span>
          </div>
        ))}
      </div>

      {active ? (
        <MonacoEditor
          key={active.path}
          height="100%"
          theme={monacoBase}
          language={langFor(active.name)}
          value={active.content}
          onChange={(value) => onChange(active.path, value ?? '')}
          loading={
            <div className="monaco-loading-indicator">
              <div className="monaco-spinner" />
              <span>Loading Editor…</span>
            </div>
          }
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: 13,
            minimap: { enabled: true },
            smoothScrolling: true,
            padding: { top: 12 },
            automaticLayout: true
          }}
        />
      ) : (
        <div className="editor-empty">
          <FileCode2 size={32} color="var(--text-muted)" />
          Open a file to start editing
        </div>
      )}
    </div>
  );
}
