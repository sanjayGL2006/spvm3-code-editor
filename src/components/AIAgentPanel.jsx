import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Bot, Shield, Check, X, Code, RefreshCw, Cpu, Database, Eye } from 'lucide-react';
import { getOllamaStatus, streamChat } from '../services/ollama.js';
import { ragIndexer } from '../services/ragIndexer.js';

export default function AIAgentPanel({ activeFile, onApplyCodeFix, isOpen, onClose }) {
  const [status, setStatus] = useState({ running: false, models: [] });
  const [model, setModel] = useState('');
  const [provider, setProvider] = useState('ollama'); // 'ollama' | 'openai' | 'gemini' | 'claude'
  const [agentMode, setAgentMode] = useState('Ask'); // Ask, Explain, Fix, Edit, Agent, Debug, Test, Learn, Review
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Welcome to **SPVM3 AI Agent**. I run offline on your system using Ollama — zero cloud dependencies or API keys required. Choose a mode below (Ask, Explain, Fix, Edit, Learn, Review) to assist your coding."
    }
  ]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [proposedCodeFix, setProposedCodeFix] = useState(null);
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

  const modes = [
    { id: 'Ask', label: 'Ask' },
    { id: 'Explain', label: 'Explain' },
    { id: 'Fix', label: 'Fix' },
    { id: 'Edit', label: 'Edit' },
    { id: 'Agent', label: 'Agent' },
    { id: 'Debug', label: 'Debug' },
    { id: 'Test', label: 'Test' },
    { id: 'Learn', label: 'Learn' },
    { id: 'Review', label: 'Review' }
  ];

  function send() {
    if (!input.trim() || streaming) return;

    // Local RAG project context retrieval
    const ragContext = ragIndexer.queryContext(input);

    const contextHeader = activeFile
      ? `\n\n[Active File Context: ${activeFile.name}]\nCode:\n\`\`\`\n${activeFile.content.slice(0, 1000)}\n\`\`\``
      : '';

    const modePromptPrefix = `[Mode: ${agentMode}] `;
    const userContent = input;
    const finalPrompt = modePromptPrefix + userContent + contextHeader + ragContext;

    const userMessage = { role: 'user', content: userContent };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setStreaming(true);

    const assistantDraft = { role: 'assistant', content: '' };
    setMessages((prev) => [...prev, assistantDraft]);

    if (!status.running || !model) {
      // Graceful local fallback simulation if Ollama service is offline
      setTimeout(() => {
        const fallbackText = getOfflineFallbackResponse(agentMode, userContent, activeFile);
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: fallbackText };
          return copy;
        });
        setStreaming(false);
      }, 500);
      return;
    }

    streamChat(
      {
        model,
        messages: [...nextMessages.slice(0, -1), { role: 'user', content: finalPrompt }]
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
            copy[copy.length - 1] = {
              role: 'assistant',
              content: `Local AI Error: ${err}. Ensure Ollama service is running locally.`
            };
            return copy;
          });
        }
      }
    );
  }

  if (!isOpen) return null;

  return (
    <div className="ai-agent-panel">
      <div className="agent-header">
        <div className="agent-title-row">
          <div className="title-left">
            <Sparkles size={16} color="var(--accent)" />
            <h3>SPVM3 Agent</h3>
          </div>
          <button className="panel-icon-btn" onClick={onClose}>
            <X size={14} />
          </button>
        </div>

        <div className="agent-selectors">
          <select value={provider} onChange={(e) => setProvider(e.target.value)} className="provider-select">
            <option value="ollama">Local (Ollama Offline)</option>
            <option value="openai">OpenAI (Cloud Extension)</option>
            <option value="gemini">Google Gemini (Extension)</option>
            <option value="claude">Anthropic Claude (Extension)</option>
          </select>

          {provider === 'ollama' && status.models.length > 0 ? (
            <select value={model} onChange={(e) => setModel(e.target.value)} className="model-select">
              {status.models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          ) : (
            <span className="badge offline">
              {status.running ? 'No Model Pulled' : 'Offline / Standby'}
            </span>
          )}
        </div>

        <div className="mode-pill-bar">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`mode-pill ${agentMode === m.id ? 'active' : ''}`}
              onClick={() => setAgentMode(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="agent-messages-container" ref={scrollRef}>
        {!status.running && (
          <div className="offline-notice-box">
            <Shield size={16} color="var(--accent)" />
            <div>
              <strong>Offline Coding Mode Active</strong>
              <p>No AI provider API key required. For full LLM features, install <a href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a> & run <code>ollama pull qwen2.5-coder</code>.</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`agent-message ${msg.role}`}>
            <div className="msg-header">
              {msg.role === 'user' ? <Code size={13} /> : <Bot size={13} color="var(--accent)" />}
              <span>{msg.role === 'user' ? 'You' : 'SPVM3 Agent'}</span>
            </div>
            <div className="msg-body">{msg.content}</div>
          </div>
        ))}
      </div>

      <div className="agent-input-footer">
        <div className="active-context-tag">
          <Database size={12} />
          <span>Context: {activeFile ? activeFile.name : 'Workspace Files'} (RAG Local Index)</span>
        </div>
        <div className="input-row">
          <textarea
            placeholder={`Ask SPVM3 Agent in [${agentMode}] mode…`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
          />
          <button className="send-btn" onClick={send} disabled={streaming || !input.trim()}>
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getOfflineFallbackResponse(mode, query, activeFile) {
  const fileName = activeFile ? activeFile.name : 'your project';
  if (mode === 'Explain') {
    return `### Code Explanation for ${fileName}\n\nThis module defines structural code logic. The SPVM3 offline indexing engine parses variable scope, control structures, and function definitions. To get continuous deep neural explanations, launch Ollama locally.`;
  } else if (mode === 'Fix' || mode === 'Edit') {
    return `### Suggested Refactoring for ${fileName}\n\n\`\`\`javascript\n// Safe Fix Suggestion:\n// Check variable initialization and null bounds before dereferencing\nif (data && data.length > 0) {\n  processData(data);\n}\n\`\`\`\n\nClick **Accept Fix** to apply changes cleanly to your editor buffer.`;
  } else if (mode === 'Learn') {
    return `### Educational Concept: Scope & Execution\n\nIn ${fileName}, variables declared with \`let\` and \`const\` are block-scoped. Accessing them outside their block raises a \`ReferenceError\`.`;
  }
  return `SPVM3 Agent received your prompt in **${mode}** mode. Connect Ollama or an optional AI cloud extension to run full generative analysis on ${fileName}.`;
}
