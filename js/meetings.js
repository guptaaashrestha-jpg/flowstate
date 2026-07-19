/* ============================================
   FlowState — Meeting Brain Module
   AI-powered meeting transcript analysis
   ============================================ */

const Meetings = (() => {

  let lastResult = null;

  async function analyze() {
    const input = document.getElementById('meeting-input');
    const text = input.value.trim();

    if (!text) {
      Utils.showToast('Paste your meeting transcript first', 'info');
      return;
    }

    if (!AIEngine.hasApiKey()) {
      Utils.showToast('Connect your Gemini API key to analyze meetings', 'info');
      return;
    }

    const output = document.getElementById('meeting-output');
    const btn = document.getElementById('btn-analyze-meeting');

    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots" style="display:inline-flex;gap:3px;"><span></span><span></span><span></span></span> Analyzing...';

    Utils.showLoading(output, 'AI is analyzing your meeting...');

    try {
      const { systemPrompt, prompt } = AIEngine.PROMPTS.analyzeMeeting(text);
      const response = await AIEngine.generate(prompt, { systemPrompt, temperature: 0.3, maxTokens: 4096 });
      const parsed = Utils.parseJSON(response);

      if (parsed) {
        lastResult = parsed;
        renderResults(parsed);
        Utils.showToast('Meeting analyzed! 🧠', 'success');
        App.incrementAIInteractions();
      } else {
        output.innerHTML = `<div class="meeting-section"><h3>📝 Analysis</h3><p>${Utils.escapeHtml(response)}</p></div>`;
      }
    } catch (err) {
      output.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
      Utils.showToast('Analysis failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> Analyze with AI';
      if (window.lucide) lucide.createIcons();
    }
  }

  function renderResults(data) {
    const output = document.getElementById('meeting-output');
    output.innerHTML = '';

    // Summary
    if (data.summary) {
      const section = createSection('📋 Summary', `<p>${Utils.escapeHtml(data.summary)}</p>`);
      output.appendChild(section);
    }

    // Sentiment badge
    if (data.sentiment) {
      const sentimentColors = {
        positive: 'badge-green',
        neutral: 'badge-blue',
        mixed: 'badge-yellow',
        tense: 'badge-red'
      };
      const badge = `<span class="badge ${sentimentColors[data.sentiment] || 'badge-blue'} mt-2" style="display:inline-flex;">${data.sentiment.toUpperCase()}</span>`;
      output.firstChild.innerHTML += badge;
    }

    // Key Decisions
    if (data.keyDecisions && data.keyDecisions.length > 0) {
      const items = data.keyDecisions.map(d => `<li>${Utils.escapeHtml(d)}</li>`).join('');
      const section = createSection('⚡ Key Decisions', `<ul>${items}</ul>`);
      output.appendChild(section);
    }

    // Action Items
    if (data.actionItems && data.actionItems.length > 0) {
      const items = data.actionItems.map(item => `
        <li>
          <strong>${Utils.escapeHtml(item.task)}</strong>
          <br><span class="text-muted text-sm">Assignee: ${Utils.escapeHtml(item.assignee || 'Unassigned')} · Deadline: ${Utils.escapeHtml(item.deadline || 'TBD')}</span>
        </li>
      `).join('');
      const section = createSection('✅ Action Items', `<ul>${items}</ul>`);

      // Add "Create Tasks" button
      const btn = Utils.createElement('button', {
        className: 'btn btn-primary btn-sm mt-3',
        innerHTML: '➕ Create Tasks from Action Items',
        onClick: () => createTasksFromActions(data.actionItems)
      });
      section.appendChild(btn);
      output.appendChild(section);
    }

    // Follow-up Email
    if (data.followUpEmail) {
      const section = createSection('📧 Follow-up Email Draft', `
        <p style="white-space:pre-wrap;">${Utils.escapeHtml(data.followUpEmail)}</p>
        <button class="btn btn-secondary btn-sm mt-3" onclick="Utils.copyToClipboard(Meetings.getLastResult().followUpEmail)">
          📋 Copy Email
        </button>
      `);
      output.appendChild(section);
    }
  }

  function createSection(title, content) {
    const section = Utils.createElement('div', {
      className: 'meeting-section',
      innerHTML: `<h3>${title}</h3>${content}`
    });
    return section;
  }

  function createTasksFromActions(actionItems) {
    let count = 0;
    for (const item of actionItems) {
      TaskBoard.addTask({
        title: item.task,
        description: `Assignee: ${item.assignee || 'Unassigned'}`,
        priority: 'high',
        category: 'meetings',
        status: 'todo',
        dueDate: null
      });
      count++;
    }
    Utils.showToast(`${count} tasks created from action items! ⚡`, 'success');
  }

  function getLastResult() {
    return lastResult;
  }

  return {
    analyze,
    getLastResult
  };
})();
