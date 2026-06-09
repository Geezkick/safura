/**
 * Safura AI — Frontend Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // ── Navbar Scroll Effect ───────────────────────────────────────
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  });

  // ── Mobile Menu Toggle ─────────────────────────────────────────
  const mobileBtn = document.getElementById('navMobileBtn');
  const mobileMenu = document.getElementById('navMobileMenu');
  
  if(mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
    });
    
    // Close mobile menu when a link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('.nav-mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
      });
    });
  }


  // ── Populate Modules Grid ──────────────────────────────────────
  const modulesData = [
    { num: '01', name: 'Food Scanner' },
    { num: '02', name: 'Allergen Guard' },
    { num: '03', name: 'Nutrition Coach' },
    { num: '04', name: 'Global Encyclopedia' },
    { num: '05', name: 'Menu Scanner' },
    { num: '06', name: 'Travel Assistant' },
    { num: '07', name: 'Recipe Generator' },
    { num: '08', name: 'Meal Planner' },
    { num: '09', name: 'Freshness Detector' },
    { num: '10', name: 'AR Vision Mode' },
    { num: '11', name: 'Voice Assistant' },
    { num: '12', name: 'Food Passport' },
    { num: '13', name: 'Family Profiles' },
    { num: '14', name: 'Carbon Footprint' }
  ];

  const modulesGrid = document.getElementById('modulesGrid');
  if(modulesGrid) {
    modulesData.forEach(mod => {
      const el = document.createElement('div');
      el.className = 'module-card';
      el.innerHTML = `
        <div class="module-num">${mod.num}</div>
        <div class="module-name">${mod.name}</div>
      `;
      modulesGrid.appendChild(el);
    });
  }

  // ── Demo Section Logic ─────────────────────────────────────────
  const demoTabs = document.querySelectorAll('.demo-tab');
  const demoInput = document.getElementById('demoInput');
  const demoSubmit = document.getElementById('demoSubmit');
  const demoSubmitLabel = document.getElementById('demoSubmitLabel');
  const demoSpinner = document.getElementById('demoSpinner');
  const demoInputIcon = document.getElementById('demoInputIcon');
  
  const demoResultArea = document.getElementById('demoResultArea');
  const demoPlaceholder = document.getElementById('demoPlaceholder');
  const demoResult = document.getElementById('demoResult');
  const demoResultMode = document.getElementById('demoResultMode');
  const demoResultTime = document.getElementById('demoResultTime');
  const demoResultBody = document.getElementById('demoResultBody');
  const demoError = document.getElementById('demoError');
  const demoErrorMsg = document.getElementById('demoErrorMsg');

  // Set active tab
  let currentMode = 'scan';
  const modeIcons = {
    'scan': '🍽️',
    'recipe': '👨‍🍳',
    'allergen': '🛡️',
    'encyclopedia': '🌍',
    'nutrition': '📊'
  };

  const modePlaceholders = {
    'scan': 'Type any food, dish, or ingredient...',
    'recipe': 'Enter ingredients (e.g. chicken, rice, broccoli)...',
    'allergen': 'Enter a food to check against your allergens...',
    'encyclopedia': 'Enter a dish to learn about its history...',
    'nutrition': 'Ask a nutrition question...'
  };

  demoTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      demoTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentMode = tab.dataset.mode;
      demoInputIcon.textContent = modeIcons[currentMode];
      demoInput.placeholder = modePlaceholders[currentMode];
      
      // Update result badge if we already have a result
      demoResultMode.textContent = tab.textContent.trim().substring(2); // Remove emoji
    });
  });

  // Handle chips clicking
  const demoChips = document.querySelectorAll('.demo-chip');
  demoChips.forEach(chip => {
    chip.addEventListener('click', () => {
      demoInput.value = chip.dataset.val;
      // Auto submit on chip click
      handleDemoSubmit();
    });
  });

  // Handle allergen pills
  const allergenPills = document.querySelectorAll('.allergen-pill');
  allergenPills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
    });
  });

  function getActiveAllergens() {
    const active = [];
    document.querySelectorAll('.allergen-pill.active').forEach(pill => {
      active.push(pill.dataset.allergen);
    });
    return active;
  }

  // Handle submit
  demoSubmit.addEventListener('click', handleDemoSubmit);
  demoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleDemoSubmit();
  });

  async function handleDemoSubmit() {
    const query = demoInput.value.trim();
    if (!query) return;

    // Show loading state
    demoSubmitLabel.classList.add('hidden');
    demoSpinner.classList.remove('hidden');
    demoSubmit.disabled = true;

    demoPlaceholder.classList.add('hidden');
    demoResult.classList.add('hidden');
    demoError.classList.add('hidden');
    
    // Smooth scroll to result area
    demoResultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    try {
      // Prepare the payload based on mode
      let endpoint = '';
      let payload = {};

      const userProfile = {
        allergens: getActiveAllergens(),
        goals: "manage_diet"
      };

      if (currentMode === 'scan') {
        endpoint = 'http://localhost:3000/api/scan/text';
        payload = { foodName: query, userProfile };
      } else if (currentMode === 'recipe') {
        endpoint = 'http://localhost:3000/api/recipe/generate';
        payload = { 
          ingredients: query.split(',').map(i => i.trim()),
          userProfile 
        };
      } else {
        // Chat mode for the others
        endpoint = 'http://localhost:3000/api/chat';
        payload = {
          mode: currentMode,
          messages: [{ role: 'user', content: query }],
          userProfile
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'API request failed');
      }

      // Show result
      const activeTabText = document.querySelector('.demo-tab.active').textContent.trim();
      demoResultMode.textContent = activeTabText.substring(2); // Remove emoji
      
      const now = new Date();
      demoResultTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      demoResultBody.textContent = data.result;
      demoResult.classList.remove('hidden');

    } catch (err) {
      console.error(err);
      demoErrorMsg.textContent = "Error: Make sure the backend is running on port 3000, and your Anthropic API key is set in backend/.env.";
      demoError.classList.remove('hidden');
    } finally {
      // Restore button
      demoSubmitLabel.classList.remove('hidden');
      demoSpinner.classList.add('hidden');
      demoSubmit.disabled = false;
    }
  }


  // ── API Docs Logic ───────────────────────────────────────────────
  
  const endpoints = [
    { method: 'POST', path: '/api/scan/image', title: 'Food Image Scan', active: true },
    { method: 'POST', path: '/api/scan/text', title: 'Text Based Scan' },
    { method: 'POST', path: '/api/recipe/generate', title: 'Generate Recipe' },
    { method: 'POST', path: '/api/chat', title: 'AI Nutritionist Chat' },
    { method: 'POST', path: '/api/meal-plan/generate', title: '7-Day Meal Plan' },
    { method: 'GET', path: '/api/user/profile/:id', title: 'Get User Profile' }
  ];

  const endpointList = document.getElementById('endpointList');
  if(endpointList) {
    endpoints.forEach((ep, i) => {
      const el = document.createElement('div');
      el.className = `endpoint-item ${ep.active ? 'active' : ''}`;
      el.innerHTML = `
        <span class="endpoint-method method-${ep.method.toLowerCase()}">${ep.method}</span>
        <span class="endpoint-path">${ep.path}</span>
      `;
      
      el.addEventListener('click', () => {
        document.querySelectorAll('.endpoint-item').forEach(item => item.classList.remove('active'));
        el.classList.add('active');
        // Update code block (mock functionality for demo)
        updateCodeBlock(ep.path);
      });
      
      endpointList.appendChild(el);
    });
  }

  // Code Block logic
  const codeTabs = document.querySelectorAll('.code-tab');
  const codeContent = document.getElementById('codeContent');
  const copyBtn = document.getElementById('copyCodeBtn');
  
  let currentLang = 'js';
  let currentEndpoint = '/api/scan/image';

  function updateCodeBlock(endpoint = currentEndpoint) {
    currentEndpoint = endpoint;
    let code = '';
    
    if (currentLang === 'js') {
      code = `const response = await fetch("https://api.safura.ai${endpoint}", {\n  method: "POST",\n  headers: {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer YOUR_API_KEY"\n  },\n  body: JSON.stringify({\n    // Payload specific to endpoint\n  })\n});\n\nconst data = await response.json();\nconsole.log(data.result);`;
    } else if (currentLang === 'python') {
      code = `import requests\n\nurl = "https://api.safura.ai${endpoint}"\nheaders = {\n    "Content-Type": "application/json",\n    "Authorization": "Bearer YOUR_API_KEY"\n}\ndata = {\n    # Payload specific to endpoint\n}\n\nresponse = requests.post(url, headers=headers, json=data)\nprint(response.json()['result'])`;
    } else if (currentLang === 'curl') {
      code = `curl -X POST https://api.safura.ai${endpoint} \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -d '{\n    "payload": "data"\n  }'`;
    }
    
    if(codeContent) codeContent.textContent = code;
  }

  codeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      codeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLang = tab.dataset.lang;
      updateCodeBlock();
    });
  });

  // Init code block
  updateCodeBlock();

  if(copyBtn && codeContent) {
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeContent.textContent);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Copied!';
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2000);
    });
  }
});
