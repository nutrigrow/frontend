import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../services/api';

// ─── Tipe ──────────────────────────────────────────────────────────────────
interface User {
  id: string;
  nama: string;
  email: string;
  role: string;
  avatarUrl?: string;
  tinggiBadanIbu?: number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isLoggedIn: boolean;
}

// ─── Context ────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ───────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Cek sesi saat pertama kali app dibuka
  useEffect(() => {
    const checkSession = async () => {
      // Jika tidak ada token sama sekali di localStorage
      if (!authService.isLoggedIn()) {
        setLoading(false);
        return;
      }
      
      try {
        // Ambil data user dari backend menggunakan token yang ada
        const userData = await authService.getMe();
        setUser(userData);
      } catch {
        // Token expired / invalid → bersihkan
        authService.logout().catch(() => {});
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    // Memanggil API login
    const userData = await authService.login(email, password);
    // Langsung set user agar Header berubah otomatis
    setUser(userData);
  };

  const logout = async () => {
    await authService.logout();
    // Kosongkan state setelah logout
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isLoggedIn: !!user }}>
      {!loading ? children : null}
    </AuthContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>');
  return ctx;
}