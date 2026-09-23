/**
 * Viantha Solutions — Claude AI Chat Widget (SECURE VERSION)
 * ==========================================================
 * Embedded AI assistant trained on Viantha's services.
 *
 * HOW TO USE:
 * 1. Host the backend server (see server.js) on your domain.
 * 2. Add this line to every HTML page before </body>:
 *    <script src="viantha-ai-chat.js"></script>
 * 3. That's it. The chat bubble appears automatically.
 *
 * SECURITY: The API key is NEVER in this file. It lives on the server.
 */

(function () {
  'use strict';

  // ── Config ──────────────────────────────────────────────────────
  const CONFIG = {
    // Point this to your backend endpoint (see server.js)
    // If your website is https://vianthait.com, this should be
    // https://vianthait.com/api/chat
    backendUrl: '/api/chat',
    brandName:   'Viantha Solutions',
    brandColor:  '#0a2540',
    accentColor: '#1a5fd4',
    greenColor:  '#4caf50',
    position:    'right',
    offsetX:     24,
    offsetY:     90,
  };

  // ── System prompt — Viantha knowledge base ───────────────────────
  const SYSTEM_PROMPT = `You are the AI assistant for Viantha Solutions, a specialist technology company. Your role is to help website visitors understand Viantha's services, answer questions, qualify leads, and connect them to the right team.

ABOUT VIANTHA SOLUTIONS:
Viantha Solutions is a global technology company founded in 2026, specialising in:
1. Banking Technology — core banking modernisation, payment systems (UPI, IMPS, SWIFT), open banking APIs, RBI compliance, KYC/AML automation, digital banking products
2. AI & Intelligent Automation — fraud detection, document processing, KYC automation, predictive analytics, AI chatbots, intelligent workflows for financial institutions
3. IT Staff Augmentation — specialist contract engineers (banking tech, AI/ML, cloud, full-stack, DevOps, QA) placed with enterprises across Asia, US, and UK
4. Cloud & DevOps — AWS, Azure, GCP architecture, CI/CD, Kubernetes, Terraform, managed services
5. Digital Transformation — legacy modernisation, API-first architecture, process automation

CLIENTS WE SERVE:
- Banks and NBFCs needing banking technology
- Fintech startups building financial products
- Global enterprises needing specialist IT engineers on contract
- US and UK companies needing remote Indian engineering talent
- IT companies (TCS, Infosys, HCL) needing staffing subvendors

CONTACT:
- Email: info@vianthait.com
- Phone: +91 (4322) 223-098
- WhatsApp: +91 9342147239
- Website: www.vianthait.com

INSTRUCTIONS:
- Be friendly, professional, and concise. Maximum 3-4 sentences per reply.
- Always try to understand what the visitor needs and match it to Viantha's services.
- For staffing enquiries, ask: what role, how many resources, on-site or remote, duration.
- For banking tech, ask: what system or challenge they have.
- When a visitor wants to proceed, ask for their name, email, and company.
- If you cannot answer something specific, say: "Let me connect you to our team — they'll respond within one business day" and suggest WhatsApp or email.
- Never make up facts or pricing.
- Always end with a helpful follow-up question to keep the conversation moving.
- If the visitor seems ready to hire or engage, suggest: "You can also reach us directly on WhatsApp at +91 9342147239 for a faster response."`;

  // ── State ────────────────────────────────────────────────────────
  let messages = [];
  let isOpen   = false;
  let isTyping = false;

  // ── Inject styles ────────────────────────────────────────────────
  const css = `
    #vs-chat-widget * { box-sizing:border-box; margin:0; padding:0; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
    #vs-chat-widget { position:fixed; bottom:${CONFIG.offsetY}px; ${CONFIG.position}:${CONFIG.offsetX}px; z-index:9997; }
    #vs-chat-btn { width:52px; height:52px; border-radius:50%; background:${CONFIG.brandColor}; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 16px rgba(10,37,64,0.35); transition:transform 0.2s, box-shadow 0.2s; }
    #vs-chat-btn:hover { transform:scale(1.08); box-shadow:0 6px 22px rgba(10,37,64,0.45); }
    #vs-chat-btn svg   { width:26px; height:26px; fill:#fff; }
    #vs-chat-notif { position:absolute; top:-4px; right:-4px; width:16px; height:16px; border-radius:50%; background:#e74c3c; border:2px solid #fff; display:flex; align-items:center; justify-content:center; font-size:9px; color:#fff; font-weight:700; }
    #vs-chat-window { position:absolute; bottom:64px; ${CONFIG.position}:0; width:340px; background:#fff; border-radius:16px; box-shadow:0 8px 40px rgba(10,37,64,0.18); display:none; flex-direction:column; overflow:hidden; border:1px solid rgba(10,37,64,0.1); max-height:520px; }
    #vs-chat-window.open { display:flex; animation:vsChatIn 0.22s ease; }
    @keyframes vsChatIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    #vs-chat-header { background:${CONFIG.brandColor}; padding:14px 16px; display:flex; align-items:center; gap:12px; flex-shrink:0; }
    #vs-chat-avatar { width:38px; height:38px; border-radius:50%; background:${CONFIG.accentColor}; display:flex; align-items:center; justify-content:center; font-size:15px; font-weight:700; color:#fff; flex-shrink:0; }
    .vs-header-info { flex:1; }
    .vs-header-info h4 { color:#fff; font-size:13px; font-weight:600; line-height:1.2; }
    .vs-header-info span { color:rgba(255,255,255,0.65); font-size:11px; display:flex; align-items:center; gap:4px; margin-top:2px; }
    .vs-online-dot { width:6px; height:6px; border-radius:50%; background:${CONFIG.greenColor}; flex-shrink:0; }
    #vs-close-btn { background:rgba(255,255,255,0.15); border:none; border-radius:50%; width:26px; height:26px; cursor:pointer; color:#fff; font-size:16px; display:flex; align-items:center; justify-content:center; transition:background 0.15s; }
    #vs-close-btn:hover { background:rgba(255,255,255,0.25); }
    #vs-suggested { padding:10px 12px 0; display:flex; flex-wrap:wrap; gap:6px; flex-shrink:0; background:#f8fafc; border-bottom:1px solid #e2e8f0; }
    .vs-chip { background:#fff; border:1px solid #e2e8f0; border-radius:20px; padding:5px 12px; font-size:11.5px; color:#0a2540; cursor:pointer; transition:all 0.15s; margin-bottom:8px; }
    .vs-chip:hover { background:${CONFIG.accentColor}; color:#fff; border-color:${CONFIG.accentColor}; }
    #vs-messages { flex:1; overflow-y:auto; padding:14px 14px 8px; display:flex; flex-direction:column; gap:10px; scroll-behavior:smooth; }
    #vs-messages::-webkit-scrollbar { width:4px; }
    #vs-messages::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
    .vs-msg { display:flex; gap:8px; align-items:flex-end; max-width:88%; }
    .vs-msg.bot  { align-self:flex-start; }
    .vs-msg.user { align-self:flex-end; flex-direction:row-reverse; }
    .vs-bubble { padding:9px 13px; border-radius:14px; font-size:13px; line-height:1.55; color:#1e293b; }
    .vs-msg.bot  .vs-bubble { background:#f1f5f9; border-bottom-left-radius:4px; }
    .vs-msg.user .vs-bubble { background:${CONFIG.accentColor}; color:#fff; border-bottom-right-radius:4px; }
    .vs-msg-avatar { width:26px; height:26px; border-radius:50%; background:${CONFIG.brandColor}; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; color:#fff; flex-shrink:0; }
    .vs-typing { display:flex; gap:4px; padding:10px 14px; align-items:center; }
    .vs-typing span { width:7px; height:7px; border-radius:50%; background:#94a3b8; animation:vsTyping 1.2s infinite; }
    .vs-typing span:nth-child(2) { animation-delay:0.2s; }
    .vs-typing span:nth-child(3) { animation-delay:0.4s; }
    @keyframes vsTyping { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-5px)} }
    #vs-input-area { padding:10px 12px; border-top:1px solid #e2e8f0; display:flex; gap:8px; align-items:flex-end; background:#fff; flex-shrink:0; }
    #vs-input { flex:1; border:1px solid #e2e8f0; border-radius:10px; padding:9px 12px; font-size:13px; color:#1e293b; resize:none; outline:none; min-height:38px; max-height:90px; font-family:inherit; transition:border-color 0.2s; line-height:1.4; }
    #vs-input:focus { border-color:${CONFIG.accentColor}; }
    #vs-input::placeholder { color:#94a3b8; }
    #vs-send-btn { width:36px; height:36px; border-radius:10px; background:${CONFIG.accentColor}; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; transition:background 0.15s; }
    #vs-send-btn:hover { background:#1451b8; }
    #vs-send-btn svg { width:16px; height:16px; fill:#fff; }
    #vs-send-btn:disabled { background:#94a3b8; cursor:not-allowed; }
    #vs-footer-note { text-align:center; font-size:10px; color:#94a3b8; padding:6px 12px 10px; background:#fff; flex-shrink:0; }
    #vs-footer-note a { color:${CONFIG.accentColor}; text-decoration:none; }
    .vs-escalate-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-top:4px; }
    .vs-escalate-card p { font-size:12px; color:#475569; margin-bottom:8px; }
    .vs-esc-btns { display:flex; gap:6px; flex-wrap:wrap; }
    .vs-esc-btn { padding:6px 12px; border-radius:8px; font-size:12px; font-weight:500; cursor:pointer; border:none; transition:opacity 0.15s; }
    .vs-esc-btn.wa  { background:#25D366; color:#fff; }
    .vs-esc-btn.em  { background:${CONFIG.accentColor}; color:#fff; }
    .vs-esc-btn:hover { opacity:0.88; }
    @media(max-width:400px){ #vs-chat-window { width:calc(100vw - 24px); ${CONFIG.position}:0; } }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── Build widget HTML ────────────────────────────────────────────
  const widget = document.createElement('div');
  widget.id = 'vs-chat-widget';
  widget.innerHTML = `
    <div id="vs-chat-window">
      <div id="vs-chat-header">
        <div id="vs-chat-avatar">V</div>
        <div class="vs-header-info">
          <h4>${CONFIG.brandName} AI</h4>
          <span><div class="vs-online-dot"></div>Online — replies instantly</span>
        </div>
        <button id="vs-close-btn" aria-label="Close chat">&#215;</button>
      </div>
      <div id="vs-suggested">
        <div class="vs-chip" data-msg="What banking technology services do you offer?">Banking Tech</div>
        <div class="vs-chip" data-msg="I need to hire an IT specialist on contract">Hire Talent</div>
        <div class="vs-chip" data-msg="Tell me about your AI solutions">AI Solutions</div>
        <div class="vs-chip" data-msg="How do I get started with Viantha?">Get Started</div>
      </div>
      <div id="vs-messages"></div>
      <div id="vs-input-area">
        <textarea id="vs-input" placeholder="Ask anything about our services…" rows="1" aria-label="Chat message"></textarea>
        <button id="vs-send-btn" aria-label="Send message" disabled>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="vs-footer-note">
        Powered by Viantha AI &nbsp;·&nbsp;
        <a href="mailto:info@vianthait.com">Email us</a> &nbsp;·&nbsp;
        <a href="https://wa.me/919342147239" target="_blank">WhatsApp</a>
      </div>
    </div>
    <button id="vs-chat-btn" aria-label="Open Viantha AI chat">
      <div id="vs-chat-notif">1</div>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
    </button>
  `;
  document.body.appendChild(widget);

  // ── DOM refs ─────────────────────────────────────────────────────
  const chatWindow  = document.getElementById('vs-chat-window');
  const chatBtn     = document.getElementById('vs-chat-btn');
  const closeBtn    = document.getElementById('vs-close-btn');
  const messagesEl  = document.getElementById('vs-messages');
  const inputEl     = document.getElementById('vs-input');
  const sendBtn     = document.getElementById('vs-send-btn');
  const notifDot    = document.getElementById('vs-chat-notif');
  const suggestedEl = document.getElementById('vs-suggested');

  // ── Helpers ──────────────────────────────────────────────────────
  function appendMessage(role, text) {
    const wrap = document.createElement('div');
    wrap.className = `vs-msg ${role}`;
    const bubble = document.createElement('div');
    bubble.className = 'vs-bubble';
    // Use textContent for user input to prevent XSS attacks, innerHTML for bot (trusted)
    if (role === 'user') {
      bubble.textContent = text;
    } else {
      bubble.innerHTML = text.replace(/\n/g, '<br>');
    }
    if (role === 'bot') {
      const av = document.createElement('div');
      av.className = 'vs-msg-avatar';
      av.textContent = 'V';
      wrap.appendChild(av);
    }
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'vs-typing'; t.id = 'vs-typing-ind';
    t.innerHTML = '<span></span><span></span><span></span>';
    messagesEl.appendChild(t);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    const t = document.getElementById('vs-typing-ind');
    if (t) t.remove();
  }

  function showEscalateCard() {
    const card = document.createElement('div');
    card.className = 'vs-escalate-card';
    card.innerHTML = `
      <p>Connect with our team directly:</p>
      <div class="vs-esc-btns">
        <button class="vs-esc-btn wa" onclick="window.open('https://wa.me/919342147239?text=${encodeURIComponent('Hi Viantha Solutions! I need to speak with your team.')}','_blank')">💬 WhatsApp</button>
        <button class="vs-esc-btn em" onclick="window.location.href='mailto:info@vianthait.com'">✉ Email Us</button>
      </div>`;
    messagesEl.appendChild(card);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  // ── Open / close ─────────────────────────────────────────────────
  function openChat() {
    isOpen = true;
    chatWindow.classList.add('open');
    notifDot.style.display = 'none';
    if (messages.length === 0) {
      setTimeout(() => {
        showTyping();
        setTimeout(() => {
          removeTyping();
          const greeting = `Hi there! 👋 I'm Viantha's AI assistant. I can help you with:\n• Banking technology solutions\n• Hiring specialist IT engineers\n• AI & automation services\n\nWhat brings you here today?`;
          appendMessage('bot', greeting);
          messages.push({ role:'assistant', content: greeting });
        }, 900);
      }, 300);
    }
    inputEl.focus();
  }

  function closeChat() {
    isOpen = false;
    chatWindow.classList.remove('open');
  }

  chatBtn.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn.addEventListener('click', closeChat);

  // ── Suggested chips ──────────────────────────────────────────────
  suggestedEl.querySelectorAll('.vs-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const msg = chip.dataset.msg;
      suggestedEl.style.display = 'none';
      sendMessage(msg);
    });
  });

  // ── Input handling ───────────────────────────────────────────────
  inputEl.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 90) + 'px';
    sendBtn.disabled = this.value.trim().length === 0 || isTyping;
  });

  inputEl.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!sendBtn.disabled) sendMessage(this.value.trim());
    }
  });

  sendBtn.addEventListener('click', () => {
    const txt = inputEl.value.trim();
    if (txt && !isTyping) sendMessage(txt);
  });

  // ── Send message & call YOUR backend (not Anthropic directly) ────
  async function sendMessage(text) {
    if (!text || isTyping) return;
    suggestedEl.style.display = 'none';

    appendMessage('user', text);
    messages.push({ role:'user', content: text });

    inputEl.value = '';
    inputEl.style.height = 'auto';
    sendBtn.disabled = true;
    isTyping = true;
    showTyping();

    const escalate = /speak.*(human|person|team|someone)|call|urgent|price|cost|quote|proposal/i.test(text);

    try {
      const response = await fetch(CONFIG.backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: SYSTEM_PROMPT,
          messages: messages.slice(-10)
        })
      });

      if (!response.ok) {
        throw new Error('Server error: ' + response.status);
      }

      const data = await response.json();
      removeTyping();

      if (data.reply) {
        appendMessage('bot', data.reply);
        messages.push({ role:'assistant', content: data.reply });
        if (escalate || /connect|team|email|whatsapp|call us/i.test(data.reply)) {
          setTimeout(showEscalateCard, 600);
        }
      } else {
        throw new Error('No reply from server');
      }

    } catch (err) {
      console.error('Chat error:', err);
      removeTyping();
      appendMessage('bot', "I'm having a moment — please try again or reach us directly.");
      showEscalateCard();
    }

    isTyping = false;
    sendBtn.disabled = inputEl.value.trim().length === 0;
  }

  // ── Auto-open after 45s if visitor hasn't interacted ────────────
  setTimeout(() => {
    if (!isOpen && messages.length === 0) {
      notifDot.style.display = 'flex';
      chatBtn.style.animation = 'vsPulse 1s ease 2';
    }
  }, 45000);

  const pulseCSS = document.createElement('style');
  pulseCSS.textContent = '@keyframes vsPulse{0%,100%{box-shadow:0 4px 16px rgba(10,37,64,0.35)}50%{box-shadow:0 4px 28px rgba(26,95,212,0.6)}}';
  document.head.appendChild(pulseCSS);

})();