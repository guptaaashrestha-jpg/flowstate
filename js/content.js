/* ============================================
   FlowState — Content Studio Module
   AI-powered content generation with streaming
   ============================================ */

const Content = (() => {
  let currentType = 'email';
  let currentTone = 'professional';
  let lastContent = '';

  function setType(type) {
    currentType = type;
    Utils.$$('#content-type-grid .content-type-option').forEach(opt => {
      opt.classList.toggle('active', opt.dataset.type === type);
    });
  }

  function setTone(tone) {
    currentTone = tone;
    Utils.$$('#tone-chips .tone-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.tone === tone);
    });
  }

  async function generate() {
    const topic = document.getElementById('content-topic').value.trim();
    const context = document.getElementById('content-context').value.trim();

    if (!topic) {
      Utils.showToast('Describe what the content should be about', 'info');
      return;
    }

    if (!AIEngine.hasApiKey()) {
      Utils.showToast('Connect your Gemini API key to generate content', 'info');
      return;
    }

    const btn = document.getElementById('btn-generate-content');
    const preview = document.getElementById('content-preview-body');

    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots" style="display:inline-flex;gap:3px;"><span></span><span></span><span></span></span> Generating...';

    preview.innerHTML = '<span class="streaming-cursor"></span>';
    lastContent = '';

    try {
      const { systemPrompt, prompt } = AIEngine.PROMPTS.generateContent(currentType, topic, currentTone, context);

      lastContent = await AIEngine.streamGenerate(
        prompt,
        (chunk, fullText) => {
          preview.innerHTML = Utils.escapeHtml(fullText) + '<span class="streaming-cursor"></span>';
          // Auto-scroll
          preview.scrollTop = preview.scrollHeight;
        },
        { systemPrompt, temperature: 0.7, maxTokens: 4096 }
      );

      // Remove cursor after done
      preview.innerHTML = Utils.escapeHtml(lastContent);

      Utils.showToast('Content generated! ✍️', 'success');
      App.incrementAIInteractions();
    } catch (err) {
      preview.innerHTML = `<div class="empty-state" style="padding:20px;"><div class="empty-state-icon">❌</div><h3>Error</h3><p>${Utils.escapeHtml(err.message)}</p></div>`;
      Utils.showToast('Generation failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> Generate with AI';
      if (window.lucide) lucide.createIcons();
    }
  }

  function regenerate() {
    generate();
  }

  function copy() {
    if (lastContent) {
      Utils.copyToClipboard(lastContent);
    } else {
      Utils.showToast('No content to copy. Generate some first!', 'info');
    }
  }

  return {
    setType,
    setTone,
    generate,
    regenerate,
    copy
  };
})();
