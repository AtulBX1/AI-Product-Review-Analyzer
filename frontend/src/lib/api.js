import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 120000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.error || err.response?.data?.detail || err.message || 'Something went wrong'
    return Promise.reject({ message, status: err.response?.status })
  }
)

export default api