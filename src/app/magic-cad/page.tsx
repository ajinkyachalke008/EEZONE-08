'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the 3D viewer to avoid SSR issues with Three.js
const CADViewer = dynamic(() => import('@/components/magic-cad/CADViewer'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: '#1a1a2e' }}>
      <div style={{ color: '#64748b', fontSize: '0.85rem' }}>Loading 3D Viewer...</div>
    </div>
  ),
});

// ── Example gallery ──
const EXAMPLES = [
  {
    name: 'Parametric Box',
    prompt: 'A parametric box with rounded edges, a lid, and a hinge mechanism',
    icon: '📦',
  },
  {
    name: 'Phone Stand',
    prompt: 'A phone stand with 60 degree angle, cable routing slot, and anti-slip base',
    icon: '📱',
  },
  {
    name: 'Gear',
    prompt: 'A detailed spur gear with 24 teeth, 40mm pitch diameter, and 5mm bore hole',
    icon: '⚙️',
  },
  {
    name: 'Vase',
    prompt: 'An elegant twisted vase with hexagonal cross-section and spiral pattern',
    icon: '🏺',
  },
  {
    name: 'Arduino Case',
    prompt: 'A snap-fit enclosure for Arduino Uno with ventilation slots and port cutouts',
    icon: '🔌',
  },
  {
    name: 'Desk Organizer',
    prompt: 'A modular desk organizer with pen holder, card slot, and phone cradle',
    icon: '🗂️',
  },
];

interface ScadParameter {
  name: string;
  value: number;
  comment: string;
}

export default function MagicCADPage() {
  const [prompt, setPrompt] = useState('');
  const [scadCode, setScadCode] = useState('');
  const [parameters, setParameters] = useState<ScadParameter[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [showCode, setShowCode] = useState(false);
  const [showParams, setShowParams] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const generate = useCallback(
    async (userPrompt: string, existingCode?: string) => {
      if (!userPrompt.trim()) return;
      setIsGenerating(true);
      setError(null);

      setChatHistory((h) => [...h, { role: 'user', content: userPrompt }]);
      setPrompt('');

      try {
        const res = await fetch('/api/magic-cad/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: userPrompt,
            currentScad: existingCode || undefined,
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Generation failed');
        }

        setScadCode(data.scadCode);
        setParameters(data.parameters || []);
        setChatHistory((h) => [
          ...h,
          {
            role: 'assistant',
            content: `✅ Generated ${data.parameters?.length || 0} parametric variables. Model ready for preview!`,
          },
        ]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        setError(msg);
        setChatHistory((h) => [...h, { role: 'assistant', content: `❌ Error: ${msg}` }]);
      } finally {
        setIsGenerating(false);
      }
    },
    []
  );

  const handleParamChange = useCallback(
    async (paramName: string, paramValue: number) => {
      try {
        const res = await fetch('/api/magic-cad/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentScad: scadCode,
            paramName,
            paramValue,
          }),
        });
        const data = await res.json();
        if (data.scadCode) {
          setScadCode(data.scadCode);
          setParameters(data.parameters || []);
        }
      } catch {
        // silently ignore param update errors
      }
    },
    [scadCode]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    generate(prompt, scadCode || undefined);
  };

  const handleExampleClick = (examplePrompt: string) => {
    generate(examplePrompt);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generate(prompt, scadCode || undefined);
    }
  };

  return (
    <div style={styles.container}>
      {/* ─── Left Panel: Chat + Controls ─── */}
      <div style={styles.leftPanel}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitle}>
            <span style={styles.headerIcon}>✨</span>
            <h1 style={styles.h1}>
              Magic<span style={styles.h1Accent}>CAD</span>
            </h1>
          </div>
          <p style={styles.headerSub}>AI-Powered 3D CAD Generation</p>
        </div>

        {/* Chat area */}
        <div style={styles.chatArea}>
          {chatHistory.length === 0 ? (
            <div style={styles.examplesContainer}>
              <p style={styles.examplesTitle}>Try an example</p>
              <div style={styles.examplesGrid}>
                {EXAMPLES.map((ex) => (
                  <button
                    key={ex.name}
                    onClick={() => handleExampleClick(ex.prompt)}
                    style={styles.exampleCard}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#6366f1';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(99,102,241,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#27272a';
                      (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.02)';
                    }}
                  >
                    <span style={styles.exampleIcon}>{ex.icon}</span>
                    <span style={styles.exampleName}>{ex.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={styles.chatMessages}>
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.chatBubble,
                    ...(msg.role === 'user' ? styles.chatUser : styles.chatBot),
                  }}
                >
                  <div style={styles.chatRole}>{msg.role === 'user' ? '👤 You' : '🤖 Magic CAD'}</div>
                  <div style={styles.chatText}>{msg.content}</div>
                </div>
              ))}
              {isGenerating && (
                <div style={{ ...styles.chatBubble, ...styles.chatBot }}>
                  <div style={styles.chatRole}>🤖 Magic CAD</div>
                  <div style={styles.chatText}>
                    <span style={styles.typingIndicator}>
                      <span style={styles.dot}>●</span>
                      <span style={{ ...styles.dot, animationDelay: '0.2s' }}>●</span>
                      <span style={{ ...styles.dot, animationDelay: '0.4s' }}>●</span>
                    </span>
                    Generating your 3D model...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        {/* Parameter sliders */}
        {parameters.length > 0 && showParams && (
          <div style={styles.paramsPanel}>
            <div style={styles.paramsPanelHeader}>
              <span style={styles.paramsPanelTitle}>⚙️ Parameters</span>
              <button style={styles.toggleBtn} onClick={() => setShowParams(false)}>
                ▼
              </button>
            </div>
            <div style={styles.paramsList}>
              {parameters.map((p) => (
                <div key={p.name} style={styles.paramRow}>
                  <div style={styles.paramLabel}>
                    <span style={styles.paramName}>{p.name}</span>
                    <span style={styles.paramValue}>{p.value}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.max(0, p.value * 0.1)}
                    max={p.value * 3}
                    step={p.value > 10 ? 1 : 0.1}
                    value={p.value}
                    onChange={(e) => handleParamChange(p.name, parseFloat(e.target.value))}
                    style={styles.slider}
                  />
                  <div style={styles.paramComment}>{p.comment}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {parameters.length > 0 && !showParams && (
          <button
            style={{ ...styles.toggleBtn, margin: '0 16px 8px', padding: '6px 12px' }}
            onClick={() => setShowParams(true)}
          >
            ⚙️ Show Parameters ({parameters.length})
          </button>
        )}

        {/* Input bar */}
        <form onSubmit={handleSubmit} style={styles.inputBar}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={scadCode ? 'Modify your design...' : 'Describe a 3D object to generate...'}
            style={styles.textarea}
            rows={1}
            disabled={isGenerating}
          />
          <button
            type="submit"
            disabled={isGenerating || !prompt.trim()}
            style={{
              ...styles.sendBtn,
              opacity: isGenerating || !prompt.trim() ? 0.4 : 1,
            }}
          >
            {isGenerating ? (
              <span style={styles.spinnerSmall}>⟳</span>
            ) : (
              '↑'
            )}
          </button>
        </form>

        {error && <div style={styles.errorBanner}>{error}</div>}
      </div>

      {/* ─── Right Panel: 3D Viewer + Code ─── */}
      <div style={styles.rightPanel}>
        {/* Tab bar */}
        <div style={styles.tabBar}>
          <button
            onClick={() => setShowCode(false)}
            style={{
              ...styles.tab,
              ...(showCode ? {} : styles.tabActive),
            }}
          >
            🎨 3D Preview
          </button>
          <button
            onClick={() => setShowCode(true)}
            style={{
              ...styles.tab,
              ...(showCode ? styles.tabActive : {}),
            }}
          >
            {'</>'} Code
          </button>
          {scadCode && (
            <button
              onClick={() => {
                const blob = new Blob([scadCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'magic-cad-model.scad';
                a.click();
                URL.revokeObjectURL(url);
              }}
              style={styles.downloadBtn}
            >
              ⬇ Download .scad
            </button>
          )}
        </div>

        {/* Content area */}
        <div style={styles.viewerArea}>
          {showCode ? (
            <div style={styles.codeEditor}>
              <textarea
                value={scadCode}
                onChange={(e) => {
                  setScadCode(e.target.value);
                  // re-extract params
                  const params: ScadParameter[] = [];
                  const lines = e.target.value.split('\n');
                  const RESERVED = new Set(['true', 'false', 'undef', 'PI', 'e']);
                  for (const line of lines) {
                    const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([\d.]+)\s*;?\s*(?:\/\/\s*(.*))?/);
                    if (match) {
                      const [, name, rawValue, comment] = match;
                      if (!RESERVED.has(name)) {
                        params.push({ name, value: parseFloat(rawValue), comment: comment?.trim() || name });
                      }
                    }
                  }
                  setParameters(params);
                }}
                style={styles.codeTextarea}
                spellCheck={false}
                placeholder="// OpenSCAD code will appear here after generation..."
              />
            </div>
          ) : scadCode ? (
            <CADViewer scadCode={scadCode} />
          ) : (
            <div style={styles.emptyViewer}>
              <div style={styles.emptyViewerInner}>
                <div style={styles.emptyIcon}>🎯</div>
                <h2 style={styles.emptyTitle}>Ready to Create</h2>
                <p style={styles.emptyText}>
                  Describe any 3D object and Magic CAD will generate parametric
                  OpenSCAD code with a live 3D preview.
                </p>
                <div style={styles.featureGrid}>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🧠</span>
                    <span>AI-Powered</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>⚙️</span>
                    <span>Parametric</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>🔄</span>
                    <span>Iterative</span>
                  </div>
                  <div style={styles.featureItem}>
                    <span style={styles.featureIcon}>📥</span>
                    <span>Exportable</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Watermark */}
        <div style={styles.watermark}>
          <span style={{ fontSize: '0.6rem', color: '#555' }}>Powered by</span>
          <span
            style={{
              fontSize: '0.7rem',
              fontWeight: 700,
              background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            EE ZONE
          </span>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          height: 4px;
          background: #27272a;
          border-radius: 2px;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #6366f1;
          cursor: pointer;
          border: 2px solid #1a1a2e;
        }
        textarea:focus { outline: none; }
      `}</style>
    </div>
  );
}

// ── Styles ──────────────────────────────────────────────────
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    height: 'calc(100vh - 64px)',
    background: '#09090b',
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    color: '#e4e4e7',
    overflow: 'hidden',
  },
  leftPanel: {
    width: 420,
    minWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #1e1e2e',
    background: '#0c0c14',
  },
  header: {
    padding: '20px 20px 14px',
    borderBottom: '1px solid #1e1e2e',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    fontSize: '1.4rem',
  },
  h1: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: '#f4f4f5',
    letterSpacing: '-0.02em',
  },
  h1Accent: {
    background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  headerSub: {
    margin: '4px 0 0',
    fontSize: '0.72rem',
    color: '#52525b',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  chatArea: {
    flex: 1,
    overflowY: 'auto' as const,
    padding: '16px',
  },
  examplesContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 16,
    paddingTop: 20,
  },
  examplesTitle: {
    fontSize: '0.8rem',
    color: '#71717a',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    margin: 0,
  },
  examplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 10,
  },
  exampleCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '12px 14px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid #27272a',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: '#d4d4d8',
    fontSize: '0.8rem',
    textAlign: 'left' as const,
  },
  exampleIcon: {
    fontSize: '1.2rem',
  },
  exampleName: {
    fontWeight: 500,
  },
  chatMessages: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 12,
  },
  chatBubble: {
    padding: '10px 14px',
    borderRadius: 10,
    fontSize: '0.82rem',
    lineHeight: 1.5,
  },
  chatUser: {
    background: 'rgba(99,102,241,0.12)',
    border: '1px solid rgba(99,102,241,0.2)',
    marginLeft: 20,
  },
  chatBot: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e1e2e',
    marginRight: 20,
  },
  chatRole: {
    fontSize: '0.68rem',
    color: '#71717a',
    marginBottom: 4,
    fontWeight: 600,
  },
  chatText: {
    color: '#d4d4d8',
  },
  typingIndicator: {
    display: 'inline-flex',
    gap: 3,
    marginRight: 8,
  },
  dot: {
    animation: 'pulse-dot 1s infinite',
    color: '#6366f1',
    fontSize: '0.5rem',
  },
  paramsPanel: {
    borderTop: '1px solid #1e1e2e',
    maxHeight: 200,
    overflowY: 'auto' as const,
  },
  paramsPanelHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    background: 'rgba(99,102,241,0.05)',
  },
  paramsPanelTitle: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#a1a1aa',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#71717a',
    cursor: 'pointer',
    fontSize: '0.7rem',
  },
  paramsList: {
    padding: '8px 16px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 10,
  },
  paramRow: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 4,
  },
  paramLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paramName: {
    fontSize: '0.72rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#a5b4fc',
  },
  paramValue: {
    fontSize: '0.72rem',
    fontFamily: "'JetBrains Mono', monospace",
    color: '#6366f1',
    fontWeight: 600,
  },
  paramComment: {
    fontSize: '0.62rem',
    color: '#52525b',
  },
  slider: {
    width: '100%',
    cursor: 'pointer',
  },
  inputBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '12px 16px',
    borderTop: '1px solid #1e1e2e',
    background: '#0c0c14',
  },
  textarea: {
    flex: 1,
    background: '#18181b',
    border: '1px solid #27272a',
    borderRadius: 10,
    padding: '10px 14px',
    color: '#e4e4e7',
    fontSize: '0.82rem',
    resize: 'none' as const,
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.4,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
    border: 'none',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'opacity 0.2s',
  },
  spinnerSmall: {
    animation: 'spin 1s linear infinite',
    display: 'inline-block',
  },
  errorBanner: {
    background: 'rgba(239,68,68,0.1)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 8,
    padding: '8px 16px',
    margin: '0 16px 12px',
    fontSize: '0.75rem',
    color: '#f87171',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    position: 'relative' as const,
    background: '#0f0f1a',
  },
  tabBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '8px 16px',
    borderBottom: '1px solid #1e1e2e',
    background: '#0c0c14',
  },
  tab: {
    padding: '6px 16px',
    background: 'transparent',
    border: '1px solid transparent',
    borderRadius: 8,
    color: '#71717a',
    fontSize: '0.78rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: 500,
  },
  tabActive: {
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.3)',
    color: '#a5b4fc',
  },
  downloadBtn: {
    marginLeft: 'auto',
    padding: '6px 14px',
    background: 'rgba(6,182,212,0.1)',
    border: '1px solid rgba(6,182,212,0.3)',
    borderRadius: 8,
    color: '#67e8f9',
    fontSize: '0.72rem',
    cursor: 'pointer',
    fontWeight: 500,
  },
  viewerArea: {
    flex: 1,
    position: 'relative' as const,
    overflow: 'hidden',
  },
  codeEditor: {
    height: '100%',
    display: 'flex',
  },
  codeTextarea: {
    flex: 1,
    background: '#0a0a12',
    border: 'none',
    color: '#a5b4fc',
    fontSize: '0.78rem',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    padding: 20,
    resize: 'none' as const,
    lineHeight: 1.6,
    tabSize: 2,
  },
  emptyViewer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    background: 'radial-gradient(ellipse at center, #111127 0%, #09090b 70%)',
  },
  emptyViewerInner: {
    textAlign: 'center' as const,
    maxWidth: 400,
  },
  emptyIcon: {
    fontSize: '3rem',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: '1.6rem',
    fontWeight: 700,
    color: '#f4f4f5',
    margin: '0 0 8px',
  },
  emptyText: {
    fontSize: '0.82rem',
    color: '#71717a',
    lineHeight: 1.6,
    margin: '0 0 24px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: 12,
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid #1e1e2e',
    borderRadius: 8,
    fontSize: '0.78rem',
    color: '#a1a1aa',
  },
  featureIcon: {
    fontSize: '1rem',
  },
  watermark: {
    position: 'absolute' as const,
    bottom: 12,
    right: 16,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 10px',
    borderRadius: 6,
    background: 'rgba(0,0,0,0.5)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.06)',
    pointerEvents: 'none' as const,
    zIndex: 10,
  },
};
