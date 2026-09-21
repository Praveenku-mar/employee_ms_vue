<template>
  <div class="app-shell">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span class="logo-icon">👤</span>
        <span class="logo-text">EmpMS</span>
      </div>
      <nav class="sidebar-nav">
        <a class="nav-item active">
          <span class="nav-icon">🏠</span>
          <span>Dashboard</span>
        </a>
      </nav>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <h1 class="page-title">Employee Management</h1>
          <p class="page-subtitle">Manage your workforce records</p>
        </div>
        <div class="topbar-right">
          <div class="stat-chip">
            <span class="stat-num">{{ employees.length }}</span>
            <span class="stat-label">Total Employees</span>
          </div>
        </div>
      </header>

      <Transition name="toast">
        <div v-if="toast.visible" :class="['toast', `toast--${toast.type}`]">
          <span class="toast-icon">{{ toast.type === 'success' ? '✅' : '❌' }}</span>
          <span>{{ toast.message }}</span>
          <button class="toast-close" @click="toast.visible = false">×</button>
        </div>
      </Transition>

      <section class="card form-card">
        <div class="card-header">
          <h2 class="card-title">
            {{ editingName ? '✏️ Edit Employee' : '➕ Add New Employee' }}
          </h2>
          <button v-if="editingName" class="btn btn-ghost" @click="cancelEdit">
            Cancel
          </button>
        </div>

        <form class="emp-form" @submit.prevent="submitForm" novalidate>
          <div class="form-grid">
            <!-- First Name -->
            <div class="field-group" :class="{ error: errors.first_name }">
              <label for="first_name" class="field-label">
                First Name <span class="required">*</span>
              </label>
              <input
                id="first_name"
                v-model.trim="form.first_name"
                type="text"
                class="field-input"
                placeholder="e.g. Praveen"
                autocomplete="given-name"
                @input="clearError('first_name')"
              />
              <span v-if="errors.first_name" class="field-error">{{ errors.first_name }}</span>
            </div>

            <div class="field-group">
              <label for="last_name" class="field-label">Last Name</label>
              <input
                id="last_name"
                v-model.trim="form.last_name"
                type="text"
                class="field-input"
                placeholder="e.g. Kumar"
                autocomplete="family-name"
              />
            </div>

            <div class="field-group" :class="{ error: errors.phone_number }">
              <label for="phone_number" class="field-label">Phone Number</label>
              <input
                id="phone_number"
                v-model.trim="form.phone_number"
                type="tel"
                class="field-input"
                placeholder="+91 98765 43210"
                autocomplete="tel"
                @input="clearError('phone_number')"
              />
              <span v-if="errors.phone_number" class="field-error">{{ errors.phone_number }}</span>
            </div>

            <div class="field-group" :class="{ error: errors.email_id }">
              <label for="email_id" class="field-label">Email ID</label>
              <input
                id="email_id"
                v-model.trim="form.email_id"
                type="email"
                class="field-input"
                placeholder="praveen@company.com"
                autocomplete="email"
                @input="clearError('email_id')"
              />
              <span v-if="errors.email_id" class="field-error">{{ errors.email_id }}</span>
            </div>

            <div class="field-group">
              <label for="joining_date" class="field-label">Joining Date</label>
              <input
                id="joining_date"
                v-model="form.joining_date"
                type="date"
                class="field-input"
              />
            </div>

            <div class="field-group">
              <label for="date_of_birth" class="field-label">Date of Birth</label>
              <input
                id="date_of_birth"
                v-model="form.date_of_birth"
                type="date"
                class="field-input"
              />
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner" />
              {{ submitting ? 'Saving…' : editingName ? 'Update Employee' : 'Save Employee' }}
            </button>
            <button
              v-if="editingName"
              type="button"
              class="btn btn-ghost"
              @click="cancelEdit"
            >
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section class="card table-card">
        <div class="card-header">
          <h2 class="card-title">👥 All Employees</h2>
          <div class="search-wrap">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchQuery"
              type="search"
              class="search-input"
              placeholder="Search employees…"
            />
          </div>
        </div>

        <div v-if="loading" class="skeleton-wrap">
          <div v-for="i in 4" :key="i" class="skeleton-row">
            <div class="skeleton skeleton-avatar" />
            <div class="skeleton skeleton-line" style="width: 18%" />
            <div class="skeleton skeleton-line" style="width: 14%" />
            <div class="skeleton skeleton-line" style="width: 22%" />
            <div class="skeleton skeleton-line" style="width: 16%" />
            <div class="skeleton skeleton-line" style="width: 12%" />
            <div class="skeleton skeleton-btn" />
          </div>
        </div>

        <div v-else-if="filteredEmployees.length === 0" class="empty-state">
          <div class="empty-icon">🗂️</div>
          <p class="empty-title">No employees found</p>
          <p class="empty-sub">
            {{ searchQuery ? 'Try a different search term.' : 'Add your first employee above.' }}
          </p>
        </div>

        <div v-else class="table-wrap">
          <table class="emp-table" aria-label="Employee records">
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Joining Date</th>
                <th>Date of Birth</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(emp, idx) in filteredEmployees"
                :key="emp.name"
                class="table-row"
                :class="{ 'row-editing': emp.name === editingName }"
              >
                <td class="col-idx">{{ idx + 1 }}</td>
                <td class="col-name">
                  <div class="avatar-cell">
                    <div class="avatar" :style="{ background: avatarColor(emp.first_name) }">
                      {{ initials(emp.first_name, emp.last_name) }}
                    </div>
                    <div>
                      <span class="name-full">{{ emp.first_name }} {{ emp.last_name }}</span>
                      <span class="name-id">{{ emp.name }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span v-if="emp.phone_number" class="badge badge-blue">
                    📞 {{ emp.phone_number }}
                  </span>
                  <span v-else class="empty-val">—</span>
                </td>
                <td>
                  <span v-if="emp.email_id" class="badge badge-purple">
                    ✉️ {{ emp.email_id }}
                  </span>
                  <span v-else class="empty-val">—</span>
                </td>
                <td>
                  <span v-if="emp.joining_date" class="date-chip">
                    📅 {{ formatDate(emp.joining_date) }}
                  </span>
                  <span v-else class="empty-val">—</span>
                </td>
                <td>
                  <span v-if="emp.date_of_birth" class="date-chip">
                    🎂 {{ formatDate(emp.date_of_birth) }}
                  </span>
                  <span v-else class="empty-val">—</span>
                </td>
                <td>
                  <div class="action-btns">
                    <button
                      class="btn-action btn-edit"
                      title="Edit"
                      @click="startEdit(emp)"
                      aria-label="Edit employee"
                    >
                      ✏️
                    </button>
                    <button
                      class="btn-action btn-delete"
                      title="Delete"
                      :disabled="deletingName === emp.name"
                      @click="deleteEmployee(emp)"
                      aria-label="Delete employee"
                    >
                      <span v-if="deletingName === emp.name" class="spinner spinner-sm" />
                      <span v-else>🗑️</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee as apiDeleteEmployee,
} from './api.js'

const employees = ref([])
const loading = ref(false)
const submitting = ref(false)
const deletingName = ref(null)
const editingName = ref(null)
const searchQuery = ref('')

const EMPTY_FORM = () => ({
  first_name: '',
  last_name: '',
  phone_number: '',
  email_id: '',
  joining_date: '',
  date_of_birth: '',
})

const form = reactive(EMPTY_FORM())
const errors = reactive({})

const toast = reactive({ visible: false, message: '', type: 'success', timer: null })

const filteredEmployees = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return employees.value
  return employees.value.filter((e) =>
    [e.first_name, e.last_name, e.email_id, e.phone_number]
      .filter(Boolean)
      .some((v) => v.toLowerCase().includes(q)),
  )
})

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
]

function avatarColor(name = '') {
  let hash = 0
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function initials(first = '', last = '') {
  return ((first[0] ?? '') + (last[0] ?? '')).toUpperCase() || '?'
}

function formatDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function showToast(message, type = 'success') {
  clearTimeout(toast.timer)
  Object.assign(toast, { visible: true, message, type })
  toast.timer = setTimeout(() => { toast.visible = false }, 4000)
}

function validate() {
  Object.keys(errors).forEach((k) => delete errors[k])

  if (!form.first_name) {
    errors.first_name = 'First Name is required.'
  }
  if (form.email_id && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email_id)) {
    errors.email_id = 'Enter a valid email address.'
  }
  if (form.phone_number && !/^[+\d\s\-().]{5,20}$/.test(form.phone_number)) {
    errors.phone_number = 'Enter a valid phone number.'
  }

  return Object.keys(errors).length === 0
}

function clearError(field) {
  delete errors[field]
}

async function loadEmployees() {
  loading.value = true
  try {
    employees.value = await fetchEmployees()
  } catch (err) {
    showToast(`Failed to load employees: ${apiMessage(err)}`, 'error')
  } finally {
    loading.value = false
  }
}

async function submitForm() {
  if (!validate()) return

  submitting.value = true
  try {
    const payload = { ...form }
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') delete payload[k]
    })

    if (editingName.value) {
      await updateEmployee(editingName.value, payload)
      showToast(`✅ Employee "${form.first_name}" updated successfully!`)
    } else {
      await createEmployee(payload)
      showToast(`🎉 Employee "${form.first_name}" created successfully!`)
    }

    Object.assign(form, EMPTY_FORM())
    editingName.value = null
    await loadEmployees()
  } catch (err) {
    showToast(`Save failed: ${apiMessage(err)}`, 'error')
  } finally {
    submitting.value = false
  }
}

function startEdit(emp) {
  editingName.value = emp.name
  Object.assign(form, {
    first_name: emp.first_name ?? '',
    last_name: emp.last_name ?? '',
    phone_number: emp.phone_number ?? '',
    email_id: emp.email_id ?? '',
    joining_date: emp.joining_date ?? '',
    date_of_birth: emp.date_of_birth ?? '',
  })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function cancelEdit() {
  editingName.value = null
  Object.assign(form, EMPTY_FORM())
  Object.keys(errors).forEach((k) => delete errors[k])
}

async function deleteEmployee(emp) {
  if (!confirm(`Delete "${emp.first_name} ${emp.last_name ?? ''}".trim()? This cannot be undone.`)) return
  deletingName.value = emp.name
  try {
    await apiDeleteEmployee(emp.name)
    showToast(`🗑️ Employee "${emp.first_name}" deleted.`)
    await loadEmployees()
  } catch (err) {
    showToast(`Delete failed: ${apiMessage(err)}`, 'error')
  } finally {
    deletingName.value = null
  }
}

function apiMessage(err) {
  const data = err?.response?.data

  if (data?._server_messages) {
    try {
      const messages = JSON.parse(data._server_messages)
      const first = JSON.parse(messages[0])
      if (first?.message) return first.message.replace(/<[^>]*>/g, '')
    } catch {
    }
  }

  if (data?.exception) {
    return data.exception.replace(/^[\w.]+(?:Error|Exception):\s*/, '')
  }

  return data?.message || err?.message || 'Unknown error'
}

onMounted(loadEmployees)
</script>

<style>
:root {
  --bg: #f4f6f8;
  --bg-card: #ffffff;
  --bg-sidebar: #ffffff;
  --bg-input: #ffffff;
  --border: #e2e6ea;
  --border-hover: #c7ccd3;

  --primary: #2952cc;
  --primary-hover: #1f3fa3;
  --primary-soft: rgba(41, 82, 204, 0.08);

  --success: #1a7f4e;
  --success-soft: rgba(26, 127, 78, 0.09);
  --danger: #b3261e;
  --danger-soft: rgba(179, 38, 30, 0.08);
  --warning: #b7791f;

  --text-1: #1a2027;
  --text-2: #5b6572;
  --text-3: #8a93a0;

  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 10px;
  --radius-xl: 12px;

  --shadow-card: 0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06);
  --shadow-btn: 0 1px 2px rgba(16, 24, 40, 0.08);

  --font: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  --transition: 0.15s ease;
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; }

body {
  font-family: var(--font);
  background: var(--bg);
  color: var(--text-1);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
  font-size: 14px;
  line-height: 1.5;
}

.app-shell {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  min-height: 100vh;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border);
  padding: 24px 14px;
  display: flex;
  flex-direction: column;
  gap: 28px;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 10px;
}
.logo-icon { font-size: 1.3rem; }
.logo-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.01em;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  color: var(--text-2);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: background var(--transition), color var(--transition);
  text-decoration: none;
}
.nav-item:hover { background: var(--bg); color: var(--text-1); }
.nav-item.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}
.nav-icon { font-size: 0.95rem; }

.main-content {
  flex: 1;
  padding: 32px 36px;
  overflow-x: auto;
  min-width: 0;
}

.topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
}
.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-1);
  letter-spacing: -0.01em;
}
.page-subtitle {
  font-size: 0.85rem;
  color: var(--text-2);
  margin-top: 4px;
}
.stat-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 20px;
  box-shadow: var(--shadow-card);
}
.stat-num {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--primary);
  line-height: 1.2;
}
.stat-label {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-3);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
}

.toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  border-radius: var(--radius-md);
  margin-bottom: 20px;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
  border-left: 4px solid;
}
.toast--success {
  background: var(--success-soft);
  border-color: var(--success);
  color: var(--success);
}
.toast--error {
  background: var(--danger-soft);
  border-color: var(--danger);
  color: var(--danger);
}
.toast-icon { font-size: 1.1rem; }
.toast-close {
  margin-left: auto;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.2rem;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity var(--transition);
  line-height: 1;
  padding: 0 4px;
}
.toast-close:hover { opacity: 1; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from { transform: translateY(-16px); opacity: 0; }
.toast-leave-to { transform: translateY(-8px); opacity: 0; }

.card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-card);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.card-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-1);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-2);
}
.required { color: var(--danger); margin-left: 2px; }

.field-input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 9px 12px;
  color: var(--text-1);
  font-family: var(--font);
  font-size: 0.875rem;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
  -webkit-appearance: none;
}
.field-input::placeholder { color: var(--text-3); }
.field-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.field-group.error .field-input {
  border-color: var(--danger);
  box-shadow: 0 0 0 3px var(--danger-soft);
}
.field-error {
  font-size: 0.75rem;
  color: var(--danger);
  margin-top: 2px;
}

/* date inputs */
.field-input[type="date"]::-webkit-calendar-picker-indicator {
  cursor: pointer;
  opacity: 0.6;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-family: var(--font);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background var(--transition), border-color var(--transition);
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary {
  background: var(--primary);
  color: #fff;
  box-shadow: var(--shadow-btn);
}
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }

.btn-ghost {
  background: transparent;
  color: var(--text-2);
  border-color: var(--border);
}
.btn-ghost:hover { background: var(--bg); color: var(--text-1); }

.action-btns { display: flex; gap: 6px; }

.btn-action {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: background var(--transition), border-color var(--transition);
}
.btn-edit:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}
.btn-delete:hover {
  background: var(--danger-soft);
  border-color: var(--danger);
}
.btn-action:disabled { opacity: 0.5; cursor: not-allowed; }

.spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
.spinner-sm { width: 12px; height: 12px; border-width: 2px; }
@keyframes spin { to { transform: rotate(360deg); } }

.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 10px;
  font-size: 0.9rem;
  pointer-events: none;
}
.search-input {
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 7px 12px 7px 32px;
  color: var(--text-1);
  font-family: var(--font);
  font-size: 0.85rem;
  width: 220px;
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}
.search-input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-soft);
}
.search-input::placeholder { color: var(--text-3); }

.table-wrap { overflow-x: auto; }

.emp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}
.emp-table thead tr {
  border-bottom: 1px solid var(--border);
}
.emp-table th {
  padding: 10px 14px;
  text-align: left;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-3);
  white-space: nowrap;
}
.emp-table td {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

.table-row { transition: background var(--transition); }
.table-row:hover { background: var(--bg); }
.table-row:last-child td { border-bottom: none; }
.row-editing { background: var(--primary-soft) !important; }

.col-idx { color: var(--text-3); font-size: 0.75rem; width: 36px; }

/* Avatar cell */
.avatar-cell {
  display: flex;
  align-items: center;
  gap: 12px;
  white-space: nowrap;
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.name-full {
  display: block;
  font-weight: 600;
  color: var(--text-1);
}
.name-id {
  display: block;
  font-size: 0.72rem;
  color: var(--text-3);
  margin-top: 1px;
}

/* Badges */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 100px;
  font-size: 0.78rem;
  font-weight: 500;
  white-space: nowrap;
}
.badge-blue {
  background: rgba(37, 99, 235, 0.08);
  color: #1d4ed8;
  border: 1px solid rgba(37, 99, 235, 0.18);
}
.badge-purple {
  background: rgba(124, 58, 237, 0.08);
  color: #6d28d9;
  border: 1px solid rgba(124, 58, 237, 0.18);
}

.date-chip {
  font-size: 0.8rem;
  color: var(--text-2);
  white-space: nowrap;
}
.empty-val { color: var(--text-3); }

@keyframes shimmer {
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
}
.skeleton {
  background: linear-gradient(
    90deg,
    #eef0f3 25%,
    #f7f8fa 50%,
    #eef0f3 75%
  );
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
  border-radius: 6px;
}
.skeleton-wrap { display: flex; flex-direction: column; gap: 12px; padding: 8px 0; }
.skeleton-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 14px;
}
.skeleton-avatar { width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; }
.skeleton-line { height: 14px; flex: 0 0 auto; }
.skeleton-btn { width: 70px; height: 30px; margin-left: auto; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  gap: 10px;
}
.empty-icon { font-size: 3rem; }
.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-2);
}
.empty-sub { font-size: 0.85rem; color: var(--text-3); }

@media (max-width: 768px) {
  .sidebar { display: none; }
  .main-content { padding: 20px 16px; }
  .form-grid { grid-template-columns: 1fr; }
  .topbar { flex-direction: column; gap: 16px; }
  .search-input { width: 100%; }
  .card { padding: 20px 16px; }
}
</style>
