const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs/promises');
const http = require('http');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

let mainWindow;
let currentProjectRoot = null;
let selectedPythonCmd = 'python';

if (process.env.NODE_ENV === 'development') {
  process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = 'true';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1000,
    minHeight: 650,
    backgroundColor: '#0d1117',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#161b22',
      symbolColor: '#c9d1d9',
      height: 32
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devUrl = 'http://localhost:5173';
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// ---------- Project / File System IPC ----------

async function readDirRecursive(dirPath, depth = 0) {
  if (depth > 10) return [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.DS_Store', '.idea', '.vscode']);
    const nodes = [];
    for (const entry of entries) {
      if (ignored.has(entry.name)) continue;
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        nodes.push({
          name: entry.name,
          path: fullPath,
          type: 'directory',
          children: await readDirRecursive(fullPath, depth + 1)
        });
      } else {
        nodes.push({ name: entry.name, path: fullPath, type: 'file' });
      }
    }
    nodes.sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'directory' ? -1 : 1));
    return nodes;
  } catch (err) {
    console.error('Failed to read directory:', dirPath, err);
    return [];
  }
}

ipcMain.handle('project:open', async () => {
  const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
  if (result.canceled || !result.filePaths.length) return null;
  currentProjectRoot = result.filePaths[0];
  const tree = await readDirRecursive(currentProjectRoot);
  return { root: currentProjectRoot, tree };
});

ipcMain.handle('project:refresh', async () => {
  if (!currentProjectRoot) return null;
  const tree = await readDirRecursive(currentProjectRoot);
  return { root: currentProjectRoot, tree };
});

ipcMain.handle('file:read', async (_evt, filePath) => {
  return fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('file:write', async (_evt, filePath, contents) => {
  await fs.writeFile(filePath, contents, 'utf-8');
  return true;
});

ipcMain.handle('file:create', async (_evt, dirPath, name, isDirectory) => {
  const target = path.join(dirPath, name);
  if (isDirectory) {
    await fs.mkdir(target, { recursive: true });
  } else {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, '', 'utf-8');
  }
  return target;
});

ipcMain.handle('file:rename', async (_evt, oldPath, newName) => {
  const target = path.join(path.dirname(oldPath), newName);
  await fs.rename(oldPath, target);
  return target;
});

ipcMain.handle('file:delete', async (_evt, filePath) => {
  await fs.rm(filePath, { recursive: true, force: true });
  return true;
});

ipcMain.handle('file:reveal', async (_evt, filePath) => {
  shell.showItemInFolder(filePath);
});

// ---------- Global Search ----------

ipcMain.handle('project:search', async (_evt, query) => {
  if (!currentProjectRoot || !query || query.trim().length === 0) return [];
  const results = [];
  const lowerQuery = query.toLowerCase();

  async function searchTree(dirPath) {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const ignored = new Set(['node_modules', '.git', 'dist', 'build', '.DS_Store']);
      for (const entry of entries) {
        if (ignored.has(entry.name)) continue;
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          await searchTree(fullPath);
        } else {
          // Check extension / file size limit for text searching
          const ext = path.extname(entry.name).toLowerCase();
          const binaryExts = new Set(['.png', '.jpg', '.jpeg', '.gif', '.exe', '.dll', '.zip', '.pdf']);
          if (binaryExts.has(ext)) continue;

          try {
            const content = await fs.readFile(fullPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach((line, idx) => {
              if (line.toLowerCase().includes(lowerQuery)) {
                results.push({
                  path: fullPath,
                  fileName: entry.name,
                  line: idx + 1,
                  text: line.trim()
                });
              }
            });
          } catch {
            // skip unreadable
          }
        }
      }
    } catch {
      // skip
    }
  }

  await searchTree(currentProjectRoot);
  return results.slice(0, 100);
});

// ---------- Code Runner Service ----------

ipcMain.handle('runner:execute', async (_evt, { language, filePath, code }) => {
  const startTime = Date.now();
  const dir = currentProjectRoot || path.dirname(filePath || app.getPath('temp'));

  try {
    if (language === 'javascript') {
      // Write temp file if no path provided
      const targetFile = filePath || path.join(app.getPath('temp'), `spvm3_temp_${Date.now()}.js`);
      if (!filePath) await fs.writeFile(targetFile, code, 'utf-8');

      const { stdout, stderr } = await execPromise(`node "${targetFile}"`, { cwd: dir, timeout: 15000 });
      return {
        success: true,
        stdout,
        stderr,
        executionTimeMs: Date.now() - startTime,
        exitCode: 0
      };
    } else if (language === 'python') {
      const targetFile = filePath || path.join(app.getPath('temp'), `spvm3_temp_${Date.now()}.py`);
      if (!filePath) await fs.writeFile(targetFile, code, 'utf-8');

      // Use selected python version or fallback to python / python3
      let runnerCmd = selectedPythonCmd.includes(' ') || selectedPythonCmd.includes('/') || selectedPythonCmd.includes('\\')
        ? `"${selectedPythonCmd}"`
        : selectedPythonCmd;
      let cmd = `${runnerCmd} "${targetFile}"`;

      try {
        const { stdout, stderr } = await execPromise(cmd, { cwd: dir, timeout: 15000 });
        return { success: true, stdout, stderr, executionTimeMs: Date.now() - startTime, exitCode: 0 };
      } catch (err) {
        if (err.stdout || err.stderr) {
          return {
            success: false,
            stdout: err.stdout || '',
            stderr: err.stderr || err.message,
            executionTimeMs: Date.now() - startTime,
            exitCode: err.code || 1
          };
        }
        // retry fallback python
        const { stdout, stderr } = await execPromise(`python "${targetFile}"`, { cwd: dir, timeout: 15000 });
        return { success: true, stdout, stderr, executionTimeMs: Date.now() - startTime, exitCode: 0 };
      }
    } else if (language === 'c' || language === 'cpp') {
      const targetFile = filePath || path.join(app.getPath('temp'), `spvm3_temp_${Date.now()}.c`);
      if (!filePath) await fs.writeFile(targetFile, code, 'utf-8');
      const outExe = path.join(app.getPath('temp'), `spvm3_out_${Date.now()}.exe`);

      const compileCmd = `gcc "${targetFile}" -o "${outExe}"`;
      try {
        await execPromise(compileCmd, { cwd: dir });
        const { stdout, stderr } = await execPromise(`"${outExe}"`, { cwd: dir, timeout: 15000 });
        return { success: true, stdout, stderr, executionTimeMs: Date.now() - startTime, exitCode: 0 };
      } catch (err) {
        return {
          success: false,
          stdout: err.stdout || '',
          stderr: err.stderr || err.message || 'GCC Compiler failed or not found in PATH.',
          executionTimeMs: Date.now() - startTime,
          exitCode: err.code || 1
        };
      }
    } else if (language === 'java') {
      const targetFile = filePath || path.join(app.getPath('temp'), `Main_${Date.now()}.java`);
      if (!filePath) await fs.writeFile(targetFile, code, 'utf-8');
      const workDir = path.dirname(targetFile);

      try {
        await execPromise(`javac "${targetFile}"`, { cwd: workDir, timeout: 15000 });
        const className = path.basename(targetFile, '.java');
        const { stdout, stderr } = await execPromise(`java "${className}"`, { cwd: workDir, timeout: 15000 });
        return { success: true, stdout, stderr, executionTimeMs: Date.now() - startTime, exitCode: 0 };
      } catch (err) {
        return {
          success: false,
          stdout: err.stdout || '',
          stderr: err.stderr || err.message || 'Java compiler (javac) failed or not found in PATH.',
          executionTimeMs: Date.now() - startTime,
          exitCode: err.code || 1
        };
      }
    } else if (language === 'csharp') {
      const targetFile = filePath || path.join(app.getPath('temp'), `Program_${Date.now()}.cs`);
      if (!filePath) await fs.writeFile(targetFile, code, 'utf-8');
      const outExe = path.join(app.getPath('temp'), `spvm3_cs_${Date.now()}.exe`);

      try {
        await execPromise(`csc /out:"${outExe}" "${targetFile}"`, { cwd: dir, timeout: 15000 });
        const { stdout, stderr } = await execPromise(`"${outExe}"`, { cwd: dir, timeout: 15000 });
        return { success: true, stdout, stderr, executionTimeMs: Date.now() - startTime, exitCode: 0 };
      } catch (err) {
        return {
          success: false,
          stdout: err.stdout || '',
          stderr: err.stderr || err.message || 'C# compiler (csc) failed or dotnet runner not found.',
          executionTimeMs: Date.now() - startTime,
          exitCode: err.code || 1
        };
      }
    } else if (language === 'html' || language === 'css' || language === 'markdown') {
      return {
        success: true,
        stdout: `Rendered in ${language.toUpperCase()} preview panel`,
        stderr: '',
        executionTimeMs: Date.now() - startTime,
        exitCode: 0
      };
    } else {
      return {
        success: true,
        stdout: `Document (${language}) opened cleanly in SPVM3 workspace.`,
        stderr: '',
        executionTimeMs: Date.now() - startTime,
        exitCode: 0
      };
    }
  } catch (err) {
    return {
      success: false,
      stdout: err.stdout || '',
      stderr: err.stderr || err.message || 'Execution error',
      executionTimeMs: Date.now() - startTime,
      exitCode: err.code || 1
    };
  }
});

// ---------- Integrated Terminal IPC ----------

ipcMain.handle('terminal:execute', async (_evt, command) => {
  const cwd = currentProjectRoot || process.cwd();
  try {
    const { stdout, stderr } = await execPromise(command, { cwd, timeout: 30000 });
    return { stdout, stderr, exitCode: 0 };
  } catch (err) {
    return { stdout: err.stdout || '', stderr: err.stderr || err.message, exitCode: err.code || 1 };
  }
});

// ---------- Environment System Diagnostics ----------

ipcMain.handle('system:diagnose', async () => {
  const checkCmd = async (cmd) => {
    try {
      const { stdout } = await execPromise(cmd);
      return stdout.trim().split('\n')[0];
    } catch {
      return 'Not Found';
    }
  };

  const results = {
    node: await checkCmd('node -v'),
    python: await checkCmd('python --version'),
    gcc: await checkCmd('gcc --version'),
    git: await checkCmd('git --version'),
    docker: await checkCmd('docker --version')
  };
  return results;
});

ipcMain.handle('python:listVersions', async () => {
  const versions = [];
  try {
    const { stdout } = await execPromise('py -0p');
    const lines = stdout.split('\n').filter(Boolean);
    for (const line of lines) {
      if (line.includes('Python') || line.includes('-') || line.includes('*')) {
        const trimmed = line.trim();
        const parts = trimmed.split(/\s+/);
        const name = parts[0] || 'Python';
        const pathStr = trimmed.includes('*') ? trimmed.substring(trimmed.indexOf('*') + 1).trim() : parts[parts.length - 1];
        versions.push({ name: `Python Launcher (${name})`, path: pathStr.replace(/^\*+\s*/, '') });
      }
    }
  } catch {
    // ignore
  }

  try {
    const { stdout } = await execPromise('python --version');
    const ver = stdout.trim();
    if (!versions.some((v) => v.name.includes(ver))) {
      versions.push({ name: `System Python (${ver})`, path: 'python' });
    }
  } catch {}

  try {
    const { stdout } = await execPromise('python3 --version');
    const ver = stdout.trim();
    if (!versions.some((v) => v.name.includes(ver))) {
      versions.push({ name: `Python 3 (${ver})`, path: 'python3' });
    }
  } catch {}

  if (versions.length === 0) {
    versions.push({ name: 'System Default (python)', path: 'python' });
  }

  return versions;
});

ipcMain.handle('python:setVersion', async (_evt, pathCmd) => {
  selectedPythonCmd = pathCmd || 'python';
  return selectedPythonCmd;
});

// ---------- Local AI (Ollama) Bridge ----------

ipcMain.handle('ollama:status', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/tags', (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ running: true, models: parsed.models?.map((m) => m.name) || [] });
        } catch {
          resolve({ running: false, models: [] });
        }
      });
    });
    req.on('error', () => resolve({ running: false, models: [] }));
    req.setTimeout(1500, () => {
      req.destroy();
      resolve({ running: false, models: [] });
    });
  });
});

ipcMain.on('ollama:chat:stream', (event, { model, messages, requestId }) => {
  const body = JSON.stringify({ model, messages, stream: true });
  const req = http.request(
    {
      host: '127.0.0.1',
      port: 11434,
      path: '/api/chat',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    },
    (res) => {
      res.on('data', (chunk) => {
        const lines = chunk.toString('utf-8').split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            event.sender.send(`ollama:chat:chunk:${requestId}`, parsed);
          } catch {
            // ignore fragments
          }
        }
      });
      res.on('end', () => {
        event.sender.send(`ollama:chat:done:${requestId}`);
      });
    }
  );
  req.on('error', (err) => {
    event.sender.send(`ollama:chat:error:${requestId}`, err.message);
  });
  req.write(body);
  req.end();
});
