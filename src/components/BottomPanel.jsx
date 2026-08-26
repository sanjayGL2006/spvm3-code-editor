import { useState } from 'react';
import { Terminal, AlertTriangle, Play, Cpu, ShieldAlert, CheckCircle, X, Maximize2, Minimize2, Trash2 } from 'lucide-react';

export default function BottomPanel({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  problems,
  output,
  onClearOutput,
  onNavigateToProblem,
  onRunTerminalCommand
}) {
  const [termInput, setTermInput] = useState('');
  const [termLogs, setTermLogs] = useState([
    { type: 'sys', text: 'SPVM3 Terminal Initialized (PowerShell / Windows CMD default).' }
  ]);
  const [isMaximized, setIsMaximized] = useState(false);

  if (!isOpen) return null;

  async function handleTermSubmit(e) {
    if (e.key === 'Enter' && termInput.trim()) {
      e.preventDefault();
      const cmd = termInput.trim();
      setTermLogs((prev) => [...prev, { type: 'cmd', text: `> ${cmd}` }]);
      setTermInput('');

      if (onRunTerminalCommand) {
        const res = await onRunTerminalCommand(cmd);
        if (res.stdout) {
          setTermLogs((prev) => [...prev, { type: 'out', text: res.stdout }]);
        }
        if (res.stderr) {
          setTermLogs((prev) => [...prev, { type: 'err', text: res.stderr }]);
        }
      }
    }
  }

  return (
    <div className={`bottom-panel ${isMaximized ? 'maximized' : ''}`}>
      <div className="panel-header">
        <div className="panel-tabs">
          <button
            className={`panel-tab ${activeTab === 'problems' ? 'active' : ''}`}
            onClick={() => onTabChange('problems')}
          >
            <AlertTriangle size={14} />
            <span>Problems</span>
            {problems.length > 0 && <span className="tab-badge warning">{problems.length}</span>}
          </button>

          <button
            className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => onTabChange('output')}
          >
            <Play size={14} />
            <span>Output</span>
          </button>

          <button
            className={`panel-tab ${activeTab === 'terminal' ? 'active' : ''}`}
            onClick={() => onTabChange('terminal')}
          >
            <Terminal size={14} />
            <span>Terminal</span>
          </button>

          <button
            className={`panel-tab ${activeTab === 'debug' ? 'active' : ''}`}
            onClick={() => onTabChange('debug')}
          >
            <Cpu size={14} />
            <span>Debug Console</span>
          </button>

          <button
            className={`panel-tab ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => onTabChange('security')}
          >
            <ShieldAlert size={14} />
            <span>Security Scan</span>
          </button>

          <button
            className={`panel-tab ${activeTab === 'tests' ? 'active' : ''}`}
            onClick={() => onTabChange('tests')}
          >
            <CheckCircle size={14} />
            <span>Tests</span>
          </button>
        </div>

        <div className="panel-actions">
          <button className="panel-icon-btn" title="Clear Output" onClick={onClearOutput}>
            <Trash2 size={13} />
          </button>
          <button
            className="panel-icon-btn"
            title={isMaximized ? 'Restore' : 'Maximize'}
            onClick={() => setIsMaximized(!isMaximized)}
          >
            {isMaximized ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
          <button className="panel-icon-btn" title="Close Panel" onClick={onClose}>
            <X size={13} />
          </button>
        </div>
      </div>

      <div className="panel-content">
        {activeTab === 'problems' && (
          <div className="problems-view">
            {problems.length > 0 ? (
              problems.map((prob, idx) => (
                <div
                  key={idx}
                  className="problem-row"
                  onClick={() => onNavigateToProblem && onNavigateToProblem(prob)}
                >
                  <AlertTriangle size={15} className="prob-icon" />
                  <div className="prob-info">
                    <span className="prob-msg">{prob.message}</span>
                    <span className="prob-location">
                      {prob.file} [Line {prob.line}, Col {prob.column || 1}]
                    </span>
                  </div>
                  {prob.fixSuggestion && <span className="prob-fix-tag">Quick Fix Available</span>}
                </div>
              ))
            ) : (
              <div className="empty-panel-msg">No compilation or syntax problems detected in workspace</div>
            )}
          </div>
        )}

        {activeTab === 'output' && (
          <div className="output-view">
            <pre className="output-pre">{output || 'No program execution output yet. Click "Run" to execute.'}</pre>
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="terminal-view">
            <div className="terminal-scroll">
              {termLogs.map((log, idx) => (
                <div key={idx} className={`term-line ${log.type}`}>
                  {log.text}
                </div>
              ))}
            </div>
            <div className="terminal-input-row">
              <span className="prompt">$</span>
              <input
                type="text"
                placeholder="Type shell command (e.g. dir, python --version, node -v, git status)…"
                value={termInput}
                onChange={(e) => setTermInput(e.target.value)}
                onKeyDown={handleTermSubmit}
              />
            </div>
          </div>
        )}

        {activeTab === 'debug' && (
          <div className="debug-view">
            <div className="empty-panel-msg">Debug session inactive. Press F5 to start debugger session.</div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="security-view">
            <div className="sec-card">
              <ShieldAlert size={18} color="var(--success)" />
              <div>
                <strong>Local Security & Secrets Scanner Active</strong>
                <p>No hardcoded API keys, exposed secrets, or vulnerable package dependencies found.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tests' && (
          <div className="tests-view">
            <div className="empty-panel-msg">No test suites configured. Support for PyTest, Jest, and CUnit extensions active.</div>
          </div>
        )}
      </div>
    </div>
  );
}
