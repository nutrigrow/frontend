import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import {
  DELIVERY_HOURS,
  monitoringService,
  type MonitoringNotification,
} from '../services/monitoring.service';

// ─── Tipe ──────────────────────────────────────────────────────────────────
interface MonitoringContextType {
  notifications: MonitoringNotification[];
  unreadCount: number;
  isRead: (id: string) => boolean;
  markAllRead: () => void;
  /** Notifikasi yang sedang tampil sebagai pop-up (in-app top bar) */
  activeToast: MonitoringNotification | null;
  dismissToast: () => void;
  refresh: () => Promise<void>;
}

const MonitoringContext = createContext<MonitoringContextType | null>(null);

// ─── localStorage helpers ───────────────────────────────────────────────────
const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage penuh / diblokir — notifikasi tetap jalan tanpa status baca
  }
};

/**
 * Slot pengiriman terakhir yang sudah lewat (08.00 atau 19.00).
 * Pop-up hanya muncul sekali per slot, meniru jadwal kirim di dokumen.
 */
const currentDeliverySlot = (now = new Date()): string => {
  const passed = DELIVERY_HOURS.filter((h) => now.getHours() >= h);
  if (passed.length > 0) {
    const hour = passed[passed.length - 1];
    return `${now.toDateString()}-${hour}`;
  }
  // Sebelum 08.00 → masih termasuk slot 19.00 kemarin
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  return `${yesterday.toDateString()}-${DELIVERY_HOURS[DELIVERY_HOURS.length - 1]}`;
};

// ─── Provider ───────────────────────────────────────────────────────────────
export function MonitoringProvider({ children }: { children: ReactNode }) {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  const isPatient = isLoggedIn && user?.role?.toUpperCase() === 'USER';
  const readKey  = `nutrigrow:notif-read:${user?.id}`;
  const toastKey = `nutrigrow:notif-toast-slot:${user?.id}`;

  const [fetched, setFetched] = useState<MonitoringNotification[]>([]);
  const [readState, setReadState] = useState<{ key: string; ids: string[] }>({ key: '', ids: [] });
  const [activeToast, setActiveToast] = useState<MonitoringNotification | null>(null);

  // Non-pasien (admin / ahli gizi / belum login) tidak mendapat notifikasi monitoring
  const notifications = useMemo(() => (isPatient ? fetched : []), [isPatient, fetched]);

  // Status "sudah dibaca" dibaca dari localStorage milik user yang sedang login
  const readIds = useMemo(
    () => (readState.key === readKey ? readState.ids : readJson<string[]>(readKey, [])),
    [readState, readKey],
  );

  const refresh = useCallback(async () => {
    if (!isPatient) return;
    let list: MonitoringNotification[];
    try {
      list = await monitoringService.getNotifications();
    } catch {
      return; // gagal memuat → biarkan daftar sebelumnya
    }
    setFetched(list);

    // Pop-up: satu notifikasi prioritas tertinggi, sekali per slot pengiriman
    const slot = currentDeliverySlot();
    if (list.length > 0 && readJson<string | null>(toastKey, null) !== slot) {
      setActiveToast(list[0]);
      writeJson(toastKey, slot);
    }
  }, [isPatient, toastKey]);

  // Muat ulang saat pindah halaman (mis. setelah user mencatat data) dan saat tab kembali aktif
  useEffect(() => {
    refresh();
  }, [refresh, location.pathname]);

  useEffect(() => {
    const onFocus = () => refresh();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refresh]);

  // Notifikasi yang sudah tidak berlaku (data sudah dicatat) ikut hilang dari pop-up
  const visibleToast = activeToast && notifications.some((n) => n.id === activeToast.id) ? activeToast : null;

  const isRead = useCallback((id: string) => readIds.includes(id), [readIds]);

  const markAllRead = useCallback(() => {
    const ids = Array.from(new Set([...readIds, ...notifications.map((n) => n.id)]));
    setReadState({ key: readKey, ids });
    writeJson(readKey, ids);
  }, [notifications, readIds, readKey]);

  const value = useMemo<MonitoringContextType>(() => ({
    notifications,
    unreadCount: notifications.filter((n) => !readIds.includes(n.id)).length,
    isRead,
    markAllRead,
    activeToast: visibleToast,
    dismissToast: () => setActiveToast(null),
    refresh,
  }), [notifications, readIds, isRead, markAllRead, visibleToast, refresh]);

  return <MonitoringContext.Provider value={value}>{children}</MonitoringContext.Provider>;
}

export function useMonitoring() {
  const ctx = useContext(MonitoringContext);
  if (!ctx) throw new Error('useMonitoring harus dipakai di dalam MonitoringProvider');
  return ctx;
}
