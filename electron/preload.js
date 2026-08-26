const { contextBridge, ipcRenderer } = require('electron');

const spvm3Api = {
  // Project / FS
  openProject: () => ipcRenderer.invoke('project:open'),
  refreshProject: () => ipcRenderer.invoke('project:refresh'),
  readFile: (filePath) => ipcRenderer.invoke('file:read', filePath),
  writeFile: (filePath, contents) => ipcRenderer.invoke('file:write', filePath, contents),
  createFile: (dirPath, name, isDirectory) => ipcRenderer.invoke('file:create', dirPath, name, isDirectory),
  renameFile: (oldPath, newName) => ipcRenderer.invoke('file:rename', oldPath, newName),
  deleteFile: (filePath) => ipcRenderer.invoke('file:delete', filePath),
  revealFile: (filePath) => ipcRenderer.invoke('file:reveal', filePath),
  searchProject: (query) => ipcRenderer.invoke('project:search', query),

  // Runner & Exec
  runCode: ({ language, filePath, code }) => ipcRenderer.invoke('runner:execute', { language, filePath, code }),
  executeTerminalCommand: (command) => ipcRenderer.invoke('terminal:execute', command),
  diagnoseSystem: () => ipcRenderer.invoke('system:diagnose'),
  listPythonVersions: () => ipcRenderer.invoke('python:listVersions'),
  setPythonVersion: (pathCmd) => ipcRenderer.invoke('python:setVersion', pathCmd),

  // Local Ollama AI
  getOllamaStatus: () => ipcRenderer.invoke('ollama:status'),
  ollamaStatus: () => ipcRenderer.invoke('ollama:status'),
  streamChat: ({ model, messages }, { onChunk, onDone, onError }) => {
    const requestId = Math.random().toString(36).substring(2, 9);
    const chunkChannel = `ollama:chat:chunk:${requestId}`;
    const doneChannel = `ollama:chat:done:${requestId}`;
    const errorChannel = `ollama:chat:error:${requestId}`;

    const cleanup = () => {
      ipcRenderer.removeAllListeners(chunkChannel);
      ipcRenderer.removeAllListeners(doneChannel);
      ipcRenderer.removeAllListeners(errorChannel);
    };

    ipcRenderer.on(chunkChannel, (_evt, data) => onChunk && onChunk(data));
    ipcRenderer.on(doneChannel, () => {
      cleanup();
      if (onDone) onDone();
    });
    ipcRenderer.on(errorChannel, (_evt, err) => {
      cleanup();
      if (onError) onError(err);
    });

    ipcRenderer.send('ollama:chat:stream', { model, messages, requestId });
    return cleanup;
  },
  ollamaChatStream: (args, onChunk, onDone, onError) => {
    // Handle both argument formats: ({ model, messages, requestId }, onChunk, ...) or ({ model, messages }, { onChunk, ... })
    if (typeof onChunk === 'function') {
      const requestId = args?.requestId || Math.random().toString(36).substring(2, 9);
      const chunkChannel = `ollama:chat:chunk:${requestId}`;
      const doneChannel = `ollama:chat:done:${requestId}`;
      const errorChannel = `ollama:chat:error:${requestId}`;

      const cleanup = () => {
        ipcRenderer.removeAllListeners(chunkChannel);
        ipcRenderer.removeAllListeners(doneChannel);
        ipcRenderer.removeAllListeners(errorChannel);
      };

      ipcRenderer.on(chunkChannel, (_evt, data) => onChunk && onChunk(data));
      ipcRenderer.on(doneChannel, () => {
        cleanup();
        if (onDone) onDone();
      });
      ipcRenderer.on(errorChannel, (_evt, err) => {
        cleanup();
        if (onError) onError(err);
      });

      ipcRenderer.send('ollama:chat:stream', { model: args.model, messages: args.messages, requestId });
      return cleanup;
    } else {
      return spvm3Api.streamChat(args, onChunk);
    }
  }
};

contextBridge.exposeInMainWorld('spvm3', spvm3Api);
// Backward compatibility bridge
contextBridge.exposeInMainWorld('codeforge', spvm3Api);
