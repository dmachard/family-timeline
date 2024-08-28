import axios from 'axios'
import config from '../config'

const apiClient = axios.create({
  baseURL: import.meta.env.MODE === 'development'
    ? import.meta.env.VITE_API_URL
    : '/api',
  timeout: config.axiosTimeout || 5000,
  headers: { 'Content-Type': 'application/json' }
})


// Add a request interceptor to include the token if available
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // If token exists, add it to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request error
    return Promise.reject(error);
  }
);

// Handle responses or errors if needed (e.g., logging out on 401)
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        try {
          const response = await apiClient.post('/auth/refresh-token', { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save the new tokens
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);

          // Update the authorization header for the original request
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // Retry the original request with the new token
          return apiClient(originalRequest);
        } catch (err) {
          console.error('Refresh token failed:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          // Redirect to login if refresh fails
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient
