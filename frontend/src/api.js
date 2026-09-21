import axios from 'axios'


function getCsrfToken() {
  const match = document.cookie.match(/(?:^|;\s*)csrf_token=([^;]+)/)
  return match ? decodeURIComponent(match[1]) : ''
}

const api = axios.create({
  baseURL: '/api/resource',
  withCredentials: true, // send session cookies
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  if (['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-Frappe-CSRF-Token'] = getCsrfToken()
  }
  return config
})

export async function fetchEmployees() {
  const fields = JSON.stringify([
    'name',
    'first_name',
    'last_name',
    'phone_number',
    'email_id',
    'joining_date',
    'date_of_birth',
  ])
  const { data } = await api.get('/Employee', {
    params: { fields, limit: 500 },
  })
  return data.data ?? []
}

export async function createEmployee(payload) {
  const { data } = await api.post('/Employee', payload)
  return data.data
}

export async function updateEmployee(name, payload) {
  const { data } = await api.put(`/Employee/${encodeURIComponent(name)}`, payload)
  return data.data
}

export async function deleteEmployee(name) {
  const { data } = await api.delete(`/Employee/${encodeURIComponent(name)}`)
  return data
}
