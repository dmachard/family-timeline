import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_API_URL
    : '/api',
  timeout: config.axiosTimeout || 5000,
  headers: { 'Content-Type': 'application/json' }
})

export default apiClient
