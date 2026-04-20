import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// ─── Axios instance ────────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Token helpers (localStorage) ─────────────────────────────────────────────
export const tokenStorage = {
  getAccess:      ()       => localStorage.getItem('accessToken'),
  getRefresh:     ()       => localStorage.getItem('refreshToken'),
  setTokens:      (access: string, refresh: string) => {
    localStorage.setItem('accessToken',  access);
    localStorage.setItem('refreshToken', refresh);
  },
  clear:          ()       => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },
};

// ─── Request interceptor: lampirkan Bearer token ke setiap request ─────────────
apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response interceptor: auto-refresh jika access token expired (401) ────────
let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      const refreshToken = tokenStorage.getRefresh();
      if (!refreshToken) {
        tokenStorage.clear();
        window.location.href = '/sign-in';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Tunggu sampai token baru tersedia
        return new Promise((resolve) => {
          queue.push((newToken) => {
            original.headers.Authorization = `Bearer ${newToken}`;
            resolve(apiClient(original));
          });
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_URL}/api/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefresh } = data.data.tokens;
        tokenStorage.setTokens(accessToken, newRefresh);

        // Retry semua request yang tertunda
        queue.forEach((cb) => cb(accessToken));
        queue = [];

        original.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(original);
      } catch {
        tokenStorage.clear();
        window.location.href = '/sign-in';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth Service ──────────────────────────────────────────────────────────────
export const authService = {

  /** Login dengan email & password. Menyimpan token ke localStorage. */
  login: async (email: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/login', { email, password });
    const { accessToken, refreshToken } = data.data.tokens;
    tokenStorage.setTokens(accessToken, refreshToken);
    return data.data.user;
  },

  /** Register user baru. Backend akan kirim email verifikasi, belum buat akun di DB. */
  register: async (nama: string, email: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/register', { nama, email, password });
    return data;
  },

  /** Kirim link reset password ke email. */
  forgotPassword: async (email: string) => {
    const { data } = await apiClient.post('/api/auth/forgot-password', { email });
    return data;
  },

  /** Reset password menggunakan token dari email. */
  resetPassword: async (token: string, password: string) => {
    const { data } = await apiClient.post('/api/auth/reset-password', { token, password });
    return data;
  },

  /** Logout: revoke refresh token di backend + hapus dari localStorage. */
  logout: async () => {
    const refreshToken = tokenStorage.getRefresh();
    try {
      await apiClient.post('/api/auth/logout', { refreshToken });
    } finally {
      tokenStorage.clear();
    }
  },

  /** Ambil data user yang sedang login. */
  getMe: async () => {
    const { data } = await apiClient.get('/api/auth/me');
    return data.data.user;
  },

  /** Redirect ke Google OAuth (backend yang handle). */
  loginWithGoogle: () => {
    window.location.href = `${API_URL}/api/auth/google`;
  },

  /** Cek apakah user sudah login (ada access token). */
  isLoggedIn: () => !!tokenStorage.getAccess(),
};