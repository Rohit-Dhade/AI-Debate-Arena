import { useState, useRef, useEffect } from "react";

// ─── Theme & Design Tokens ───────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,500;0,9..40,700;1,9..40,300&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a24;
    --border: #2a2a3a;
    --red: #ff3b5c;
    --red-dim: #ff3b5c22;
    --red-glow: #ff3b5c44;
    --blue: #3b8bff;
    --blue-dim: #3b8bff22;
    --blue-glow: #3b8bff44;
    --gold: #f5c542;
    --gold-dim: #f5c54222;
    --text: #e8e8f0;
    --text-dim: #7070a0;
    --text-dimmer: #40405a;
    --radius: 12px;
    --radius-lg: 20px;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* Noise texture overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 9999;
    opacity: 0.3;
  }

  .app {
    max-width: 1400px;
    margin: 0 auto;
    padding: 24px 20px 60px;
    min-height: 100vh;
  }

  /* ── Header ── */
  .header {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
  }
  .header-eyebrow {
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .header-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 8vw, 96px);
    letter-spacing: 0.04em;
    line-height: 1;
    background: linear-gradient(90deg, var(--red) 0%, #fff 45%, var(--blue) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .header-sub {
    font-size: 14px;
    color: var(--text-dim);
    margin-top: 10px;
    font-weight: 300;
  }
  .header-line {
    width: 100%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--border), transparent);
    margin-top: 28px;
  }

  /* ── Topic Setup ── */
  .topic-setup {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 28px 32px;
    margin-bottom: 32px;
  }
  .topic-setup-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-bottom: 12px;
  }
  .topic-row {
    display: flex;
    gap: 12px;
    align-items: stretch;
  }
  .topic-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 18px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
  }
  .topic-input::placeholder { color: var(--text-dimmer); }
  .topic-input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px var(--gold-dim); }

  .btn {
    border: none;
    border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    white-space: nowrap;
  }
  .btn:active { transform: scale(0.97); }
  .btn-gold {
    background: var(--gold);
    color: #0a0a0f;
    padding: 14px 28px;
    font-size: 14px;
    letter-spacing: 0.04em;
  }
  .btn-gold:hover { background: #f7d060; box-shadow: 0 4px 20px var(--gold-dim); }
  .btn-gold:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-sm-red {
    background: var(--red-dim);
    color: var(--red);
    border: 1px solid var(--red-glow);
    padding: 8px 16px;
    font-size: 13px;
  }
  .btn-sm-red:hover { background: var(--red-glow); }

  .btn-sm-blue {
    background: var(--blue-dim);
    color: var(--blue);
    border: 1px solid var(--blue-glow);
    padding: 8px 16px;
    font-size: 13px;
  }
  .btn-sm-blue:hover { background: var(--blue-glow); }

  .btn-outline {
    background: transparent;
    color: var(--text-dim);
    border: 1px solid var(--border);
    padding: 8px 16px;
    font-size: 13px;
  }
  .btn-outline:hover { border-color: var(--text-dim); color: var(--text); }

  /* ── Active Topic Banner ── */
  .active-topic {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    background: linear-gradient(135deg, #0f0f1a, #151525);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 20px 28px;
    margin-bottom: 28px;
  }
  .active-topic-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .active-topic-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(20px, 3vw, 32px);
    letter-spacing: 0.03em;
    color: var(--text);
  }
  .active-topic-right { display: flex; gap: 10px; flex-shrink: 0; }

  /* ── Debate Arena ── */
  .arena {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    gap: 0;
    margin-bottom: 28px;
    position: relative;
  }

  /* ── Model Panel ── */
  .model-panel {
    background: var(--surface);
    border: 1px solid var(--border);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-height: 520px;
    position: relative;
    transition: border-color 0.3s;
  }
  .model-panel.left { border-radius: var(--radius-lg) 0 0 var(--radius-lg); }
  .model-panel.right { border-radius: 0 var(--radius-lg) var(--radius-lg) 0; }
  .model-panel.active-left { border-color: var(--red); box-shadow: 0 0 40px var(--red-dim); }
  .model-panel.active-right { border-color: var(--blue); box-shadow: 0 0 40px var(--blue-dim); }
  .model-panel.winner-left { border-color: var(--gold); box-shadow: 0 0 60px var(--gold-dim); }
  .model-panel.winner-right { border-color: var(--gold); box-shadow: 0 0 60px var(--gold-dim); }

  .model-header {
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
    position: relative;
    overflow: hidden;
  }
  .model-header-left .model-accent { background: linear-gradient(135deg, var(--red-glow), transparent); }
  .model-header-right .model-accent { background: linear-gradient(135deg, transparent, var(--blue-glow)); }
  .model-accent {
    position: absolute;
    inset: 0;
    opacity: 0.4;
  }
  .model-header-info { position: relative; z-index: 1; }
  .model-tag {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .model-tag.red { color: var(--red); }
  .model-tag.blue { color: var(--blue); }
  .model-name {
    font-weight: 700;
    font-size: 16px;
    color: var(--text);
  }
  .model-name-input {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 6px 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
    outline: none;
    width: 160px;
  }
  .model-name-input:focus { border-color: var(--text-dim); }

  .model-score {
    position: relative;
    z-index: 1;
    text-align: right;
  }
  .score-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; color: var(--text-dimmer); letter-spacing: 0.15em; }
  .score-value {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 36px;
    line-height: 1;
  }
  .score-value.red { color: var(--red); }
  .score-value.blue { color: var(--blue); }

  /* ── Messages ── */
  .messages {
    flex: 1;
    padding: 20px 24px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }
  .message {
    display: flex;
    flex-direction: column;
    gap: 6px;
    animation: msgIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes msgIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .message-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .message-meta.red { color: var(--red); }
  .message-meta.blue { color: var(--blue); }
  .message-meta.user { color: var(--gold); }
  .message-meta.system { color: var(--text-dimmer); }
  .message-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .message-dot.red { background: var(--red); }
  .message-dot.blue { background: var(--blue); }
  .message-dot.gold { background: var(--gold); }
  .message-dot.dim { background: var(--text-dimmer); }
  .message-bubble {
    background: var(--surface2);
    border-radius: var(--radius);
    padding: 14px 16px;
    font-size: 14px;
    line-height: 1.6;
    color: var(--text);
    border-left: 2px solid transparent;
  }
  .message-bubble.red { border-color: var(--red); }
  .message-bubble.blue { border-color: var(--blue); }
  .message-bubble.user { border-color: var(--gold); background: #1a1a10; }
  .message-bubble.system { border-color: var(--text-dimmer); opacity: 0.7; font-style: italic; font-size: 13px; }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--text-dimmer);
    gap: 10px;
    padding: 40px;
    text-align: center;
  }
  .empty-icon { font-size: 32px; opacity: 0.3; }
  .empty-text { font-size: 13px; line-height: 1.5; }

  /* ── Typing Indicator ── */
  .typing {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 12px 16px;
    background: var(--surface2);
    border-radius: var(--radius);
    width: fit-content;
  }
  .typing span {
    width: 6px; height: 6px;
    border-radius: 50%;
    animation: bounce 1.2s infinite;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  .typing.red span { background: var(--red); }
  .typing.blue span { background: var(--blue); }
  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-6px); opacity: 1; }
  }

  /* ── VS Divider ── */
  .vs-divider {
    width: 64px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    position: relative;
    z-index: 2;
    flex-shrink: 0;
  }
  .vs-label {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--text-dimmer);
    position: relative;
  }
  .vs-label::before, .vs-label::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 1px;
    background: linear-gradient(to bottom, transparent, var(--border));
    transform: translateX(-50%);
  }
  .vs-label::before { bottom: 100%; height: 60px; }
  .vs-label::after { top: 100%; height: 60px; background: linear-gradient(to top, transparent, var(--border)); }
  .round-badge {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    color: var(--text-dim);
    text-align: center;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 4px 10px;
    white-space: nowrap;
  }

  /* ── Model Footer (Ask Question) ── */
  .model-footer {
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 8px;
  }
  .question-input {
    flex: 1;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s;
    resize: none;
  }
  .question-input::placeholder { color: var(--text-dimmer); }
  .question-input.red:focus { border-color: var(--red); }
  .question-input.blue:focus { border-color: var(--blue); }

  .send-btn {
    background: none;
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px 14px;
    cursor: pointer;
    color: var(--text-dim);
    font-size: 16px;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .send-btn.red:hover { border-color: var(--red); color: var(--red); background: var(--red-dim); }
  .send-btn.blue:hover { border-color: var(--blue); color: var(--blue); background: var(--blue-dim); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  /* ── Controls Bar ── */
  .controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .controls-divider { width: 1px; height: 24px; background: var(--border); }

  /* ── Winner Declare ── */
  .winner-bar {
    background: linear-gradient(135deg, #1a1600, #121200);
    border: 1px solid var(--gold);
    border-radius: var(--radius-lg);
    padding: 20px 28px;
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    animation: msgIn 0.4s ease both;
    box-shadow: 0 0 40px var(--gold-dim);
  }
  .winner-left { display: flex; align-items: center; gap: 16px; }
  .trophy { font-size: 36px; animation: trophySpin 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  @keyframes trophySpin {
    from { transform: rotate(-30deg) scale(0); }
    to { transform: rotate(0deg) scale(1); }
  }
  .winner-info { }
  .winner-announce {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 4px;
  }
  .winner-name {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    color: var(--text);
    letter-spacing: 0.05em;
  }
  .winner-reason {
    font-size: 13px;
    color: var(--text-dim);
    max-width: 500px;
    line-height: 1.5;
  }

  /* ── Status Pill ── */
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 14px;
    border-radius: 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 11px;
    letter-spacing: 0.1em;
    border: 1px solid;
  }
  .status-pill.idle { border-color: var(--text-dimmer); color: var(--text-dim); }
  .status-pill.debating { border-color: var(--gold); color: var(--gold); }
  .status-pill.ended { border-color: var(--red); color: var(--red); }
  .pulse { width: 7px; height: 7px; border-radius: 50%; background: currentColor; animation: pulse 1.5s infinite; }
  @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.7); } }

  /* ── Declare Winner Modal ── */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.2s ease both;
  }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  .modal {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 36px;
    max-width: 480px;
    width: 90%;
    animation: modalIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  }
  @keyframes modalIn {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  .modal-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 32px;
    letter-spacing: 0.05em;
    color: var(--gold);
    margin-bottom: 8px;
  }
  .modal-sub { font-size: 14px; color: var(--text-dim); margin-bottom: 24px; line-height: 1.5; }
  .modal-options { display: flex; flex-direction: column; gap: 12px; }
  .winner-option {
    background: var(--surface2);
    border: 2px solid var(--border);
    border-radius: var(--radius);
    padding: 16px 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 14px;
    transition: all 0.15s;
  }
  .winner-option:hover.red-option { border-color: var(--red); background: var(--red-dim); }
  .winner-option:hover.blue-option { border-color: var(--blue); background: var(--blue-dim); }
  .winner-option-icon { font-size: 24px; }
  .winner-option-name { font-weight: 700; font-size: 15px; }
  .winner-option-hint { font-size: 12px; color: var(--text-dim); }
  .modal-reason {
    margin-top: 20px;
  }
  .modal-reason-label { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.2em; color: var(--text-dim); text-transform: uppercase; margin-bottom: 8px; }
  .modal-reason-input {
    width: 100%;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 16px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--text);
    outline: none;
    resize: none;
    height: 80px;
  }
  .modal-reason-input:focus { border-color: var(--gold); }
  .modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }

  /* ── Scoreboard ── */
  .scoreboard {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px 28px;
    margin-bottom: 28px;
  }
  .scoreboard-title {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    letter-spacing: 0.25em;
    color: var(--text-dim);
    text-transform: uppercase;
    margin-bottom: 16px;
  }
  .score-bar-row { display: flex; align-items: center; gap: 14px; margin-bottom: 10px; }
  .score-bar-name { font-size: 13px; font-weight: 700; width: 140px; flex-shrink: 0; }
  .score-bar-track {
    flex: 1;
    height: 8px;
    background: var(--surface2);
    border-radius: 4px;
    overflow: hidden;
  }
  .score-bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .score-bar-fill.red { background: var(--red); }
  .score-bar-fill.blue { background: var(--blue); }
  .score-bar-count { font-family: 'Bebas Neue', sans-serif; font-size: 20px; width: 30px; text-align: right; flex-shrink: 0; }
  .score-bar-count.red { color: var(--red); }
  .score-bar-count.blue { color: var(--blue); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .arena { grid-template-columns: 1fr; }
    .model-panel.left, .model-panel.right { border-radius: var(--radius-lg); }
    .vs-divider { width: 100%; flex-direction: row; height: 48px; }
    .vs-label::before, .vs-label::after { display: none; }
  }
`;

// ─── Main App Component ───────────────────────────────────────────────────────
export default function AIDebateArena() {
  const [topic, setTopic] = useState("");
  const [activeTopic, setActiveTopic] = useState("");
  const [debateState, setDebateState] = useState("idle"); // idle | debating | ended
  const [round, setRound] = useState(0);
  const [modelAName, setModelAName] = useState("GPT-4o");
  const [modelBName, setModelBName] = useState("Claude Opus");
  const [messagesA, setMessagesA] = useState([]);
  const [messagesB, setMessagesB] = useState([]);
  const [typingA, setTypingA] = useState(false);
  const [typingB, setTypingB] = useState(false);
  const [questionA, setQuestionA] = useState("");
  const [questionB, setQuestionB] = useState("");
  const [winner, setWinner] = useState(null); // { side, reason }
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerReason, setWinnerReason] = useState("");
  const [pendingWinner, setPendingWinner] = useState(null);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const scrollRefA = useRef(null);
  const scrollRefB = useRef(null);

  // Auto-scroll
  useEffect(() => { if (scrollRefA.current) scrollRefA.current.scrollTop = scrollRefA.current.scrollHeight; }, [messagesA, typingA]);
  useEffect(() => { if (scrollRefB.current) scrollRefB.current.scrollTop = scrollRefB.current.scrollHeight; }, [messagesB, typingB]);

  const startDebate = () => {
    if (!topic.trim()) return;
    setActiveTopic(topic.trim());
    setDebateState("debating");
    setRound(1);
    setMessagesA([{ type: "system", text: `Debate started on: "${topic.trim()}"` }]);
    setMessagesB([{ type: "system", text: `Debate started on: "${topic.trim()}"` }]);
    setWinner(null);
    setScoreA(0);
    setScoreB(0);
    setTopic("");
  };

  const resetDebate = () => {
    setDebateState("idle");
    setActiveTopic("");
    setMessagesA([]);
    setMessagesB([]);
    setTypingA(false);
    setTypingB(false);
    setWinner(null);
    setRound(0);
    setScoreA(0);
    setScoreB(0);
  };

  const simulateTyping = (setter, setTyping, msg, delay = 0) => {
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setter(prev => [...prev, msg]);
      }, 1200 + Math.random() * 800);
    }, delay);
  };

  const nextRound = () => {
    const nextR = round + 1;
    setRound(nextR);
    setTypingA(true);
    setTypingB(true);
    setTimeout(() => {
      setTypingA(false);
      setMessagesA(prev => [...prev, {
        type: "model",
        text: `[Round ${nextR}] Placeholder argument from ${modelAName}. Connect your backend to populate this with real model responses.`,
        round: nextR
      }]);
    }, 1500 + Math.random() * 700);
    setTimeout(() => {
      setTypingB(false);
      setMessagesB(prev => [...prev, {
        type: "model",
        text: `[Round ${nextR}] Placeholder argument from ${modelBName}. Wire this up with your API response stream.`,
        round: nextR
      }]);
    }, 1800 + Math.random() * 900);
  };

  const sendQuestion = (side) => {
    const q = side === "A" ? questionA : questionB;
    if (!q.trim()) return;
    const modelName = side === "A" ? modelAName : modelBName;
    const setter = side === "A" ? setMessagesA : setMessagesB;
    const qSetter = side === "A" ? setQuestionA : setQuestionB;
    const setTyping = side === "A" ? setTypingA : setTypingB;

    setter(prev => [...prev, { type: "user", text: q.trim() }]);
    qSetter("");

    simulateTyping(setter, setTyping,
      { type: "model", text: `${modelName} response to: "${q.trim()}" — (connect backend to get real answer)` },
      300
    );
  };

  const handleDeclareWinner = (side) => {
    setPendingWinner(side);
    if (!showWinnerModal) {
      // already selecting from modal
    }
  };

  const confirmWinner = () => {
    if (!pendingWinner) return;
    setWinner({ side: pendingWinner, reason: winnerReason });
    setDebateState("ended");
    if (pendingWinner === "A") setScoreA(s => s + 1);
    else setScoreB(s => s + 1);
    setShowWinnerModal(false);
    setWinnerReason("");
    setPendingWinner(null);
  };

  const winnerName = winner?.side === "A" ? modelAName : modelBName;
  const maxScore = Math.max(scoreA, scoreB, 1);

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">

        {/* ── Header ── */}
        <div className="header">
          <div className="header-eyebrow">⚡ Real-time Intelligence Showdown</div>
          <div className="header-title">AI Debate Arena</div>
          <div className="header-sub">Two models. One topic. You decide the winner.</div>
          <div className="header-line" />
        </div>

        {/* ── Topic Setup or Active Topic ── */}
        {debateState === "idle" ? (
          <div className="topic-setup">
            <div className="topic-setup-label">🎯 Set the debate topic</div>
            <div className="topic-row">
              <input
                className="topic-input"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === "Enter" && startDebate()}
                placeholder="e.g. AI will replace human creativity within 10 years..."
              />
              <button className="btn btn-gold" onClick={startDebate} disabled={!topic.trim()}>
                Start Debate ⚔️
              </button>
            </div>
          </div>
        ) : (
          <div className="active-topic">
            <div>
              <div className="active-topic-label">🎯 Current Topic</div>
              <div className="active-topic-text">{activeTopic}</div>
            </div>
            <div className="active-topic-right">
              <span className={`status-pill ${debateState === "debating" ? "debating" : "ended"}`}>
                <span className="pulse" />
                {debateState === "debating" ? `Round ${round}` : "Debate Ended"}
              </span>
              {debateState === "debating" && (
                <>
                  <button className="btn btn-gold" style={{ padding: "10px 20px", fontSize: 13 }} onClick={nextRound}>
                    Next Round →
                  </button>
                  <button className="btn btn-outline" onClick={() => setShowWinnerModal(true)}>
                    🏆 Declare Winner
                  </button>
                </>
              )}
              <button className="btn btn-outline" onClick={resetDebate}>
                ↺ Reset
              </button>
            </div>
          </div>
        )}

        {/* ── Winner Banner ── */}
        {winner && (
          <div className="winner-bar">
            <div className="winner-left">
              <div className="trophy">🏆</div>
              <div className="winner-info">
                <div className="winner-announce">Winner Declared</div>
                <div className="winner-name">{winnerName}</div>
                {winner.reason && <div className="winner-reason">{winner.reason}</div>}
              </div>
            </div>
            <button className="btn btn-outline" onClick={resetDebate}>New Debate</button>
          </div>
        )}

        {/* ── Scoreboard ── */}
        {(scoreA > 0 || scoreB > 0) && (
          <div className="scoreboard">
            <div className="scoreboard-title">📊 Session Scoreboard</div>
            <div className="score-bar-row">
              <div className="score-bar-name" style={{ color: "var(--red)" }}>{modelAName}</div>
              <div className="score-bar-track">
                <div className="score-bar-fill red" style={{ width: `${(scoreA / maxScore) * 100}%` }} />
              </div>
              <div className="score-bar-count red">{scoreA}</div>
            </div>
            <div className="score-bar-row">
              <div className="score-bar-name" style={{ color: "var(--blue)" }}>{modelBName}</div>
              <div className="score-bar-track">
                <div className="score-bar-fill blue" style={{ width: `${(scoreB / maxScore) * 100}%` }} />
              </div>
              <div className="score-bar-count blue">{scoreB}</div>
            </div>
          </div>
        )}

        {/* ── Arena ── */}
        <div className="arena">
          {/* Model A */}
          <div className={`model-panel left ${typingA ? "active-left" : ""} ${winner?.side === "A" ? "winner-left" : ""}`}>
            <div className="model-header model-header-left">
              <div className="model-accent" />
              <div className="model-header-info">
                <div className="model-tag red">Model A · PRO</div>
                <input
                  className="model-name-input"
                  value={modelAName}
                  onChange={e => setModelAName(e.target.value)}
                  placeholder="Model name..."
                />
              </div>
              <div className="model-score">
                <div className="score-label">WINS</div>
                <div className="score-value red">{scoreA}</div>
              </div>
            </div>

            <div className="messages" ref={scrollRefA}>
              {messagesA.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div className="empty-text">Set a topic and start the debate to see {modelAName}'s arguments here.</div>
                </div>
              ) : (
                <>
                  {messagesA.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} side="A" />
                  ))}
                  {typingA && (
                    <div>
                      <div className="message-meta red"><span className="message-dot red" />{modelAName} is typing...</div>
                      <div className="typing red" style={{ marginTop: 6 }}>
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {debateState === "debating" && (
              <div className="model-footer">
                <textarea
                  className="question-input red"
                  rows={1}
                  value={questionA}
                  onChange={e => setQuestionA(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion("A"); } }}
                  placeholder={`Ask ${modelAName} a question…`}
                />
                <button className="send-btn red" onClick={() => sendQuestion("A")} disabled={!questionA.trim()}>↑</button>
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="vs-divider">
            <div className="vs-label">VS</div>
            {activeTopic && <div className="round-badge">Round {round}</div>}
          </div>

          {/* Model B */}
          <div className={`model-panel right ${typingB ? "active-right" : ""} ${winner?.side === "B" ? "winner-right" : ""}`}>
            <div className="model-header model-header-right">
              <div className="model-accent" />
              <div className="model-header-info">
                <div className="model-tag blue">Model B · CON</div>
                <input
                  className="model-name-input"
                  value={modelBName}
                  onChange={e => setModelBName(e.target.value)}
                  placeholder="Model name..."
                />
              </div>
              <div className="model-score">
                <div className="score-label">WINS</div>
                <div className="score-value blue">{scoreB}</div>
              </div>
            </div>

            <div className="messages" ref={scrollRefB}>
              {messagesB.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <div className="empty-text">Set a topic and start the debate to see {modelBName}'s arguments here.</div>
                </div>
              ) : (
                <>
                  {messagesB.map((msg, i) => (
                    <MessageBubble key={i} msg={msg} side="B" />
                  ))}
                  {typingB && (
                    <div>
                      <div className="message-meta blue"><span className="message-dot blue" />{modelBName} is typing...</div>
                      <div className="typing blue" style={{ marginTop: 6 }}>
                        <span /><span /><span />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {debateState === "debating" && (
              <div className="model-footer">
                <textarea
                  className="question-input blue"
                  rows={1}
                  value={questionB}
                  onChange={e => setQuestionB(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendQuestion("B"); } }}
                  placeholder={`Ask ${modelBName} a question…`}
                />
                <button className="send-btn blue" onClick={() => sendQuestion("B")} disabled={!questionB.trim()}>↑</button>
              </div>
            )}
          </div>
        </div>

        {/* ── Winner Modal ── */}
        {showWinnerModal && (
          <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowWinnerModal(false); }}>
            <div className="modal">
              <div className="modal-title">Declare a Winner</div>
              <div className="modal-sub">Who made the strongest argument? Select the winner for this debate.</div>
              <div className="modal-options">
                <div
                  className={`winner-option red-option ${pendingWinner === "A" ? "active" : ""}`}
                  style={pendingWinner === "A" ? { borderColor: "var(--red)", background: "var(--red-dim)" } : {}}
                  onClick={() => setPendingWinner("A")}
                >
                  <div className="winner-option-icon">🔴</div>
                  <div>
                    <div className="winner-option-name">{modelAName}</div>
                    <div className="winner-option-hint">Model A · PRO side</div>
                  </div>
                  {pendingWinner === "A" && <span style={{ marginLeft: "auto", color: "var(--red)", fontSize: 18 }}>✓</span>}
                </div>
                <div
                  className={`winner-option blue-option ${pendingWinner === "B" ? "active" : ""}`}
                  style={pendingWinner === "B" ? { borderColor: "var(--blue)", background: "var(--blue-dim)" } : {}}
                  onClick={() => setPendingWinner("B")}
                >
                  <div className="winner-option-icon">🔵</div>
                  <div>
                    <div className="winner-option-name">{modelBName}</div>
                    <div className="winner-option-hint">Model B · CON side</div>
                  </div>
                  {pendingWinner === "B" && <span style={{ marginLeft: "auto", color: "var(--blue)", fontSize: 18 }}>✓</span>}
                </div>
              </div>
              <div className="modal-reason">
                <div className="modal-reason-label">Reason (optional)</div>
                <textarea
                  className="modal-reason-input"
                  value={winnerReason}
                  onChange={e => setWinnerReason(e.target.value)}
                  placeholder="Why did this model win? Better logic, more persuasive, etc..."
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" onClick={() => { setShowWinnerModal(false); setPendingWinner(null); }}>
                  Cancel
                </button>
                <button className="btn btn-gold" onClick={confirmWinner} disabled={!pendingWinner}>
                  🏆 Confirm Winner
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

// ─── Message Bubble Component ────────────────────────────────────────────────
function MessageBubble({ msg, side }) {
  const color = msg.type === "user" ? "user" : msg.type === "system" ? "system" : side === "A" ? "red" : "blue";
  const dotColor = msg.type === "user" ? "gold" : msg.type === "system" ? "dim" : side === "A" ? "red" : "blue";
  const label = msg.type === "user" ? "YOU" : msg.type === "system" ? "SYSTEM" : side === "A" ? "MODEL A" : "MODEL B";

  return (
    <div className="message">
      <div className={`message-meta ${color}`}>
        <span className={`message-dot ${dotColor}`} />
        {label}
        {msg.round && <span style={{ opacity: 0.6 }}>· Round {msg.round}</span>}
      </div>
      <div className={`message-bubble ${color}`}>{msg.text}</div>
    </div>
  );
}