import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useMonitoring } from '../context/MonitoringContext'
import { NOTIFICATION_KIND_STYLE } from './notification-style'

const formatTime = (date: Date) =>
  `${date.getHours().toString().padStart(2, '0')}.${date.getMinutes().toString().padStart(2, '0')} WIB`

// ─── MonitoringToast ──────────────────────────────────────────────────────────
// Pop-up in-app (top bar) untuk notifikasi monitoring prioritas tertinggi
const MonitoringToast = () => {
  const { activeToast, dismissToast } = useMonitoring()
  const navigate = useNavigate()

  const handleAction = () => {
    if (!activeToast) return
    navigate(activeToast.cta.href)
    dismissToast()
  }

  return (
    <AnimatePresence>
      {activeToast && (
        <motion.div
          key={activeToast.id}
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed z-[45] left-3 right-3 sm:left-auto sm:right-6"
          style={{ top: '84px', maxWidth: '420px' }}
          role="status"
          aria-live="polite"
        >
          <ToastCard
            kind={activeToast.kind}
            title={activeToast.title}
            message={activeToast.message}
            meta={activeToast.meta}
            actionLabel={activeToast.cta.label}
            onAction={handleAction}
            onDismiss={dismissToast}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── ToastCard ────────────────────────────────────────────────────────────────
interface ToastCardProps {
  kind: keyof typeof NOTIFICATION_KIND_STYLE
  title: string
  message: string
  meta: string
  actionLabel: string
  onAction: () => void
  onDismiss: () => void
}

const ToastCard = ({ kind, title, message, meta, actionLabel, onAction, onDismiss }: ToastCardProps) => {
  const style = NOTIFICATION_KIND_STYLE[kind]
  const Icon = style.icon
  const isWarning = kind === 'warning'

  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: isWarning ? '#3B1515' : '#1F2A17',
        boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
        color: 'white',
      }}
    >
      <div className="flex items-start gap-3">
        <span className="flex-shrink-0 flex items-center justify-center rounded-xl" style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.1)' }}>
          <Icon size={20} color={isWarning ? '#FCA5A5' : '#BEF264'} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wide rounded-md px-2 py-0.5"
              style={{ background: isWarning ? '#DC2626' : 'var(--color-nutri-green-light)', color: 'white' }}
            >
              {style.label}
            </span>
            <span className="text-[11px]" style={{ color: 'rgba(255,255,255,0.6)' }}>{formatTime(new Date())}</span>
          </div>
          <p className="mt-1.5 text-[15px] font-bold leading-snug" style={{ fontFamily: 'var(--font-heading)' }}>{title}</p>
          <p className="mt-1 text-[13px] leading-snug" style={{ color: 'rgba(255,255,255,0.75)' }}>{message}</p>
        </div>

        <button
          onClick={onDismiss}
          aria-label="Tutup notifikasi"
          className="flex-shrink-0 rounded-md p-1 transition-colors hover:bg-white/10"
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.7)' }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-3 pt-3 flex items-center justify-between gap-3" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-[11px] min-w-0 truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{meta}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onDismiss}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-full transition-colors hover:bg-white/10"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}
          >
            Nanti
          </button>
          <button
            onClick={onAction}
            className="flex items-center gap-1 text-[12px] font-semibold px-3.5 py-1.5 rounded-full transition-opacity hover:opacity-90"
            style={{ background: isWarning ? '#DC2626' : 'var(--color-nutri-green-light)', border: 'none', cursor: 'pointer', color: 'white' }}
          >
            <Check size={14} /> {actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MonitoringToast
