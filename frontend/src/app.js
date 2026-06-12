/**
 * Safura AI — Premium Mobile PWA Logic
 * Dynamic Mini-App Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered'))
      .catch(err => console.error('SW error', err));
  }

  // ── PWA Install Prompt ──────────────────────────────────────
  let deferredInstallPrompt = null;
  const installBanner = document.getElementById('pwa-install-banner');
  const installBtn = document.getElementById('pwa-install-btn');
  const dismissBtn = document.getElementById('pwa-dismiss-btn');

  const manualInstallBtn = document.getElementById('manual-install-btn');

  // Check if already installed or previously dismissed
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
  const wasDismissed = localStorage.getItem('safura_pwa_dismissed');

  // Detect iOS since it doesn't support beforeinstallprompt
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  // Show installation UI immediately if not installed and not dismissed
  if (!isStandalone && !wasDismissed) {
    if (manualInstallBtn) manualInstallBtn.style.display = 'block';
    if (installBanner) installBanner.style.display = 'block';
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
  });

  const handleInstallClick = async () => {
    if (deferredInstallPrompt) {
      try {
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
          if (installBanner) installBanner.style.display = 'none';
          if (manualInstallBtn) manualInstallBtn.style.display = 'none';
        }
        deferredInstallPrompt = null;
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    } else {
      if (isIOS) {
        alert("To install on iOS:\n\n1. Tap the Share icon (bottom center).\n2. Scroll down and tap 'Add to Home Screen'.");
      } else {
        alert("Your browser is still preparing the install process.\n\nPlease wait a few seconds and try again, or tap the browser menu (⋮) and select 'Install app'.");
      }
    }
  };

  if (installBtn) {
    installBtn.addEventListener('click', handleInstallClick);
  }

  if (manualInstallBtn) {
    manualInstallBtn.addEventListener('click', handleInstallClick);
  }

  if (dismissBtn) {
    dismissBtn.addEventListener('click', () => {
      if (installBanner) installBanner.style.display = 'none';
      localStorage.setItem('safura_pwa_dismissed', 'true');
    });
  }

  // Auto-hide if app becomes installed
  window.addEventListener('appinstalled', () => {
    if (installBanner) installBanner.style.display = 'none';
    if (manualInstallBtn) manualInstallBtn.style.display = 'none';
    localStorage.setItem('safura_pwa_dismissed', 'true');
    deferredInstallPrompt = null;
  });

  const API_URL = '/api';

  // ── Core API Utility ────────────────────────────────────────
  async function apiPost(endpoint, bodyData) {
    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyData)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error('API Error:', err);
      return { success: false, error: err.message };
    }
  }

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
    freshness: { 
      name: 'Freshness AI', 
      desc: 'Analyze food safety and detect spoilage instantly.',
      form: [
        { id: 'food_name', type: 'input', label: 'What food is this?', placeholder: 'e.g., Raw Chicken, Strawberries' },
        { id: 'storage_method', type: 'select', label: 'How was it stored?', options: ['Fridge', 'Room Temperature', 'Freezer'] },
        { id: 'days_stored', type: 'input', label: 'Days stored (approx.)', placeholder: 'e.g., 3' }
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
      desc: 'Super intelligent nutritional planning tailored to your goals.',
      form: [
        { id: 'duration', type: 'select', label: 'Plan Duration', options: ['1 Day', '3 Days', '1 Week', '1 Month'] },
        { id: 'goal', type: 'select', label: 'Primary Goal', options: ['Weight Loss', 'Maintenance', 'Muscle Gain', 'Recomposition', 'Athletic Performance'] },
        { id: 'diet', type: 'select', label: 'Dietary Focus', options: ['Standard/Balanced', 'High Protein', 'Low Carb', 'Keto', 'Mediterranean', 'Vegan', 'Vegetarian', 'Paleo'] },
        { id: 'budget', type: 'select', label: 'Budget Level', options: ['Budget-Friendly', 'Standard', 'Premium/Organic'] },
        { id: 'prepTime', type: 'select', label: 'Max Prep Time (Per Meal)', options: ['Under 15 mins', 'Under 30 mins', 'Under 1 Hour', 'Unlimited'] },
        { id: 'cuisine', type: 'select', label: 'Cuisine Preference', options: ['Global Mix', 'African', 'Asian', 'Mediterranean', 'Latin American', 'European'] },
        { id: 'meals', type: 'select', label: 'Meals per Day', options: ['3 Meals', '3 Meals + 1 Snack', '3 Meals + 2 Snacks', 'Intermittent Fasting (2 Meals)'] }
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

  // ── Initialization ──────────────────────────────────────────
  setTimeout(() => {
    if (localStorage.getItem('safura_profile')) {
      const user = JSON.parse(localStorage.getItem('safura_user') || '{"name":"User"}');
      document.getElementById('user-name').textContent = user.name.split(' ')[0];
      initProfile();
      setAppView('main');
    } else {
      setAppView('onboarding');
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
    // Family Profile Setup
    const familyProfiles = JSON.parse(localStorage.getItem('safura_family') || '[]');
    const switcher = document.getElementById('family-profile-switcher');
    if (switcher && switcher.options.length <= 2) {
      familyProfiles.forEach((prof, idx) => {
        const opt = document.createElement('option');
        opt.value = `family_${idx}`;
        opt.textContent = prof.name;
        switcher.insertBefore(opt, switcher.lastElementChild);
      });

      switcher.addEventListener('change', (e) => {
        if (e.target.value === 'new') {
          const name = prompt("Enter family member's name:");
          if (name) {
            const allergens = prompt("Any allergies? (comma separated):");
            const newMember = { name, allergens: allergens ? allergens.split(',').map(s=>s.trim()) : [] };
            const fam = JSON.parse(localStorage.getItem('safura_family') || '[]');
            fam.push(newMember);
            localStorage.setItem('safura_family', JSON.stringify(fam));
            initProfile(); // Reload
            switcher.value = `family_${fam.length - 1}`;
            switcher.dispatchEvent(new Event('change'));
          } else {
            switcher.value = 'main';
          }
        } else {
          // Switch display context
          renderProfileContext(e.target.value);
        }
      });
    }

    renderProfileContext('main');
  }

  function renderProfileContext(mode) {
    let data = {};
    let user = JSON.parse(localStorage.getItem('safura_user') || '{"name":"User"}');
    
    if (mode === 'main') {
      data = JSON.parse(localStorage.getItem('safura_profile') || '{}');
      document.getElementById('profile-display-name').textContent = user.name;
    } else {
      const idx = parseInt(mode.split('_')[1]);
      const fam = JSON.parse(localStorage.getItem('safura_family') || '[]');
      data = fam[idx] || {};
      document.getElementById('profile-display-name').textContent = data.name;
    }
    
    document.getElementById('prof-height').textContent = data.height ? `${data.height} cm` : '—';
    document.getElementById('prof-weight').textContent = data.weight ? `${data.weight} kg` : '—';
    
    if (data.height && data.weight) {
      const h = data.height / 100;
      const bmi = (data.weight / (h * h)).toFixed(1);
      document.getElementById('prof-bmi').textContent = bmi;
    } else {
      document.getElementById('prof-bmi').textContent = '—';
    }

    document.getElementById('prof-age').textContent = data.age || '—';
    document.getElementById('prof-diet').textContent = data.diet ? data.diet.charAt(0).toUpperCase() + data.diet.slice(1) : '—';
    document.getElementById('prof-gender').textContent = data.gender || '—';
    document.getElementById('prof-target').textContent = data.targetWeight ? `${data.targetWeight} kg` : '—';
    
    const goalMap = { lose: 'Weight Loss', maintain: 'Maintenance', gain: 'Muscle Gain' };
    document.getElementById('profile-goal-label').textContent = `Goal: ${data.goal ? goalMap[data.goal] : '—'}`;

    if (data.photo && mode === 'main') {
      const img = document.getElementById('profile-photo');
      img.src = data.photo;
      img.style.display = 'block';
      document.getElementById('profile-avatar-fallback').style.display = 'none';
    } else {
      document.getElementById('profile-photo').style.display = 'none';
      document.getElementById('profile-avatar-fallback').style.display = 'flex';
    }

    const allergenList = document.getElementById('profile-allergen-list');
    if (data.allergens && data.allergens.length > 0) {
      allergenList.innerHTML = data.allergens.map(a => `<span class="allergen-badge">${a}</span>`).join('');
    } else {
      allergenList.innerHTML = '<span class="allergen-badge" style="background:rgba(255,255,255,0.1);color:var(--safura-text-muted);">None set</span>';
    }

    if (mode === 'main') initLiveTrackers(data);
  }

  // ── Live Trackers Logic ────────────────────────────────────
  function initLiveTrackers(profile) {
    const defaultPrefs = { waterInterval: 2, mealInterval: 4 };
    let trackerPrefs = JSON.parse(localStorage.getItem('safura_tracker_prefs')) || defaultPrefs;

    // Helper for Native Notifications
    function notifyUser(title, body) {
      if (!("Notification" in window)) return;
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: '/icons/icon-192x192.png' });
      }
    }

    // Modal UI Setup
    const trackerModal = document.getElementById('tracker-modal');
    document.getElementById('tracker-settings-btn').onclick = () => {
      document.getElementById('water-interval-slider').value = trackerPrefs.waterInterval;
      document.getElementById('water-interval-val').textContent = `Every ${trackerPrefs.waterInterval} hrs`;
      document.getElementById('meal-interval-slider').value = trackerPrefs.mealInterval;
      document.getElementById('meal-interval-val').textContent = `Every ${trackerPrefs.mealInterval.toFixed(1)} hrs`;
      trackerModal.classList.remove('hidden');
    };

    document.getElementById('close-tracker-modal').onclick = () => trackerModal.classList.add('hidden');

    document.getElementById('water-interval-slider').oninput = (e) => {
      document.getElementById('water-interval-val').textContent = `Every ${e.target.value} hrs`;
    };
    document.getElementById('meal-interval-slider').oninput = (e) => {
      document.getElementById('meal-interval-val').textContent = `Every ${parseFloat(e.target.value).toFixed(1)} hrs`;
    };

    document.getElementById('save-tracker-prefs-btn').onclick = () => {
      if ("Notification" in window && Notification.permission !== "granted") {
        Notification.requestPermission();
      }
      
      trackerPrefs.waterInterval = parseFloat(document.getElementById('water-interval-slider').value);
      trackerPrefs.mealInterval = parseFloat(document.getElementById('meal-interval-slider').value);
      localStorage.setItem('safura_tracker_prefs', JSON.stringify(trackerPrefs));
      
      const now = Date.now();
      localStorage.setItem('safura_next_water', (now + trackerPrefs.waterInterval * 3600000).toString());
      
      nextMealTime = now + trackerPrefs.mealInterval * 3600000;
      localStorage.setItem('safura_next_meal', nextMealTime.toString());
      
      waterNotified = false;
      mealNotified = false;
      
      updateMealTimer();
      trackerModal.classList.add('hidden');
    };

    // Hydration Tracker
    const waterGoal = profile.weight ? parseFloat((profile.weight * 0.033).toFixed(1)) : 2.5;
    document.getElementById('water-goal').textContent = `${waterGoal}L`;
    
    const todayStr = new Date().toDateString();
    let hydrationState = JSON.parse(localStorage.getItem('safura_hydration') || '{}');
    if (hydrationState.date !== todayStr) {
      hydrationState = { date: todayStr, current: 0 };
    }
    
    let nextWaterTime = parseInt(localStorage.getItem('safura_next_water') || '0');
    if (!nextWaterTime || nextWaterTime < Date.now()) {
      nextWaterTime = Date.now() + trackerPrefs.waterInterval * 3600000;
      localStorage.setItem('safura_next_water', nextWaterTime.toString());
    }

    function updateWaterUI() {
      document.getElementById('water-current').textContent = `${hydrationState.current.toFixed(1)}L`;
      const pct = Math.min(100, (hydrationState.current / waterGoal) * 100);
      document.getElementById('water-fill').style.width = `${pct}%`;
      localStorage.setItem('safura_hydration', JSON.stringify(hydrationState));
    }
    updateWaterUI();

    document.getElementById('add-water-btn').onclick = () => {
      hydrationState.current += 0.25;
      updateWaterUI();
      // Reset water reminder since user just drank
      nextWaterTime = Date.now() + trackerPrefs.waterInterval * 3600000;
      localStorage.setItem('safura_next_water', nextWaterTime.toString());
      waterNotified = false;
    };

    // Meal Tracker
    let nextMealTime = parseInt(localStorage.getItem('safura_next_meal') || '0');
    if (!nextMealTime || nextMealTime < Date.now()) {
      nextMealTime = Date.now() + trackerPrefs.mealInterval * 3600000;
      localStorage.setItem('safura_next_meal', nextMealTime.toString());
    }

    const getMealName = () => {
      const hr = new Date(nextMealTime).getHours();
      if (hr < 11) return 'Breakfast';
      if (hr < 16) return 'Lunch';
      if (hr < 21) return 'Dinner';
      return 'Late Snack';
    };

    const mealTypeEl = document.getElementById('meal-type');
    const mealCountdownEl = document.getElementById('meal-countdown');
    mealTypeEl.textContent = getMealName();

    let waterNotified = false;
    let mealNotified = false;

    function updateMealTimer() {
      const now = Date.now();
      
      // Check Water Notification
      if (now >= nextWaterTime && !waterNotified) {
        notifyUser("💧 Time to Hydrate!", `Stay on track! You're currently at ${hydrationState.current.toFixed(1)}L out of your ${waterGoal}L daily goal.`);
        waterNotified = true;
      }

      // Check Meal Notification
      const diff = nextMealTime - now;
      if (diff <= 0) {
        mealCountdownEl.textContent = "00:00:00";
        mealTypeEl.textContent = "Time to Eat!";
        
        if (!mealNotified) {
          notifyUser("🍽️ " + getMealName() + " Time!", "Time to refuel according to your customized schedule.");
          mealNotified = true;
        }
        return;
      }
      
      const h = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const m = Math.floor((diff / 1000 / 60) % 60).toString().padStart(2, '0');
      const s = Math.floor((diff / 1000) % 60).toString().padStart(2, '0');
      mealCountdownEl.textContent = `${h}:${m}:${s}`;
    }

    setInterval(updateMealTimer, 1000);
    updateMealTimer();

    document.getElementById('log-meal-btn').onclick = () => {
      nextMealTime = Date.now() + trackerPrefs.mealInterval * 3600000;
      localStorage.setItem('safura_next_meal', nextMealTime.toString());
      mealTypeEl.textContent = getMealName();
      mealNotified = false;
      updateMealTimer();
    };
  }

  function getActiveAllergens() {
    const data = JSON.parse(localStorage.getItem('safura_profile') || '{"allergens":[]}');
    return data.allergens;
  }

  // ── Smart Scanner Logic ────────────────────────────────────
  const scanUploadInput = document.getElementById('scan-upload-input');
  const scanPreview = document.getElementById('scan-preview');
  const scannerPlaceholder = document.getElementById('scanner-placeholder');
  
  // AR Camera Elements
  const arContainer = document.getElementById('ar-camera-container');
  const arVideo = document.getElementById('ar-video');
  const arCanvas = document.getElementById('ar-canvas');
  const arCaptureBtn = document.getElementById('ar-capture-btn');
  const arCloseBtn = document.getElementById('ar-close-btn');
  let currentStream = null;

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

  // WebRTC AR Camera Logic
  document.getElementById('btn-live-scan').addEventListener('click', async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        currentStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        arVideo.srcObject = currentStream;
        arContainer.style.display = 'block';
        scannerPlaceholder.style.display = 'none';
        scanPreview.classList.add('hidden');
      } else {
        alert("Camera not supported on this device/browser.");
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      alert("Camera access denied or unavailable.");
    }
  });

  function stopARCamera() {
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
      currentStream = null;
    }
    arContainer.style.display = 'none';
    scannerPlaceholder.style.display = 'flex';
  }

  arCloseBtn.addEventListener('click', stopARCamera);

  arCaptureBtn.addEventListener('click', () => {
    arCanvas.width = arVideo.videoWidth;
    arCanvas.height = arVideo.videoHeight;
    const ctx = arCanvas.getContext('2d');
    ctx.drawImage(arVideo, 0, 0, arCanvas.width, arCanvas.height);
    
    // Capture base64
    currentScanImage = arCanvas.toDataURL('image/jpeg', 0.8);
    
    // Show preview and close camera
    scanPreview.src = currentScanImage;
    scanPreview.classList.remove('hidden');
    stopARCamera();
    scannerPlaceholder.style.display = 'none';
  });

  document.getElementById('btn-upload-photo').addEventListener('click', () => scanUploadInput.click());
  scanUploadInput.addEventListener('change', handleImageInput);

  document.getElementById('scan-analyse-btn').addEventListener('click', () => {
    const textInput = document.getElementById('scan-text-input').value;
    if (!currentScanImage && !textInput) {
      alert("Please capture an image, upload a photo, or type a food name to scan.");
      return;
    }
    
    let textPrompt = `I am using the Smart Food Scanner.\n\n`;
    if (textInput) textPrompt += `User description: ${textInput}\n\n`;
    
    textPrompt += `Please identify this food based on the description/image. Give me full details including:
1. Exact food name, country of origin, and a brief cultural history of the dish.
2. Full nutritional breakdown (calories, protein, carbs, fat).
3. The specific diet type it falls under (e.g., keto-friendly, vegan, etc.).
4. Is it a warm, cold, or hot dish? How does this temperature specification align with my personal preferences and goals?
5. Estimate its freshness (is it fresh or does it look bad/spoiled?) based on visual cues.
6. Finally, definitively state if it is safe for me based on my active allergens.`;

    let contentPayload = [];
    if (currentScanImage) {
      // Extract base64 and mime type from data URI
      const match = currentScanImage.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contentPayload.push({
          type: 'image',
          source: { type: 'base64', media_type: match[1], data: match[2] }
        });
      }
    }
    contentPayload.push({ type: 'text', text: textPrompt });

    // Store the raw base64 to clear UI safely
    const storedImage = currentScanImage;

    // Reset scanner UI
    document.getElementById('scan-text-input').value = '';
    currentScanImage = null;
    scanPreview.src = '';
    scanPreview.classList.add('hidden');
    scannerPlaceholder.classList.remove('hidden');

    // Route directly to the AI Chat Modal for real analysis
    openChatModule('scan', contentPayload, !!storedImage);
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

  function openChatModule(mode, autoPrompt = null, hasImage = false) {
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
      if (hasImage || Array.isArray(autoPrompt)) {
        addChatMessage('user', "I have submitted a photo and description for analysis.");
      } else {
        addChatMessage('user', "I have submitted the form parameters.");
      }
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
      const family = JSON.parse(localStorage.getItem('safura_family') || '[]');
      
      let allAllergens = new Set(profile.allergens || []);
      family.forEach(f => {
        (f.allergens || []).forEach(a => allAllergens.add(a));
      });

      if (allAllergens.size > 0) {
        systemContext += `CRITICAL: The household is strictly allergic to: ${Array.from(allAllergens).join(', ')}. DO NOT INCLUDE THESE IN ANY FOOD OR MEAL PLAN.\n`;
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
        speakText(data.result);
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

  // ── Voice AI Integration ──────────────────────────────────
  const chatMicBtn = document.getElementById('chat-mic-btn');
  let recognition = null;
  let isRecording = false;

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isRecording = true;
      chatMicBtn.style.background = 'rgba(239, 68, 68, 0.2)';
      chatMicBtn.style.color = '#ef4444';
      chatMicBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="6" width="12" height="12"></rect></svg>`;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      chatInput.value = transcript;
      sendChatMessage();
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      stopRecording();
    };

    recognition.onend = () => {
      stopRecording();
    };
  }

  function stopRecording() {
    isRecording = false;
    chatMicBtn.style.background = 'rgba(56, 189, 248, 0.1)';
    chatMicBtn.style.color = 'var(--safura-accent)';
    chatMicBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>`;
  }

  if (chatMicBtn) {
    chatMicBtn.addEventListener('click', () => {
      if (!recognition) {
        alert("Voice recognition not supported in this browser.");
        return;
      }
      if (isRecording) {
        recognition.stop();
      } else {
        recognition.start();
      }
    });
  }

  // Speak AI Response
  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear queue
      const msg = new SpeechSynthesisUtterance(text);
      msg.rate = 1.05;
      msg.pitch = 1.0;
      window.speechSynthesis.speak(msg);
    }
  }
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
        const planCard = document.querySelector('#view-plan .plan-card');
        planCard.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--safura-accent);">Curating your optimal nutrition strategy...</div>';
        
        const data = await apiPost('/chat', {
          mode: 'mealplan',
          formData: { duration: '1 Week', goal: JSON.parse(localStorage.getItem('safura_profile')||'{}').goal || 'Maintain' },
          profile: JSON.parse(localStorage.getItem('safura_profile') || '{}')
        });

        if (data.success) {
          try {
            const aiJson = JSON.parse(data.text);
            let html = '';
            
            aiJson.plan.forEach(dayPlan => {
              html += `<div class="plan-day" style="margin-top: 1rem; color: #a78bfa;">Day ${dayPlan.day}</div>`;
              dayPlan.meals.forEach(m => {
                html += `
                  <div class="meal" style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div>
                      <span class="time" style="font-weight: 600; color: #E2E8F0; display: block; margin-bottom: 0.2rem;">${m.type}</span>
                      <span class="food" style="color: var(--safura-text-muted); font-size: 0.9rem;">${m.food}</span>
                    </div>
                    <div style="text-align: right;">
                      <span style="color: #38bdf8; font-weight: 700; font-size: 0.9rem; display: block;">${m.calories} kcal</span>
                      <span style="color: var(--safura-text-muted); font-size: 0.8rem;">${m.protein}g protein</span>
                    </div>
                  </div>
                `;
              });
            });

            if (aiJson.groceryList && aiJson.groceryList.length > 0) {
              html += `<div class="plan-day" style="margin-top: 1.5rem; color: #EF9F27;">Smart Grocery List</div>`;
              html += `<div class="grocery-list-container" style="margin-top: 1rem;">`;
              
              const savedListState = JSON.parse(localStorage.getItem('safura_grocery_state') || '{}');
              
              aiJson.groceryList.forEach((item, idx) => {
                const isChecked = savedListState[item] ? 'checked' : '';
                html += `
                  <label class="grocery-item" style="display: flex; align-items: center; padding: 0.75rem; background: rgba(255,255,255,0.03); border-radius: 8px; margin-bottom: 0.5rem; cursor: pointer;">
                    <input type="checkbox" class="grocery-checkbox" data-item="${item}" ${isChecked} style="margin-right: 1rem; width: 18px; height: 18px; accent-color: #EF9F27;">
                    <span style="color: #E2E8F0; font-size: 0.95rem; ${isChecked ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${item}</span>
                  </label>
                `;
              });
              html += `</div>`;
            }

            planCard.innerHTML = html;

            // Attach event listeners for grocery list
            document.querySelectorAll('.grocery-checkbox').forEach(cb => {
              cb.addEventListener('change', (e) => {
                const itemName = e.target.dataset.item;
                const state = JSON.parse(localStorage.getItem('safura_grocery_state') || '{}');
                state[itemName] = e.target.checked;
                localStorage.setItem('safura_grocery_state', JSON.stringify(state));
                
                // Toggle visual strikethrough
                const textSpan = e.target.nextElementSibling;
                if (e.target.checked) {
                  textSpan.style.textDecoration = 'line-through';
                  textSpan.style.opacity = '0.6';
                } else {
                  textSpan.style.textDecoration = 'none';
                  textSpan.style.opacity = '1';
                }
              });
            });
          } catch (e) {
            planCard.innerHTML = `<div class="plan-day">AI Curated Plan</div><pre style="white-space:pre-wrap;font-family:'Inter';font-size:0.85rem;line-height:1.6;color:#E2E8F0;">${data.text}</pre>`;
          }
        }
      } catch {
        alert('AI unavailable. Check your connection.');
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
