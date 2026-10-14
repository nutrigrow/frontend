import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useMonitoring } from '../context/MonitoringContext'
import { NOTIFICATION_KIND_STYLE } from './notification-style'
import type { MonitoringNotification } from '../services/monitoring.service'

// ─── NotificationBell ─────────────────────────────────────────────────────────
// Lonceng di header + dropdown daftar notifikasi monitoring
const NotificationBell = () => {
  const { notifications, unreadCount, isRead, markAllRead, dismissToast } = useMonitoring()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  // Simpan id yang belum dibaca saat dropdown dibuka, supaya penandanya tetap terlihat selama dropdown terbuka
  const [unreadSnapshot, setUnreadSnapshot] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = () => {
    if (!open) {
      setUnreadSnapshot(notifications.filter((n) => !isRead(n.id)).map((n) => n.id))
      markAllRead()
      // Pop-up berada di area yang sama dengan dropdown; tutup supaya tidak menghalangi klik
      dismissToast()
    }
    setOpen((p) => !p)
  }

  const handleSelect = (n: MonitoringNotification) => {
    setOpen(false)
    navigate(n.cta.href)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={toggle}
        aria-label={unreadCount > 0 ? `Notifikasi, ${unreadCount} belum dibaca` : 'Notifikasi'}
        className="relative flex items-center justify-center rounded-lg transition-colors duration-150"
        style={{ width: '40px', height: '40px', background: open ? 'var(--color-nutri-icon-bg-active)' : 'var(--color-nutri-icon-bg)', border: 'none', cursor: 'pointer' }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg-hover)' }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg)' }}
      >
        <Bell size={19} color="var(--color-nutri-icon)" />
        {unreadCount > 0 && (
          <span
            className="absolute flex items-center justify-center text-white font-bold"
            style={{
              top: '-2px', right: '-2px', minWidth: '18px', height: '18px', padding: '0 5px',
              borderRadius: '9999px', background: '#EF4444', fontSize: '10px', border: '2px solid white',
            }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="fixed sm:absolute right-3 sm:right-0 top-[72px] sm:top-full bg-white rounded-2xl overflow-hidden z-50"
          style={{
            marginTop: '8px',
            width: 'min(380px, calc(100vw - 24px))',
            border: '1px solid var(--color-nutri-border)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12), 0 2px 6px rgba(0,0,0,0.06)',
          }}
          role="menu"
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--color-nutri-border)' }}>
            <p className="text-[15px] font-bold" style={{ fontFamily: 'var(--font-heading)', color: '#1e293b' }}>Notifikasi</p>
            <span className="text-[12px]" style={{ color: 'var(--color-nutri-slate-light)' }}>
              {notifications.length > 0 ? `${notifications.length} pengingat aktif` : ''}
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="px-6 py-10 text-center">
              <p className="text-[28px]">🎉</p>
              <p className="mt-2 text-sm font-semibold" style={{ color: '#1e293b' }}>Semua pemantauan sudah up to date</p>
              <p className="mt-1 text-[12px]" style={{ color: 'var(--color-nutri-slate-light)' }}>Kami akan mengingatkan saat waktunya mencatat lagi.</p>
            </div>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto py-1">
              {notifications.map((n) => (
                <NotificationItem key={n.id} notification={n} unread={unreadSnapshot.includes(n.id)} onSelect={() => handleSelect(n)} />
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}

// ─── NotificationItem ─────────────────────────────────────────────────────────
const NotificationItem = ({ notification, unread, onSelect }: { notification: MonitoringNotification; unread: boolean; onSelect: () => void }) => {
  const style = NOTIFICATION_KIND_STYLE[notification.kind]
  const Icon = style.icon
  return (
    <li>
      <button
        onClick={onSelect}
        className="w-full text-left flex gap-3 px-4 py-3 transition-colors duration-150 hover:bg-stone-50"
        style={{ background: notification.kind === 'warning' ? style.softBg : undefined, border: 'none', cursor: 'pointer' }}
        role="menuitem"
      >
        <span className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: '38px', height: '38px', background: notification.kind === 'warning' ? 'white' : style.softBg }}>
          <Icon size={18} color={style.color} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[13px] font-semibold leading-snug" style={{ color: '#1e293b' }}>{notification.title}</span>
            {unread && <span className="flex-shrink-0 rounded-full" style={{ width: '7px', height: '7px', background: '#EF4444' }} />}
          </span>
          <span className="block mt-0.5 text-[12px] leading-snug" style={{ color: 'var(--color-nutri-slate)' }}>{notification.message}</span>
          <span className="flex items-center justify-between mt-1.5">
            <span className="text-[11px]" style={{ color: 'var(--color-nutri-slate-light)' }}>{notification.meta}</span>
            <span className="text-[11px] font-semibold" style={{ color: style.color }}>{notification.cta.label} →</span>
          </span>
        </span>
      </button>
    </li>
  )
}

export default NotificationBell
