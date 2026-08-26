import { useState, useEffect, useCallback } from 'react';
import TopMenuBar from './components/TopMenuBar.jsx';
import ActivityBar from './components/ActivityBar.jsx';
import Sidebar from './components/Sidebar.jsx';
import EditorWorkspace from './components/EditorWorkspace.jsx';
import AIAgentPanel from './components/AIAgentPanel.jsx';
import VisualizerPanel from './components/VisualizerPanel.jsx';
import BottomPanel from './components/BottomPanel.jsx';
import StatusBar from './components/StatusBar.jsx';
import CommandPalette from './components/CommandPalette.jsx';
import { applyTheme } from './themes/themes.js';
import { runCode } from './services/codeRunner.js';
import { ragIndexer } from './services/ragIndexer.js';

export default function App() {
  const [activeTheme, setActiveTheme] = useState('ember');
  const [activeView, setActiveView] = useState('explorer'); // 'explorer' | 'search' | 'git' | 'runner' | 'visualizer' | 'extensions' | 'docker' | 'testing' | 'database' | 'workspace' | 'settings'
  const [agentOpen, setAgentOpen] = useState(false);

  // Workspace & Files
  const [projectRoot, setProjectRoot] = useState(null);
  const [tree, setTree] = useState([]);
  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  // Bottom Panel State
  const [panelOpen, setPanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState('output'); // 'problems' | 'output' | 'terminal' | 'debug' | 'security' | 'tests'
  const [outputLog, setOutputLog] = useState('');
  const [problems, setProblems] = useState([]);

  // Command Palette & Diagnostics
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [ollamaRunning, setOllamaRunning] = useState(false);
  const [systemDiagnostics, setSystemDiagnostics] = useState(null);

  useEffect(() => {
    applyTheme(activeTheme);
  }, [activeTheme]);

  // Initial toolchain diagnostics & Ollama status check
  useEffect(() => {
    let mounted = true;
    if (window.spvm3) {
      window.spvm3.getOllamaStatus().then((s) => mounted && setOllamaRunning(s.running));
      window.spvm3.diagnoseSystem().then((diag) => mounted && setSystemDiagnostics(diag));
    }
    const interval = setInterval(() => {
      if (window.spvm3) {
        window.spvm3.getOllamaStatus().then((s) => mounted && setOllamaRunning(s.running));
      }
    }, 6000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Index workspace whenever project tree changes
  useEffect(() => {
    if (tree && tree.length > 0) {
      ragIndexer.scanWorkspace(tree);
    }
  }, [tree]);

  // Workspace File Handlers
  const handleOpenProject = useCallback(async () => {
    if (!window.spvm3) return;
    const result = await window.spvm3.openProject();
    if (!result) return;
    setProjectRoot(result.root);
    setTree(result.tree);
  }, []);

  const handleRefreshProject = useCallback(async () => {
    if (!window.spvm3) return;
    const result = await window.spvm3.refreshProject();
    if (result) setTree(result.tree);
  }, []);

  const handleFileClick = useCallback(
    async (node) => {
      const existing = openTabs.find((t) => t.path === node.path);
      if (existing) {
        setActiveTab(node.path);
        return;
      }
      try {
        const content = await window.spvm3.readFile(node.path);
        setOpenTabs((prev) => [...prev, { path: node.path, name: node.name, content, dirty: false }]);
        setActiveTab(node.path);
      } catch (err) {
        console.error('Failed to open file:', node.path, err);
      }
    },
    [openTabs]
  );

  const handleCreateFile = useCallback(
    async (dirPath, isDir) => {
      if (!window.spvm3) return;
      const targetDir = dirPath || projectRoot;
      if (!targetDir) return;
      const name = prompt(isDir ? 'Enter new folder name:' : 'Enter new file name:');
      if (!name) return;
      await window.spvm3.createFile(targetDir, name, isDir);
      handleRefreshProject();
    },
    [projectRoot, handleRefreshProject]
  );

  const handleDeleteFile = useCallback(
    async (filePath) => {
      if (!window.spvm3) return;
      if (!confirm(`Are you sure you want to delete ${filePath}?`)) return;
      await window.spvm3.deleteFile(filePath);
      setOpenTabs((prev) => prev.filter((t) => t.path !== filePath));
      handleRefreshProject();
    },
    [handleRefreshProject]
  );

  const handleRenameFile = useCallback(
    async (oldPath) => {
      if (!window.spvm3) return;
      const newName = prompt('Enter new name:', oldPath.split(/[\\/]/).pop());
      if (!newName) return;
      await window.spvm3.renameFile(oldPath, newName);
      handleRefreshProject();
    },
    [handleRefreshProject]
  );

  const handleCloseTab = useCallback(
    (path) => {
      setOpenTabs((prev) => prev.filter((t) => t.path !== path));
      if (activeTab === path) {
        const remaining = openTabs.filter((t) => t.path !== path);
        setActiveTab(remaining.length ? remaining[remaining.length - 1].path : null);
      }
    },
    [openTabs, activeTab]
  );

  const handleContentChange = useCallback((path, value) => {
    setOpenTabs((prev) =>
      prev.map((t) => (t.path === path ? { ...t, content: value, dirty: true } : t))
    );
  }, []);

  const handleSaveFile = useCallback(async () => {
    if (!activeTab || !window.spvm3) return;
    const tab = openTabs.find((t) => t.path === activeTab);
    if (!tab) return;
    await window.spvm3.writeFile(tab.path, tab.content);
    setOpenTabs((prev) => prev.map((t) => (t.path === tab.path ? { ...t, dirty: false } : t)));
  }, [activeTab, openTabs]);

  // Code Runner Action
  const handleRunCode = useCallback(async () => {
    const activeFile = openTabs.find((t) => t.path === activeTab);
    if (!activeFile) return;

    // Save before run
    if (activeFile.dirty && window.spvm3) {
      await window.spvm3.writeFile(activeFile.path, activeFile.content);
      setOpenTabs((prev) => prev.map((t) => (t.path === activeFile.path ? { ...t, dirty: false } : t)));
    }

    const ext = activeFile.name.split('.').pop().toLowerCase();
    const langMap = { js: 'javascript', py: 'python', c: 'c', cpp: 'cpp', html: 'html', css: 'css' };
    const language = langMap[ext] || 'javascript';

    setPanelOpen(true);
    setPanelTab('output');
    setOutputLog(`Running ${activeFile.name} via SPVM3 Safe Execution Engine…\n----------------------------------------\n`);

    const result = await runCode({ language, filePath: activeFile.path, code: activeFile.content });

    let runOutput = `[Execution Complete] Duration: ${result.executionTimeMs}ms | Exit Code: ${result.exitCode}\n\n`;
    if (result.stdout) runOutput += `--- STDOUT ---\n${result.stdout}\n`;
    if (result.stderr) runOutput += `--- STDERR ---\n${result.stderr}\n`;

    setOutputLog((prev) => prev + runOutput);

    if (result.parsedDiagnostics && !result.success) {
      setProblems([
        {
          file: result.parsedDiagnostics.file || activeFile.name,
          line: result.parsedDiagnostics.line || 1,
          column: result.parsedDiagnostics.column || 1,
          message: result.parsedDiagnostics.message || result.parsedDiagnostics.category,
          fixSuggestion: result.parsedDiagnostics.fixSuggestion,
          explanation: result.parsedDiagnostics.explanation
        }
      ]);
    } else {
      setProblems([]);
    }
  }, [activeTab, openTabs]);

  // Integrated Terminal Command Execution
  const handleRunTerminalCommand = useCallback(async (cmd) => {
    if (window.spvm3) {
      return await window.spvm3.executeTerminalCommand(cmd);
    }
    return { stdout: '', stderr: 'Terminal unavailable in browser mode', exitCode: 1 };
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e) {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.shiftKey && (e.key === 'P' || e.key === 'p')) {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      } else if (isCmdOrCtrl && (e.key === 'S' || e.key === 's')) {
        e.preventDefault();
        handleSaveFile();
      } else if (e.key === 'F5' || (isCmdOrCtrl && (e.key === 'R' || e.key === 'r'))) {
        e.preventDefault();
        handleRunCode();
      } else if (isCmdOrCtrl && e.key === '`') {
        e.preventDefault();
        setPanelOpen((prev) => !prev);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSaveFile, handleRunCode]);

  const activeFile = openTabs.find((t) => t.path === activeTab) || null;
  const projectName = projectRoot ? projectRoot.split(/[\\/]/).pop() : null;

  return (
    <div className="app-shell" data-theme={activeTheme}>
      <TopMenuBar
        projectName={projectName}
        onOpenFolder={handleOpenProject}
        onNewFile={() => handleCreateFile(projectRoot, false)}
        onSaveFile={handleSaveFile}
        onRunCode={handleRunCode}
        onToggleCommandPalette={() => setCommandPaletteOpen(!commandPaletteOpen)}
        onTogglePanel={() => setPanelOpen(!panelOpen)}
        onToggleAgent={() => setAgentOpen(!agentOpen)}
        activeTheme={activeTheme}
        onThemeChange={setActiveTheme}
      />

      <div className="main-body">
        <ActivityBar
          activeView={activeView}
          onViewChange={setActiveView}
          onToggleAgent={() => setAgentOpen(!agentOpen)}
          agentOpen={agentOpen}
        />

        <Sidebar
          activeView={activeView}
          projectRoot={projectRoot}
          tree={tree}
          activePath={activeTab}
          onOpenProject={handleOpenProject}
          onFileClick={handleFileClick}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          onRenameFile={handleRenameFile}
          onRefreshProject={handleRefreshProject}
          activeTheme={activeTheme}
          onThemeChange={setActiveTheme}
          diagnostics={systemDiagnostics}
        />

        <div className="workspace-container">
          {activeView === 'visualizer' ? (
            <VisualizerPanel />
          ) : (
            <EditorWorkspace
              openTabs={openTabs}
              activeTab={activeTab}
              activeTheme={activeTheme}
              onSelectTab={setActiveTab}
              onCloseTab={handleCloseTab}
              onChange={handleContentChange}
              onRunCode={handleRunCode}
              onOpenFolder={handleOpenProject}
              onToggleAgent={() => setAgentOpen(!agentOpen)}
              diagnosticsError={problems.length > 0 ? problems[0] : null}
            />
          )}

          <BottomPanel
            isOpen={panelOpen}
            onClose={() => setPanelOpen(false)}
            activeTab={panelTab}
            onTabChange={setPanelTab}
            problems={problems}
            output={outputLog}
            onClearOutput={() => setOutputLog('')}
            onRunTerminalCommand={handleRunTerminalCommand}
          />
        </div>

        <AIAgentPanel
          isOpen={agentOpen}
          onClose={() => setAgentOpen(false)}
          activeFile={activeFile}
        />
      </div>

      <StatusBar
        ollamaRunning={ollamaRunning}
        activeFile={activeFile}
        problemsCount={problems.length}
        diagnostics={systemDiagnostics}
        onTogglePanel={() => setPanelOpen(!panelOpen)}
        onToggleAgent={() => setAgentOpen(!agentOpen)}
      />

      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenFolder={handleOpenProject}
        onNewFile={() => handleCreateFile(projectRoot, false)}
        onSaveFile={handleSaveFile}
        onRunCode={handleRunCode}
        onTogglePanel={() => setPanelOpen(!panelOpen)}
        onToggleAgent={() => setAgentOpen(!agentOpen)}
        onThemeChange={setActiveTheme}
        onDiagnose={() => {
          setActiveView('settings');
          setCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}
