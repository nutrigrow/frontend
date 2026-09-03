import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GardenImg from '../assets/images/img-garden.png'
import MotherFeedingImg from '../assets/images/img-mother-feeding.png'
import CircleAsset from '../assets/asset/asset-circle.svg'
import FamilyImg from '../assets/images/img-family.png'
import Member1Img from '../assets/images/img-member-1.png'
import Member2Img from '../assets/images/img-member-2.png'
import Member3Img from '../assets/images/img-member-3.png'
import Member4Img from '../assets/images/img-member-4.png'
import Member5Img from '../assets/images/img-member-5.png'
import User1Img from '../assets/images/img-user-1.png'
import User2Img from '../assets/images/img-user-2.png'
import User3Img from '../assets/images/img-user-3.png'

// ─── Design Tokens ───────────────────────────────────────────────────────────
const BRAND = {
  green:     '#628141',
  greenDark: '#3F6212',
  greenDeep: '#1C1917',  // used as near-black
  greenLight:'#ECFCCB',
  lime:      '#A3E635',
  limeBright:'#BEF264',
  white:     '#FFF',
  offWhite:  '#FAFAF9',
  stone50:   '#FAFAF9',
  stone100:  '#F5F5F4',
  stone200:  '#E7E5E4',
  stone400:  '#A8A29E',
  stone500:  '#78716C',
  stone600:  '#57534E',
  stone700:  '#44403C',
  stone900:  '#1C1917',
}

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

// ─── Shared helpers ──────────────────────────────────────────────────────────
const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '24px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

const isLoggedIn = (): boolean => !!localStorage.getItem('token')

// Reusable section label style
const sectionLabel = (isMobile: boolean): React.CSSProperties => ({
  color: BRAND.green,
  fontFamily: 'Inter, sans-serif',
  fontSize: isMobile ? 11 : 13,
  fontWeight: 700,
  lineHeight: '20px',
  letterSpacing: '2px',
  textTransform: 'uppercase',
})

// Reusable section heading style
const sectionHeading = (bp: 'mobile' | 'tablet' | 'desktop'): React.CSSProperties => ({
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 900,
  fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 38 : 46,
  lineHeight: bp === 'mobile' ? '36px' : '54px',
  color: BRAND.stone900,
  margin: 0,
})

// ─── Vertical padding per section ────────────────────────────────────────────
const sectionPy = (isMobileOrTablet: boolean) => ({
  paddingTop:    isMobileOrTablet ? 56 : 88,
  paddingBottom: isMobileOrTablet ? 56 : 88,
})

// ─── Section 1: Hero ─────────────────────────────────────────────────────────
const SectionOurRoots = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const paddingInline = getPaddingInline(bp)
  const navigate = useNavigate()

  return (
    <div style={{ width: '100%', height: isMobile ? 500 : 660, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <img
        src={GardenImg} alt="" aria-hidden="true"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }}
      />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(28,25,23,0.92) 0%, rgba(28,25,23,0.55) 60%, rgba(28,25,23,0.2) 100%)' }} />

      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto', paddingInline, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: isMobile ? 18 : 28, maxWidth: isMobile ? '100%' : 1000 }}>

          {/* Badge */}
          <div className="badge-shimmer" style={{ display: 'inline-flex', padding: '6px 18px', borderRadius: 9999, border: '1px solid rgba(163,230,53,0.3)', boxShadow: '0 4px 12px rgba(163,230,53,0.1)' }}>
            <span style={{ color: BRAND.limeBright, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 11 : 13, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              Tentang Kami
            </span>
          </div>

          <h1 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: bp === 'mobile' ? 32 : bp === 'tablet' ? 44 : 54, lineHeight: isMobile ? '42px' : '64px', color: BRAND.white, margin: 0 }}>
            Lebih dari Sekadar Pencatat, {bp !== 'mobile' && <br />}
            <span className="text-gradient-lime" style={{ fontWeight: 900 }}>Kami Adalah Pendamping Anda.</span>
          </h1>

          <p style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: isMobile ? 14 : 18, lineHeight: isMobile ? '24px' : '30px', color: '#E7E5E4', margin: 0, maxWidth: 760 }}>
            Langkah pertama untuk generasi yang lebih sehat dimulai dari sini. {bp !== 'mobile' && <br />} Pantau pertumbuhan anak dan asupan gizi secara presisi dalam satu platform terpadu.
          </p>

          <button
            onClick={() => navigate('/sign-in')}
            className="btn-primary"
            style={{ display: 'inline-flex', padding: isMobile ? '14px 28px' : '16px 40px', borderRadius: 12, border: 'none', background: BRAND.green, cursor: 'pointer', outline: 'none' }}
          >
            <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: isMobile ? 14 : 16, color: BRAND.white, whiteSpace: 'nowrap' }}>
              Mulai Sekarang
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section 2: Visi & Misi ──────────────────────────────────────────────────
const SectionOurMission = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isMobileOrTablet = bp !== 'desktop'
  const paddingInline = getPaddingInline(bp)

  return (
    <div style={{ width: '100%', background: BRAND.white, ...sectionPy(isMobileOrTablet), boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline, display: 'flex', flexDirection: 'column', gap: 40, boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={sectionLabel(isMobile)}>Alasan Kami Hadir</span>
          <h2 style={sectionHeading(bp)}>
            Misi Kami untuk{' '}
            <span style={{ color: BRAND.green }}>Indonesia.</span>
          </h2>
        </div>

        {/* Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr', gap: 24 }}>

          {/* Visi card — dark green */}
          <div className="hover-lift" style={{ display: 'flex', padding: isMobileOrTablet ? '36px' : '52px', flexDirection: 'column', alignItems: 'flex-start', gap: 20, borderRadius: 28, background: BRAND.greenDark, boxSizing: 'border-box', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px rgba(63,98,18,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', marginBottom: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="26" viewBox="0 0 55 38" fill="none">
                <path d="M27.5 30C30.625 30 33.2812 28.9062 35.4688 26.7188C37.6562 24.5312 38.75 21.875 38.75 18.75C38.75 15.625 37.6562 12.9688 35.4688 10.7812C33.2812 8.59375 30.625 7.5 27.5 7.5C24.375 7.5 21.7188 8.59375 19.5312 10.7812C17.3438 12.9688 16.25 15.625 16.25 18.75C16.25 21.875 17.3438 24.5312 19.5312 26.7188C21.7188 28.9062 24.375 30 27.5 30ZM27.5 25.5C25.625 25.5 24.0312 24.8438 22.7188 23.5312C21.4062 22.2188 20.75 20.625 20.75 18.75C20.75 16.875 21.4062 15.2812 22.7188 13.9688C24.0312 12.6562 25.625 12 27.5 12C29.375 12 30.9688 12.6562 32.2812 13.9688C33.5938 15.2812 34.25 16.875 34.25 18.75C34.25 20.625 33.5938 22.2188 32.2812 23.5312C30.9688 24.8438 29.375 25.5 27.5 25.5ZM27.5 37.5C21.4167 37.5 15.875 35.8021 10.875 32.4062C5.875 29.0104 2.25 24.4583 0 18.75C2.25 13.0417 5.875 8.48958 10.875 5.09375C15.875 1.69792 21.4167 0 27.5 0C33.5833 0 39.125 1.69792 44.125 5.09375C49.125 8.48958 52.75 13.0417 55 18.75C52.75 24.4583 49.125 29.0104 44.125 32.4062C39.125 35.8021 33.5833 37.5 27.5 37.5ZM27.5 32.5C32.2083 32.5 36.5312 31.2604 40.4688 28.7812C44.4062 26.3021 47.4167 22.9583 49.5 18.75C47.4167 14.5417 44.4062 11.1979 40.4688 8.71875C36.5312 6.23958 32.2083 5 27.5 5C22.7917 5 18.4688 6.23958 14.5312 8.71875C10.5938 11.1979 7.58333 14.5417 5.5 18.75C7.58333 22.9583 10.5938 26.3021 14.5312 28.7812C18.4688 31.2604 22.7917 32.5 27.5 32.5Z" fill={BRAND.lime}/>
              </svg>
            </div>
            <span style={{ color: BRAND.white, fontFamily: 'Montserrat, sans-serif', fontSize: isMobileOrTablet ? 22 : 28, fontWeight: 800, lineHeight: '1.2' }}>Visi Kami</span>
            <p style={{ color: '#E7E5E4', fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 15 : 17, fontWeight: 400, lineHeight: '1.75', margin: 0 }}>
              "Mewujudkan generasi bebas stunting melalui pemenuhan gizi yang inklusif dan preventif."
            </p>
          </div>

          {/* Misi card — light green */}
          <div className="hover-lift" style={{ display: 'flex', padding: isMobileOrTablet ? '36px' : '52px', flexDirection: 'column', alignItems: 'flex-start', gap: 20, borderRadius: 28, background: BRAND.greenLight, boxSizing: 'border-box', border: '1px solid rgba(98,129,65,0.1)', boxShadow: '0 10px 30px rgba(98,129,65,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: '50%', background: 'rgba(98,129,65,0.08)', marginBottom: 8 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="34" viewBox="0 0 38 43" fill="none">
                <path d="M0 42.5V0H22.5L23.5 5H37.5V30H20L19 25H5V42.5H0ZM24.125 25H32.5V10H19.375L18.375 5H5V20H23.125L24.125 25Z" fill={BRAND.green}/>
              </svg>
            </div>
            <span style={{ color: BRAND.greenDark, fontFamily: 'Montserrat, sans-serif', fontSize: isMobileOrTablet ? 22 : 28, fontWeight: 800, lineHeight: '1.2' }}>Misi Kami</span>
            <p style={{ color: BRAND.stone700, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 15 : 17, fontWeight: 400, lineHeight: '1.75', margin: 0 }}>
              "Mendigitalisasi deteksi dini malnutrisi, memperluas akses konsultasi gizi profesional, dan menyediakan wadah pemenuhan nutrisi yang tepercaya bagi ibu hamil, ibu menyusui, remaja dan balita."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 3: SDG 2.2 ──────────────────────────────────────────────────────
const SectionSDG = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileOrTablet = isMobile || isTablet
  const paddingInline = getPaddingInline(bp)

  return (
    <div style={{ width: '100%', background: 'linear-gradient(180deg, #F0FDF4 0%, #F7FEE7 100%)', ...sectionPy(isMobileOrTablet), boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative orbs */}
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(98,129,65,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -80, left: -80, width: 280, height: 280, borderRadius: '50%', background: 'rgba(163,230,53,0.08)', pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline, display: 'flex', flexDirection: isMobileOrTablet ? 'column' : 'row', gap: isMobileOrTablet ? 48 : 72, alignItems: isMobileOrTablet ? 'flex-start' : 'center', boxSizing: 'border-box', position: 'relative', zIndex: 1 }}>

        {/* Left */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* SDG icon badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 18 }}>
            <div style={{ width: 74, height: 74, borderRadius: 20, background: 'linear-gradient(135deg, #D4AF37 0%, #C6973F 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: '8px 6px', boxSizing: 'border-box', boxShadow: '0 10px 20px -5px rgba(198,151,63,0.35)', border: '2px solid rgba(255,255,255,0.35)' }}>
              <span style={{ color: '#fff', fontFamily: 'Montserrat, sans-serif', fontSize: 24, fontWeight: 900, lineHeight: 1 }}>2</span>
              <span style={{ color: '#fff', fontFamily: 'Inter, sans-serif', fontSize: 7, fontWeight: 800, letterSpacing: '0.5px', textTransform: 'uppercase', lineHeight: 1.3, textAlign: 'center', marginTop: 1 }}>ZERO HUNGER</span>
              <svg width="24" height="13" viewBox="0 0 24 13" fill="none" style={{ marginTop: 2 }}>
                <path d="M1 1Q6 12 12 12Q18 12 23 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
                <line x1="1" y1="1" x2="23" y2="1" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, color: BRAND.stone500, fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>Target SDG</p>
              <p style={{ margin: '2px 0 0', color: BRAND.green, fontFamily: 'Montserrat, sans-serif', fontSize: 30, fontWeight: 900, lineHeight: 1 }}>2.2</p>
            </div>
          </div>

          <h2 style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: isMobile ? 28 : isTablet ? 36 : 44, lineHeight: isMobile ? '36px' : '52px', color: BRAND.stone900, margin: 0 }}>
            Berkomitmen Menuju{' '}
            <span style={{ color: BRAND.green }}>Zero Hunger 2030.</span>
          </h2>

          <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 14 : 16, fontWeight: 400, lineHeight: '1.8', margin: 0, maxWidth: 520 }}>
            NutriGrow dikembangkan selaras dengan{' '}
            <strong style={{ color: BRAND.stone900 }}>Tujuan Pembangunan Berkelanjutan (SDGs) PBB — Target 2.2</strong>:{' '}
            mengakhiri segala bentuk malnutrisi pada tahun 2030, termasuk stunting dan wasting pada anak di bawah 5 tahun.
          </p>
        </div>

        {/* Right — indicator cards */}
        <div style={{ flex: isMobileOrTablet ? undefined : '0 0 440px', width: isMobileOrTablet ? '100%' : 440, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[
            { code: '2.2.1', desc: 'Prevalensi stunting (tinggi badan/usia < −2 SD dari median WHO) pada anak di bawah 5 tahun.' },
            { code: '2.2.2', desc: 'Prevalensi malnutrisi (berat badan/tinggi badan > +2 atau < −2 SD dari median WHO) pada anak di bawah 5 tahun, meliputi wasting dan overweight.' },
          ].map(item => (
            <div key={item.code} className="hover-lift" style={{ background: BRAND.white, border: `1px solid ${BRAND.stone200}`, borderLeft: `5px solid ${BRAND.green}`, borderRadius: 18, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <span style={{ color: BRAND.green, fontFamily: 'Montserrat, sans-serif', fontSize: 17, fontWeight: 800 }}>{item.code}</span>
              <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '1.65', margin: 0 }}>{item.desc}</p>
            </div>
          ))}

          <div style={{ background: BRAND.greenLight, border: `1.5px dashed rgba(98,129,65,0.25)`, borderRadius: 18, padding: '18px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ display: 'inline-flex', padding: '6px', borderRadius: '50%', background: BRAND.white, boxShadow: '0 4px 8px rgba(0,0,0,0.04)', fontSize: 16, flexShrink: 0, lineHeight: 1 }}>🌱</span>
            <p style={{ color: BRAND.greenDark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 600, lineHeight: '1.65', margin: 0 }}>
              NutriGrow membantu deteksi dini stunting & wasting sesuai standar WHO — mendukung pencapaian target SDG 2.2 di Indonesia.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 4: Tujuan Kami ──────────────────────────────────────────────────
const SectionThePurpose = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isMobileOrTablet = bp !== 'desktop'
  const paddingInline = getPaddingInline(bp)

  return (
    <div style={{ width: '100%', background: BRAND.stone50, ...sectionPy(isMobileOrTablet), boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline, display: 'flex', flexDirection: 'column', gap: isMobileOrTablet ? 36 : 48, boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={sectionLabel(isMobile)}>Tujuan Kami</span>
          <div style={{ display: 'flex', flexDirection: isMobileOrTablet ? 'column' : 'row', alignItems: isMobileOrTablet ? 'flex-start' : 'stretch', gap: isMobileOrTablet ? 16 : 32, width: '100%' }}>
            <h2 style={{ ...sectionHeading(bp), flex: 1 }}>
              <strong>Mencegah Stunting Melalui{' '}
              <span style={{ color: BRAND.green }}>Pemenuhan Gizi.</span></strong>
            </h2>
            <div style={{ display: 'flex', flex: 1, width: '100%', flexDirection: 'column', justifyContent: 'center', borderRadius: 24, border: `1px solid ${BRAND.stone200}`, padding: isMobileOrTablet ? '20px 24px' : '28px 36px', boxSizing: 'border-box', background: BRAND.white, boxShadow: '0 8px 24px rgba(0,0,0,0.02)' }}>
              <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 14 : 16, fontWeight: 400, lineHeight: '1.8', margin: 0 }}>
                Stunting pada anak bukan sekadar masalah tinggi badan — melainkan berdampak pada perkembangan otak, imunitas, dan potensi masa depan mereka. Kami hadir menjembatani sains klinis dengan pola asuh sehari-hari.
              </p>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(3, minmax(0, 1fr))', rowGap: 24, columnGap: 24 }}>

          {/* Photo card — spans 2 cols */}
          <div className="img-zoom-container" style={{ gridColumn: isMobileOrTablet ? '1' : '1 / span 2', borderRadius: 28, overflow: 'hidden', position: 'relative', minHeight: isMobileOrTablet ? 300 : 480, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.1)' }}>
            <img src={MotherFeedingImg} alt="Ibu menyusui anak" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.3) 100%)' }} />
            {/* Floating card */}
            <div className="glass-card" style={{ position: 'absolute', bottom: 24, left: 24, width: isMobileOrTablet ? 'calc(100% - 48px)' : 380, borderRadius: 20, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 10, boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: BRAND.green, boxShadow: '0 4px 10px rgba(98,129,65,0.3)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 26 26" fill="none">
                  <path d="M12.375 25.5371C11.55 25.5371 10.7188 25.4433 9.88125 25.2558C9.04375 25.0683 8.1875 24.7996 7.3125 24.4496C7.6125 21.4246 8.4875 18.5996 9.9375 15.9746C11.3875 13.3496 13.25 11.0371 15.525 9.03708C12.775 10.4371 10.3938 12.2871 8.38125 14.5871C6.36875 16.8871 4.9625 19.5121 4.1625 22.4621C4.0625 22.3871 3.96875 22.3058 3.88125 22.2183C3.79375 22.1308 3.7 22.0371 3.6 21.9371C2.425 20.7621 1.53125 19.4496 0.91875 17.9996C0.30625 16.5496 0 15.0371 0 13.4621C0 11.7621 0.3375 10.1371 1.0125 8.58708C1.6875 7.03708 2.625 5.66208 3.825 4.46208C5.85 2.43708 8.475 1.11833 11.7 0.505829C14.925 -0.106671 19.45 -0.162921 25.275 0.337079C25.725 6.31208 25.65 10.8683 25.05 14.0058C24.45 17.1433 23.15 19.7121 21.15 21.7121C19.925 22.9371 18.5563 23.8808 17.0438 24.5433C15.5313 25.2058 13.975 25.5371 12.375 25.5371Z" fill={BRAND.white}/>
                </svg>
              </div>
              <span style={{ color: BRAND.stone900, fontFamily: 'Montserrat, sans-serif', fontSize: 20, fontWeight: 800, lineHeight: '1.3' }}>Kesehatan Berkelanjutan</span>
              <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: '1.6', margin: 0 }}>
                Memberdayakan keluarga melalui edukasi kesehatan yang berdampak melintasi generasi.
              </p>
            </div>
          </div>

          {/* Fokus Kognitif card */}
          <div className="hover-lift" style={{ gridColumn: isMobileOrTablet ? '1' : '3', display: 'flex', padding: isMobileOrTablet ? '36px' : '44px', flexDirection: 'column', alignItems: 'flex-start', gap: 18, borderRadius: 28, background: BRAND.greenLight, boxSizing: 'border-box', border: '1px solid rgba(98,129,65,0.12)', boxShadow: '0 10px 30px rgba(98,129,65,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 68, height: 68, borderRadius: '50%', background: BRAND.white, boxShadow: '0 6px 12px rgba(98,129,65,0.06)', marginBottom: 4 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 39 40" fill="none">
                <path d="M6 40V31.4C4.1 29.6667 2.625 27.6417 1.575 25.325C0.525 23.0083 0 20.5667 0 18C0 13 1.75 8.75 5.25 5.25C8.75 1.75 13 0 18 0C22.1667 0 25.8583 1.225 29.075 3.675C32.2917 6.125 34.3833 9.31667 35.35 13.25L37.95 23.5C38.1167 24.1333 38 24.7083 37.6 25.225C37.2 25.7417 36.6667 26 36 26H32V32C32 33.1 31.6083 34.0417 30.825 34.825C30.0417 35.6083 29.1 36 28 36H24V40H20V32H28V22H33.4L31.5 14.25C30.7333 11.2167 31.5 14.25 31.5 14.25C30.7333 11.2167 29.1 8.75 26.6 6.85C24.1 4.95 21.2333 4 18 4C14.1333 4 10.8333 5.35 8.1 8.05C5.36667 10.75 4 14.0333 4 17.9C4 19.9 4.40833 21.8 5.225 23.6C6.04167 25.4 7.2 27 8.7 28.4L10 29.6V40H6ZM16 26H20L20.3 23.5C20.5667 23.4 20.8083 23.2833 21.025 23.15C21.2417 23.0167 21.4333 22.8667 21.6 22.7L23.9 23.7L25.9 20.3L23.9 18.8C23.9667 18.5333 24 18.2667 24 18C24 17.7333 23.9667 17.4667 23.9 17.2L25.9 15.7L23.9 12.3L21.6 13.3C21.4333 13.1333 21.2417 12.9833 21.025 12.85C20.8083 12.7167 20.5667 12.6 20.3 12.5L20 10H16L15.7 12.5C15.4333 12.6 15.1917 12.7167 14.975 12.85C14.7583 12.9833 14.5667 13.1333 14.4 13.3L12.1 12.3L10.1 15.7L12.1 17.2C12.0333 17.4667 12 17.7333 12 18C12 18.2667 12.0333 18.5333 12.1 18.8L10.1 20.3L12.1 23.7L14.4 22.7C14.5667 22.8667 14.7583 23.0167 14.975 23.15C15.1917 23.2833 15.4333 23.4 15.7 23.5L16 26ZM18 21C17.1667 21 16.4583 20.7083 15.875 20.125C15.2917 19.5417 15 18.8333 15 18C15 17.1667 15.2917 16.4583 15.875 15.875C16.4583 15.2917 17.1667 15 18 15C18.8333 15 19.5417 15.2917 20.125 15.875C20.7083 16.4583 21 17.1667 21 18C21 18.8333 20.7083 19.5417 20.125 20.125C19.5417 20.7083 18.8333 21 18 21Z" fill={BRAND.green}/>
              </svg>
            </div>
            <span style={{ color: BRAND.greenDark, fontFamily: 'Montserrat, sans-serif', fontSize: isMobileOrTablet ? 20 : 24, fontWeight: 800, lineHeight: '1.3' }}>Fokus Kognitif</span>
            <p style={{ color: BRAND.stone700, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 14 : 15, fontWeight: 400, lineHeight: '1.7', margin: 0 }}>
              Gizi bukan sekadar sumber tenaga, melainkan fondasi utama fungsi kognitif. Kami mengutamakan pemenuhan mikronutrien untuk mencerdaskan generasi muda.
            </p>
          </div>

          {/* 1000 Hari card */}
          <div className="hover-lift" style={{ gridColumn: isMobileOrTablet ? '1' : '1 / span 3', display: 'flex', padding: isMobileOrTablet ? '36px' : '48px 56px', alignItems: 'center', gap: isMobileOrTablet ? 28 : 56, borderRadius: 28, border: `1px solid ${BRAND.stone200}`, background: BRAND.white, flexDirection: isMobileOrTablet ? 'column' : 'row', boxSizing: 'border-box', boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <h3 style={{ color: BRAND.stone900, fontFamily: 'Montserrat, sans-serif', fontSize: isMobileOrTablet ? 22 : 30, fontWeight: 900, lineHeight: '1.25', margin: 0 }}>
                1000 Hari Pertama Kehidupan
              </h3>
              <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 14 : 16, fontWeight: 400, lineHeight: '1.8', margin: 0 }}>
                Sejak masa kandungan hingga ulang tahun kedua adalah periode emas paling krusial bagi kesehatan anak. NutriGrow memprioritaskan panduan lengkap untuk mengawal fase ini.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: BRAND.greenLight, borderRadius: 99, padding: '6px 16px', alignSelf: 'flex-start', border: '1px solid rgba(98,129,65,0.1)' }}>
                <span style={{ fontSize: 14 }}>🇮🇩</span>
                <span style={{ color: BRAND.greenDark, fontFamily: 'Inter, sans-serif', fontSize: 13, fontWeight: 700, letterSpacing: '0.3px' }}>Untuk keluarga Indonesia</span>
              </div>
            </div>
            <img src={CircleAsset} alt="" aria-hidden="true" style={{ width: isMobileOrTablet ? 100 : 180, height: isMobileOrTablet ? 100 : 180, flexShrink: 0 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 5: Perjalanan Mereka (Testimonials) ─────────────────────────────
const SectionOurStory = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isMobileOrTablet = bp !== 'desktop'
  const paddingInline = getPaddingInline(bp)

  const testimonials = [
    {
      img: User1Img,
      name: 'Dewi Rahayu',
      location: 'Ibu rumah tangga, Yogyakarta',
      text: '"Fitur growth tracker-nya mudah digunakan dan penjelasannya juga mudah dipahami. Saya juga suka karena ada rekomendasi makanan bergizi untuk si kecil."',
    },
    {
      img: User2Img,
      name: 'Siti Nurhaliza',
      location: 'Ibu bekerja, Surabaya',
      text: '"NutriGrow sangat membantu saya yang sibuk bekerja. Fitur Health Log memudahkan pemantauan asupan zat besi dan nutrisi harian anak tanpa perlu ke dokter setiap saat."',
    },
    {
      img: User3Img,
      name: 'Riana Permata',
      location: 'Ibu baru, Bandung',
      text: '"Tampilan NutriGrow simpel dan nyaman dipakai. Fitur konsultasi gizi dan NutriShop memudahkan saya mendapatkan informasi dan produk nutrisi dalam satu aplikasi."',
    },
  ]

  return (
    <div style={{ width: '100%', background: BRAND.white, ...sectionPy(isMobileOrTablet), boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline, display: 'flex', flexDirection: isMobileOrTablet ? 'column' : 'row', gap: isMobileOrTablet ? 48 : 88, alignItems: 'center', boxSizing: 'border-box' }}>

        {/* Photo Container with offset border for premium look */}
        <div style={{ position: 'relative', width: isMobileOrTablet ? '80%' : 460, margin: isMobileOrTablet ? '0 auto' : '0', maxWidth: '100%', flexShrink: 0 }}>
          {/* Decorative background outline frame */}
          <div style={{ position: 'absolute', inset: '16px -16px -16px 16px', borderRadius: 28, border: `3px solid ${BRAND.greenLight}`, pointerEvents: 'none', zIndex: 0 }} />
          
          <div className="img-zoom-container" style={{ position: 'relative', zIndex: 1, borderRadius: 28, overflow: 'hidden', aspectRatio: isMobileOrTablet ? '1/1' : '4/5', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.12)' }}>
            <img src={FamilyImg} alt="Keluarga bahagia" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }} />
          </div>
        </div>

        {/* Right */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 36, minWidth: 0, width: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={sectionLabel(isMobile)}>Perjalanan Mereka</span>
            <h2 style={sectionHeading(bp)}>
              Inspirasi dari Mereka yang{' '}
              <span style={{ color: BRAND.green }}>Telah Memulai.</span>
            </h2>
          </div>

          {/* Testimonials Stack as beautiful cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
            {testimonials.map((t, i) => (
              <div key={i} className="hover-lift" style={{ display: 'flex', gap: 20, alignItems: 'flex-start', background: BRAND.stone50, borderRadius: 24, border: `1px solid ${BRAND.stone200}`, padding: '24px 28px', boxSizing: 'border-box', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.01)' }}>
                {/* Decorative quote icon */}
                <span style={{ position: 'absolute', top: 12, right: 24, fontFamily: 'Georgia, serif', fontSize: 64, lineHeight: 1, color: 'rgba(98, 129, 65, 0.08)', userSelect: 'none', pointerEvents: 'none' }}>“</span>
                
                <img
                  src={t.img} alt={t.name}
                  style={{ width: 56, height: 56, borderRadius: 9999, border: `3px solid ${BRAND.white}`, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', objectFit: 'cover', objectPosition: 'top center', flexShrink: 0 }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1 }}>
                  <span style={{ color: BRAND.stone900, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 15 : 17, fontWeight: 700, lineHeight: '24px' }}>
                    {t.name}
                  </span>
                  <span style={{ color: BRAND.green, fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 600, lineHeight: '18px' }}>
                    {t.location}
                  </span>
                  <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: isMobileOrTablet ? 13.5 : 14.5, fontWeight: 400, lineHeight: '1.75', margin: '8px 0 0', fontStyle: 'italic' }}>
                    {t.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 6: Tim Pengembang ───────────────────────────────────────────────
const SectionTheTeam = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileOrTablet = bp !== 'desktop'
  const paddingInline = getPaddingInline(bp)

  const members = [
    { img: Member1Img, name: 'Rynad Gunawan',      role: 'Team Lead / QA' },
    { img: Member2Img, name: 'Nazwa Nashatasya',   role: 'Frontend Developer' },
    { img: Member3Img, name: 'Siti Nailah Eko',   role: 'Frontend Developer' },
    { img: Member4Img, name: 'Exsfo Al Banjari',  role: 'Backend Developer' },
    { img: Member5Img, name: 'M. Raihan Rizky Zain', role: 'Backend Developer' },
  ]

  return (
    <div style={{ width: '100%', background: BRAND.stone50, ...sectionPy(isMobileOrTablet), boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', paddingInline, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56, boxSizing: 'border-box' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, textAlign: 'center' }}>
          <span style={{ ...sectionLabel(isMobile), textAlign: 'center' }}>Tim Pengembang</span>
          <h2 style={{ ...sectionHeading(bp), textAlign: 'center', maxWidth: 720 }}>
            Dipandu oleh Sains,{' '}
            <span style={{ color: BRAND.green }}>Digerakkan oleh Kepedulian.</span>
          </h2>
          <p style={{ color: BRAND.stone600, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 14 : 16, fontWeight: 400, lineHeight: '1.75', textAlign: 'center', margin: 0, maxWidth: 640 }}>
            Tim multidisiplin kami didorong oleh inovator teknologi, pengembang perangkat lunak, dan talenta digital yang berdedikasi tinggi.
          </p>
        </div>

        {/* Members cards grid — berjajar berlima on non-mobile */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', 
          gap: isMobile ? 16 : isTablet ? 16 : 24, 
          width: '100%',
          maxWidth: 1140
        }}>
          {members.map((m, i) => (
            <div key={i} className="team-card" style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              gap: 16, 
              background: BRAND.white, 
              borderRadius: 24, 
              border: `1px solid ${BRAND.stone200}`, 
              padding: '16px 16px 20px 16px', 
              boxSizing: 'border-box', 
              boxShadow: '0 8px 24px rgba(0,0,0,0.01)',
              gridColumn: (isMobile && i === 4) ? 'span 2' : 'auto', 
              maxWidth: (isMobile && i === 4) ? 210 : 'none',
              justifySelf: (isMobile && i === 4) ? 'center' : 'auto',
              width: '100%'
            }}>
              <div className="img-zoom-container" style={{ position: 'relative', width: '100%', aspectRatio: '3/4', borderRadius: 16, overflow: 'hidden' }}>
                <img src={m.img} alt={m.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: '100%' }}>
                <span style={{ color: BRAND.stone900, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 13 : 15, fontWeight: 700, lineHeight: '22px', textAlign: 'center' }}>
                  {m.name}
                </span>
                <span style={{ color: BRAND.green, fontFamily: 'Inter, sans-serif', fontSize: isMobile ? 10 : 12, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', textAlign: 'center' }}>
                  {m.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 7: CTA ──────────────────────────────────────────────────────────
const SectionReady = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isMobileOrTablet = bp !== 'desktop'
  const paddingInline = getPaddingInline(bp)
  const navigate = useNavigate()

  return (
    <div style={{ position: 'relative', width: '100%', background: 'linear-gradient(135deg, #1C1917 0%, #3F6212 100%)', ...sectionPy(isMobileOrTablet), paddingInline, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, boxSizing: 'border-box', overflow: 'hidden' }}>
      {/* Decorative background vectors */}
      <div style={{ position: 'absolute', top: -120, left: -120, width: 320, height: 320, borderRadius: '50%', background: 'rgba(163,230,53,0.06)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -160, right: -160, width: 440, height: 440, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', pointerEvents: 'none' }} />

      <h2 style={{ position: 'relative', zIndex: 1, fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontSize: bp === 'mobile' ? 24 : bp === 'tablet' ? 36 : 48, lineHeight: isMobileOrTablet ? '34px' : '58px', color: BRAND.white, textAlign: 'center', margin: 0, maxWidth: '100%', whiteSpace: isMobile ? 'normal' : 'nowrap' }}>
        Mari Tumbuh Bersama Kami!
      </h2>
      <p style={{ position: 'relative', zIndex: 1, fontFamily: 'Inter, sans-serif', fontWeight: 400, fontSize: isMobileOrTablet ? 14 : 18, lineHeight: '1.7', color: '#BEF264', textAlign: 'center', margin: 0, maxWidth: 560 }}>
        Bergabunglah menjadi bagian dari ribuan keluarga yang peduli pada pilihan nutrisi setiap hari.
      </p>
      
      <div style={{ position: 'relative', zIndex: 1, display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => { window.scrollTo(0, 0); if (isLoggedIn()) { navigate('/growth-tracker'); } else { navigate('/sign-in'); } }}
	  className="btn-white"
          style={{ display: 'inline-flex', padding: isMobile ? '13px 28px' : '16px 40px', borderRadius: 12, background: BRAND.white, border: 'none', cursor: 'pointer' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: isMobile ? 14 : 16, color: BRAND.stone900, whiteSpace: 'nowrap' }}>Mulai Pemantauan</span>
        </button>

        <button
          onClick={() => { window.scrollTo(0, 0); navigate('/artikel') }}
          className="btn-outline"
          style={{ display: 'inline-flex', padding: isMobile ? '13px 28px' : '16px 40px', borderRadius: 12, border: '2px solid rgba(255,255,255,0.28)', background: 'transparent', cursor: 'pointer' }}
        >
          <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: isMobile ? 14 : 16, color: BRAND.white, whiteSpace: 'nowrap' }}>Jelajahi Artikel</span>
        </button>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
const AboutUs = () => {
  const bp = useBreakpoint()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: BRAND.stone50, width: '100%', overflowX: 'hidden' }}>
      <style>{`
        /* CSS transitions & hover effects */
        .hover-lift {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, background 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.06), 0 10px 15px -5px rgba(0, 0, 0, 0.03);
        }
        
        .img-zoom-container {
          overflow: hidden;
        }
        .img-zoom-container img {
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .img-zoom-container:hover img {
          transform: scale(1.04);
        }
        
        .badge-shimmer {
          background: linear-gradient(120deg, rgba(163,230,53,0.15) 30%, rgba(163,230,53,0.3) 40%, rgba(163,230,53,0.15) 50%);
          background-size: 200% 100%;
          animation: shimmer-badge 3s infinite linear;
        }
        @keyframes shimmer-badge {
          0% { background-position: 120% 0; }
          100% { background-position: -120% 0; }
        }

        .btn-primary {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 20px -5px rgba(98, 129, 65, 0.3);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(98, 129, 65, 0.4);
          filter: brightness(1.05);
        }
        .btn-primary:active {
          transform: translateY(0);
        }

        .btn-white {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
        }
        .btn-white:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(0, 0, 0, 0.2);
          background: #FAFAF9;
        }
        .btn-white:active {
          transform: translateY(0);
        }

        .btn-outline {
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .btn-outline:hover {
          transform: translateY(-2px);
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.6) !important;
        }
        .btn-outline:active {
          transform: translateY(0);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.75) !important;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.45) !important;
          box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.08) !important;
        }

        .team-card {
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.08);
          border-color: rgba(98, 129, 65, 0.2) !important;
        }

        .text-gradient-lime {
          background: linear-gradient(135deg, #BEF264 0%, #A3E635 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
      <SectionOurRoots bp={bp} />
      <SectionOurMission bp={bp} />
      <SectionSDG bp={bp} />
      <SectionThePurpose bp={bp} />
      <SectionOurStory bp={bp} />
      <SectionTheTeam bp={bp} />
      <SectionReady bp={bp} />
    </div>
  )
}

export default AboutUs
