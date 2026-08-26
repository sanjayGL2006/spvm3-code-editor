// Thin wrapper around the IPC bridge exposed in preload.js.
// All calls stay on localhost — no API key, no network egress.

export async function getOllamaStatus() {
  const bridge = typeof window !== 'undefined' ? (window.codeforge || window.spvm3) : null;
  if (!bridge) return { running: false, models: [] };

  const getStatus = bridge.getOllamaStatus || bridge.ollamaStatus;
  if (typeof getStatus === 'function') {
    try {
      return await getStatus();
    } catch (err) {
      console.error('Error fetching Ollama status:', err);
      return { running: false, models: [] };
    }
  }

  return { running: false, models: [] };
}

export function streamChat({ model, messages }, { onChunk, onDone, onError }) {
  const bridge = typeof window !== 'undefined' ? (window.codeforge || window.spvm3) : null;
  if (!bridge) {
    if (onError) onError('IPC bridge not available');
    return () => {};
  }

  if (typeof bridge.streamChat === 'function') {
    return bridge.streamChat({ model, messages }, { onChunk, onDone, onError });
  }

  if (typeof bridge.ollamaChatStream === 'function') {
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    return bridge.ollamaChatStream({ model, messages, requestId }, onChunk, onDone, onError);
  }

  if (onError) onError('Stream chat function not available');
  return () => {};
}
