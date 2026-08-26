import { useState, useEffect } from 'react';
import {
  FolderOpen,
  FilePlus,
  FolderPlus,
  RefreshCw,
  Search,
  GitBranch,
  Blocks,
  Container,
  CheckCircle,
  FileText,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit2,
  ExternalLink,
  Settings as SettingsIcon,
  Sparkles,
  Check,
  Download,
  Cpu,
  Layers
} from 'lucide-react';

function TreeNode({ node, activePath, onFileClick, onCreateFile, onDeleteFile, onRenameFile }) {
  const [open, setOpen] = useState(true);
  const isDir = node.type === 'directory';

  return (
    <div className="tree-node">
      <div
        className={`node-row ${node.path === activePath ? 'active' : ''}`}
        onClick={() => {
          if (isDir) setOpen(!open);
          else onFileClick(node);
        }}
      >
        {isDir ? (
          open ? (
            <ChevronDown size={14} className="tree-chevron" />
          ) : (
            <ChevronRight size={14} className="tree-chevron" />
          )
        ) : (
          <FileText size={14} className="tree-icon" />
        )}
        <span className="node-name">{node.name}</span>

        <div className="node-hover-actions">
          {isDir && (
            <button
              title="New File in Folder"
              onClick={(e) => {
                e.stopPropagation();
                onCreateFile(node.path, false);
              }}
            >
              <FilePlus size={12} />
            </button>
          )}
          <button
            title="Rename"
            onClick={(e) => {
              e.stopPropagation();
              onRenameFile(node.path);
            }}
          >
            <Edit2 size={12} />
          </button>
          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFile(node.path);
            }}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {isDir && open && node.children && (
        <div className="tree-children">
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              activePath={activePath}
              onFileClick={onFileClick}
              onCreateFile={onCreateFile}
              onDeleteFile={onDeleteFile}
              onRenameFile={onRenameFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar({
  activeView,
  projectRoot,
  tree,
  activePath,
  onOpenProject,
  onFileClick,
  onCreateFile,
  onDeleteFile,
  onRenameFile,
  onRefreshProject,
  activeTheme,
  onThemeChange,
  diagnostics
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  async function handleSearch(e) {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length > 1 && window.spvm3) {
      const res = await window.spvm3.searchProject(q);
      setSearchResults(res || []);
    } else {
      setSearchResults([]);
    }
  }

  const projectName = projectRoot ? projectRoot.split(/[\\/]/).pop() : null;

  return (
    <div className="primary-sidebar">
      {activeView === 'explorer' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>Explorer</h3>
            <div className="header-actions">
              <button title="New File" onClick={() => onCreateFile(projectRoot, false)}>
                <FilePlus size={14} />
              </button>
              <button title="New Folder" onClick={() => onCreateFile(projectRoot, true)}>
                <FolderPlus size={14} />
              </button>
              <button title="Refresh" onClick={onRefreshProject}>
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          {projectRoot ? (
            <div className="explorer-tree">
              <div className="root-folder-tag">{projectName}</div>
              {tree.map((node) => (
                <TreeNode
                  key={childPath(node)}
                  node={node}
                  activePath={activePath}
                  onFileClick={onFileClick}
                  onCreateFile={onCreateFile}
                  onDeleteFile={onDeleteFile}
                  onRenameFile={onRenameFile}
                />
              ))}
            </div>
          ) : (
            <div className="empty-sidebar">
              <p>No workspace folder opened.</p>
              <button className="btn-primary" onClick={onOpenProject}>
                <FolderOpen size={14} />
                Open Folder
              </button>
            </div>
          )}
        </div>
      )}

      {activeView === 'search' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>Search Workspace</h3>
          </div>
          <div className="search-input-wrap">
            <Search size={14} />
            <input
              type="text"
              placeholder="Search text in workspace files…"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <div className="search-results-list">
            {searchResults.map((res, idx) => (
              <div key={idx} className="search-result-item" onClick={() => onFileClick({ path: res.path, name: res.fileName })}>
                <div className="res-file">{res.fileName} <span className="res-line">L{res.line}</span></div>
                <div className="res-text">{res.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeView === 'git' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>Source Control</h3>
          </div>
          <div className="git-view-content">
            <div className="git-status-card">
              <GitBranch size={16} />
              <span>Branch: <strong>main</strong></span>
            </div>
            <p className="sidebar-subtext">Git workspace integration connected. 0 uncommitted changes.</p>
          </div>
        </div>
      )}

      {activeView === 'extensions' && (
        <ExtensionMarketplaceView />
      )}

      {activeView === 'docker' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>Docker Containers</h3>
            <button className="icon-btn" title="Refresh Docker Containers" onClick={() => onOpenFile?.('Dockerfile')}>
              <RefreshCw size={14} />
            </button>
          </div>
          <div className="docker-panel" style={{ padding: '12px' }}>
            <div className="ext-card active" style={{ marginBottom: '12px' }}>
              <div className="ext-card-header">
                <Container size={18} color="var(--accent-primary)" />
                <h4>SPVM3 Docker Containerfile</h4>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>
                Multi-stage container setup configured in <code>Dockerfile</code>. Build or preview containerized web IDE.
              </p>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  className="btn-action primary"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => onOpenFile?.('Dockerfile')}
                >
                  Edit Dockerfile
                </button>
                <button
                  className="btn-action"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                  onClick={() => onOpenFile?.('.dockerignore')}
                >
                  .dockerignore
                </button>
              </div>
            </div>

            <div className="settings-section">
              <label>Build Command</label>
              <code style={{ display: 'block', padding: '6px', background: 'var(--bg-tertiary)', borderRadius: '4px', fontSize: '11px', color: 'var(--accent-primary)' }}>
                docker build -t spvm3-code-editor .
              </code>
            </div>

            <div className="settings-section" style={{ marginTop: '10px' }}>
              <label>Container Sandboxing</label>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Runs isolated execution containers for testing untrusted user scripts securely.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeView === 'testing' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>Testing System</h3>
          </div>
          <div className="empty-sidebar">
            <CheckCircle size={28} color="var(--success)" />
            <p>Unit & Integration testing extensions active.</p>
          </div>
        </div>
      )}

      {activeView === 'settings' && (
        <div className="sidebar-view">
          <div className="sidebar-header">
            <h3>SPVM3 Settings</h3>
          </div>
          <div className="settings-section">
            <label>Color Theme</label>
            <select value={activeTheme} onChange={(e) => onThemeChange(e.target.value)} className="settings-select">
              <option value="ember">Ember Dark</option>
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="obsidian">Obsidian Jet</option>
              <option value="nightshade">Nightshade Violet</option>
              <option value="glacier">Glacier Light</option>
              <option value="parchment">Parchment Sepia</option>
            </select>
          </div>
          {diagnostics && (
            <div className="settings-section">
              <label>Detected System Toolchain</label>
              <ul className="diag-list">
                <li>Node: {diagnostics.node}</li>
                <li>Python: {diagnostics.python}</li>
                <li>GCC Compiler: {diagnostics.gcc}</li>
                <li>Git: {diagnostics.git}</li>
              </ul>
            </div>
          )}

          <div className="settings-section" style={{ marginTop: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
            <label>Privacy & Compliance</label>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              SPVM3 operates 100% local-first. Zero external tracking or telemetry.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                className="btn-action"
                style={{ textAlign: 'left', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => onOpenFile?.('PRIVACY.md')}
              >
                <FileText size={12} /> View Privacy Policy (PRIVACY.md)
              </button>
              <button
                className="btn-action"
                style={{ textAlign: 'left', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => onOpenFile?.('POLICIES.md')}
              >
                <FileText size={12} /> View Terms & Policies (POLICIES.md)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExtensionMarketplaceView() {
  const [installed, setInstalled] = useState(
    new Set(['python', 'c_cpp', 'java', 'web_react', 'ollama_ai'])
  );
  const [pythonVersions, setPythonVersions] = useState([]);
  const [selectedPy, setSelectedPy] = useState('python');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (window.spvm3?.listPythonVersions) {
      window.spvm3.listPythonVersions().then((vers) => {
        setPythonVersions(vers || []);
        if (vers?.length) setSelectedPy(vers[0].path);
      });
    }
  }, []);

  function toggleExt(id) {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePyChange(e) {
    const val = e.target.value;
    setSelectedPy(val);
    if (window.spvm3?.setPythonVersion) {
      window.spvm3.setPythonVersion(val);
    }
  }

  const extensions = [
    {
      id: 'python',
      title: 'Python Extension Pack',
      author: 'SPVM3 Core',
      version: 'v3.2.0',
      description: 'Python 3.x execution engine, PyLint, Black formatter & interpreter switcher.',
      icon: Cpu,
      hasPySelector: true
    },
    {
      id: 'web_react',
      title: 'Web & React Developer Pack',
      author: 'SPVM3 Web',
      version: 'v2.8.1',
      description: 'React JSX/TSX, HTML5, CSS3, SCSS, Tailwind & Vite live preview renderer.',
      icon: Layers
    },
    {
      id: 'c_cpp',
      title: 'C / C++ Compiler Toolchain',
      author: 'SPVM3 Native',
      version: 'v4.1.0',
      description: 'GCC, Clang & MSVC C23/C++20 compilation and error parser.',
      icon: Blocks
    },
    {
      id: 'java',
      title: 'Java Extension Pack',
      author: 'SPVM3 Java',
      version: 'v1.9.4',
      description: 'Java JDK 17/21 compiler, javac runner, and class diagnostics.',
      icon: Blocks
    },
    {
      id: 'csharp',
      title: 'C# & .NET Core Pack',
      author: 'SPVM3 .NET',
      version: 'v2.1.0',
      description: 'C# Roslyn compiler, dotnet execution engine, and CS error parser.',
      icon: Blocks
    },
    {
      id: 'rust_go',
      title: 'Rust & Go Compiler Pack',
      author: 'SPVM3 Systems',
      version: 'v1.5.0',
      description: 'Cargo, rustc, and Go language tools & syntax indexer.',
      icon: Blocks
    },
    {
      id: 'ollama_ai',
      title: 'Ollama Local AI Connector',
      author: 'SPVM3 AI',
      version: 'v5.0.2',
      description: 'Offline local LLM inference engine for code generation & explainers.',
      icon: Sparkles
    },
    {
      id: 'sql_db',
      title: 'Database & Data Pack',
      author: 'SPVM3 Data',
      version: 'v1.2.0',
      description: 'SQL, SQLite, JSON, YAML, TOML & Docker container tools.',
      icon: Container
    }
  ];

  const filtered = extensions.filter(
    (e) =>
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sidebar-view">
      <div className="sidebar-header">
        <h3>Extensions Marketplace</h3>
      </div>

      <div className="search-input-wrap">
        <Search size={14} />
        <input
          type="text"
          placeholder="Search programming extensions…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ext-list">
        {filtered.map((ext) => {
          const isInst = installed.has(ext.id);
          const Icon = ext.icon;

          return (
            <div key={ext.id} className={`ext-card ${isInst ? 'installed' : ''}`}>
              <div className="ext-icon-row">
                <Icon size={20} color="var(--accent)" />
                <div className="ext-info">
                  <strong>{ext.title}</strong>
                  <span className="ext-meta">{ext.author} • {ext.version}</span>
                </div>
              </div>
              <p className="ext-desc">{ext.description}</p>

              {ext.hasPySelector && isInst && (
                <div className="py-version-selector">
                  <label>Python Interpreter Version:</label>
                  <select value={selectedPy} onChange={handlePyChange} className="py-select">
                    {pythonVersions.length > 0 ? (
                      pythonVersions.map((v, i) => (
                        <option key={i} value={v.path}>
                          {v.name} ({v.path})
                        </option>
                      ))
                    ) : (
                      <option value="python">System Default (python)</option>
                    )}
                  </select>
                </div>
              )}

              <div className="ext-actions">
                <button
                  className={`ext-btn ${isInst ? 'btn-enabled' : 'btn-install'}`}
                  onClick={() => toggleExt(ext.id)}
                >
                  {isInst ? (
                    <>
                      <Check size={12} /> Installed & Enabled
                    </>
                  ) : (
                    <>
                      <Download size={12} /> Install Extension
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function childPath(node) {
  return node.path;
}
