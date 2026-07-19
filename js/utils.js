/* ============================================
   FlowState — Utilities
   Shared helpers, toast system, DOM utils
   ============================================ */

const Utils = (() => {

  // --- ID Generation ---
  function generateId() {
    return 'fs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  // --- Date/Time Formatting ---
  function formatDate(date) {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  function formatTime(date) {
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }

  function formatDateISO(date) {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  function getToday() {
    return formatDateISO(new Date());
  }

  function getTimeOfDay() {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  function getGreeting() {
    const tod = getTimeOfDay();
    const greetings = {
      morning: 'Good morning',
      afternoon: 'Good afternoon',
      evening: 'Good evening'
    };
    return greetings[tod] || 'Hello';
  }

  // --- DOM Helpers ---
  function $(selector, parent = document) {
    return parent.querySelector(selector);
  }

  function $$(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
  }

  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === 'className') el.className = value;
      else if (key === 'innerHTML') el.innerHTML = value;
      else if (key === 'textContent') el.textContent = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2).toLowerCase(), value);
      else if (key === 'dataset') Object.assign(el.dataset, value);
      else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
      else el.setAttribute(key, value);
    }
    for (const child of children) {
      if (typeof child === 'string') el.appendChild(document.createTextNode(child));
      else if (child) el.appendChild(child);
    }
    return el;
  }

  // --- Toast Notification System ---
  function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
      success: '✓',
      error: '✕',
      info: 'ℹ',
      warning: '⚠'
    };

    const toast = createElement('div', {
      className: `toast toast-${type}`,
      innerHTML: `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span>${message}</span>
      `
    });

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // --- Local Storage ---
  function saveData(key, data) {
    try {
      localStorage.setItem(`flowstate_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }

  function loadData(key, fallback = null) {
    try {
      const data = localStorage.getItem(`flowstate_${key}`);
      return data ? JSON.parse(data) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  // --- JSON Parsing from AI ---
  function parseJSON(text) {
    // Try direct parse
    try {
      return JSON.parse(text);
    } catch (e) {}

    // Try extracting from code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
      try {
        return JSON.parse(fenceMatch[1].trim());
      } catch (e) {}
    }

    // Try finding JSON object/array
    const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {}
    }

    return null;
  }

  // --- Simple Markdown to HTML ---
  function markdownToHtml(text) {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // --- Copy to Clipboard ---
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!', 'success');
    } catch (e) {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('Copied to clipboard!', 'success');
    }
  }

  // --- Debounce ---
  function debounce(fn, delay = 300) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // --- Loading State Helpers ---
  function showLoading(container, message = 'AI is thinking...') {
    const el = createElement('div', {
      className: 'ai-loading',
      id: 'ai-loading-indicator',
      innerHTML: `
        <div class="ai-loading-dots">
          <span></span><span></span><span></span>
        </div>
        <span>${message}</span>
      `
    });
    container.innerHTML = '';
    container.appendChild(el);
  }

  function hideLoading() {
    const el = document.getElementById('ai-loading-indicator');
    if (el) el.remove();
  }

  // --- Escape HTML ---
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  return {
    generateId,
    formatDate,
    formatTime,
    formatDateISO,
    getToday,
    getTimeOfDay,
    getGreeting,
    $,
    $$,
    createElement,
    showToast,
    saveData,
    loadData,
    parseJSON,
    markdownToHtml,
    copyToClipboard,
    debounce,
    showLoading,
    hideLoading,
    escapeHtml
  };
})();
