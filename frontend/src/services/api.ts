const API_URL = import.meta.env.VITE_API_URL;

import axios from 'axios';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});