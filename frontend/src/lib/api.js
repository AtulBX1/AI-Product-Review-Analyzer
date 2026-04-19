import axios from 'axios'
const api = axios.create({ baseURL: '/api', headers: { 'Content-Type': 'application/json' } })
api.interceptors.response.use(r => r, err => Promise.reject(err.response?.data || err))
export default api