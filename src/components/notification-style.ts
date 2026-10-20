import { AlertTriangle, Bell, CalendarClock, Flame, Stethoscope } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { MonitoringKind } from '../services/monitoring.service'

export interface NotificationKindStyle {
  label: string
  icon: LucideIcon
  color: string
  softBg: string
}

export const NOTIFICATION_KIND_STYLE: Record<MonitoringKind, NotificationKindStyle> = {
  warning:  { label: 'Peringatan',         icon: AlertTriangle, color: '#DC2626', softBg: '#FEF2F2' },
  streak:   { label: 'Streak',             icon: Flame,         color: '#EA580C', softBg: '#FFF7ED' },
  session:  { label: 'Tele-Consultation',  icon: Stethoscope,   color: '#0E7490', softBg: '#ECFEFF' },
  reminder: { label: 'Pengingat Sehat',    icon: CalendarClock, color: 'var(--color-nutri-green)', softBg: 'var(--color-nutri-green-soft)' },
  info:     { label: 'Pengingat Harian',   icon: Bell,          color: '#D97706', softBg: '#FFFBEB' },
}
