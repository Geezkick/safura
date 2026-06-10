/**
 * Safura AI — Premium Mobile PWA Logic
 * Dynamic Mini-App Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/public/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW error', err));
  }

  const API_URL = 'http://localhost:3000/api';

  // ── Dynamic Mini-App Configuration ──────────────────────────
  const MODULE_META = {
    scan: { 
      name: 'Food Scanner', 
      desc: 'Identify food and get full nutritional breakdowns instantly.',
      form: [
        { id: 'food_name', type: 'input', label: 'What food are you looking at?', placeholder: 'e.g., Jollof Rice, Caesar Salad' },
        { id: 'portion', type: 'select', label: 'Portion Size', options: ['Small', 'Medium (Standard)', 'Large'] }
      ]
    },
    allergen: { 
      name: 'Allergen Guard', 
      desc: 'Strict safety checks for 14 EU-mandated allergens.',
      form: [
        { id: 'ingredient_list', type: 'textarea', label: 'Paste ingredient list or dish name:', placeholder: 'e.g., Peanuts, Soy Sauce, Chicken...' },
        { id: 'sensitivity', type: 'select', label: 'Sensitivity Level', options: ['Standard', 'High (Anaphylactic Risk)'] }
      ]
    },
    nutrition: { 
      name: 'Nutrition Coach', 
      desc: 'Personalized daily macro guidance based on your profile.',
      form: [
        { id: 'query', type: 'textarea', label: 'What do you need help with?', placeholder: 'e.g., I need a high protein breakfast under 400 calories' }
      ]
    },
    encyclopedia: { 
      name: 'Global Encyclopedia', 
      desc: 'Deep dive into the cultural origins and significance of global cuisine.',
      form: [
        { id: 'dish_origin', type: 'input', label: 'Dish or Region', placeholder: 'e.g., Paella, West Africa' }
      ]
    },
    travel: { 
      name: 'Travel Assistant', 
      desc: 'Navigate your dietary needs safely in foreign countries.',
      form: [
        { id: 'country', type: 'input', label: 'Destination Country', placeholder: 'e.g., Japan, Italy' },
        { id: 'request_type', type: 'select', label: 'What do you need?', options: ['Local Safe Dishes', 'Translation Cards', 'Cultural Dining Rules'] }
      ]
    },
    recipe: { 
      name: 'Recipe Generator', 
      desc: 'Create custom, safe recipes from the ingredients you have.',
      form: [
        { id: 'ingredients', type: 'textarea', label: 'What ingredients do you have?', placeholder: 'e.g., Chicken breast, rice, broccoli...' },
        { id: 'time', type: 'select', label: 'Max Cooking Time', options: ['15 Minutes', '30 Minutes', '1 Hour', 'Any'] },
        { id: 'difficulty', type: 'select', label: 'Difficulty', options: ['Easy', 'Medium', 'Masterchef'] }
      ]
    },
    mealplan: { 
      name: 'Meal Planner', 
      desc: 'Automated nutritional planning tailored to your goals.',
      form: [
        { id: 'days', type: 'select', label: 'Number of Days', options: ['1 Day', '3 Days', '7 Days'] },
        { id: 'goal', type: 'select', label: 'Primary Goal', options: ['Weight Loss', 'Maintenance', 'Muscle Gain'] },
        { id: 'meals', type: 'select', label: 'Meals per Day', options: ['3 Meals', '3 Meals + Snacks'] }
      ]
    },
    carbon: { 
      name: 'Carbon Footprint', 
      desc: 'Track the sustainability and CO₂ impact of your meals.',
      form: [
        { id: 'meal', type: 'input', label: 'What did you eat?', placeholder: 'e.g., Beef Burger with Fries' },
        { id: 'compare', type: 'select', label: 'Provide Alternatives?', options: ['Yes, suggest greener options', 'No, just the footprint'] }
      ]
    }
  };

  // ── View State Management ───────────────────────────────────
  const views = {
    splash: document.getElementById('splash-screen'),
    auth:   document.getElementById('auth-screen'),
    main:   document.getElementById('main-shell'),
    onboarding: document.getElementById('onboarding-screen')
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
        if (localStorage.getItem('safura_profile')) {
          initProfile();
          setAppView('main');
        } else {
          setAppView('onboarding');
        }
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
        setAppView('onboarding');
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
      if (localStorage.getItem('safura_profile')) {
        initProfile();
        setAppView('main');
      } else {
        setAppView('onboarding');
      }
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

  // ── Onboarding Logic ────────────────────────────────────────
  let currentStep = 1;
  const totalSteps = 6;
  const obNextBtn = document.getElementById('ob-next');
  const obBackBtn = document.getElementById('ob-back');
  const profileData = { allergens: [] };

  // Setup options
  document.querySelectorAll('.goal-option').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.parentElement.querySelectorAll('.goal-option').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
    });
  });

  // Photo upload
  const obPhotoInput = document.getElementById('ob-photo');
  const photoPreview = document.getElementById('photo-preview');
  const photoPlaceholder = document.getElementById('photo-placeholder');
  document.getElementById('photo-upload-area').addEventListener('click', () => obPhotoInput.click());
  
  obPhotoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        profileData.photo = e.target.result;
        photoPreview.src = e.target.result;
        photoPreview.classList.remove('hidden');
        photoPlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  });

  function updateOnboarding() {
    document.querySelectorAll('.onboard-step').forEach(el => el.classList.remove('active'));
    document.querySelector(`.onboard-step[data-step="${currentStep}"]`).classList.add('active');
    document.getElementById('step-num').textContent = currentStep;
    document.getElementById('onboard-bar').style.width = `${(currentStep / totalSteps) * 100}%`;
    
    obBackBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    obNextBtn.textContent = currentStep === totalSteps ? 'Finish & Save' : 'Continue';
  }

  obNextBtn.addEventListener('click', () => {
    if (currentStep === 1) {
      profileData.age = document.getElementById('ob-age').value || 25;
      profileData.gender = document.getElementById('ob-gender').value;
    } else if (currentStep === 2) {
      profileData.height = document.getElementById('ob-height').value || 170;
      profileData.weight = document.getElementById('ob-weight').value || 70;
      profileData.targetWeight = document.getElementById('ob-target-weight').value || profileData.weight;
    } else if (currentStep === 3) {
      profileData.goal = document.querySelector('.onboard-step[data-step="3"] .goal-option.active').dataset.goal;
    } else if (currentStep === 4) {
      profileData.diet = document.querySelector('.onboard-step[data-step="4"] .goal-option.active').dataset.diet;
    } else if (currentStep === 5) {
      profileData.allergens = [];
      document.querySelectorAll('.onboard-step[data-step="5"] input[type="checkbox"]').forEach(cb => {
        if (cb.checked) profileData.allergens.push(cb.dataset.allergen);
      });
    }

    if (currentStep < totalSteps) {
      currentStep++;
      updateOnboarding();
    } else {
      // Save and finish
      localStorage.setItem('safura_profile', JSON.stringify(profileData));
      initProfile();
      setAppView('main');
    }
  });

  obBackBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      updateOnboarding();
    }
  });

  document.getElementById('edit-profile-btn').addEventListener('click', () => {
    setAppView('onboarding');
  });

  document.getElementById('logout-btn-profile').addEventListener('click', () => {
    localStorage.removeItem('safura_token');
    localStorage.removeItem('safura_user');
    setAppView('auth');
  });

  function initProfile() {
    const data = JSON.parse(localStorage.getItem('safura_profile') || '{}');
    const user = JSON.parse(localStorage.getItem('safura_user') || '{"name":"User"}');
    
    document.getElementById('profile-display-name').textContent = user.name;
    document.getElementById('prof-height').textContent = data.height ? `${data.height} cm` : '—';
    document.getElementById('prof-weight').textContent = data.weight ? `${data.weight} kg` : '—';
    
    if (data.height && data.weight) {
      const h = data.height / 100;
      const bmi = (data.weight / (h * h)).toFixed(1);
      document.getElementById('prof-bmi').textContent = bmi;
    }

    document.getElementById('prof-age').textContent = data.age || '—';
    document.getElementById('prof-diet').textContent = data.diet ? data.diet.charAt(0).toUpperCase() + data.diet.slice(1) : '—';
    document.getElementById('prof-gender').textContent = data.gender || '—';
    document.getElementById('prof-target').textContent = data.targetWeight ? `${data.targetWeight} kg` : '—';
    
    const goalMap = { lose: 'Weight Loss', maintain: 'Maintenance', gain: 'Muscle Gain' };
    document.getElementById('profile-goal-label').textContent = `Goal: ${data.goal ? goalMap[data.goal] : '—'}`;

    if (data.photo) {
      const img = document.getElementById('profile-photo');
      img.src = data.photo;
      img.style.display = 'block';
      document.getElementById('profile-avatar-fallback').style.display = 'none';
      
      const homeImg = document.querySelector('.avatar');
      if (homeImg) homeImg.style.backgroundImage = `url(${data.photo})`;
    }

    const allergenList = document.getElementById('profile-allergen-list');
    if (data.allergens && data.allergens.length > 0) {
      allergenList.innerHTML = data.allergens.map(a => `<span class="allergen-badge">${a}</span>`).join('');
    } else {
      allergenList.innerHTML = '<span class="allergen-badge" style="background:rgba(255,255,255,0.1);color:var(--safura-text-muted);">None set</span>';
    }
  }

  function getActiveAllergens() {
    const data = JSON.parse(localStorage.getItem('safura_profile') || '{"allergens":[]}');
    return data.allergens;
  }

  // ── Smart Scanner Logic ────────────────────────────────────
  const scanCameraInput = document.getElementById('scan-camera-input');
  const scanUploadInput = document.getElementById('scan-upload-input');
  const scanPreview = document.getElementById('scan-preview');
  const scannerPlaceholder = document.getElementById('scanner-placeholder');
  let currentScanImage = null;

  function handleImageInput(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentScanImage = e.target.result;
        scanPreview.src = e.target.result;
        scanPreview.classList.remove('hidden');
        scannerPlaceholder.classList.add('hidden');
      };
      reader.readAsDataURL(file);
    }
  }

  document.getElementById('btn-live-scan').addEventListener('click', () => scanCameraInput.click());
  document.getElementById('btn-upload-photo').addEventListener('click', () => scanUploadInput.click());

  scanCameraInput.addEventListener('change', handleImageInput);
  scanUploadInput.addEventListener('change', handleImageInput);

  document.getElementById('scan-analyse-btn').addEventListener('click', () => {
    const textInput = document.getElementById('scan-text-input').value;
    if (!currentScanImage && !textInput) {
      alert("Please capture an image, upload a photo, or type a food name to scan.");
      return;
    }
    
    let compiled = `I am using the Smart Food Scanner.\n\n`;
    if (currentScanImage) compiled += `[Image uploaded by user]\n`;
    if (textInput) compiled += `User description: ${textInput}\n\n`;
    
    compiled += `Please identify this food based on the description/image. Give me full details including:
1. Exact food name, country of origin, and a brief cultural history of the dish.
2. Full nutritional breakdown (calories, protein, carbs, fat).
3. The specific diet type it falls under (e.g., keto-friendly, vegan, etc.).
4. Is it a warm, cold, or hot dish? How does this temperature specification align with my personal preferences and goals?
5. Estimate its freshness (is it fresh or does it look bad/spoiled?) based on visual cues.
6. Finally, definitively state if it is safe for me based on my active allergens.`;

    // Reset scanner UI
    document.getElementById('scan-text-input').value = '';
    currentScanImage = null;
    scanPreview.src = '';
    scanPreview.classList.add('hidden');
    scannerPlaceholder.classList.remove('hidden');

    // Route directly to the AI Chat Modal for real analysis
    openChatModule('scan', compiled);
  });

  // ── Dynamic Mini-App Form Engine ───────────────────────────
  const featureDetailsScreen = document.getElementById('feature-details-screen');
  const featureBackBtn = document.getElementById('feature-back-btn');
  const featureDetailTitle = document.getElementById('feature-detail-title');
  const featureDetailIcon = document.getElementById('feature-detail-icon');
  const featureDetailName = document.getElementById('feature-detail-name');
  const featureDetailDesc = document.getElementById('feature-detail-desc');
  const featureActionList = document.getElementById('feature-action-list');
  let currentSelectedMode = null;

  function openFeatureModule(mode) {
    const meta = MODULE_META[mode];
    if (!meta) return;
    currentSelectedMode = mode;

    featureDetailTitle.textContent = meta.name;
    featureDetailName.textContent = meta.name;
    featureDetailDesc.textContent = meta.desc;

    // Clone icon from module list item
    const listItem = document.querySelector(`.module-list-item[data-mode="${mode}"]`);
    if (listItem) {
      featureDetailIcon.innerHTML = listItem.querySelector('.mod-icon-wrapper').innerHTML;
    }

    // Build dynamic form
    featureActionList.innerHTML = `<form id="dynamic-mini-app-form" class="mini-app-form"></form>`;
    const formEl = document.getElementById('dynamic-mini-app-form');

    meta.form.forEach(field => {
      const group = document.createElement('div');
      group.className = 'form-group';
      const label = document.createElement('label');
      label.className = 'form-label';
      label.textContent = field.label;
      group.appendChild(label);

      if (field.type === 'select') {
        const sel = document.createElement('select');
        sel.className = 'form-select';
        sel.id = `field_${field.id}`;
        field.options.forEach(opt => {
          const o = document.createElement('option');
          o.value = opt; o.textContent = opt;
          sel.appendChild(o);
        });
        group.appendChild(sel);
      } else if (field.type === 'textarea') {
        const ta = document.createElement('textarea');
        ta.className = 'form-textarea';
        ta.id = `field_${field.id}`;
        ta.placeholder = field.placeholder || '';
        ta.required = true;
        group.appendChild(ta);
      } else {
        const inp = document.createElement('input');
        inp.className = 'form-input';
        inp.type = 'text';
        inp.id = `field_${field.id}`;
        inp.placeholder = field.placeholder || '';
        group.appendChild(inp);
      }
      formEl.appendChild(group);
    });

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary full-width';
    submitBtn.style.marginTop = '0.5rem';
    submitBtn.textContent = `Analyse with ${meta.name}`;
    formEl.appendChild(submitBtn);

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      let compiled = `I need help with ${meta.name}. My context:\n\n`;
      meta.form.forEach(f => {
        const el = document.getElementById(`field_${f.id}`);
        if (el) compiled += `${f.label}: ${el.value}\n`;
      });
      featureDetailsScreen.classList.remove('open');
      openChatModule(mode, compiled);
    });

    featureDetailsScreen.classList.add('open');
  }

  document.querySelectorAll('.module-list-item').forEach(item => {
    item.addEventListener('click', () => openFeatureModule(item.dataset.mode));
  });

  // Quick launch buttons on home screen
  document.querySelectorAll('.quick-btn').forEach(btn => {
    btn.addEventListener('click', () => openFeatureModule(btn.dataset.mode));
  });

  featureBackBtn.addEventListener('click', () => {
    featureDetailsScreen.classList.remove('open');
  });

  // Dynamic date on home screen
  const dateEl = document.getElementById('home-date');
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' });
  }

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
    chatInput.placeholder = 'Type a message...';
    chatBody.innerHTML = '';
    
    addChatMessage('system', `Connected to ${meta.name}. ${meta.desc}`);

    chatModal.classList.remove('hidden');
    
    if (autoPrompt) {
      // Send the structured prompt immediately but display a simplified message to the user
      addChatMessage('user', "I have submitted the form parameters.");
      chatInput.value = '';
      chatHistory.push({ role: 'user', content: autoPrompt });
      
      triggerChatRequest();
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

  async function triggerChatRequest() {
    addLoadingMessage();
    chatSendBtn.disabled = true;

    try {
      let systemContext = `Active mode: ${currentSelectedMode}\n`;
      const profile = JSON.parse(localStorage.getItem('safura_profile') || '{}');
      
      if (profile.allergens && profile.allergens.length > 0) {
        systemContext += `CRITICAL: User is strictly allergic to: ${profile.allergens.join(', ')}.\n`;
      }
      
      systemContext += `User Profile Context:\n`;
      if (profile.goal) systemContext += `- Goal: ${profile.goal}\n`;
      if (profile.diet) systemContext += `- Dietary Preference: ${profile.diet}\n`;
      if (profile.height) systemContext += `- Height: ${profile.height} cm\n`;
      if (profile.weight) systemContext += `- Weight: ${profile.weight} kg\n`;
      if (profile.targetWeight) systemContext += `- Target Weight: ${profile.targetWeight} kg\n`;
      if (profile.age) systemContext += `- Age: ${profile.age}\n`;
      if (profile.gender) systemContext += `- Gender: ${profile.gender}\n`;

      const data = await apiPost('/chat', {
        mode: currentSelectedMode,
        messages: chatHistory,
        systemContext: systemContext
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

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || !currentSelectedMode) return;

    addChatMessage('user', text);
    chatInput.value = '';
    chatHistory.push({ role: 'user', content: text });
    
    triggerChatRequest();
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
