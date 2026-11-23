const API_BASE = '/api/items';
const ITEMS_PER_PAGE = 10;

let state = {
  items: [],
  total: 0,
  currentPage: 1,
  totalPages: 1,
  filters: { search: '', category: '', status: '' },
  editingId: null,
  confirmAction: null
};

const elements = {
  form: document.getElementById('itemForm'),
  formTitle: document.getElementById('formTitle'),
  submitBtn: document.getElementById('submitBtn'),
  submitText: document.getElementById('submitText'),
  cancelEditBtn: document.getElementById('cancelEditBtn'),
  resetBtn: document.getElementById('resetBtn'),
  itemId: document.getElementById('itemId'),
  description: document.getElementById('description'),
  category: document.getElementById('category'),
  location_found: document.getElementById('location_found'),
  status: document.getElementById('status'),
  descriptionError: document.getElementById('descriptionError'),
  categoryError: document.getElementById('categoryError'),
  locationError: document.getElementById('locationError'),
  filterSearch: document.getElementById('filterSearch'),
  filterCategory: document.getElementById('filterCategory'),
  filterStatus: document.getElementById('filterStatus'),
  clearFiltersBtn: document.getElementById('clearFiltersBtn'),
  tableBody: document.getElementById('itemsTableBody'),
  emptyState: document.getElementById('emptyState'),
  itemsCount: document.getElementById('itemsCount'),
  pagination: document.getElementById('pagination'),
  prevPage: document.getElementById('prevPage'),
  nextPage: document.getElementById('nextPage'),
  pageInfo: document.getElementById('pageInfo'),
  statTotal: document.getElementById('statTotal'),
  statAvailable: document.getElementById('statAvailable'),
  statReturned: document.getElementById('statReturned'),
  confirmModal: document.getElementById('confirmModal'),
  modalTitle: document.getElementById('modalTitle'),
  modalMessage: document.getElementById('modalMessage'),
  modalConfirmBtn: document.getElementById('modalConfirmBtn'),
  modalCancelBtn: document.getElementById('modalCancelBtn'),
  modalCloseBtn: document.getElementById('modalCloseBtn'),
  toastContainer: document.getElementById('toastContainer')
};

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

function getStatusLabel(status) {
  return status === 'disponivel' ? 'Disponível' : 'Devolvido';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || 'Erro na requisição');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function fetchItems(page = 1) {
  state.currentPage = page;
  const params = new URLSearchParams({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE
  });
  if (state.filters.search) params.append('search', state.filters.search);
  if (state.filters.category) params.append('category', state.filters.category);
  if (state.filters.status) params.append('status', state.filters.status);

  const data = await apiRequest(`${API_BASE}?${params}`);
  state.items = data.data || [];
  state.total = data.pagination?.total || state.items.length;
  state.totalPages = Math.ceil(state.total / ITEMS_PER_PAGE);
  renderTable();
  renderPagination();
  updateItemsCount();
}

async function fetchStats() {
  try {
    const data = await apiRequest(`${API_BASE}/stats`);
    const stats = data.data;
    elements.statTotal.textContent = stats.total;
    elements.statAvailable.textContent = stats.disponivel;
    elements.statReturned.textContent = stats.devolvido;
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
  }
}

async function createItem(itemData) {
  return apiRequest(API_BASE, { method: 'POST', body: JSON.stringify(itemData) });
}

async function updateItem(id, itemData) {
  return apiRequest(`${API_BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(itemData) });
}

async function updateItemStatus(id, status) {
  return apiRequest(`${API_BASE}/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) });
}

async function deleteItem(id) {
  return apiRequest(`${API_BASE}/${id}`, { method: 'DELETE' });
}

function renderTable() {
  if (state.items.length === 0) {
    elements.tableBody.innerHTML = '';
    elements.emptyState.style.display = 'flex';
    return;
  }
  elements.emptyState.style.display = 'none';
  elements.tableBody.innerHTML = state.items.map(item => `
    <tr data-id="${item.id}">
      <td class="description-cell" title="${escapeHtml(item.description)}">${escapeHtml(item.description)}</td>
      <td><span class="category-badge">${escapeHtml(item.category)}</span></td>
      <td>${escapeHtml(item.location_found)}</td>
      <td>${formatDate(item.registration_date)}</td>
      <td><span class="status-badge ${item.status}">${getStatusLabel(item.status)}</span></td>
      <td class="actions-col">
        <div class="action-buttons">
          <button class="action-btn edit" onclick="editItem('${item.id}')" title="Editar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="action-btn delete" onclick="confirmDelete('${item.id}')" title="Excluir">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
          ${item.status === 'disponivel' ? `
            <button class="action-btn status" onclick="confirmStatusChange('${item.id}', 'devolvido')" title="Marcar como devolvido">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </button>
          ` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

function renderPagination() {
  if (state.totalPages <= 1) {
    elements.pagination.style.display = 'none';
    return;
  }
  elements.pagination.style.display = 'flex';
  elements.prevPage.disabled = state.currentPage === 1;
  elements.nextPage.disabled = state.currentPage === state.totalPages;
  elements.pageInfo.textContent = `Página ${state.currentPage} de ${state.totalPages}`;
}

function updateItemsCount() {
  const start = (state.currentPage - 1) * ITEMS_PER_PAGE + 1;
  const end = Math.min(state.currentPage * ITEMS_PER_PAGE, state.total);
  elements.itemsCount.textContent = state.total === 0 ? 'Nenhum item' : `${start}-${end} de ${state.total} itens`;
}

function resetForm() {
  state.editingId = null;
  elements.form.reset();
  elements.itemId.value = '';
  elements.formTitle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
    Novo Item
  `;
  elements.submitText.textContent = 'Cadastrar Item';
  elements.cancelEditBtn.style.display = 'none';
  clearErrors();
}

function clearErrors() {
  [elements.descriptionError, elements.categoryError, elements.locationError].forEach(el => el.textContent = '');
  [elements.description, elements.category, elements.location_found].forEach(el => el.classList.remove('error'));
}

function showErrors(errors) {
  clearErrors();
  errors.forEach(error => {
    const input = document.getElementById(error.field);
    const errorEl = document.getElementById(`${error.field}Error`);
    if (input) input.classList.add('error');
    if (errorEl) errorEl.textContent = error.message;
  });
}

function populateForm(item) {
  state.editingId = item.id;
  elements.itemId.value = item.id;
  elements.description.value = item.description;
  elements.category.value = item.category;
  elements.location_found.value = item.location_found;
  elements.status.value = item.status;
  elements.formTitle.innerHTML = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
    Editar Item
  `;
  elements.submitText.textContent = 'Salvar Alterações';
  elements.cancelEditBtn.style.display = 'inline-flex';
  elements.form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function handleSubmit(event) {
  event.preventDefault();
  const formData = {
    description: elements.description.value.trim(),
    category: elements.category.value,
    location_found: elements.location_found.value.trim(),
    status: elements.status.value
  };

  const errors = [];
  if (formData.description.length < 3) errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 3 caracteres' });
  if (!formData.category) errors.push({ field: 'category', message: 'Selecione uma categoria' });
  if (formData.location_found.length < 2) errors.push({ field: 'location_found', message: 'Local deve ter pelo menos 2 caracteres' });
  if (errors.length > 0) { showErrors(errors); return; }

  setLoading(elements.submitBtn, true);
  try {
    if (state.editingId) {
      await updateItem(state.editingId, formData);
      showToast('Sucesso', 'Item atualizado com sucesso!', 'success');
    } else {
      await createItem(formData);
      showToast('Sucesso', 'Item cadastrado com sucesso!', 'success');
    }
    resetForm();
    await fetchItems(state.currentPage);
    await fetchStats();
  } catch (error) {
    console.error('Erro ao salvar:', error);
    if (error.data?.errors) showErrors(error.data.errors);
    else showToast('Erro', error.message || 'Erro ao salvar item', 'error');
  } finally {
    setLoading(elements.submitBtn, false);
  }
}

function editItem(id) {
  const item = state.items.find(i => i.id === id);
  if (item) populateForm(item);
}

function confirmDelete(id) {
  state.confirmAction = { type: 'delete', id };
  elements.modalTitle.textContent = 'Excluir Item';
  elements.modalMessage.textContent = 'Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.';
  elements.modalConfirmBtn.textContent = 'Excluir';
  elements.modalConfirmBtn.className = 'btn btn-danger';
  openModal();
}

function confirmStatusChange(id, newStatus) {
  const statusLabel = newStatus === 'devolvido' ? 'devolvido' : 'disponível';
  state.confirmAction = { type: 'status', id, status: newStatus };
  elements.modalTitle.textContent = `Marcar como ${statusLabel}`;
  elements.modalMessage.textContent = `Deseja marcar este item como ${statusLabel}?`;
  elements.modalConfirmBtn.textContent = `Marcar como ${statusLabel}`;
  elements.modalConfirmBtn.className = newStatus === 'devolvido' ? 'btn btn-success' : 'btn btn-primary';
  openModal();
}

async function executeConfirmAction() {
  if (!state.confirmAction) return;
  const { type, id, status } = state.confirmAction;
  setLoading(elements.modalConfirmBtn, true);
  try {
    if (type === 'delete') {
      await deleteItem(id);
      showToast('Sucesso', 'Item excluído com sucesso!', 'success');
    } else {
      await updateItemStatus(id, status);
      showToast('Sucesso', `Item marcado como ${status}!`, 'success');
    }
    closeModal();
    await fetchItems(state.currentPage);
    await fetchStats();
  } catch (error) {
    console.error('Erro:', error);
    showToast('Erro', error.message || 'Erro ao executar ação', 'error');
  } finally {
    setLoading(elements.modalConfirmBtn, false);
  }
}

function openModal() {
  elements.confirmModal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  elements.confirmModal.style.display = 'none';
  document.body.style.overflow = '';
  state.confirmAction = null;
}

const debouncedApplyFilters = debounce(applyFilters, 300);

function applyFilters() {
  state.filters = {
    search: elements.filterSearch.value.trim(),
    category: elements.filterCategory.value,
    status: elements.filterStatus.value
  };
  fetchItems(1);
}

function clearFilters() {
  state.filters = { search: '', category: '', status: '' };
  elements.filterSearch.value = '';
  elements.filterCategory.value = '';
  elements.filterStatus.value = '';
  fetchItems(1);
}

function goToPage(page) {
  if (page >= 1 && page <= state.totalPages) fetchItems(page);
}

function showToast(title, message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = {
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
  };
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${escapeHtml(title)}</div>
      <div class="toast-message">${escapeHtml(message)}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;
  elements.toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideInRight 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

function setLoading(button, loading) {
  if (loading) { button.classList.add('loading'); button.disabled = true; }
  else { button.classList.remove('loading'); button.disabled = false; }
}

function initEventListeners() {
  elements.form.addEventListener('submit', handleSubmit);
  elements.resetBtn.addEventListener('click', () => state.editingId ? resetForm() : clearErrors());
  elements.cancelEditBtn.addEventListener('click', resetForm);
  elements.filterSearch.addEventListener('input', debouncedApplyFilters);
  elements.filterCategory.addEventListener('change', applyFilters);
  elements.filterStatus.addEventListener('change', applyFilters);
  elements.clearFiltersBtn.addEventListener('click', clearFilters);
  elements.prevPage.addEventListener('click', () => goToPage(state.currentPage - 1));
  elements.nextPage.addEventListener('click', () => goToPage(state.currentPage + 1));
  elements.modalConfirmBtn.addEventListener('click', executeConfirmAction);
  elements.modalCancelBtn.addEventListener('click', closeModal);
  elements.modalCloseBtn.addEventListener('click', closeModal);
  elements.confirmModal.addEventListener('click', (e) => { if (e.target === elements.confirmModal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); if (state.editingId) resetForm(); } });
}

async function init() {
  initEventListeners();
  await fetchItems(1);
  await fetchStats();
  console.log('Front-end iniciado');
}

init();

window.editItem = editItem;
window.confirmDelete = confirmDelete;
window.confirmStatusChange = confirmStatusChange;
window.applyFilters = applyFilters;
window.clearFilters = clearFilters;
window.closeModal = closeModal;
window.goToPage = goToPage;