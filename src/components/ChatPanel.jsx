import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { getOllamaStatus, streamChat } from '../services/ollama.js';

export default function ChatPanel({ activeFile }) {
  const [status, setStatus] = useState({ running: false, models: [] });
  const [model, setModel] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Hi, I'm your local coding assistant. I run entirely on your machine through Ollama — no API key, no cloud calls. Ask me to explain, refactor, or write code."
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    getOllamaStatus().then((s) => {
      if (!mounted) return;
      setStatus(s);
      if (s.models.length && !model) setModel(s.models[0]);
    });
    const interval = setInterval(() => {
      getOllamaStatus().then((s) => mounted && setStatus(s));
    }, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  function send() {
    if (!input.trim() || streaming || !status.running || !model) return;

    const contextNote = activeFile
      ? `\n\n(Context: the user currently has "${activeFile.name}" open in the editor.)`
      : '';
    const userMessage = { role: 'user', content: input };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);

    const assistantDraft = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantDraft]);

    streamChat(
      {
        model,
        messages: [...nextMessages.slice(0, -1), { role: 'user', content: userMessage.content + contextNote }]
      },
      {
        onChunk: (data) => {
          const piece = data?.message?.content || '';
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = {
              ...copy[copy.length - 1],
              content: copy[copy.length - 1].content + piece
            };
            return copy;
          });
        },
        onDone: () => setStreaming(false),
        onError: (err) => {
          setStreaming(false);
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: 'assistant', content: `Error talking to Ollama: ${err}` };
            return copy;
          });
        }
      }
    );
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <h2>Assistant</h2>
        {status.models.length > 0 ? (
          <select className="model-select" value={model} onChange={(e) => setModel(e.target.value)}>
            {status.models.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        ) : (
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>no models</span>
        )}
      </div>

      {!status.running && (
        <div className="ollama-warning">
          Ollama isn't running, so the assistant can't respond yet. Install it from{' '}
          <strong>ollama.com</strong>, then run e.g. <code>ollama pull qwen2.5-coder</code> and{' '}
          <code>ollama serve</code>. Everything then runs locally — no API key needed.
        </div>
      )}
      {status.running && status.models.length === 0 && (
        <div className="ollama-warning">
          Ollama is running but no models are pulled yet. Run <code>ollama pull qwen2.5-coder</code> in a
          terminal, then come back here.
        </div>
      )}

      <div className="chat-messages" ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.role}`}>
            <span className="role">{m.role === 'user' ? 'You' : 'Assistant'}</span>
            <div className="bubble">{m.content || (streaming && i === messages.length - 1 ? '…' : '')}</div>
          </div>
        ))}
      </div>

      <div className="chat-input-area">
        <textarea
          placeholder={activeFile ? `Ask about ${activeFile.name}…` : 'Ask anything about your code…'}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button className="send-btn" onClick={send} disabled={streaming || !status.running || !model}>
          <Sparkles size={16} style={{ display: streaming ? 'block' : 'none' }} />
          {!streaming && <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
