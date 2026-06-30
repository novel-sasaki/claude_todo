/* ── State ── */
const STORAGE_KEY = 'claude_todo_v2';

let state = {
  todos: [],
  categories: ['仕事', '個人', '買い物', '勉強'],
  filter: { status: 'all', priority: 'all', category: 'all' },
  search: '',
  sortBy: 'order',
  theme: 'light',
  nextOrder: 0,
};

/* ── Persistence ── */
function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    Object.assign(state, saved);
  } catch (_) {}
}

/* ── Helpers ── */
function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(dateStr) {
  return dateStr && dateStr < today();
}

function isToday(dateStr) {
  return dateStr === today();
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-');
  return `${y}/${m}/${d}`;
}

function priorityWeight(p) {
  return p === 'high' ? 0 : p === 'medium' ? 1 : 2;
}

/* ── Filtered + sorted todos ── */
function getVisible() {
  let list = [...state.todos];

  // Status filter
  if (state.filter.status === 'active') list = list.filter(t => !t.completed);
  else if (state.filter.status === 'completed') list = list.filter(t => t.completed);
  else if (state.filter.status === 'today') list = list.filter(t => isToday(t.dueDate));
  else if (state.filter.status === 'overdue') list = list.filter(t => !t.completed && isOverdue(t.dueDate));

  // Priority filter
  if (state.filter.priority !== 'all') list = list.filter(t => t.priority === state.filter.priority);

  // Category filter
  if (state.filter.category !== 'all') list = list.filter(t => t.category === state.filter.category);

  // Search
  const q = state.search.trim().toLowerCase();
  if (q) list = list.filter(t =>
    t.title.toLowerCase().includes(q) ||
    (t.description || '').toLowerCase().includes(q)
  );

  // Sort
  if (state.sortBy === 'order') list.sort((a, b) => a.order - b.order);
  else if (state.sortBy === 'dueDate') list.sort((a, b) => {
    if (!a.dueDate && !b.dueDate) return a.order - b.order;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return a.dueDate.localeCompare(b.dueDate);
  });
  else if (state.sortBy === 'priority') list.sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || a.order - b.order);
  else if (state.sortBy === 'createdAt') list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  else if (state.sortBy === 'title') list.sort((a, b) => a.title.localeCompare(b.title, 'ja'));

  return list;
}

/* ── Counts ── */
function getCounts() {
  const all = state.todos.length;
  const active = state.todos.filter(t => !t.completed).length;
  const completed = state.todos.filter(t => t.completed).length;
  const todayCount = state.todos.filter(t => isToday(t.dueDate)).length;
  const overdueCount = state.todos.filter(t => !t.completed && isOverdue(t.dueDate)).length;
  return { all, active, completed, today: todayCount, overdue: overdueCount };
}

/* ── CRUD ── */
function addTodo(data) {
  const todo = {
    id: uid(),
    title: data.title.trim(),
    description: (data.description || '').trim(),
    completed: false,
    priority: data.priority || 'medium',
    category: data.category || '',
    dueDate: data.dueDate || '',
    createdAt: new Date().toISOString(),
    order: state.nextOrder++,
  };
  state.todos.unshift(todo);
  // Re-number order so newest is first in custom sort
  state.todos.forEach((t, i) => { t.order = i; });
  save();
  return todo;
}

function updateTodo(id, data) {
  const idx = state.todos.findIndex(t => t.id === id);
  if (idx === -1) return;
  Object.assign(state.todos[idx], data);
  save();
}

function deleteTodo(id) {
  state.todos = state.todos.filter(t => t.id !== id);
  save();
}

function toggleTodo(id) {
  const todo = state.todos.find(t => t.id === id);
  if (!todo) return;
  todo.completed = !todo.completed;
  save();
}

/* ── Toast ── */
function showToast(msg, type = '') {
  const el = document.createElement('div');
  el.className = `toast${type ? ' ' + type : ''}`;
  el.textContent = msg;
  document.getElementById('toastContainer').prepend(el);
  setTimeout(() => {
    el.style.animation = 'toastOut .2s ease forwards';
    setTimeout(() => el.remove(), 200);
  }, 2200);
}

/* ── Render ── */
function render() {
  renderList();
  renderSidebar();
  renderProgress();
  updateCategoryNav();
  updateCategorySelects();
}

function renderList() {
  const list = document.getElementById('todoList');
  const empty = document.getElementById('emptyState');
  const visible = getVisible();

  // Clear non-empty-state nodes
  [...list.children].forEach(el => { if (!el.id) el.remove(); });

  if (visible.length === 0) {
    empty.style.display = '';
    return;
  }
  empty.style.display = 'none';

  // Build fragment
  const frag = document.createDocumentFragment();
  visible.forEach(todo => frag.appendChild(createTodoEl(todo)));
  list.appendChild(frag);
}

function createTodoEl(todo) {
  const el = document.createElement('div');
  el.className = `todo-item${todo.completed ? ' completed' : ''}`;
  el.dataset.id = todo.id;
  el.draggable = true;

  const dueCls = isOverdue(todo.dueDate) && !todo.completed ? 'overdue'
               : isToday(todo.dueDate) ? 'today' : '';

  el.innerHTML = `
    <div class="priority-indicator ${todo.priority}"></div>
    <div class="drag-handle" aria-hidden="true">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="8" cy="6" r="1" fill="currentColor"/><circle cx="16" cy="6" r="1" fill="currentColor"/>
        <circle cx="8" cy="12" r="1" fill="currentColor"/><circle cx="16" cy="12" r="1" fill="currentColor"/>
        <circle cx="8" cy="18" r="1" fill="currentColor"/><circle cx="16" cy="18" r="1" fill="currentColor"/>
      </svg>
    </div>
    <button class="todo-checkbox${todo.completed ? ' checked' : ''}" data-action="toggle" aria-label="${todo.completed ? '未完了にする' : '完了にする'}">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </button>
    <div class="todo-content">
      <div class="todo-title">${escHtml(todo.title)}</div>
      ${todo.description ? `<div class="todo-desc">${escHtml(todo.description)}</div>` : ''}
      <div class="todo-meta">
        ${todo.category ? `<span class="meta-tag category">${escHtml(todo.category)}</span>` : ''}
        ${todo.dueDate ? `<span class="meta-tag due ${dueCls}">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          ${dueCls === 'overdue' ? '期限超過 ' : dueCls === 'today' ? '今日 ' : ''}${formatDate(todo.dueDate)}
        </span>` : ''}
      </div>
    </div>
    <div class="todo-actions">
      <button class="todo-action-btn" data-action="edit" aria-label="編集">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="todo-action-btn delete" data-action="delete" aria-label="削除">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/>
          <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
        </svg>
      </button>
    </div>
  `;

  // Events
  el.querySelector('[data-action="toggle"]').addEventListener('click', () => {
    toggleTodo(todo.id);
    render();
    showToast(todo.completed ? 'タスクを未完了にしました' : 'タスクを完了しました！', todo.completed ? '' : 'success');
  });
  el.querySelector('[data-action="edit"]').addEventListener('click', () => openModal(todo));
  el.querySelector('[data-action="delete"]').addEventListener('click', () => {
    deleteTodo(todo.id);
    render();
    showToast('タスクを削除しました');
  });

  // Drag & drop
  el.addEventListener('dragstart', onDragStart);
  el.addEventListener('dragover', onDragOver);
  el.addEventListener('drop', onDrop);
  el.addEventListener('dragend', onDragEnd);

  return el;
}

function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function renderSidebar() {
  const counts = getCounts();
  document.getElementById('countAll').textContent = counts.all;
  document.getElementById('countActive').textContent = counts.active;
  document.getElementById('countCompleted').textContent = counts.completed;
  document.getElementById('countToday').textContent = counts.today;
  document.getElementById('countOverdue').textContent = counts.overdue;

  // Active filter buttons
  document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    const { filter, value } = btn.dataset;
    const isActive = state.filter[filter] === value ||
      (filter === 'status' && value === state.filter.status) ||
      (filter === 'priority' && value === state.filter.priority) ||
      (filter === 'category' && value === state.filter.category);
    btn.classList.toggle('active', isActive);
  });

  // Title
  const titles = {
    all: 'すべてのタスク', active: '未完了のタスク',
    completed: '完了済みのタスク', today: '今日のタスク', overdue: '期限超過のタスク',
  };
  const catTitle = state.filter.category !== 'all' ? state.filter.category : null;
  const statusTitle = titles[state.filter.status] || 'タスク';
  document.getElementById('mainTitle').textContent = catTitle || statusTitle;
}

function renderProgress() {
  const todayTodos = state.todos.filter(t => isToday(t.dueDate));
  const done = todayTodos.filter(t => t.completed).length;
  const total = todayTodos.length;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  document.getElementById('progressPercent').textContent = `${pct}%`;
  document.getElementById('progressFill').style.width = `${pct}%`;
}

function updateCategoryNav() {
  const nav = document.getElementById('categoryNav');
  // Keep "すべて" button
  const allBtn = nav.querySelector('[data-value="all"]');
  nav.innerHTML = '';
  nav.appendChild(allBtn);

  state.categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.dataset.filter = 'category';
    btn.dataset.value = cat;
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
        <line x1="7" y1="7" x2="7.01" y2="7"/>
      </svg>
      ${escHtml(cat)}
    `;
    if (state.filter.category === cat) btn.classList.add('active');
    btn.addEventListener('click', () => {
      state.filter.category = cat;
      render();
    });
    nav.appendChild(btn);
  });
}

function updateCategorySelects() {
  const sel = document.getElementById('todoCategory');
  const current = sel.value;
  sel.innerHTML = '<option value="">なし</option>';
  state.categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat; opt.textContent = cat;
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

/* ── Modal ── */
const backdrop = document.getElementById('modalBackdrop');

function openModal(todo = null) {
  const titleEl = document.getElementById('todoTitle');
  const descEl = document.getElementById('todoDesc');
  const priorityEl = document.getElementById('todoPriority');
  const dueEl = document.getElementById('todoDue');
  const catEl = document.getElementById('todoCategory');
  const editingId = document.getElementById('editingId');
  const modalTitle = document.getElementById('modalTitle');

  if (todo) {
    editingId.value = todo.id;
    titleEl.value = todo.title;
    descEl.value = todo.description || '';
    priorityEl.value = todo.priority;
    dueEl.value = todo.dueDate || '';
    catEl.value = todo.category || '';
    modalTitle.textContent = 'タスクを編集';
  } else {
    editingId.value = '';
    titleEl.value = '';
    descEl.value = '';
    priorityEl.value = 'medium';
    dueEl.value = '';
    catEl.value = '';
    modalTitle.textContent = 'タスクを追加';
  }

  updateCategorySelects();
  if (todo) catEl.value = todo.category || '';
  backdrop.classList.add('open');
  setTimeout(() => titleEl.focus(), 100);
}

function closeModal() {
  backdrop.classList.remove('open');
  document.getElementById('todoTitle').classList.remove('error');
}

function saveModal() {
  const titleEl = document.getElementById('todoTitle');
  const title = titleEl.value.trim();
  if (!title) {
    titleEl.classList.add('error');
    titleEl.focus();
    showToast('タイトルを入力してください', 'error');
    return;
  }
  titleEl.classList.remove('error');

  const data = {
    title,
    description: document.getElementById('todoDesc').value,
    priority: document.getElementById('todoPriority').value,
    dueDate: document.getElementById('todoDue').value,
    category: document.getElementById('todoCategory').value,
  };

  const id = document.getElementById('editingId').value;
  if (id) {
    updateTodo(id, data);
    showToast('タスクを更新しました', 'success');
  } else {
    addTodo(data);
    showToast('タスクを追加しました', 'success');
  }

  closeModal();
  render();
}

/* ── Quick add ── */
function quickAdd() {
  const input = document.getElementById('quickAddInput');
  const title = input.value.trim();
  if (!title) return;
  addTodo({ title });
  input.value = '';
  render();
  showToast('タスクを追加しました', 'success');
}

/* ── Drag & Drop ── */
let dragId = null;

function onDragStart(e) {
  dragId = e.currentTarget.dataset.id;
  e.currentTarget.classList.add('dragging');
  e.dataTransfer.effectAllowed = 'move';
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const target = e.currentTarget;
  if (target.dataset.id !== dragId) {
    document.querySelectorAll('.todo-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    target.classList.add('drag-over');
  }
}

function onDrop(e) {
  e.preventDefault();
  const targetId = e.currentTarget.dataset.id;
  if (dragId && targetId && dragId !== targetId) {
    const fromIdx = state.todos.findIndex(t => t.id === dragId);
    const toIdx = state.todos.findIndex(t => t.id === targetId);
    if (fromIdx !== -1 && toIdx !== -1) {
      const [moved] = state.todos.splice(fromIdx, 1);
      state.todos.splice(toIdx, 0, moved);
      state.todos.forEach((t, i) => { t.order = i; });
      state.sortBy = 'order';
      document.getElementById('sortSelect').value = 'order';
      save();
      render();
    }
  }
  document.querySelectorAll('.todo-item.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function onDragEnd(e) {
  e.currentTarget.classList.remove('dragging');
  document.querySelectorAll('.todo-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  dragId = null;
}

/* ── Theme ── */
function applyTheme() {
  document.body.dataset.theme = state.theme;
}

function toggleTheme() {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  save();
}

/* ── Sidebar toggle ── */
let sidebarOpen = true;

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main');
  const isMobile = window.innerWidth <= 768;

  if (isMobile) {
    sidebar.classList.toggle('mobile-open');
  } else {
    sidebarOpen = !sidebarOpen;
    sidebar.classList.toggle('collapsed', !sidebarOpen);
    main.style.marginLeft = sidebarOpen ? 'var(--sidebar-width)' : '0';
  }
}

/* ── Category management ── */
function showAddCategoryInline() {
  const nav = document.getElementById('categoryNav');
  if (nav.querySelector('.category-inline-input')) return;

  const row = document.createElement('div');
  row.className = 'category-inline-input';
  row.innerHTML = `
    <input type="text" placeholder="カテゴリ名" maxlength="20" autocomplete="off">
    <button class="confirm">追加</button>
    <button class="cancel">×</button>
  `;
  nav.appendChild(row);
  row.querySelector('input').focus();

  const confirm = () => {
    const val = row.querySelector('input').value.trim();
    if (val && !state.categories.includes(val)) {
      state.categories.push(val);
      save();
      render();
      showToast(`「${val}」を追加しました`);
    }
    row.remove();
  };

  row.querySelector('.confirm').addEventListener('click', confirm);
  row.querySelector('.cancel').addEventListener('click', () => row.remove());
  row.querySelector('input').addEventListener('keydown', e => {
    if (e.key === 'Enter') confirm();
    if (e.key === 'Escape') row.remove();
  });
}

function showNewCategoryModal() {
  const name = prompt('新しいカテゴリ名:');
  if (!name || !name.trim()) return;
  const trimmed = name.trim();
  if (!state.categories.includes(trimmed)) {
    state.categories.push(trimmed);
    save();
    updateCategorySelects();
    document.getElementById('todoCategory').value = trimmed;
  }
}

/* ── Keyboard shortcuts ── */
let shortcutsVisible = false;

function toggleShortcuts() {
  shortcutsVisible = !shortcutsVisible;
  document.getElementById('shortcutsHint').classList.toggle('visible', shortcutsVisible);
}

document.addEventListener('keydown', e => {
  const tag = document.activeElement.tagName;
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(tag);
  const modalOpen = backdrop.classList.contains('open');

  if (e.key === 'Escape') {
    if (modalOpen) { closeModal(); return; }
    if (shortcutsVisible) { toggleShortcuts(); return; }
  }

  if (modalOpen) return;

  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    document.getElementById('searchInput').focus();
    return;
  }

  if (typing) return;

  if (e.key === 'n' || e.key === 'N') { e.preventDefault(); openModal(); }
  if (e.key === 'd' || e.key === 'D') { e.preventDefault(); toggleTheme(); }
  if (e.key === '?') { e.preventDefault(); toggleShortcuts(); }
});

/* ── Wire up ── */
function init() {
  load();
  applyTheme();

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Sidebar toggle
  document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);

  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    state.search = e.target.value;
    render();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    state.sortBy = e.target.value;
    render();
  });

  // Quick add
  document.getElementById('quickAddInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') quickAdd();
  });

  // Open modal with detail
  document.getElementById('openModalBtn').addEventListener('click', () => {
    const input = document.getElementById('quickAddInput');
    openModal();
    if (input.value.trim()) {
      document.getElementById('todoTitle').value = input.value.trim();
      input.value = '';
    }
  });

  // FAB
  document.getElementById('fab').addEventListener('click', () => openModal());

  // Modal
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modalSave').addEventListener('click', saveModal);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) closeModal(); });

  document.getElementById('todoTitle').addEventListener('keydown', e => {
    if (e.key === 'Enter') saveModal();
  });

  // New category in modal
  document.getElementById('newCategoryBtn').addEventListener('click', showNewCategoryModal);

  // Add category in sidebar
  document.getElementById('addCategoryBtn').addEventListener('click', showAddCategoryInline);

  // Status + priority filter buttons
  document.querySelectorAll('.filter-btn[data-filter="status"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filter.status = btn.dataset.value;
      render();
    });
  });
  document.querySelectorAll('.filter-btn[data-filter="priority"]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.filter.priority = btn.dataset.value;
      render();
    });
  });

  // Category "all" button (always present)
  document.querySelector('.filter-btn[data-filter="category"]').addEventListener('click', () => {
    state.filter.category = 'all';
    render();
  });

  // Bulk actions
  document.getElementById('completeAllBtn').addEventListener('click', () => {
    const visible = getVisible().filter(t => !t.completed);
    if (visible.length === 0) { showToast('完了するタスクがありません'); return; }
    visible.forEach(t => { t.completed = true; });
    save(); render();
    showToast(`${visible.length}件のタスクを完了しました`, 'success');
  });
  document.getElementById('clearCompletedBtn').addEventListener('click', () => {
    const before = state.todos.length;
    state.todos = state.todos.filter(t => !t.completed);
    const removed = before - state.todos.length;
    if (removed === 0) { showToast('削除する完了済みタスクがありません'); return; }
    save(); render();
    showToast(`${removed}件の完了済みタスクを削除しました`);
  });

  // Sort select
  document.getElementById('sortSelect').value = state.sortBy;

  // Search value
  document.getElementById('searchInput').value = state.search;

  // Initial render
  render();

  // Welcome message for new users
  if (state.todos.length === 0) {
    setTimeout(() => showToast('N キーで新しいタスクを追加できます'), 800);
  }
}

init();
