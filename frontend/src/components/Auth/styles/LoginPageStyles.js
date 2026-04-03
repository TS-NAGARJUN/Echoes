/**
 * @file components/Auth/styles/LoginPageStyles.js
 * @description Injected CSS for login page (split layout design)
 */

export const loginPageCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --night: #0d0f14;
    --panel: #13161e;
    --surface: #1a1e28;
    --rim: rgba(255,255,255,0.07);
    --accent: #7c6fff;
    --accent-2: #ff6eb3;
    --accent-glow: rgba(124,111,255,0.35);
    --muted: rgba(255,255,255,0.38);
    --text: rgba(255,255,255,0.92);
    --radius: 16px;
    --input-h: 52px;
    --ff-head: 'Syne', sans-serif;
    --ff-body: 'DM Sans', sans-serif;
  }

  body { background: var(--night); font-family: var(--ff-body); color: var(--text); }

  /* ── Page ── */
  .lp-root {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  /* ── Left panel ── */
  .lp-left {
    position: relative;
    background: var(--panel);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 3rem;
  }

  .lp-left-bg {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 60% 50% at 30% 20%, rgba(124,111,255,0.18) 0%, transparent 70%),
      radial-gradient(ellipse 50% 40% at 75% 80%, rgba(255,110,179,0.14) 0%, transparent 65%);
    pointer-events: none;
  }

  .lp-grid-lines {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
    background-size: 48px 48px;
    pointer-events: none;
  }

  .lp-brand {
    position: absolute;
    top: 2rem;
    left: 2.5rem;
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: var(--ff-head);
    font-weight: 700;
    font-size: 1.1rem;
    letter-spacing: -0.02em;
  }

  .lp-brand-dot {
    width: 28px; height: 28px;
    border-radius: 8px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    display: flex; align-items: center; justify-content: center;
    font-size: 14px;
  }

  /* ── Chat illustration ── */
  .chat-stage {
    position: relative;
    width: 100%;
    max-width: 380px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    z-index: 1;
  }

  .chat-bubble {
    display: flex;
    align-items: flex-end;
    gap: 10px;
    opacity: 0;
    transform: translateY(16px);
    animation: bubbleIn 0.5s cubic-bezier(0.34,1.4,0.64,1) forwards;
  }
  .chat-bubble.right { flex-direction: row-reverse; }

  .chat-avatar {
    width: 34px; height: 34px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 600;
    font-family: var(--ff-head);
  }
  .av-purple { background: rgba(124,111,255,0.2); color: var(--accent); border: 1px solid rgba(124,111,255,0.3); }
  .av-pink   { background: rgba(255,110,179,0.2); color: var(--accent-2); border: 1px solid rgba(255,110,179,0.3); }
  .av-teal   { background: rgba(29,158,117,0.2); color: #1d9e75; border: 1px solid rgba(29,158,117,0.3); }

  .chat-msg {
    max-width: 72%;
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 13.5px;
    line-height: 1.5;
    color: var(--text);
    position: relative;
  }
  .chat-bubble:not(.right) .chat-msg {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-bottom-left-radius: 4px;
  }
  .chat-bubble.right .chat-msg {
    background: linear-gradient(135deg, var(--accent), #9b8dff);
    border-bottom-right-radius: 4px;
    color: #fff;
  }

  .chat-typing {
    display: flex; align-items: flex-end; gap: 10px;
    opacity: 0;
    transform: translateY(12px);
    animation: bubbleIn 0.5s cubic-bezier(0.34,1.4,0.64,1) 2.8s forwards;
  }
  .typing-dots {
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: 18px; border-bottom-left-radius: 4px;
    padding: 12px 16px;
    display: flex; gap: 5px; align-items: center;
  }
  .typing-dots span {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--muted);
    animation: dot 1.4s ease-in-out infinite;
  }
  .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
  .typing-dots span:nth-child(3) { animation-delay: 0.4s; }

  .chat-tagline {
    margin-top: 2.5rem;
    text-align: center;
    z-index: 1;
  }
  .chat-tagline h2 {
    font-family: var(--ff-head);
    font-size: 2rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 1.2;
    background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.55));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .chat-tagline p {
    margin-top: 0.6rem;
    color: var(--muted);
    font-size: 0.9rem;
    font-weight: 300;
  }

  /* ── Right panel ── */
  .lp-right {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem 2rem;
    background: var(--night);
  }

  .lp-form-wrap {
    width: 100%;
    max-width: 400px;
  }

  .lp-form-header {
    margin-bottom: 2.5rem;
  }
  .lp-form-header h1 {
    font-family: var(--ff-head);
    font-size: 2.2rem;
    font-weight: 800;
    letter-spacing: -0.045em;
    line-height: 1.1;
    margin-bottom: 0.5rem;
  }
  .lp-form-header h1 span {
    background: linear-gradient(90deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .lp-form-header p {
    color: var(--muted);
    font-size: 0.9rem;
    font-weight: 300;
  }

  /* ── Inputs ── */
  .lp-field { margin-bottom: 1.25rem; }

  .lp-label {
    display: block;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 8px;
  }

  .lp-input-wrap {
    position: relative;
  }

  .lp-input-icon {
    position: absolute;
    left: 16px; top: 50%;
    transform: translateY(-50%);
    width: 16px; height: 16px;
    color: var(--muted);
    pointer-events: none;
    transition: color 0.2s;
  }

  .lp-input {
    width: 100%;
    height: var(--input-h);
    background: var(--surface);
    border: 1px solid var(--rim);
    border-radius: var(--radius);
    color: var(--text);
    font-family: var(--ff-body);
    font-size: 15px;
    padding: 0 16px 0 44px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    caret-color: var(--accent);
  }
  .lp-input::placeholder { color: var(--muted); }
  .lp-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accent-glow);
  }
  .lp-input.has-error { border-color: #e24b4a; }
  .lp-input.has-error:focus { box-shadow: 0 0 0 3px rgba(226,75,74,0.25); }

  .lp-error {
    margin-top: 6px;
    font-size: 12px;
    color: #e24b4a;
    display: flex; align-items: center; gap: 5px;
  }

  .lp-pwd-toggle {
    position: absolute;
    right: 14px; top: 50%;
    transform: translateY(-50%);
    background: none; border: none;
    color: var(--muted);
    cursor: pointer;
    padding: 4px;
    display: flex; align-items: center;
    transition: color 0.2s;
  }
  .lp-pwd-toggle:hover { color: var(--text); }

  /* ── Extras row ── */
  .lp-extras {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 0.5rem 0 1.75rem;
    font-size: 13px;
  }
  .lp-remember {
    display: flex; align-items: center; gap: 8px;
    cursor: pointer; color: var(--muted);
    user-select: none;
  }
  .lp-remember input[type="checkbox"] {
    width: 16px; height: 16px;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .lp-forgot {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .lp-forgot:hover { opacity: 0.75; }

  /* ── Terms checkbox ── */
  .lp-terms {
    display: flex; align-items: flex-start; gap: 8px;
    cursor: pointer; color: var(--muted);
    user-select: none; font-size: 14px; line-height: 1.4;
  }
  .lp-terms input[type="checkbox"] {
    width: 16px; height: 16px; margin-top: 2px;
    accent-color: var(--accent);
    cursor: pointer;
  }
  .lp-link {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
    transition: opacity 0.2s;
  }
  .lp-link:hover { opacity: 0.75; }

  /* ── Submit button ── */
  .lp-btn {
    width: 100%;
    height: var(--input-h);
    border: none;
    border-radius: var(--radius);
    background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
    color: #fff;
    font-family: var(--ff-head);
    font-size: 15px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform 0.15s, opacity 0.2s;
  }
  .lp-btn::before {
    content: '';
    position: absolute; inset: 0;
    background: rgba(255,255,255,0);
    transition: background 0.2s;
  }
  .lp-btn:hover::before { background: rgba(255,255,255,0.1); }
  .lp-btn:active { transform: scale(0.985); }
  .lp-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  .lp-btn-shimmer {
    position: absolute;
    top: 0; left: -100%; bottom: 0;
    width: 60%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    animation: shimmer 2.4s ease-in-out infinite;
  }

  .lp-footer {
    text-align: center;
    margin-top: 1.75rem;
    font-size: 13.5px;
    color: var(--muted);
  }
  .lp-footer a {
    color: var(--accent);
    text-decoration: none;
    font-weight: 500;
  }
  .lp-footer a:hover { opacity: 0.75; }

  /* ── Animations ── */
  @keyframes bubbleIn {
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes dot {
    0%, 80%, 100% { transform: scale(1); opacity: 0.5; }
    40% { transform: scale(1.3); opacity: 1; }
  }
  @keyframes shimmer {
    0% { left: -100%; }
    60%, 100% { left: 160%; }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .fade-up { opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.25,1,0.5,1) forwards; }
  .delay-1 { animation-delay: 0.08s; }
  .delay-2 { animation-delay: 0.16s; }
  .delay-3 { animation-delay: 0.24s; }
  .delay-4 { animation-delay: 0.32s; }
  .delay-5 { animation-delay: 0.40s; }
  .delay-6 { animation-delay: 0.48s; }
  .delay-7 { animation-delay: 0.56s; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .lp-root { grid-template-columns: 1fr; }
    .lp-left  { display: none; }
    .lp-right { min-height: 100vh; }
  }
`;
