import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Attach JWT token from localStorage to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear stored auth and redirect to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (name, email, password, confirmPassword) =>
  api.post('/auth/register', { name, email, password, confirmPassword });

export const login = (email, password) =>
  api.post('/auth/login', { email, password });

export const logout = () =>
  api.post('/auth/logout');

// ── Expenses ──────────────────────────────────────────────────────────────────
export const listExpenses = (params = {}) =>
  api.get('/expenses', { params });

export const createExpense = (data) =>
  api.post('/expenses', data);

export const getExpense = (id) =>
  api.get(`/expenses/${id}`);

export const updateExpense = (id, data) =>
  api.put(`/expenses/${id}`, data);

export const deleteExpense = (id) =>
  api.delete(`/expenses/${id}`);

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () =>
  api.get('/dashboard');

// ── User / Wallet ─────────────────────────────────────────────────────────────
export const getWalletBalance = () =>
  api.get('/user/balance');

export const updateWalletBalance = (walletBalance) =>
  api.put('/user/balance', { walletBalance });

export default api;
