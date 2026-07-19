/* ============================================
   FlowState — Task Board Module
   AI-powered Kanban with drag-and-drop
   ============================================ */

const TaskBoard = (() => {
  let tasks = [];
  let draggedCard = null;

  function init() {
    tasks = Utils.loadData('tasks', []);
    render();
    setupDragDrop();
  }

  function saveTasks() {
    Utils.saveData('tasks', tasks);
    App.updateDashboardStats();
  }

  // --- Add task from natural language input ---
  async function addTaskFromInput() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) {
      Utils.showToast('Type a task description first', 'info');
      return;
    }

    if (!AIEngine.hasApiKey()) {
      // Fallback: add as simple task
      addTask({
        title: text,
        description: '',
        priority: 'medium',
        category: 'general',
        status: 'todo',
        dueDate: null
      });
      input.value = '';
      Utils.showToast('Task added!', 'success');
      return;
    }

    // AI Parse
    const btn = document.getElementById('btn-add-task');
    btn.disabled = true;
    btn.innerHTML = '<span class="ai-loading-dots" style="display:inline-flex;gap:3px;"><span></span><span></span><span></span></span> Parsing...';

    try {
      const { systemPrompt, prompt } = AIEngine.PROMPTS.parseTask(text);
      const response = await AIEngine.generate(prompt, { systemPrompt, temperature: 0.3 });
      const parsed = Utils.parseJSON(response);

      if (parsed && parsed.tasks && parsed.tasks.length > 0) {
        for (const t of parsed.tasks) {
          addTask({
            title: t.title || text,
            description: t.description || '',
            priority: t.priority || 'medium',
            category: t.category || 'general',
            status: 'todo',
            dueDate: t.dueDate || null
          });
        }
        Utils.showToast(`${parsed.tasks.length} task(s) created with AI! ⚡`, 'success');
        App.incrementAIInteractions();
      } else {
        // Fallback
        addTask({ title: text, description: '', priority: 'medium', category: 'general', status: 'todo', dueDate: null });
        Utils.showToast('Task added!', 'success');
      }
      input.value = '';
    } catch (err) {
      Utils.showToast('AI Error: ' + err.message, 'error');
      // Fallback
      addTask({ title: text, description: '', priority: 'medium', category: 'general', status: 'todo', dueDate: null });
      input.value = '';
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i data-lucide="sparkles" style="width:16px;height:16px;"></i> AI Parse';
      if (window.lucide) lucide.createIcons();
    }
  }

  function addManualTask() {
    const input = document.getElementById('task-input');
    const text = input.value.trim();
    if (!text) {
      Utils.showToast('Type a task description first', 'info');
      return;
    }
    addTask({
      title: text,
      description: '',
      priority: 'medium',
      category: 'general',
      status: 'todo',
      dueDate: null
    });
    input.value = '';
    Utils.showToast('Task added!', 'success');
  }

  function addTask(taskData) {
    const task = {
      id: Utils.generateId(),
      ...taskData,
      createdAt: new Date().toISOString()
    };
    tasks.push(task);
    saveTasks();
    render();
  }

  function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    Utils.showToast('Task deleted', 'info');
  }

  function moveTask(id, newStatus) {
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.status = newStatus;
      saveTasks();
      render();
    }
  }

  // --- Rendering ---
  function render() {
    const statuses = ['todo', 'progress', 'done'];
    for (const status of statuses) {
      const container = document.getElementById(`cards-${status}`);
      const count = document.getElementById(`count-${status}`);
      const filtered = tasks.filter(t => t.status === status);

      if (count) count.textContent = filtered.length;

      if (!container) continue;
      container.innerHTML = '';

      if (filtered.length === 0) {
        container.innerHTML = `<div class="text-muted text-sm" style="text-align:center;padding:20px;">Drop tasks here</div>`;
        continue;
      }

      for (const task of filtered) {
        const card = createTaskCard(task);
        container.appendChild(card);
      }
    }
  }

  function createTaskCard(task) {
    const priorityClass = `priority-${task.priority}`;
    const categoryIcons = {
      work: '💼', personal: '🏠', meetings: '👥', creative: '🎨', health: '❤️', learning: '📚', general: '📌'
    };

    const card = Utils.createElement('div', {
      className: 'task-card',
      draggable: 'true',
      dataset: { id: task.id },
      innerHTML: `
        <div class="task-card-actions">
          <button class="task-card-action-btn" onclick="TaskBoard.deleteTask('${task.id}')" title="Delete">✕</button>
        </div>
        <div class="task-card-title">${Utils.escapeHtml(task.title)}</div>
        <div class="task-card-meta">
          <span class="task-card-category">
            ${categoryIcons[task.category] || '📌'} ${task.category || 'general'}
            ${task.dueDate ? ` · ${Utils.formatDate(task.dueDate)}` : ''}
          </span>
          <span class="task-card-priority ${priorityClass}" title="${task.priority}"></span>
        </div>
      `
    });

    // Drag events
    card.addEventListener('dragstart', (e) => {
      draggedCard = task.id;
      card.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      draggedCard = null;
    });

    return card;
  }

  // --- Drag & Drop ---
  function setupDragDrop() {
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      const column = e.target.closest('.kanban-cards');
      if (column) {
        column.classList.add('drag-over');
      }
    });

    document.addEventListener('dragleave', (e) => {
      const column = e.target.closest('.kanban-cards');
      if (column) {
        column.classList.remove('drag-over');
      }
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      const column = e.target.closest('.kanban-cards');
      if (column && draggedCard) {
        column.classList.remove('drag-over');
        const newStatus = column.dataset.status;
        moveTask(draggedCard, newStatus);

        if (newStatus === 'done') {
          Utils.showToast('Task completed! 🎉', 'success');
        }
      }
    });
  }

  function getTasks() {
    return tasks;
  }

  return {
    init,
    addTaskFromInput,
    addManualTask,
    addTask,
    deleteTask,
    moveTask,
    getTasks,
    render
  };
})();
