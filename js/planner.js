/* ============================================
   FlowState — Focus Planner Module
   AI-powered daily schedule optimizer
   ============================================ */

const Planner = (() => {
  let schedule = [];
  let energy = 'high';

  function init() {
    schedule = Utils.loadData('schedule', []);
    updateDate();
    renderTimeline();
  }

  function updateDate() {
    const el = document.getElementById('planner-date');
    if (el) {
      el.textContent = new Date().toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      });
    }
  }

  function setEnergy(level) {
    energy = level;
    Utils.$$('.energy-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.energy === level);
    });
  }

  async function planMyDay() {
    if (!AIEngine.hasApiKey()) {
      Utils.showToast('Connect your Gemini API key to use AI planning', 'info');
      return;
    }

    const btn = document.getElementById('btn-plan-day');
    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots" style="display:inline-flex;gap:3px;"><span></span><span></span><span></span></span> Planning...';

    try {
      const tasks = Utils.loadData('tasks', []);
      const { systemPrompt, prompt } = AIEngine.PROMPTS.planDay(tasks, energy);
      const response = await AIEngine.generate(prompt, { systemPrompt, temperature: 0.5 });
      const parsed = Utils.parseJSON(response);

      if (parsed && parsed.schedule) {
        schedule = parsed.schedule;
        Utils.saveData('schedule', schedule);
        renderTimeline();

        if (parsed.tips && parsed.tips.length > 0) {
          Utils.showToast(`💡 ${parsed.tips[0]}`, 'info', 5000);
        }

        Utils.showToast('Daily schedule generated! ⚡', 'success');
        App.incrementAIInteractions();
      } else {
        Utils.showToast('Could not parse schedule. Try again.', 'error');
      }
    } catch (err) {
      Utils.showToast('AI Error: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> Plan My Day with AI';
      if (window.lucide) lucide.createIcons();
    }
  }

  function clearSchedule() {
    schedule = [];
    Utils.saveData('schedule', []);
    renderTimeline();
    Utils.showToast('Schedule cleared', 'info');
  }

  function renderTimeline() {
    const container = document.getElementById('timeline-hours');
    if (!container) return;

    container.innerHTML = '';

    // Build hours from 6 AM to 10 PM
    for (let h = 6; h <= 22; h++) {
      const hour12 = h > 12 ? h - 12 : h;
      const ampm = h >= 12 ? 'PM' : 'AM';
      const label = `${hour12}:00 ${ampm}`;

      const hourRow = Utils.createElement('div', { className: 'timeline-hour' });
      hourRow.innerHTML = `
        <div class="timeline-hour-label">${label}</div>
        <div class="timeline-hour-line" data-hour="${h}"></div>
      `;
      container.appendChild(hourRow);
    }

    // Place schedule blocks
    for (const block of schedule) {
      placeBlock(block);
    }

    // Now indicator
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    if (currentHour >= 6 && currentHour <= 22) {
      const offset = (currentHour - 6) * 64 + (currentMinute / 60) * 64;
      const indicator = Utils.createElement('div', {
        className: 'timeline-now-indicator',
        style: { top: `${offset}px` }
      });
      container.style.position = 'relative';
      container.appendChild(indicator);
    }
  }

  function placeBlock(block) {
    if (!block.time) return;

    const [startH, startM] = block.time.split(':').map(Number);
    let endH = startH + 1;
    let endM = startM || 0;

    if (block.endTime) {
      [endH, endM] = block.endTime.split(':').map(Number);
    }

    if (startH < 6 || startH > 22) return;

    const startOffset = ((startM || 0) / 60) * 64;
    const duration = ((endH - startH) * 60 + (endM - (startM || 0))) / 60 * 64;

    const typeColors = {
      deep_work: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' },
      admin: { bg: 'var(--accent-yellow-dim)', color: 'var(--accent-yellow)' },
      meeting: { bg: 'var(--accent-purple-dim)', color: 'var(--accent-purple)' },
      break: { bg: 'var(--accent-green-dim)', color: 'var(--accent-green)' },
      creative: { bg: 'var(--accent-orange-dim)', color: 'var(--accent-orange)' },
      default: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)' }
    };

    const colors = typeColors[block.type] || typeColors.default;

    // Find the timeline hour line
    const hourLine = document.querySelector(`.timeline-hour-line[data-hour="${startH}"]`);
    if (!hourLine) return;

    const blockEl = Utils.createElement('div', {
      className: 'timeline-block',
      style: {
        top: `${startOffset}px`,
        height: `${Math.max(duration, 32)}px`,
        '--block-bg': colors.bg,
        '--block-color': colors.color
      },
      innerHTML: `
        <div class="timeline-block-title">${Utils.escapeHtml(block.title)}</div>
        <div class="timeline-block-time">${block.time} — ${block.endTime || ''} ${block.description ? '· ' + block.description : ''}</div>
      `
    });

    hourLine.appendChild(blockEl);
  }

  return {
    init,
    setEnergy,
    planMyDay,
    clearSchedule,
    renderTimeline
  };
})();
