/* ============================================
   FlowState — Doc Analyzer Module
   AI-powered document analysis
   ============================================ */

const Docs = (() => {
  let lastResult = null;

  async function analyze() {
    const input = document.getElementById('doc-input');
    const text = input.value.trim();

    if (!text) {
      Utils.showToast('Paste a document to analyze', 'info');
      return;
    }

    if (!AIEngine.hasApiKey()) {
      Utils.showToast('Connect your Gemini API key to analyze documents', 'info');
      return;
    }

    const results = document.getElementById('doc-results');
    const btn = document.getElementById('btn-analyze-doc');

    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots" style="display:inline-flex;gap:3px;"><span></span><span></span><span></span></span> Analyzing...';

    Utils.showLoading(results, 'AI is analyzing your document...');

    try {
      const { systemPrompt, prompt } = AIEngine.PROMPTS.analyzeDocument(text);
      const response = await AIEngine.generate(prompt, { systemPrompt, temperature: 0.3, maxTokens: 4096 });
      const parsed = Utils.parseJSON(response);

      if (parsed) {
        lastResult = parsed;
        renderResults(parsed);
        Utils.showToast('Document analyzed! 📄', 'success');
        App.incrementAIInteractions();
      } else {
        results.innerHTML = `<div class="doc-result-card"><h3>📝 Analysis</h3><p>${Utils.escapeHtml(response)}</p></div>`;
      }
    } catch (err) {
      results.innerHTML = `<div class="empty-state"><div class="empty-state-icon">❌</div><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
      Utils.showToast('Analysis failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> Analyze with AI';
      if (window.lucide) lucide.createIcons();
    }
  }

  function renderResults(data) {
    const results = document.getElementById('doc-results');
    results.innerHTML = '';

    // Stats bar
    if (data.wordCount || data.readingTime || data.complexity) {
      const statsCard = Utils.createElement('div', {
        className: 'doc-result-card',
        innerHTML: `
          <div class="flex gap-4" style="flex-wrap:wrap;">
            ${data.wordCount ? `<span class="badge badge-blue">📊 ${data.wordCount} words</span>` : ''}
            ${data.readingTime ? `<span class="badge badge-green">⏱ ${data.readingTime}</span>` : ''}
            ${data.complexity ? `<span class="badge badge-purple">📐 ${data.complexity} complexity</span>` : ''}
          </div>
        `
      });
      results.appendChild(statsCard);
    }

    // Summary
    if (data.summary) {
      const card = createCard('📋 Executive Summary', `<p>${Utils.escapeHtml(data.summary)}</p>`);
      results.appendChild(card);
    }

    // Key Insights
    if (data.keyInsights && data.keyInsights.length > 0) {
      const items = data.keyInsights.map(i => `<li>${Utils.escapeHtml(i)}</li>`).join('');
      const card = createCard('💡 Key Insights', `<ul>${items}</ul>`);
      results.appendChild(card);
    }

    // Action Items
    if (data.actionItems && data.actionItems.length > 0) {
      const items = data.actionItems.map(i => `<li>${Utils.escapeHtml(i)}</li>`).join('');
      const card = createCard('✅ Action Items', `<ul>${items}</ul>`);

      const btn = Utils.createElement('button', {
        className: 'btn btn-primary btn-sm mt-3',
        innerHTML: '➕ Create Tasks from Actions',
        onClick: () => createTasksFromDoc(data.actionItems)
      });
      card.appendChild(btn);
      results.appendChild(card);
    }

    // Q&A
    if (data.questions && data.questions.length > 0) {
      let qaHtml = '';
      for (const qa of data.questions) {
        qaHtml += `
          <div style="margin-bottom:12px;">
            <strong>Q: ${Utils.escapeHtml(qa.question)}</strong>
            <p style="margin-top:4px;color:var(--text-muted);">A: ${Utils.escapeHtml(qa.answer)}</p>
          </div>
        `;
      }
      const card = createCard('❓ Comprehension Q&A', qaHtml);
      results.appendChild(card);
    }

    // Copy all button
    const copyBtn = Utils.createElement('button', {
      className: 'btn btn-secondary w-full mt-3',
      innerHTML: '📋 Copy Full Analysis',
      onClick: () => copyAnalysis(data)
    });
    results.appendChild(copyBtn);
  }

  function createCard(title, content) {
    return Utils.createElement('div', {
      className: 'doc-result-card',
      innerHTML: `<h3>${title}</h3>${content}`
    });
  }

  function createTasksFromDoc(actionItems) {
    let count = 0;
    for (const item of actionItems) {
      TaskBoard.addTask({
        title: item,
        description: 'Extracted from document analysis',
        priority: 'medium',
        category: 'work',
        status: 'todo',
        dueDate: null
      });
      count++;
    }
    Utils.showToast(`${count} tasks created from document! ⚡`, 'success');
  }

  function copyAnalysis(data) {
    let text = '';
    if (data.summary) text += `SUMMARY:\n${data.summary}\n\n`;
    if (data.keyInsights) text += `KEY INSIGHTS:\n${data.keyInsights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}\n\n`;
    if (data.actionItems) text += `ACTION ITEMS:\n${data.actionItems.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}\n\n`;
    if (data.questions) text += `Q&A:\n${data.questions.map(qa => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}`;
    Utils.copyToClipboard(text);
  }

  return {
    analyze,
    getLastResult: () => lastResult
  };
})();
