/* ============================================
   FlowState — App Controller
   Navigation, State, Command Bar, Init
   ============================================ */

const App = (() => {
  let currentModule = 'dashboard';
  let aiInteractions = 0;

  function init() {
    // Load persisted data
    aiInteractions = Utils.loadData('ai_interactions', 0);

    // Check if returning user
    if (AIEngine.hasApiKey()) {
      updateDashboardStats();
    }

    // Set up keyboard shortcuts
    document.addEventListener('keydown', handleGlobalKeys);

    // Initialize Lucide icons
    if (window.lucide) {
      lucide.createIcons();
    }

    // Initialize modules
    if (typeof TaskBoard !== 'undefined' && TaskBoard.init) TaskBoard.init();
    if (typeof Planner !== 'undefined' && Planner.init) Planner.init();

    // Initialize Scroll Animations
    initScrollAnimations();
    
    // Initialize Feature Pills
    initBentoCards();

    // Set greeting
    const subtitle = document.getElementById('page-subtitle');
    if (subtitle) {
      subtitle.textContent = `${Utils.getGreeting()}. Here's your productivity overview.`;
    }

    updateDashboardStats();
  }

  function launchApp() {
    enterApp();
  }

  function enterApp() {
    const landing = document.getElementById('landing-page');
    const app = document.getElementById('app-page');

    landing.classList.add('hidden');
    app.classList.add('active');

    // Re-init icons
    if (window.lucide) lucide.createIcons();

    // Update stats
    updateDashboardStats();

    Utils.showToast('Welcome to FlowState! ⚡', 'success');
  }

  function backToLanding() {
    const landing = document.getElementById('landing-page');
    const app = document.getElementById('app-page');

    landing.classList.remove('hidden');
    app.classList.remove('active');
  }

  // --- API Key ---
  function showApiKeyModal() {
    const modal = document.getElementById('api-key-modal');
    modal.classList.add('active');
    setTimeout(() => {
      document.getElementById('api-key-input').focus();
    }, 300);

    // Allow Enter to submit
    document.getElementById('api-key-input').onkeydown = (e) => {
      if (e.key === 'Enter') saveApiKey();
    };
  }

  function hideApiKeyModal() {
    document.getElementById('api-key-modal').classList.remove('active');
  }

  function saveApiKey() {
    const input = document.getElementById('api-key-input');
    const key = input.value.trim();
    if (!key) {
      Utils.showToast('Please enter a valid API key', 'error');
      return;
    }
    AIEngine.setApiKey(key);
    hideApiKeyModal();
    enterApp();
    Utils.showToast('AI connected successfully! 🚀', 'success');
  }

  function skipApiKey() {
    hideApiKeyModal();
    enterApp();
    Utils.showToast('Running in limited mode. Add API key for full AI features.', 'warning');
  }

  // --- Navigation ---
  function navigate(module) {
    currentModule = module;

    // Update sidebar
    Utils.$$('.sidebar-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.module === module);
    });

    // Update views
    Utils.$$('.module-view').forEach(view => {
      view.classList.toggle('active', view.id === `view-${module}`);
    });

    // Update header
    const titles = {
      dashboard: ['Dashboard', `${Utils.getGreeting()}. Here's your productivity overview.`],
      tasks: ['Smart Task Board', 'Use natural language to create, organize, and manage your tasks.'],
      planner: ['Focus Planner', 'Let AI optimize your daily schedule for peak productivity.'],
      meetings: ['Meeting Brain', 'Transform meeting transcripts into actionable insights.'],
      content: ['Content Studio', 'AI-powered writing assistant for emails, reports, and more.'],
      docs: ['Doc Analyzer', 'Extract key insights and summaries from any document.']
    };

    const [title, subtitle] = titles[module] || titles.dashboard;
    document.getElementById('page-title').textContent = title;
    document.getElementById('page-subtitle').textContent = subtitle;

    // Re-init icons
    if (window.lucide) lucide.createIcons();
  }

  // --- Command Bar ---
  function openCommandBar() {
    const overlay = document.getElementById('command-bar-overlay');
    overlay.classList.add('active');
    setTimeout(() => {
      document.getElementById('command-bar-input').focus();
    }, 100);
  }

  function closeCommandBar(event) {
    if (event && event.target !== event.currentTarget) return;
    document.getElementById('command-bar-overlay').classList.remove('active');
    document.getElementById('command-bar-input').value = '';
  }

  function handleCommandBarKey(event) {
    if (event.key === 'Escape') {
      closeCommandBar({ target: event.currentTarget, currentTarget: event.currentTarget });
      return;
    }

    if (event.key === 'Enter') {
      const input = document.getElementById('command-bar-input').value.trim();
      if (input) {
        processCommand(input);
      }
    }
  }

  async function processCommand(input) {
    const lower = input.toLowerCase();

    // Quick navigation
    const navMap = {
      'task': 'tasks',
      'tasks': 'tasks',
      'plan': 'planner',
      'planner': 'planner',
      'schedule': 'planner',
      'meeting': 'meetings',
      'meetings': 'meetings',
      'content': 'content',
      'write': 'content',
      'email': 'content',
      'doc': 'docs',
      'docs': 'docs',
      'document': 'docs',
      'analyze': 'docs',
      'home': 'dashboard',
      'dashboard': 'dashboard'
    };

    for (const [key, module] of Object.entries(navMap)) {
      if (lower === key || lower === `open ${key}` || lower === `go to ${key}`) {
        commandAction(module);
        return;
      }
    }

    // Try AI parsing
    if (AIEngine.hasApiKey()) {
      try {
        const { systemPrompt, prompt } = AIEngine.PROMPTS.commandBar(input);
        const response = await AIEngine.generate(prompt, { systemPrompt, temperature: 0.3 });
        const parsed = Utils.parseJSON(response);

        if (parsed && parsed.module) {
          commandAction(parsed.module);
          if (parsed.response) {
            Utils.showToast(parsed.response, 'info');
          }
        } else {
          Utils.showToast('Command processed! Navigate to the relevant module.', 'info');
        }
        incrementAIInteractions();
      } catch (err) {
        Utils.showToast('Could not process command: ' + err.message, 'error');
      }
    } else {
      Utils.showToast('Connect your AI key to use natural language commands', 'info');
    }

    closeCommandBar({ target: document.getElementById('command-bar-overlay'), currentTarget: document.getElementById('command-bar-overlay') });
  }

  function commandAction(module) {
    document.getElementById('command-bar-overlay').classList.remove('active');
    document.getElementById('command-bar-input').value = '';
    navigate(module);
  }

  // --- Global Keyboard Shortcuts ---
  function handleGlobalKeys(event) {
    // Ctrl+K / Cmd+K for command bar
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      const overlay = document.getElementById('command-bar-overlay');
      if (overlay.classList.contains('active')) {
        closeCommandBar({ target: overlay, currentTarget: overlay });
      } else {
        openCommandBar();
      }
    }

    // Escape to close modals
    if (event.key === 'Escape') {
      document.getElementById('api-key-modal').classList.remove('active');
      document.getElementById('command-bar-overlay').classList.remove('active');
    }
  }

  // --- Dashboard Stats ---
  function updateDashboardStats() {
    const tasks = Utils.loadData('tasks', []);
    const doneTasks = tasks.filter(t => t.status === 'done');

    const totalEl = document.getElementById('stat-total-tasks');
    const completedEl = document.getElementById('stat-completed');
    const aiEl = document.getElementById('stat-ai-interactions');

    if (totalEl) totalEl.textContent = tasks.length;
    if (completedEl) completedEl.textContent = doneTasks.length;
    if (aiEl) aiEl.textContent = aiInteractions;
  }

  function initBentoCards() {
    const cards = document.querySelectorAll('.bento-card');
    
    cards.forEach(card => {
      // Set initial custom property for color
      const color = card.getAttribute('data-color');
      if (color) {
        card.style.setProperty('--card-color', color);
      }

      // Mouse move event for tilt and spotlight
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        
        // Calculate mouse position in percentage (0 to 100%)
        const xPos = ((e.clientX - rect.left) / rect.width) * 100;
        const yPos = ((e.clientY - rect.top) / rect.height) * 100;
        
        // Calculate rotation angles (max 10 degrees)
        // Center is 0, edges are -10 to 10
        const rotateY = ((xPos - 50) / 50) * 10;
        const rotateX = -((yPos - 50) / 50) * 10;

        card.style.setProperty('--mouse-x', `${xPos}%`);
        card.style.setProperty('--mouse-y', `${yPos}%`);
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      // Mouse leave event to reset tilt
      card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -15% 0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    }, observerOptions);
    
    document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-clip, .stagger-group').forEach(el => {
      observer.observe(el);
    });
  }

  function incrementAIInteractions() {
    aiInteractions++;
    Utils.saveData('ai_interactions', aiInteractions);
    updateDashboardStats();
  }

  function getAIInteractions() {
    return aiInteractions;
  }

  // --- Init on DOM Ready ---
  document.addEventListener('DOMContentLoaded', init);

  return {
    init,
    launchApp,
    backToLanding,
    navigate,
    openCommandBar,
    closeCommandBar,
    handleCommandBarKey,
    commandAction,
    updateDashboardStats,
    incrementAIInteractions,
    initBentoCards
  };
})();
