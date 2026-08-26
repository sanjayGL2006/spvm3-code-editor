# Implementation Plan - SPVM3 Code Editor Architecture & Core IDE Engine

Build **SPVM3 Code Editor**, a modular desktop IDE environment built on Electron.js, React, Monaco Editor, Vite, and Node.js. SPVM3 provides a local-first development experience featuring multi-tab Monaco code editing, top menu system, activity bar navigation, bottom panel diagnostics/terminals, multi-language runners (Python, Java, JS/TS, C/C++, C#, HTML/CSS/Markdown), Extension Marketplace, Python version selector, local RAG/indexing, interactive algorithm visualizer, command palette, theme customizer, and an offline-first AI agent system supporting local (Ollama) and extensible cloud providers.

---

## User Review Required

> [!IMPORTANT]
> **No Mandatory API Key & Security Sandboxing**: SPVM3 operates completely offline for all coding, compilation, and editing without requiring any AI API key. Local AI powered by Ollama / local inference is enabled out-of-the-box, while cloud AI connectors operate via modular opt-in extensions. API keys are stored securely using OS credential storage mechanisms.
>
> **RAG / Local Indexing vs Neural Net Training**: In alignment with your directive, user code is **never** used to train external or local neural network models. Instead, SPVM3 uses a local vector/metadata indexing engine for instant workspace understanding and retrieval-augmented generation (RAG).

---

## Open Questions

> [!NOTE]
> 1. **Default Terminal Shell**: On Windows, default terminal launches PowerShell with option to toggle to CMD.
> 2. **C / Java / C# Compiler Toolchains**: SPVM3 looks for standard `gcc`, `javac`, and `csc` / `dotnet` in system `PATH`. If missing, SPVM3 alerts the user with installation steps rather than crashing.

---

## Proposed Changes

### Component Architecture Breakdown

```
SPVM3 Code Editor Architecture
├── Electron Main Process (electron/main.js)
│   ├── IPC Handles (File I/O, Project Tree, Command Execution, Terminal PTY, Local AI Bridge, Python Version Switcher)
│   ├── Security Middleware (Context Isolation, Sandboxed Preload, Content Security Policy)
│   └── Process Runner Service (HTML/CSS Browser Preview, Node JS, Python Engine, GCC/Clang, Java Javac, C# Roslyn)
│
├── Preload Bridge (electron/preload.js)
│   └── Safe contextBridge exposure (`window.spvm3` / `window.codeforge`)
│
└── React Renderer Application (src/)
    ├── Top Menu Bar System (src/components/TopMenuBar.jsx)
    ├── Activity Bar (src/components/ActivityBar.jsx)
    ├── Primary Sidebar Views (Explorer, Search, Source Control, Run & Debug, Extensions Marketplace, Docker, Testing, AI Agent, Learning, Settings)
    ├── Monaco Editor Workspace (src/components/EditorWorkspace.jsx)
    │   ├── Multi-Tab Bar & Breadcrumbs
    │   ├── A-Z File Extension Mappings & Monaco Syntax Highlighting
    │   └── Diagnostic Error Highlighting & Banner
    ├── AI Agent Panel (src/components/AIAgentPanel.jsx)
    │   ├── Modes: Ask, Explain, Fix, Edit, Agent, Debug, Test, Learn, Review
    │   ├── Provider Select: Ollama (Local) & Extension Connectors
    │   └── Safety Diff View for code changes
    ├── Bottom Panel System (src/components/BottomPanel.jsx)
    │   └── Tabs: Problems, Output, Integrated Terminal, Debug Console, Ports, Tests, AI Tasks, Logs
    ├── Command Palette Modal (src/components/CommandPalette.jsx)
    ├── Learning & Algorithm Visualizer (src/components/VisualizerPanel.jsx)
    ├── Code Runner & Error Diagnostic Engine (src/services/codeRunner.js)
    ├── Local RAG / Project Indexing Service (src/services/ragIndexer.js)
    └── Settings & Theme System (src/themes/ & src/services/settingsStore.js)
```

---

### File Modifications & Additions

#### [MODIFY] [package.json](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/package.json)
* Update application name to `spvm3` and product title to `CodeForge`.

#### [MODIFY] [electron/main.js](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/electron/main.js)
* Implement modular IPC handlers for File Operations, Code Execution (`runner:execute` for Python, Node.js, C gcc, Java javac, C# csc, HTML/CSS/MD), Python version discovery (`python:listVersions`, `python:setVersion`), and Ollama IPC bridge.

#### [MODIFY] [electron/preload.js](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/electron/preload.js)
* Expose secure `window.spvm3` and `window.codeforge` API surface to renderer.

#### [MODIFY] [src/components/EditorWorkspace.jsx](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/src/components/EditorWorkspace.jsx)
* A-Z file extension to language mappings for Monaco Editor.

#### [MODIFY] [src/components/Sidebar.jsx](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/src/components/Sidebar.jsx)
* Interactive Extension Marketplace Manager & Python Version Switcher.

#### [MODIFY] [src/services/ragIndexer.js](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/src/services/ragIndexer.js)
* Multi-language symbol and structure extractor for RAG context retrieval.

---

## Verification Plan

### Automated Build & Syntax Checks
- Run `npm run build` to verify React components compile cleanly and electron-builder creates `dist\CodeForge Setup 1.0.0.exe`.

### Manual Verification Workflow
1. **IDE Shell & Layout**: Top Menu, Activity Bar, File Explorer, Tabbed Monaco Editor, Resizable Panels, and Status Bar render with 6 themes.
2. **Code Execution & Error Parsing**:
   - Run Python, JS, C, Java, C#, HTML/CSS code files.
3. **Extensions Marketplace**: Toggle extensions install state and switch Python interpreter version.
4. **AI Agent & Offline Mode**: Verify Ollama connection and fallback handling.

