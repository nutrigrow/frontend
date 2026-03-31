import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BowlImg from '../../assets/images/img-bowl.png'
import GreenGradientAsset from '../../assets/asset/asset-green-gradient.svg'

// ─── Breakpoint helper ────────────────────────────────────────────────────────
const useBreakpoint = () => {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop')
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop')
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])
  return bp
}

// ─── Avatar bubbles ───────────────────────────────────────────────────────────
const AvatarBubbles = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    {['#c8a97e', '#a0b4c8', '#d4956a'].map((color, i) => (
      <div
        key={i}
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: color,
          border: '2px solid rgba(255,255,255,0.6)',
          marginLeft: i === 0 ? 0 : -8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#fff',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {['A', 'B', 'C'][i]}
      </div>
    ))}
  </div>
)

// ─── Left Panel ───────────────────────────────────────────────────────────────
const LeftPanel = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isDesktop = bp === 'desktop'

  return (
    <div
      style={{
        position: isDesktop ? 'sticky' : 'relative',
        top: isDesktop ? 0 : undefined,
        width: isDesktop ? '50%' : '100%',
        height: isDesktop ? '100vh' : isTablet ? 420 : 340,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        padding: isMobile ? '24px' : isTablet ? '36px' : '48px',
        overflow: 'hidden',
      }}
    >
      {/* Green gradient background */}
      <img
        src={GreenGradientAsset}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Bowl image */}
      <img
        src={BowlImg}
        alt="Fresh vegetables bowl"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 1,
          opacity: 0.55,
        }}
      />

      {/* Text content */}
      <div
        style={{
          position: 'relative',
          zIndex: 3,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h1
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: isMobile ? '28px' : isTablet ? '36px' : '48px',
            lineHeight: isMobile ? '36px' : isTablet ? '46px' : '60px',
            letterSpacing: 0,
            color: '#FFFFFF',
            margin: 0,
            marginBottom: isMobile ? 12 : 20,
            maxWidth: 482,
          }}
        >
          Tumbuh Kembang Optimal, Bebas Stunting Bersama NutriGrow
        </h1>

        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 500,
            fontSize: isMobile ? '14px' : isTablet ? '16px' : '18px',
            lineHeight: isMobile ? '22px' : isTablet ? '26px' : '29.25px',
            color: '#FFFFFF',
            margin: 0,
            marginBottom: isMobile ? 16 : 28,
            maxWidth: 475,
          }}
        >
          Bergabunglah dengan ribuan lainnya yang telah mengubah hubungan mereka
          dengan makanan melalui pelacakan nutrisi yang dipersonalisasi dan panduan ahli.
        </p>

        {/* "Over 10k+" badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AvatarBubbles />
          <span
            style={{
              fontFamily: 'Public Sans, Inter, sans-serif',
              fontWeight: 500,
              fontSize: isMobile ? '12px' : '14px',
              lineHeight: '20px',
              color: '#FFFFFF',
            }}
          >
            Over 10k+ active health{' '}
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>journeys</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Right Panel ─────────────────────────────────────────────────────────────
const RightPanel = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isDesktop = bp === 'desktop'

  const navigate = useNavigate()

  const [email, setEmail]               = useState('')
  const [emailFocused, setEmailFocused] = useState(false)

  return (
    <div
      style={{
        flex: 1,
        minHeight: isDesktop ? '100vh' : 'auto',
        overflowY: isDesktop ? 'auto' : 'visible',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: isMobile ? '32px 20px' : isTablet ? '40px' : '96px',
        background: '#F7F7F6',
      }}
    >
      <div style={{ width: '100%', maxWidth: 480, display: 'flex', flexDirection: 'column' }}>

        {/* Lock icon */}
        <div
          style={{
            display: 'flex',
            width: 48,
            height: 48,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 8,
            background: '#F8FAFC',
            marginBottom: 16,
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
            <path d="M12.5 25C10.7708 25 9.14583 24.6719 7.625 24.0156C6.10417 23.3594 4.78125 22.4688 3.65625 21.3438C2.53125 20.2188 1.64062 18.8958 0.984375 17.375C0.328125 15.8542 0 14.2292 0 12.5H2.5C2.5 13.875 2.76042 15.1719 3.28125 16.3906C3.80208 17.6094 4.51562 18.6719 5.42188 19.5781C6.32812 20.4844 7.39062 21.2031 8.60938 21.7344C9.82812 22.2656 11.125 22.5312 12.5 22.5312C15.2917 22.5312 17.6562 21.5625 19.5938 19.625C21.5312 17.6875 22.5 15.3229 22.5 12.5312C22.5 9.73958 21.5312 7.375 19.5938 5.4375C17.6562 3.5 15.2917 2.53125 12.5 2.53125C10.6458 2.53125 8.96354 2.98438 7.45312 3.89062C5.94271 4.79688 4.75 6 3.875 7.5H7.5V10H0V2.5H2.5V5C3.64583 3.47917 5.08333 2.26562 6.8125 1.35938C8.54167 0.453125 10.4375 0 12.5 0C14.2292 0 15.8542 0.328125 17.375 0.984375C18.8958 1.64062 20.2188 2.53125 21.3438 3.65625C22.4688 4.78125 23.3594 6.10417 24.0156 7.625C24.6719 9.14583 25 10.7708 25 12.5C25 14.2292 24.6719 15.8542 24.0156 17.375C23.3594 18.8958 22.4688 20.2188 21.3438 21.3438C20.2188 22.4688 18.8958 23.3594 17.375 24.0156C15.8542 24.6719 14.2292 25 12.5 25ZM10 17.5C9.64583 17.5 9.34896 17.3802 9.10938 17.1406C8.86979 16.901 8.75 16.6042 8.75 16.25V12.5C8.75 12.1458 8.86979 11.849 9.10938 11.6094C9.34896 11.3698 9.64583 11.25 10 11.25V10C10 9.3125 10.2448 8.72396 10.7344 8.23438C11.224 7.74479 11.8125 7.5 12.5 7.5C13.1875 7.5 13.776 7.74479 14.2656 8.23438C14.7552 8.72396 15 9.3125 15 10V11.25C15.3542 11.25 15.651 11.3698 15.8906 11.6094C16.1302 11.849 16.25 12.1458 16.25 12.5V16.25C16.25 16.6042 16.1302 16.901 15.8906 17.1406C15.651 17.3802 15.3542 17.5 15 17.5H10ZM11.25 11.25H13.75V10C13.75 9.64583 13.6302 9.34896 13.3906 9.10938C13.151 8.86979 12.8542 8.75 12.5 8.75C12.1458 8.75 11.849 8.86979 11.6094 9.10938C11.3698 9.34896 11.25 9.64583 11.25 10V11.25Z" fill="#628141"/>
          </svg>
        </div>

        {/* Reset Password heading */}
        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: isMobile ? '24px' : isTablet ? '26px' : '30px',
            lineHeight: isMobile ? '30px' : '36px',
            color: '#0F172A',
            margin: 0,
            marginBottom: 6,
          }}
        >
          Reset Password
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '24px',
            color: '#64748B',
            margin: 0,
            marginBottom: 28,
          }}
        >
          Enter the email address linked to your account and we'll send you a password reset link.
        </p>

        {/* Email Address */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#334155' }}>
            Email Address
          </label>
          <div
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px',
              borderRadius: 8, border: `1px solid ${emailFocused ? '#628141' : '#E2E8F0'}`,
              background: '#FFF', gap: 10, transition: 'border-color 150ms ease',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1.66667 13.3333C1.20833 13.3333 0.815972 13.1701 0.489583 12.8438C0.163194 12.5174 0 12.125 0 11.6667V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H15C15.4583 0 15.8507 0.163194 16.1771 0.489583C16.5035 0.815972 16.6667 1.20833 16.6667 1.66667V11.6667C16.6667 12.125 16.5035 12.5174 16.1771 12.8438C15.8507 13.1701 15.4583 13.3333 15 13.3333H1.66667ZM8.33333 7.5L1.66667 3.33333V11.6667H15V3.33333L8.33333 7.5ZM8.33333 5.83333L15 1.66667H1.66667L8.33333 5.83333ZM1.66667 3.33333V1.66667V3.33333V11.6667V3.33333Z" fill="#94A3B8"/>
            </svg>
            <input
              type="email" placeholder="you@example.com" value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '13px' : '14px', color: '#0F172A', lineHeight: '20px' }}
            />
          </div>
        </div>

        {/* Send Reset Link button */}
        <button
          style={{ display: 'flex', padding: '14px 16px', justifyContent: 'center', alignItems: 'center', width: '100%', borderRadius: 8, border: '1px solid rgba(0,0,0,0)', background: '#628141', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', cursor: 'pointer', marginBottom: 20, transition: 'background 150ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#4d6633' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#628141' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#FFF' }}>
            Send Reset Link
          </span>
        </button>

        {/* Back to Sign In */}
        <button
          onClick={() => navigate('/sign-in')}
          style={{
            display: 'flex', padding: '14px 16px', justifyContent: 'center', alignItems: 'center',
            width: '100%', borderRadius: 8, border: '1px solid #E2E8F0',
            background: '#FFF', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            cursor: 'pointer', marginBottom: 32, gap: 8, transition: 'background 150ms ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF' }}
        >
          {/* Back arrow icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#334155' }}>
            Back to Sign In
          </span>
        </button>

        {/* Need help */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#64748B', textAlign: 'center', margin: 0, marginBottom: 32 }}>
          Need help?{' '}
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#628141', textDecoration: 'none' }}>
            Contact Support
          </a>
        </p>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#94A3B8', textDecoration: 'none' }}>
            Privacy Policy
          </a>
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#94A3B8', textDecoration: 'none' }}>
            Terms of Service
          </a>
        </div>

      </div>
    </div>
  )
}

// ─── Main Reset Password Page ─────────────────────────────────────────────────
const ResetPassword = () => {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isDesktop = bp === 'desktop'

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isMobile || isTablet ? 'column' : 'row',
        alignItems: isDesktop ? 'flex-start' : 'stretch',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <LeftPanel bp={bp} />
      <RightPanel bp={bp} />
    </div>
  )
}

export default ResetPassword