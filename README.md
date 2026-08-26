# SPVM3 Code Editor (CodeForge Desktop IDE)

A high-performance, modular desktop code editor and local-first AI development environment built on **Electron.js**, **React**, **Monaco Editor**, **Vite**, and **Node.js**.

SPVM3 operates completely offline — **no mandatory cloud API key, no account creation, and zero network egress for core development**.

---

## 🌟 Key Features

### 1. Master Desktop IDE Layout
- **Top Dropdown Menu System**: Desktop menus (`File`, `Edit`, `View`, `Run`, `Help`) with keyboard shortcuts and search palette trigger.
- **Vertical Activity Bar**: One-click switching between Explorer, Workspace Search, Source Control (Git), Run & Debug, Learning Visualizer, Extensions Marketplace, Docker, Testing, Database, AI Agent, and Settings.
- **Multi-Tab Monaco Editor Workspace**: VS Code Monaco Editor engine supporting split editor views, tab management, dirty state indicators (`●`), breadcrumbs, and 6 custom themes.

### 2. A to Z File Extension & Language Registry
Full syntax highlighting, Monaco language modes, and structure parsing for files from **A to Z**:
- **Web & React**: `.js`, `.jsx`, `.ts`, `.tsx`, `.html`, `.css`, `.scss`, `.less`, `.json`, `.svg`
- **High-Level & OOP**: `.py`, `.pyw`, `.java`, `.cs`, `.c`, `.cpp`, `.h`, `.hpp`, `.php`, `.rb`
- **Systems & Modern**: `.rs`, `.go`, `.swift`, `.kt`, `.scala`
- **Data & Config**: `.md`, `.markdown`, `.txt`, `.log`, `.env`, `.yml`, `.yaml`, `.ini`, `.toml`, `.sql`
- **Shell & Tools**: `.sh`, `.ps1`, `.bat`, `.cmd`, `.dockerfile`, `.makefile`

### 3. Local RAG & Workspace Code Indexer
- Scans workspace files and extracts code structure symbols: functions, classes, interfaces, DOM IDs (`#id`), CSS classes (`.class`), JSON schema keys, and Markdown headings.
- Provides fast context retrieval for AI agent prompts without sending code to external cloud providers.

### 4. Interactive Extensions Marketplace Manager
Located in the Extensions Activity Bar:
- **Python Extension Pack**: Python 3.x execution engine, PyLint, Black formatter & interpreter switcher.
- **Web & React Developer Pack**: React JSX/TSX, HTML5, CSS3, SCSS, Tailwind & Vite live preview.
- **C / C++ Compiler Toolchain**: GCC, Clang & MSVC C23/C++20 compilation and error parser.
- **Java Extension Pack**: Java JDK 17/21 compiler, `javac` runner, and class diagnostics.
- **C# & .NET Core Pack**: C# Roslyn compiler, `dotnet` execution engine, and CS error parser.
- **Rust & Go Compiler Pack**: Cargo, `rustc`, and Go language tools.
- **Ollama Local AI Connector**: Offline local LLM inference engine for code generation & explainers.
- **Database & Data Pack**: SQL, SQLite, JSON, YAML, TOML & Docker container tools.
- Supports one-click **Install / Enable / Disable** toggles for each extension.

### 5. Multi-Version Python Interpreter Selector
- Scans Windows Python Launcher (`py -0p`), system `python`, `python3`, and virtual environments.
- Allows switching the active Python interpreter version directly inside the Python Extension Pack card or Settings view.

### 6. Multi-Language Code Execution & Diagnostic Engine
- Subprocess runners for **Python**, **JavaScript (Node.js)**, **Java (`javac` + `java`)**, **C/C++ (`gcc`)**, **C# (`csc` / `dotnet`)**, **HTML/CSS/Markdown Preview**.
- Captures `stdout`, `stderr`, duration (ms), and parses tracebacks into structured line/column diagnostics with one-click **Explain & Fix with AI**.

### 7. 6 Custom UI Themes
- **Ember Dark** (Default obsidian/coral dark theme)
- **Cyberpunk Neon** (Vibrant neon cyan/pink)
- **Obsidian Jet** (Deep dark black OLED style)
- **Nightshade Violet** (Deep purple/indigo dark theme)
- **Glacier Light** (Clean crisp light mode)
- **Parchment Sepia** (Warm sepia paper design)

---

## 🛠️ Prerequisites & Installation

### Prerequisites
1. **Node.js 18+** — [nodejs.org](https://nodejs.org)
2. *(Optional for AI LLM features)* **Ollama** — [ollama.com](https://ollama.com)
   ```powershell
   ollama pull qwen2.5-coder
   ```

### Setup & Run
```bash
# Install dependencies
npm install

# Run dev server & launcher Electron desktop window
npm run dev
```

### Build Production Executable
```bash
npm run build
```
Generates packaged desktop installer in `dist\CodeForge Setup 1.0.0.exe`.

---

## 🐳 Docker Container Deployment

CodeForge includes a multi-stage `Dockerfile` and `.dockerignore` for containerized web IDE preview and isolated script sandboxing:

```bash
# Build Docker image
docker build -t spvm3-code-editor .

# Run container on port 8080
docker run -d -p 8080:80 --name codeforge-ide spvm3-code-editor
```
Access the web editor preview at `http://localhost:8080`.

---

## 🔒 Privacy & Data Security

SPVM3 CodeForge is engineered as a **local-first** environment:
- **Zero Telemetry**: No tracking, analytics cookies, or crash reports sent externally.
- **Local AI (Ollama)**: Code completions, prompt fixes, and vector symbol search operate 100% locally.
- **Data Sovereignty**: For full details, see [`PRIVACY.md`](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/PRIVACY.md).

---

## 📜 Governance & Policies

- **Terms of Use**: Distributed under the MIT License ([`POLICIES.md`](file:///c:/Users/Sanjay%20G%20L/Desktop/codeforge/POLICIES.md)).
- **Subprocess Isolation**: Supports containerized script execution via Docker.

---

## ⌨️ Keyboard Shortcuts

- `Ctrl + Shift + P`: Command Palette Modal
- `Ctrl + S`: Save Active File
- `F5` / `Ctrl + R`: Execute Active Code File
- `Ctrl + \``: Toggle Integrated Terminal / Bottom Panel

