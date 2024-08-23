import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_API_URL
    : '/api',
  timeout: 1000,
  headers: { 'Content-Type': 'application/json' }
})

export default apiClient
