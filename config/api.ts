import axios, { AxiosInstance, AxiosError } from 'axios';

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

// Get API URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add JWT token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('auth_token');
      localStorage.removeItem('usuario_logado_id'); // Remove old localStorage key if exists

      // Only redirect if not already on login page
      if (window.location.search !== '?pagina=LOGIN') {
        window.location.href = '/?pagina=LOGIN';
      }
    }

    // Handle network errors
    if (!error.response) {
      return Promise.reject(new Error('Erro de conexão. Verifique sua internet e tente novamente.'));
    }

    // Extract error message from API response
    const errorMessage = error.response.data?.error?.message || error.message || 'Erro desconhecido';

    return Promise.reject(new Error(errorMessage));
  }
);

export default api;
