/**
 * Safura AI — Premium Mobile PWA Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Service Worker Registration ─────────────────────────────
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW error', err));
  }

  const API_URL = 'http://localhost:3000/api';

  // ── Feature Metadata (No Emojis) ────────────────────────────
  const MODULE_META = {
    scan: { 
      name: 'Food Scanner', 
      desc: 'Identify food and get full nutritional breakdowns instantly.',
      hint: 'Describe or name a food to scan...',
      actions: ['Scan from camera', 'Upload food photo', 'Type food name manually']
    },
    allergen: { 
      name: 'Allergen Guard', 
      desc: 'Strict safety checks for 14 EU-mandated allergens.',
      hint: 'Enter a food to check allergens...',
      actions: ['Check ingredient list', 'Scan barcode', 'Verify menu item']
    },
    nutrition: { 
      name: 'Nutrition Coach', 
      desc: 'Personalized daily macro guidance based on your profile.',
      hint: 'Ask about your daily nutrition...',
      actions: ['Review daily macros', 'Log a recent meal', 'Get meal suggestions']
    },
    encyclopedia: { 
      name: 'Global Encyclopedia', 
      desc: 'Deep dive into the cultural origins and significance of global cuisine.',
      hint: 'Name a dish or cuisine to explore...',
      actions: ['Discover random cuisine', 'Explore regional dishes', 'Search ingredient origin']
    },
    menu: { 
      name: 'Menu Scanner', 
      desc: 'Translate and analyze restaurant menus for safety and macros.',
      hint: 'Type or paste menu items...',
      actions: ['Scan physical menu', 'Paste text menu', 'Translate foreign menu']
    },
    travel: { 
      name: 'Travel Assistant', 
      desc: 'Navigate your dietary needs safely in foreign countries.',
      hint: 'What country are you visiting?',
      actions: ['Get translation cards', 'Find safe local dishes', 'Learn local food customs']
    },
    recipe: { 
      name: 'Recipe Generator', 
      desc: 'Create custom, safe recipes from the ingredients you have.',
      hint: 'List your ingredients...',
      actions: ['Generate from pantry', 'Create quick 15-min meal', 'Find allergen-free alternative']
    },
    mealplan: { 
      name: 'Meal Planner', 
      desc: 'Automated 7-day nutritional planning tailored to your goals.',
      hint: 'Describe your dietary goals...',
      actions: ['Generate weekly plan', 'Create budget-friendly plan', 'Build high-protein plan']
    },
    freshness: { 
      name: 'Freshness Detector', 
      desc: 'Estimate food spoilage and safety based on visual cues.',
      hint: 'Describe the food to check...',
      actions: ['Scan produce', 'Check expiry guidelines', 'How to store properly']
    },
    carbon: { 
      name: 'Carbon Footprint', 
      desc: 'Track the sustainability and CO₂ impact of your meals.',
      hint: 'Enter a food for its CO₂ impact...',
      actions: ['Check ingredient impact', 'Find sustainable alternatives', 'View daily footprint']
    }
  };

  // ── View State Management ───────────────────────────────────
  const views = {
    splash: document.getElementById('splash-screen'),
    auth:   document.getElementById('auth-screen'),
    main:   document.getElementById('main-shell')
  };

  const setAppView = (viewName) => {
    Object.values(views).forEach(v => v.classList.remove('active'));
    if (views[viewName]) views[viewName].classList.add('active');
  };

  // ── Auth Forms ──────────────────────────────────────────────
  const loginForm    = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  document.getElementById('to-register').addEventListener('click', () => {
    loginForm.classList.remove('active');
    registerForm.classList.add('active');
  });

  document.getElementById('to-login').addEventListener('click', () => {
    registerForm.classList.remove('active');
    loginForm.classList.add('active');
  });

  const apiPost = async (endpoint, body) => {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    return res.json();
  };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email    = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errEl    = document.getElementById('login-error');
    try {
      errEl.textContent = 'Authenticating...';
      const data = await apiPost('/user/login', { email, password });
      if (data.success) {
        localStorage.setItem('safura_token', data.token);
        localStorage.setItem('safura_user', JSON.stringify(data.user));
        document.getElementById('user-name').textContent = data.user.name.split(' ')[0];
        setAppView('main');
      } else {
        errEl.textContent = data.error || 'Authentication failed';
      }
    } catch { errEl.textContent = 'Network error. Please try again.'; }
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name     = document.getElementById('register-name').value;
    const email    = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errEl    = document.getElementById('register-error');
    try {
      errEl.textContent = 'Provisioning account...';
      const data = await apiPost('/user/register', { name, email, password });
      if (data.success) {
        localStorage.setItem('safura_token', data.token);
        localStorage.setItem('safura_user', JSON.stringify(data.user));
        document.getElementById('user-name').textContent = data.user.name.split(' ')[0];
        setAppView('main');
      } else {
        errEl.textContent = data.error || 'Registration failed';
      }
    } catch { errEl.textContent = 'Network error. Please try again.'; }
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('safura_token');
    localStorage.removeItem('safura_user');
    setAppView('auth');
  });

  // ── Initialization ──────────────────────────────────────────
  setTimeout(() => {
    const token = localStorage.getItem('safura_token');
    const user  = JSON.parse(localStorage.getItem('safura_user') || 'null');
    if (token && user) {
      document.getElementById('user-name').textContent = user.name.split(' ')[0];
      setAppView('main');
    } else {
      setAppView('auth');
    }
  }, 2000);

  // ── Bottom Navigation Routing ──────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');
  const tabViews = document.querySelectorAll('.tab-view');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      const targetId = 'view-' + item.dataset.target;
      tabViews.forEach(t => t.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');
    });
  });

  // ── Profile Safety Toggles ─────────────────────────────────
  function getActiveAllergens() {
    const active = [];
    document.querySelectorAll('.toggle-item').forEach(item => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      const label = item.querySelector('.toggle-label').textContent;
      if (checkbox.checked) active.push(label);
    });
    return active;
  }

  // ── Feature Details Slide-in (Nested Flow) ─────────────────
  const featureDetailsScreen = document.getElementById('feature-details-screen');
  const featureBackBtn = document.getElementById('feature-back-btn');
  const featureDetailTitle = document.getElementById('feature-detail-title');
  const featureDetailIcon = document.getElementById('feature-detail-icon');
  const featureDetailName = document.getElementById('feature-detail-name');
  const featureDetailDesc = document.getElementById('feature-detail-desc');
  const featureActionList = document.getElementById('feature-action-list');
  let currentSelectedMode = null;

  document.querySelectorAll('.module-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const mode = item.dataset.mode;
      const meta = MODULE_META[mode];
      if (!meta) return;

      currentSelectedMode = mode;
      
      // Update UI
      featureDetailTitle.textContent = meta.name;
      featureDetailName.textContent = meta.name;
      featureDetailDesc.textContent = meta.desc;
      featureDetailIcon.innerHTML = item.querySelector('.mod-icon-wrapper').innerHTML;

      // Render Options/Actions
      featureActionList.innerHTML = '';
      meta.actions.forEach(actionText => {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.innerHTML = `
          <span>${actionText}</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
        `;
        btn.addEventListener('click', () => {
          featureDetailsScreen.classList.remove('open');
          openChatModule(mode, `I want to: ${actionText}`);
        });
        featureActionList.appendChild(btn);
      });

      // Also add a manual "Start Chat" option
      const chatBtn = document.createElement('button');
      chatBtn.className = 'action-btn';
      chatBtn.style.background = 'linear-gradient(135deg, rgba(93,202,165,0.1), transparent)';
      chatBtn.innerHTML = `
        <span>Start manual chat</span>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
      `;
      chatBtn.addEventListener('click', () => {
        featureDetailsScreen.classList.remove('open');
        openChatModule(mode, null);
      });
      featureActionList.appendChild(chatBtn);

      // Slide in
      featureDetailsScreen.classList.add('open');
    });
  });

  featureBackBtn.addEventListener('click', () => {
    featureDetailsScreen.classList.remove('open');
  });

  // ── AI Chat Modal ──────────────────────────────────────────
  const chatModal   = document.getElementById('chat-modal');
  const chatTitle   = document.getElementById('chat-title');
  const chatBody    = document.getElementById('chat-body');
  const chatInput   = document.getElementById('chat-input');
  const chatSendBtn = document.getElementById('chat-send-btn');
  const closeChatBtn = document.getElementById('close-chat');

  let chatHistory = [];

  closeChatBtn.addEventListener('click', () => {
    chatModal.classList.add('hidden');
    currentSelectedMode = null;
    chatHistory = [];
  });

  function openChatModule(mode, autoPrompt = null) {
    const meta = MODULE_META[mode];
    if (!meta) return;
    currentSelectedMode = mode;
    chatHistory = [];

    chatTitle.textContent = meta.name;
    chatInput.placeholder = meta.hint;
    chatBody.innerHTML = '';
    
    addChatMessage('system', `Connected to ${meta.name}. ${meta.desc}`);

    chatModal.classList.remove('hidden');
    
    if (autoPrompt) {
      chatInput.value = autoPrompt;
      sendChatMessage();
    } else {
      chatInput.focus();
    }
  }

  function addChatMessage(role, content) {
    const div = document.createElement('div');
    div.className = `chat-message ${role}`;
    const escaped = document.createElement('div');
    escaped.textContent = content;
    div.innerHTML = `<div class="msg-bubble">${escaped.innerHTML}</div>`;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function addLoadingMessage() {
    const div = document.createElement('div');
    div.className = 'chat-message system loading';
    div.id = 'loading-msg';
    div.innerHTML = `<div class="msg-bubble"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></div>`;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeLoadingMessage() {
    const el = document.getElementById('loading-msg');
    if (el) el.remove();
  }

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || !currentSelectedMode) return;

    addChatMessage('user', text);
    chatInput.value = '';
    chatHistory.push({ role: 'user', content: text });
    
    addLoadingMessage();
    chatSendBtn.disabled = true;

    try {
      const data = await apiPost('/chat', {
        mode: currentSelectedMode,
        messages: chatHistory,
        userProfile: {
          allergens: getActiveAllergens(),
          goals: 'general wellness'
        }
      });
      removeLoadingMessage();
      if (data.success) {
        addChatMessage('system', data.result);
        chatHistory.push({ role: 'assistant', content: data.result });
      } else {
        addChatMessage('system', 'Service unavailable. Please try again.');
      }
    } catch {
      removeLoadingMessage();
      addChatMessage('system', 'Connection failed. Verify network and backend availability.');
    } finally {
      chatSendBtn.disabled = false;
      chatInput.focus();
    }
  }

  chatSendBtn.addEventListener('click', sendChatMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendChatMessage();
  });

  // ── Quick Actions from Home Tab ────────────────────────────
  document.querySelectorAll('.scan-card-mini').forEach(card => {
    card.addEventListener('click', () => {
      const foodName = card.querySelector('h4').textContent;
      openChatModule('scan', `Can you scan this: ${foodName}`);
    });
  });

  // ── Plan Tab Action ────────────────────────────────────────
  const generatePlanBtn = document.querySelector('#view-plan .btn-primary');
  if (generatePlanBtn) {
    generatePlanBtn.addEventListener('click', async () => {
      generatePlanBtn.textContent = 'Generating Secure Plan...';
      generatePlanBtn.disabled = true;
      try {
        const data = await apiPost('/meal-plan/generate', {
          preferences: { days: 3 },
          userProfile: { allergens: getActiveAllergens() }
        });
        if (data.success) {
          const planCard = document.querySelector('#view-plan .plan-card');
          planCard.innerHTML = `<div class="plan-day">AI Curated Plan</div><pre style="white-space:pre-wrap;font-family:'Inter';font-size:0.85rem;line-height:1.6;color:#E2E8F0;">${data.result}</pre>`;
        }
      } catch {
        alert('API unavailable.');
      } finally {
        generatePlanBtn.textContent = 'Generate New Plan';
        generatePlanBtn.disabled = false;
      }
    });
  }

  // ── Camera Scan Action ─────────────────────────────────────
  const captureBtn = document.getElementById('capture-btn');
  const camScanModal = document.getElementById('scan-modal');
  const closeCamScan = document.getElementById('close-scan');
  
  if (captureBtn && camScanModal) {
    captureBtn.addEventListener('click', async () => {
      camScanModal.classList.remove('hidden');
      const body = document.getElementById('scan-result-body');
      body.innerHTML = '<div style="text-align:center;padding:2rem;color:#A0AEC0;">Processing visual data...</div>';
      
      try {
        const data = await apiPost('/scan/text', {
          foodName: 'Sushi Roll',
          userProfile: { allergens: getActiveAllergens() }
        });
        if (data.success) {
          body.innerHTML = `<h2 style="font-family:'Outfit';margin-bottom:1rem;">Analysis Complete</h2><pre style="white-space:pre-wrap;font-family:'Inter';font-size:0.9rem;line-height:1.6;color:#E2E8F0;">${data.result}</pre>`;
        } else {
          body.innerHTML = '<div style="color:#EF4444;">Processing failed.</div>';
        }
      } catch {
        body.innerHTML = '<div style="color:#EF4444;">Network connection lost.</div>';
      }
    });
    
    closeCamScan.addEventListener('click', () => {
      camScanModal.classList.add('hidden');
    });
  }
});
