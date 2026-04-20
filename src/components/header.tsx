import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import NutriGrowLogo    from '../assets/logo/logo-nutrigrow.svg'
import DropdownIcon     from '../assets/icons/icon-dropdown.svg'
import NotificationIcon from '../assets/icons/icon-notification.svg'
import SettingIcon       from '../assets/icons/icon-settings.svg'

// ─── Interfaces ───────────────────────────────────────────────────────────────
// Tipe lokal untuk Avatar — memetakan 'nama' dari AuthContext ke 'name'
interface DisplayUser {
  name: string
  avatarUrl?: string
}

// ─── Main Header ──────────────────────────────────────────────────────────────
const Header = () => {
  const { user: authUser, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Petakan user dari AuthContext ke format yang dipakai komponen ini
  const user: DisplayUser | null = authUser
      ? { name: authUser.nama || 'User', avatarUrl: authUser.avatarUrl }
      : null

  const handleLogOut = async () => {
    await logout()
    navigate('/sign-in')
  }

  const handleSignIn = () => {
    navigate('/sign-in')
  }

  const [featuresOpen,       setFeaturesOpen]       = useState(false)
  const [profileOpen,        setProfileOpen]        = useState(false)
  const [mobileOpen,         setMobileOpen]         = useState(false)
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false)
  const [scrolled,           setScrolled]           = useState(false)

  const featuresRef = useRef<HTMLDivElement>(null)
  const profileRef  = useRef<HTMLDivElement>(null)

  // Tutup dropdown saat klik di luar
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (featuresRef.current && !featuresRef.current.contains(e.target as Node)) {
        setFeaturesOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Shadow header saat scroll
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 4)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  // Kunci scroll body saat mobile menu terbuka
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  // Tutup mobile menu saat resize ke desktop
  useEffect(() => {
    const fn = () => {
      if (window.innerWidth >= 1024) {
        setMobileOpen(false)
        setMobileFeaturesOpen(false)
      }
    }
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  // ─── Nav data ──────────────────────────────────────────────────────────────
  const navItems = [
    { label: 'About Us',          href: '/',           active: false },
    { label: 'NutriShop',         href: '/nutrishop',          active: false },
    { label: 'Tele-Nutritionist', href: '/tele-nutritionist',  active: false },
    { label: 'Article',           href: '/article',            active: false },
  ]
  const dropdownItems = [
    { label: "Growth Tracker",  href: '/growth-tracker'  },
    { label: "Health Log", href: '/health-log' },
  ]
  const logoHref = isLoggedIn ? '/dashboard' : '/'

  return (
    <>
      {/* ── Header bar ── */}
      <header
        className="w-full sticky top-0 z-50 transition-shadow duration-200"
        style={{
          height: '72px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--color-nutri-border)',
          boxShadow: scrolled
            ? '0 4px 16px rgba(0,0,0,0.10)'
            : '0 1px 2px rgba(0,0,0,0.05)',
        }}
      >
        <div
          className="mx-auto h-full flex items-center justify-between"
          style={{
            width: '100%',
            paddingInline: 'clamp(16px, 4vw, 40px)',
          }}
        >
          {/* Logo */}
          <Link to={logoHref} className="flex-shrink-0" aria-label="NutriGrow Home">
            <img src={NutriGrowLogo} alt="NutriGrow" style={{ height: '34px', width: 'auto' }} />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden lg:flex items-center h-full" style={{ gap: '30px' }}>
            <DesktopNavLink href={navItems[0].href} active={navItems[0].active}>
              {navItems[0].label}
            </DesktopNavLink>

            {/* Features dropdown */}
            <div ref={featuresRef} className="relative h-full flex items-center">
              <DesktopFeaturesBtn open={featuresOpen} onClick={() => setFeaturesOpen(p => !p)} />
              {featuresOpen && (
                <div
                  className="absolute top-full left-0 bg-white rounded-xl overflow-hidden z-50"
                  style={{
                    marginTop: '4px',
                    minWidth: '220px',
                    border: '1px solid var(--color-nutri-border-glow)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
                  }}
                  role="menu"
                >
                  {dropdownItems.map((d) => (
                    <DropdownItem key={d.label} href={d.href} onClick={() => setFeaturesOpen(false)}>
                      {d.label}
                    </DropdownItem>
                  ))}
                </div>
              )}
            </div>

            {navItems.slice(1).map((item) => (
              <DesktopNavLink key={item.label} href={item.href} active={item.active}>
                {item.label}
              </DesktopNavLink>
            ))}
          </nav>

          {/* ── Desktop action icons + auth ── */}
          <div className="hidden lg:flex items-center" style={{ gap: '16px' }}>
            <IconBtn ariaLabel="Notifikasi"><img src={NotificationIcon} alt="" width={16} height={20} /></IconBtn>
            <IconBtn ariaLabel="Pengaturan"><img src={SettingIcon} alt="" width={21} height={20} /></IconBtn>

            {/* Profile dropdown / Sign In */}
            {isLoggedIn && user ? (
              <div ref={profileRef} className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <Avatar user={user} size={36} />
                </button>
                {profileOpen && (
                  <div
                    className="absolute top-full right-0 bg-white rounded-xl overflow-hidden z-50 shadow-lg"
                    style={{
                      marginTop: '8px',
                      minWidth: '160px',
                      border: '1px solid var(--color-nutri-border-glow)',
                    }}
                  >
                    <DropdownItem href="/dashboard" onClick={() => setProfileOpen(false)}>Dashboard</DropdownItem>
                    <DropdownItem href="/profile" onClick={() => setProfileOpen(false)}>My Profile</DropdownItem>
                    <div style={{ height: '1px', background: 'var(--color-nutri-border)' }} />
                    <DropdownItem href="#" onClick={() => { handleLogOut(); setProfileOpen(false) }}>
                      <span style={{ color: '#ef4444' }}>Log Out</span>
                    </DropdownItem>
                  </div>
                )}
              </div>
            ) : (
              <AuthBtn variant="signin" onClick={handleSignIn}>Sign In</AuthBtn>
            )}
          </div>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className="lg:hidden flex items-center justify-center rounded-lg flex-shrink-0 transition-colors duration-150"
            style={{ width: '40px', height: '40px', background: 'var(--color-nutri-icon-bg)' }}
            onClick={() => setMobileOpen(p => !p)}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg-hover)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg)' }}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </header>

      {/* ── Mobile overlay backdrop ── */}
      <div
        className="lg:hidden fixed inset-0 z-40 bg-black/30 transition-opacity duration-200"
        style={{
          backdropFilter: 'blur(2px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
        }}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile menu panel ── */}
      <div
        className="lg:hidden fixed top-[72px] left-0 right-0 z-50 bg-white overflow-y-auto"
        style={{
          maxHeight: 'calc(100svh - 72px)',
          borderBottom: '1px solid var(--color-nutri-border)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-6px)',
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'transform 220ms cubic-bezier(.4,0,.2,1), opacity 220ms ease',
        }}
      >
        <div className="px-5 pt-3 pb-6">

          {/* User info (jika sudah login) */}
          {isLoggedIn && user && (
            <div className="flex items-center gap-3 py-3 mb-2" style={{ borderBottom: '1px solid var(--color-nutri-border)' }}>
              <Avatar user={user} size={40} />
              <div>
                <p className="text-sm md:text-base font-semibold leading-tight" style={{ color: '#1e293b' }}>{user.name}</p>
                <p className="text-[12px] leading-tight mt-0.5" style={{ color: 'var(--color-nutri-slate-light)' }}>Sudah masuk</p>
              </div>
            </div>
          )}

          {/* Nav links mobile */}
          <div className="pt-1">
            <MobileNavLink href={navItems[0].href} active={navItems[0].active} onClick={() => setMobileOpen(false)}>
              {navItems[0].label}
            </MobileNavLink>
            <MobileFeaturesAccordion
              open={mobileFeaturesOpen}
              onToggle={() => setMobileFeaturesOpen(p => !p)}
              items={dropdownItems}
              onItemClick={() => setMobileOpen(false)}
            />
            {navItems.slice(1).map((item) => (
              <MobileNavLink key={item.label} href={item.href} active={item.active} onClick={() => setMobileOpen(false)}>
                {item.label}
              </MobileNavLink>
            ))}
          </div>

          <div style={{ height: '1px', background: 'var(--color-nutri-border)', margin: '12px 0' }} />

          {/* Icon actions mobile */}
          <div className="flex items-center gap-3 py-1 mb-3">
            <IconBtn ariaLabel="Notifikasi"><img src={NotificationIcon} alt="" width={16} height={20} /></IconBtn>
            <span className="text-sm md:text-base font-[family-name:var(--font-heading)] text-[color:var(--color-nutri-slate)]">Notifikasi</span>
          </div>
          <div className="flex items-center gap-3 py-1 mb-4">
            <IconBtn ariaLabel="Pengaturan"><img src={SettingIcon} alt="" width={21} height={20} /></IconBtn>
            <span className="text-sm md:text-base font-[family-name:var(--font-heading)] text-[color:var(--color-nutri-slate)]">Pengaturan</span>
          </div>

          {/* Auth button mobile */}
          {isLoggedIn ? (
            <AuthBtn variant="logout" fullWidth onClick={() => { handleLogOut(); setMobileOpen(false) }}>Log Out</AuthBtn>
          ) : (
            <AuthBtn variant="signin" fullWidth onClick={() => { handleSignIn(); setMobileOpen(false) }}>Sign In</AuthBtn>
          )}

        </div>
      </div>
    </>
  )
}

// ─── DesktopNavLink ───────────────────────────────────────────────────────────
const DesktopNavLink = ({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) => {
  const [hovered, setHovered] = useState(false)
  const highlighted = active || hovered
  return (
    <Link
      to={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-sm lg:text-[16px]"
      style={{
        fontFamily: 'var(--font-heading)', fontWeight: highlighted ? 600 : 500,
        color: highlighted ? 'var(--color-nutri-green)' : 'var(--color-nutri-slate)',
        textDecoration: 'none', position: 'relative', height: '100%', display: 'flex', alignItems: 'center', transition: 'color 150ms ease',
      }}
    >
      {children}
      <span style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px',
        background: 'var(--color-nutri-green-light)',
        opacity: highlighted ? 1 : 0, transform: highlighted ? 'scaleX(1)' : 'scaleX(0.5)', transition: 'all 150ms ease',
      }} />
    </Link>
  )
}

// ─── DesktopFeaturesBtn ───────────────────────────────────────────────────────
const DesktopFeaturesBtn = ({ open, onClick }: { open: boolean; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false)
  const highlighted = open || hovered
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-sm lg:text-[16px]"
      style={{
        fontFamily: 'var(--font-heading)', background: 'none', border: 'none',
        fontWeight: highlighted ? 600 : 500, color: highlighted ? 'var(--color-nutri-green)' : 'var(--color-nutri-slate)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', height: '100%', position: 'relative',
      }}
    >
      Features
      <img src={DropdownIcon} alt="" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }} />
      <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--color-nutri-green-light)', opacity: highlighted ? 1 : 0, transition: 'all 150ms ease' }} />
    </button>
  )
}

// ─── DropdownItem ─────────────────────────────────────────────────────────────
const DropdownItem = ({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <Link
      to={href} onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-sm md:text-base"
      style={{
        display: 'block', padding: '12px 20px', textDecoration: 'none',
        fontFamily: 'var(--font-heading)', fontWeight: hovered ? 600 : 500,
        color: hovered ? 'var(--color-nutri-green)' : 'var(--color-nutri-slate)',
        background: hovered ? 'var(--color-nutri-green-soft)' : 'transparent',
      }}
    >
      {children}
    </Link>
  )
}

// ─── MobileNavLink ────────────────────────────────────────────────────────────
const MobileNavLink = ({ href, active, children, onClick }: { href: string; active: boolean; children: React.ReactNode; onClick: () => void }) => {
  const [hovered, setHovered] = useState(false)
  const highlighted = active || hovered
  return (
    <Link
      to={href} onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-sm md:text-base"
      style={{
        display: 'flex', padding: '12px', textDecoration: 'none',
        fontFamily: 'var(--font-heading)', fontWeight: highlighted ? 600 : 500,
        color: highlighted ? 'var(--color-nutri-green)' : 'var(--color-nutri-slate)',
        borderLeft: `2px solid ${highlighted ? 'var(--color-nutri-green-light)' : 'transparent'}`,
        background: active ? 'var(--color-nutri-green-soft)' : 'transparent',
        borderRadius: '0 6px 6px 0',
      }}
    >
      {children}
    </Link>
  )
}

// ─── MobileFeaturesAccordion ──────────────────────────────────────────────────
const MobileFeaturesAccordion = ({ open, onToggle, items, onItemClick }: any) => {
  const [hovered, setHovered] = useState(false)
  const highlighted = open || hovered
  return (
    <div>
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="text-sm md:text-base"
        style={{
          width: '100%', display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'none', border: 'none',
          fontFamily: 'var(--font-heading)', cursor: 'pointer',
          fontWeight: highlighted ? 600 : 500, color: highlighted ? 'var(--color-nutri-green)' : 'var(--color-nutri-slate)',
          borderLeft: `2px solid ${highlighted ? 'var(--color-nutri-green-light)' : 'transparent'}`,
        }}
      >
        <span>Features</span>
        <img src={DropdownIcon} alt="" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {open && (
        <div style={{ paddingLeft: '24px' }}>
          {items.map((item: any) => (
            <MobileNavLink key={item.label} href={item.href} active={false} onClick={onItemClick}>{item.label}</MobileNavLink>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── IconBtn ──────────────────────────────────────────────────────────────────
const IconBtn = ({ children, ariaLabel }: { children: React.ReactNode; ariaLabel: string }) => (
  <button
    aria-label={ariaLabel}
    style={{
      width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-nutri-icon-bg)', border: 'none', borderRadius: '8px', cursor: 'pointer',
    }}
    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg-hover)' }}
    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--color-nutri-icon-bg)' }}
  >
    {children}
  </button>
)

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ user, size = 36 }: { user: DisplayUser; size?: number }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
    {user.avatarUrl ? (
      <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    ) : (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-nutri-green)', color: 'white', fontWeight: 600, fontSize: `${size * 0.4}px` }}>
        {user.name.charAt(0).toUpperCase()}
      </div>
    )}
  </div>
)

// ─── AuthBtn ──────────────────────────────────────────────────────────────────
const AuthBtn = ({ variant, children, onClick, fullWidth = false }: any) => {
  const isSignIn = variant === 'signin'
  return (
    <button
      onClick={onClick}
      className="text-sm md:text-base"
      style={{
        height: '36px', padding: '0 20px', borderRadius: '99px', fontWeight: 600, cursor: 'pointer',
        width: fullWidth ? '100%' : 'auto', transition: 'all 150ms ease',
        background: isSignIn ? 'var(--color-nutri-green)' : 'transparent',
        color: isSignIn ? 'white' : 'var(--color-nutri-green)',
        border: isSignIn ? 'none' : '1.5px solid var(--color-nutri-green)',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isSignIn ? 'var(--color-nutri-green-dark)' : 'var(--color-nutri-green-soft)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isSignIn ? 'var(--color-nutri-green)' : 'transparent' }}
    >
      {children}
    </button>
  )
}

// ─── HamburgerIcon ────────────────────────────────────────────────────────────
const HamburgerIcon = ({ open }: { open: boolean }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    {open ? (
      <path d="M5 5L19 19M19 5L5 19" stroke="var(--color-nutri-icon)" strokeWidth="2" strokeLinecap="round" />
    ) : (
      <path d="M3 6H21M3 12H21M3 18H21" stroke="var(--color-nutri-icon)" strokeWidth="2" strokeLinecap="round" />
    )}
  </svg>
)

export default Header