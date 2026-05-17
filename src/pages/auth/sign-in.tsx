import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BowlImg from '../../assets/images/img-bowl.png'
import GreenGradientAsset from '../../assets/asset/asset-green-gradient.svg'
import { useAuth } from '../../context/AuthContext'
import { authService } from '../../services/api'

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
            10.000+ perjalanan kesehatan aktif{' '}
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
  const { login, isLoggedIn, user } = useAuth()

  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role?.toUpperCase() === 'ADMIN') {
        navigate('/admin', { replace: true })
      } else {
        navigate('/dashboard', { replace: true })
      }
    }
  }, [isLoggedIn, user, navigate])

  const [email, setEmail]               = useState('')
  const [password, setPassword]         = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepSigned, setKeepSigned]     = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passFocused, setPassFocused]   = useState(false)

  const [emailTouched, setEmailTouched] = useState(false)
  const [passTouched, setPassTouched] = useState(false)
  const isEmailValid = /^\S+@\S+\.\S+$/.test(email)
  const isPasswordValid = password.length >= 8

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Email dan password tidak boleh kosong.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const loggedInUser = await login(email, password)
      if (loggedInUser?.role?.toUpperCase() === 'ADMIN') {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Login gagal. Periksa kembali email dan password kamu.')
    } finally {
      setLoading(false)
    }
  }

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

        {/* Selamat Datang Kembali! */}
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
          Selamat Datang Kembali!
        </h2>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? '14px' : '16px',
            lineHeight: '24px',
            color: '#64748B',
            margin: 0,
            marginBottom: 24,
          }}
        >
          Silakan masukkan data Anda untuk masuk.
        </p>

        {/* Sign In / Sign Up toggle */}
        <div
          style={{
            display: 'flex',
            padding: 4,
            borderRadius: 12,
            background: 'rgba(226, 232, 240, 0.50)',
            marginBottom: 24,
          }}
        >
          <button
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              cursor: 'default',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '20px',
              color: '#628141',
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.10)',
            }}
          >
            Masuk
          </button>
          <button
            onClick={() => navigate('/sign-up')}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '10px 0',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              fontSize: isMobile ? '13px' : '14px',
              lineHeight: '20px',
              color: '#475569',
              background: 'transparent',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#0F172A' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#475569' }}
          >
            Daftar
          </button>
        </div>

        {error && (
          <div style={{ padding: '10px', marginBottom: '16px', borderRadius: '8px', background: '#FEE2E2', color: '#DC2626', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
            {error}
          </div>
        )}

        {/* Alamat Email */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#334155' }}>
            Alamat Email
          </label>
          <div
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px',
              borderRadius: 8, 
              border: `1px solid ${emailTouched && !isEmailValid ? '#DC2626' : (emailFocused ? '#628141' : '#E2E8F0')}`,
              background: '#FFF', gap: 10, transition: 'border-color 150ms ease',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="14" viewBox="0 0 17 14" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1.66667 13.3333C1.20833 13.3333 0.815972 13.1701 0.489583 12.8438C0.163194 12.5174 0 12.125 0 11.6667V1.66667C0 1.20833 0.163194 0.815972 0.489583 0.489583C0.815972 0.163194 1.20833 0 1.66667 0H15C15.4583 0 15.8507 0.163194 16.1771 0.489583C16.5035 0.815972 16.6667 1.20833 16.6667 1.66667V11.6667C16.6667 12.125 16.5035 12.5174 16.1771 12.8438C15.8507 13.1701 15.4583 13.3333 15 13.3333H1.66667ZM8.33333 7.5L1.66667 3.33333V11.6667H15V3.33333L8.33333 7.5ZM8.33333 5.83333L15 1.66667H1.66667L8.33333 5.83333ZM1.66667 3.33333V1.66667V3.33333V11.6667V3.33333Z" fill="#94A3B8"/>
            </svg>
            <input
              type="email" placeholder="nama@email.com" value={email}
              onChange={e => { setEmail(e.target.value); setEmailTouched(true); }}
              onFocus={() => setEmailFocused(true)} onBlur={() => setEmailFocused(false)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '13px' : '14px', color: '#0F172A', lineHeight: '20px' }}
            />
          </div>
          {emailTouched && !isEmailValid && (
            <span style={{ color: '#DC2626', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Please enter a valid email address
            </span>
          )}
        </div>

        {/* Kata Sandi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#334155' }}>
              Kata Sandi
            </label>
            <a href="/reset-password" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: '12px', lineHeight: '16px', color: '#628141', textDecoration: 'none' }}>
              Forgot password?
            </a>
          </div>
          <div
            style={{
              display: 'flex', alignItems: 'center', padding: '14px 12px',
              borderRadius: 8, 
              border: `1px solid ${passTouched && !isPasswordValid ? '#DC2626' : (passFocused ? '#628141' : '#E2E8F0')}`,
              background: '#FFF', gap: 10, transition: 'border-color 150ms ease',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="18" viewBox="0 0 14 18" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1.66667 17.5C1.20833 17.5 0.815972 17.3368 0.489583 17.0104C0.163194 16.684 0 16.2917 0 15.8333V7.5C0 7.04167 0.163194 6.64931 0.489583 6.32292C0.815972 5.99653 1.20833 5.83333 1.66667 5.83333H2.5V4.16667C2.5 3.01389 2.90625 2.03125 3.71875 1.21875C4.53125 0.40625 5.51389 0 6.66667 0C7.81944 0 8.80208 0.40625 9.61458 1.21875C10.4271 2.03125 10.8333 3.01389 10.8333 4.16667V5.83333H11.6667C12.125 5.83333 12.5174 5.99653 12.8438 6.32292C13.1701 6.64931 13.3333 7.04167 13.3333 7.5V15.8333C13.3333 16.2917 13.1701 16.684 12.8438 17.0104C12.5174 17.3368 12.125 17.5 11.6667 17.5H1.66667ZM1.66667 15.8333H11.6667V7.5H1.66667V15.8333ZM6.66667 13.3333C7.125 13.3333 7.51736 13.1701 7.84375 12.8438C8.17014 12.5174 8.33333 12.125 8.33333 11.6667C8.33333 11.2083 8.17014 10.816 7.84375 10.4896C7.51736 10.1632 7.125 10 6.66667 10C6.20833 10 5.81597 10.1632 5.48958 10.4896C5.16319 10.816 5 11.2083 5 11.6667C5 12.125 5.16319 12.5174 5.48958 12.8438C5.81597 13.1701 6.20833 13.3333 6.66667 13.3333ZM4.16667 5.83333H9.16667V4.16667C9.16667 3.47222 8.92361 2.88194 8.4375 2.39583C7.95139 1.90972 7.36111 1.66667 6.66667 1.66667C5.97222 1.66667 5.38194 1.90972 4.89583 2.39583C4.40972 2.88194 4.16667 3.47222 4.16667 4.16667V5.83333ZM1.66667 15.8333V7.5V15.8333Z" fill="#94A3B8"/>
            </svg>
            <input
              type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password}
              onChange={e => { setPassword(e.target.value); setPassTouched(true); }}
              onFocus={() => setPassFocused(true)} onBlur={() => setPassFocused(false)}
              style={{ border: 'none', outline: 'none', background: 'transparent', flex: 1, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? '13px' : '14px', color: '#0F172A', lineHeight: '20px' }}
            />
            <button onClick={() => setShowPassword(p => !p)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="19" height="13" viewBox="0 0 19 13" fill="none">
                <path d="M9.16667 10C10.2083 10 11.0938 9.63542 11.8229 8.90625C12.5521 8.17708 12.9167 7.29167 12.9167 6.25C12.9167 5.20833 12.5521 4.32292 11.8229 3.59375C11.0938 2.86458 10.2083 2.5 9.16667 2.5C8.125 2.5 7.23958 2.86458 6.51042 3.59375C5.78125 4.32292 5.41667 5.20833 5.41667 6.25C5.41667 7.29167 5.78125 8.17708 6.51042 8.90625C7.23958 9.63542 8.125 10 9.16667 10ZM9.16667 8.5C8.54167 8.5 8.01042 8.28125 7.57292 7.84375C7.13542 7.40625 6.91667 6.875 6.91667 6.25C6.91667 5.625 7.13542 5.09375 7.57292 4.65625C8.01042 4.21875 8.54167 4 9.16667 4C9.79167 4 10.3229 4.21875 10.7604 4.65625C11.1979 5.09375 11.4167 5.625 11.4167 6.25C11.4167 6.875 11.1979 7.40625 10.7604 7.84375C10.3229 8.28125 9.79167 8.5 9.16667 8.5ZM9.16667 12.5C7.13889 12.5 5.29167 11.934 3.625 10.8021C1.95833 9.67014 0.75 8.15278 0 6.25C0.75 4.34722 1.95833 2.82986 3.625 1.69792C5.29167 0.565972 7.13889 0 9.16667 0C11.1944 0 13.0417 0.565972 14.7083 1.69792C16.375 2.82986 17.5833 4.34722 18.3333 6.25C17.5833 8.15278 16.375 9.67014 14.7083 10.8021C13.0417 11.934 11.1944 12.5 9.16667 12.5ZM9.16667 10.8333C10.7361 10.8333 12.1771 10.4201 13.4896 9.59375C14.8021 8.76736 15.8056 7.65278 16.5 6.25C15.8056 4.84722 14.8021 3.73264 13.4896 2.90625C12.1771 2.07986 10.7361 1.66667 9.16667 1.66667C7.59722 1.66667 6.15625 2.07986 4.84375 2.90625C3.53125 3.73264 2.52778 4.84722 1.83333 6.25C2.52778 7.65278 3.53125 8.76736 4.84375 9.59375C6.15625 10.4201 7.59722 10.8333 9.16667 10.8333Z" fill={showPassword ? '#628141' : '#94A3B8'}/>
              </svg>
            </button>
          </div>
          {passTouched && !isPasswordValid && (
            <span style={{ color: '#DC2626', fontSize: '12px', fontFamily: 'Inter, sans-serif', fontWeight: 500 }}>
              Password must be at least 8 characters long
            </span>
          )}
        </div>

        {/* Ingat saya selama 30 hari */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div
            onClick={() => setKeepSigned(p => !p)}
            style={{
              width: 16, height: 16, borderRadius: 4,
              border: `1px solid ${keepSigned ? '#628141' : '#CBD5E1'}`,
              background: keepSigned ? '#628141' : '#FFF',
              flexShrink: 0, cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', transition: 'all 150ms ease',
            }}
          >
            {keepSigned && (
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <span onClick={() => setKeepSigned(p => !p)} style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#475569', cursor: 'pointer', userSelect: 'none' }}>
            Ingat saya selama 30 hari
          </span>
        </div>

        {/* Sign In button */}
        <button
          onClick={handleSignIn}
          disabled={loading}
          style={{
            display: 'flex', padding: '14px 16px', justifyContent: 'center', alignItems: 'center',
            width: '100%', borderRadius: 8, border: '1px solid rgba(0,0,0,0)',
            background: '#628141', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 20,
            transition: 'background 150ms ease', opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#4d6633' }}
          onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.background = '#628141' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#FFF' }}>
            {loading ? 'Masuk...' : 'Masuk ke NutriGrow'}
          </span>
        </button>

        {/* Atau lanjutkan dengan */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ height: 1, flex: 1, borderTop: '1px solid #E2E8F0' }} />
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#64748B', whiteSpace: 'nowrap' }}>
            Atau lanjutkan dengan
          </span>
          <div style={{ height: 1, flex: 1, borderTop: '1px solid #E2E8F0' }} />
        </div>

        {/* Google button */}
        <button
          onClick={authService.loginWithGoogle}
          style={{ display: 'flex', padding: '12px 16px', justifyContent: 'center', alignItems: 'center', width: '100%', borderRadius: 8, border: '1px solid #E2E8F0', background: '#FFF', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)', cursor: 'pointer', gap: 10, marginBottom: 24, transition: 'background 150ms ease' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f8fafc' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#FFF' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="25" height="26" viewBox="0 0 25 26" fill="none">
            <path d="M25 12.8883C25 20.0738 20.0359 25.1875 12.7049 25.1875C5.67623 25.1875 0 19.5609 0 12.5938C0 5.62656 5.67623 0 12.7049 0C16.127 0 19.0061 1.24414 21.2244 3.2957L17.7664 6.59141C13.2428 2.26484 4.83094 5.51484 4.83094 12.5938C4.83094 16.9863 8.3709 20.5461 12.7049 20.5461C17.7357 20.5461 19.6209 16.9711 19.918 15.1176H12.7049V10.7859H24.8002C24.918 11.4309 25 12.0504 25 12.8883Z" fill="#628141"/>
          </svg>
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#334155' }}>
            Google
          </span>
        </button>

        {/* Butuh bantuan */}
        <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: isMobile ? '13px' : '14px', lineHeight: '20px', color: '#64748B', textAlign: 'center', margin: 0, marginBottom: 32 }}>
          Butuh bantuan?{' '}
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 700, color: '#628141', textDecoration: 'none' }}>
            Hubungi Tim Kami
          </a>
        </p>

        {/* Footer links */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16 }}>
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#94A3B8', textDecoration: 'none' }}>
            Kebijakan Privasi
          </a>
          <a href="#" style={{ fontFamily: 'Inter, sans-serif', fontWeight: 500, fontSize: '12px', lineHeight: '16px', color: '#94A3B8', textDecoration: 'none' }}>
            Syarat & Ketentuan
          </a>
        </div>

      </div>
    </div>
  )
}

// ─── Main Sign In Page ────────────────────────────────────────────────────────
const SignIn = () => {
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

export default SignIn