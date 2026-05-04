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

// ─── Shared padding helper ─────────────────────────────────────────────────────
const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '24px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Auth helper (sesuaikan dengan auth system Anda) ─────────────────────────
const isLoggedIn = (): boolean => {
  return !!localStorage.getItem('token') 
}

// ─── Avatar Bubbles ───────────────────────────────────────────────────────────
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

// ─── Section 1: Awal Perjalanan Kami ─────────────────────────────────────────────────────
const SectionOurRoots = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const paddingInline = getPaddingInline(bp)

  const navigate = useNavigate()

  return (
    <div
      style={{
        width: '100%',
        height: isMobile ? 420 : 628,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background garden image — melebar penuh */}
      <img
        src={GardenImg}
        alt=""
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
      />
      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(28,25,23,0.80) 0%, rgba(28,25,23,0.40) 50%, rgba(28,25,23,0.00) 100%)',
        }}
      />

      {/* Constrained content container — max-width 1280px, centered */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: isMobile ? 16 : 24,
            maxWidth: isMobile ? '100%' : 896,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              padding: '6px 16px',
              borderRadius: 9999,
              background: 'rgba(163,230,53,0.20)',
              backdropFilter: 'blur(2px)',
            }}
          >
            <span
              style={{
                color: '#BEF264',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobile ? '12px' : 14,
                fontWeight: 700,
                lineHeight: '20px',
                letterSpacing: '1.4px',
                textTransform: 'uppercase',
              }}
            >
              Awal Perjalanan Kami
            </span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 40 : 48,
              lineHeight: isMobile ? '36px' : '56px',
              color: '#FFF',
              margin: 0,
            }}
          >
            Lebih dari Sekadar Pencatat,{' '}
            <span style={{ color: '#A3E635' }}>Kami Adalah Pendamping Anda.</span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              fontSize: isMobile ? 14 : 18,
              lineHeight: isMobile ? '22px' : '30px',
              color: '#E7E5E4',
              margin: 0,
              maxWidth: 670,
            }}
          >
            Langkah pertama untuk generasi yang lebih sehat dimulai dari sini. Pantau pertumbuhan anak
            dan asupan gizi secara presisi dalam satu platform terpadu.
          </p>

          {/* CTA Button — warna #628141 */}
          <button
            onClick={() => navigate('/sign-in')}
            style={{
              display: 'flex',
              padding: isMobile ? '12px 24px' : '17px 32px',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 12,
              border: 'none',
              background: '#628141',
              boxShadow:
                '0 20px 25px -5px rgba(28,25,23,0.20), 0 8px 10px -6px rgba(28,25,23,0.20)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.background = '#4d6632'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.background = '#628141'
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                fontSize: isMobile ? 14 : 16,
                lineHeight: isMobile ? '14px' : '24px',
                color: '#FFF',
                whiteSpace: 'nowrap',
              }}
            >
              Mulai Sekarang
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section 2: Alasan Kami Hadir ───────────────────────────────────────────────────
const SectionOurMission = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileOrTablet = isMobile || isTablet
  const paddingInline = getPaddingInline(bp)

  return (
    <div
      style={{
        width: '100%',
        background: '#FFF',
        paddingTop: isMobileOrTablet ? 40 : 48,
        paddingBottom: isMobileOrTablet ? 40 : 56,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          display: 'flex',
          flexDirection: 'column',
          gap: 32,
          boxSizing: 'border-box',
        }}
      >
        {/* Label */}
        <span
          style={{
            color: '#A8A29E',
            fontFamily: 'Inter, sans-serif',
            fontSize: isMobile ? '12px' : 14,
            fontWeight: 600,
            lineHeight: isMobile ? '14px' : '20px',
            letterSpacing: '1.4px',
            textTransform: 'uppercase',
          }}
        >
          Alasan Kami Hadir
        </span>

        {/* Heading */}
        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 42 : 48,
            lineHeight: isMobile ? '36px' : '56px',
            color: '#1C1917',
            margin: 0,
          }}
        >
          Misi Kami untuk{' '}
          <span style={{ color: '#628141' }}>Indonesia.</span>
        </h2>

        {/* Cards grid — mobile & tablet: 1 kolom, desktop: 2 kolom */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : '1fr 1fr',
            gap: 24,
          }}
        >
          {/* Visi Kami card */}
          <div
            style={{
              display: 'flex',
              padding: isMobileOrTablet ? '32px' : '48px 48px 80px 48px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 16,
              borderRadius: 32,
              background: '#3F6212',
              boxSizing: 'border-box',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="55" height="38" viewBox="0 0 55 38" fill="none">
              <path d="M27.5 30C30.625 30 33.2812 28.9062 35.4688 26.7188C37.6562 24.5312 38.75 21.875 38.75 18.75C38.75 15.625 37.6562 12.9688 35.4688 10.7812C33.2812 8.59375 30.625 7.5 27.5 7.5C24.375 7.5 21.7188 8.59375 19.5312 10.7812C17.3438 12.9688 16.25 15.625 16.25 18.75C16.25 21.875 17.3438 24.5312 19.5312 26.7188C21.7188 28.9062 24.375 30 27.5 30ZM27.5 25.5C25.625 25.5 24.0312 24.8438 22.7188 23.5312C21.4062 22.2188 20.75 20.625 20.75 18.75C20.75 16.875 21.4062 15.2812 22.7188 13.9688C24.0312 12.6562 25.625 12 27.5 12C29.375 12 30.9688 12.6562 32.2812 13.9688C33.5938 15.2812 34.25 16.875 34.25 18.75C34.25 20.625 33.5938 22.2188 32.2812 23.5312C30.9688 24.8438 29.375 25.5 27.5 25.5ZM27.5 37.5C21.4167 37.5 15.875 35.8021 10.875 32.4062C5.875 29.0104 2.25 24.4583 0 18.75C2.25 13.0417 5.875 8.48958 10.875 5.09375C15.875 1.69792 21.4167 0 27.5 0C33.5833 0 39.125 1.69792 44.125 5.09375C49.125 8.48958 52.75 13.0417 55 18.75C52.75 24.4583 49.125 29.0104 44.125 32.4062C39.125 35.8021 33.5833 37.5 27.5 37.5ZM27.5 32.5C32.2083 32.5 36.5312 31.2604 40.4688 28.7812C44.4062 26.3021 47.4167 22.9583 49.5 18.75C47.4167 14.5417 44.4062 11.1979 40.4688 8.71875C36.5312 6.23958 32.2083 5 27.5 5C22.7917 5 18.4688 6.23958 14.5312 8.71875C10.5938 11.1979 7.58333 14.5417 5.5 18.75C7.58333 22.9583 10.5938 26.3021 14.5312 28.7812C18.4688 31.2604 22.7917 32.5 27.5 32.5Z" fill="#A3E635"/>
            </svg>
            <span
              style={{
                color: '#FFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 22 : 30,
                fontWeight: 700,
                lineHeight: '36px',
              }}
            >
              Visi Kami
            </span>
            <p
              style={{
                color: '#D6D3D1',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 15 : 20,
                fontWeight: 400,
                lineHeight: isMobileOrTablet ? '22px' : '32.5px',
                textAlign: 'justify',
                margin: 0,
              }}
            >
              "Mewujudkan generasi bebas stunting melalui pemenuhan gizi yang inklusif dan preventif."
            </p>
          </div>

          {/* Misi Kami card */}
          <div
            style={{
              display: 'flex',
              padding: isMobileOrTablet ? '32px' : '48px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 16,
              borderRadius: 32,
              background: '#ECFCCB',
              boxSizing: 'border-box',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="38" height="43" viewBox="0 0 38 43" fill="none">
              <path d="M0 42.5V0H22.5L23.5 5H37.5V30H20L19 25H5V42.5H0ZM24.125 25H32.5V10H19.375L18.375 5H5V20H23.125L24.125 25Z" fill="#628141"/>
            </svg>
            <span
              style={{
                color: '#3F6212',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 22 : 30,
                fontWeight: 700,
                lineHeight: '36px',
              }}
            >
              Misi Kami
            </span>
            <p
              style={{
                color: '#44403C',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 15 : 20,
                fontWeight: 400,
                lineHeight: isMobileOrTablet ? '22px' : '32.5px',
                textAlign: 'justify',
                margin: 0,
              }}
            >
              "Mendigitalisasi deteksi dini malnutrisi, memperluas akses konsultasi gizi profesional,
              dan menyediakan wadah pemenuhan nutrisi yang tepercaya bagi ibu hamil, ibu menyusui,
              remaja dan balita."
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 3: TUJUAN KAMI ───────────────────────────────────────────────────
const SectionThePurpose = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileOrTablet = isMobile || isTablet
  const paddingInline = getPaddingInline(bp)

  return (
    <div
      style={{
        width: '100%',
        background: '#FAFAF9',
        paddingTop: isMobileOrTablet ? 40 : 60,
        paddingBottom: isMobileOrTablet ? 40 : 60,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          display: 'flex',
          flexDirection: 'column',
          gap: isMobileOrTablet ? 40 : 48,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Section label */}
          <span
            style={{
              color: '#A8A29E',
              fontFamily: 'Inter, sans-serif',
              fontSize: isMobile ? '12px' : 14,
            fontWeight: 600,
            lineHeight: isMobile ? '14px' : '20px',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
            }}
          >
            Tujuan Kami
          </span>

          {/* Heading + description row — desktop: row, mobile & tablet: column */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobileOrTablet ? 'column' : 'row',
              alignItems: isMobileOrTablet ? 'flex-start' : 'stretch',
              gap: isMobileOrTablet ? 16 : 30,
              width: '100%',
            }}
          >
            {/* Heading */}
            <h2
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 900,
                fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 42 : 48,
                lineHeight: isMobile ? '36px' : '56px',
                color: '#1C1917',
                margin: 0,
                flex: 1,
                width: '100%',
              }}
            >
              <strong>Mencegah Stunting Melalui{' '}
              <span style={{ color: '#628141' }}>Pemenuhan Gizi.</span></strong>
            </h2>

            {/* Description */}
            <div
              style={{
                display: 'flex',
                flex: 1,
                width: '100%',
                minHeight: isMobileOrTablet ? 'auto' : 167,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: isMobileOrTablet ? 24 : 32,
                border: '1px solid #E7E5E4',
                padding: isMobileOrTablet ? '16px 20px' : '24px 32px',
                boxSizing: 'border-box',
              }}
            >
              <p
                style={{
                  color: '#57534E',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isMobileOrTablet ? 14 : 16,
                  fontWeight: 400,
                  lineHeight: isMobileOrTablet ? '24px' : '29.25px',
                  textAlign: 'justify',
                  margin: 0,
                }}
              >
                Stunting pada anak bukan sekadar masalah tinggi badan melainkan berdampak pada
                perkembangan otak, imunitas, dan potensi masa depan mereka. Kami hadir menjembatani
                sains klinis dengan pola asuh sehari-hari.
              </p>
            </div>
          </div>
        </div>

        {/* Grid — desktop: 3 columns, mobile & tablet: 1 column */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobileOrTablet ? '1fr' : 'repeat(3, minmax(0, 1fr))',
            gridAutoRows: 'auto',
            rowGap: 24,
            columnGap: 24,
          }}
        >
          {/* Mom Feeding image card — spans 2 cols on desktop only */}
          <div
            style={{
              gridColumn: isMobileOrTablet ? '1' : '1 / span 2',
              borderRadius: 32,
              overflow: 'hidden',
              position: 'relative',
              minHeight: isMobileOrTablet ? 280 : 452,
            }}
          >
            <img
              src={MotherFeedingImg}
              alt="Mother feeding child"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
              }}
            />
            {/* Dark overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(28,25,23,0.20)',
              }}
            />
            {/* Floating card */}
            <div
              style={{
                position: 'absolute',
                bottom: 24,
                left: 24,
                width: isMobileOrTablet ? 'calc(100% - 48px)' : 384,
                maxWidth: 384,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.30)',
                background: 'rgba(255,255,255,0.70)',
                backdropFilter: 'blur(6px)',
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                boxSizing: 'border-box',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
                <path d="M12.375 25.5371C11.55 25.5371 10.7188 25.4433 9.88125 25.2558C9.04375 25.0683 8.1875 24.7996 7.3125 24.4496C7.6125 21.4246 8.4875 18.5996 9.9375 15.9746C11.3875 13.3496 13.25 11.0371 15.525 9.03708C12.775 10.4371 10.3938 12.2871 8.38125 14.5871C6.36875 16.8871 4.9625 19.5121 4.1625 22.4621C4.0625 22.3871 3.96875 22.3058 3.88125 22.2183C3.79375 22.1308 3.7 22.0371 3.6 21.9371C2.425 20.7621 1.53125 19.4496 0.91875 17.9996C0.30625 16.5496 0 15.0371 0 13.4621C0 11.7621 0.3375 10.1371 1.0125 8.58708C1.6875 7.03708 2.625 5.66208 3.825 4.46208C5.85 2.43708 8.475 1.11833 11.7 0.505829C14.925 -0.106671 19.45 -0.162921 25.275 0.337079C25.725 6.31208 25.65 10.8683 25.05 14.0058C24.45 17.1433 23.15 19.7121 21.15 21.7121C19.925 22.9371 18.5563 23.8808 17.0438 24.5433C15.5313 25.2058 13.975 25.5371 12.375 25.5371Z" fill="#628141"/>
              </svg>
              <span
                style={{
                  color: '#1C1917',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isMobileOrTablet ? 18 : 24,
                  fontWeight: 600,
                  lineHeight: '32px',
                }}
              >
                Kesehatan Berkelanjutan
              </span>
              <p
                style={{
                  color: '#57534E',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 14, 
                  fontWeight: 400,
                  lineHeight: '20px',
                  margin: 0,
                }}
              >
                Memberdayakan keluarga melalui edukasi kesehatan yang berdampak melintasi generasi.
              </p>
            </div>
          </div>
          
          {/* Akurasi Tumbuh Kembang card */}
          <div
            style={{
              gridColumn: isMobileOrTablet ? '1' : '3',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center', 
              alignItems: 'flex-start',
              alignSelf: 'stretch',
              // Padding tetap ada agar konten tidak menyentuh tepi
              padding: isMobileOrTablet ? '32px' : '48px', 
              // Gap antar 3 elemen (Angka, Judul, Deskripsi) sekarang sama dan konsisten
              gap: isMobileOrTablet ? '16px' : '20px', 
              borderRadius: 32,
              background: '#3F6212',
              // minHeight tetap diperlukan agar kartu punya ruang untuk "centering" 
              // jika kontennya sedikit, tapi akan auto membesar jika konten banyak.
              minHeight: isMobileOrTablet ? 250 : 380, 
              boxSizing: 'border-box',
            }}
          >
            {/* 1. Angka 95% */}
            <span
              style={{
                color: '#A3E635',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? '48px' : '64px',
                fontWeight: 600,
                lineHeight: '1',
                margin: 0,
              }}
            >
              95%
            </span>

            {/* 2. Judul */}
            <span
              style={{
                color: '#FFF',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 18 : 22,
                fontWeight: 500,
                lineHeight: '1.2',
                margin: 0,
              }}
            >
              Akurasi Tumbuh Kembang
            </span>

            {/* 3. Deskripsi */}
            <p
              style={{
                color: '#A8A29E',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 14 : 16,
                fontWeight: 400,
                lineHeight: '1.6',
                textAlign: 'left',
                margin: 0,
                width: '100%',
              }}
            >
              Algoritma kami memantau pertumbuhan dengan presisi klinis, memberikan peringatan
              dini kepada orang tua mengenai potensi kekurangan gizi sebelum menjadi masalah yang
              lebih besar.
            </p>
          </div>

          {/* Fokus Kognitif card */}
          <div
            style={{
              gridColumn: isMobileOrTablet ? '1' : '1',
              display: 'flex',
              padding: isMobileOrTablet ? '32px' : '48px',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 12,
              borderRadius: 32,
              background: '#ECFCCB',
              boxSizing: 'border-box',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="39" height="40" viewBox="0 0 39 40" fill="none">
              <path d="M6 40V31.4C4.1 29.6667 2.625 27.6417 1.575 25.325C0.525 23.0083 0 20.5667 0 18C0 13 1.75 8.75 5.25 5.25C8.75 1.75 13 0 18 0C22.1667 0 25.8583 1.225 29.075 3.675C32.2917 6.125 34.3833 9.31667 35.35 13.25L37.95 23.5C38.1167 24.1333 38 24.7083 37.6 25.225C37.2 25.7417 36.6667 26 36 26H32V32C32 33.1 31.6083 34.0417 30.825 34.825C30.0417 35.6083 29.1 36 28 36H24V40H20V32H28V22H33.4L31.5 14.25C30.7333 11.2167 29.1 8.75 26.6 6.85C24.1 4.95 21.2333 4 18 4C14.1333 4 10.8333 5.35 8.1 8.05C5.36667 10.75 4 14.0333 4 17.9C4 19.9 4.40833 21.8 5.225 23.6C6.04167 25.4 7.2 27 8.7 28.4L10 29.6V40H6ZM16 26H20L20.3 23.5C20.5667 23.4 20.8083 23.2833 21.025 23.15C21.2417 23.0167 21.4333 22.8667 21.6 22.7L23.9 23.7L25.9 20.3L23.9 18.8C23.9667 18.5333 24 18.2667 24 18C24 17.7333 23.9667 17.4667 23.9 17.2L25.9 15.7L23.9 12.3L21.6 13.3C21.4333 13.1333 21.2417 12.9833 21.025 12.85C20.8083 12.7167 20.5667 12.6 20.3 12.5L20 10H16L15.7 12.5C15.4333 12.6 15.1917 12.7167 14.975 12.85C14.7583 12.9833 14.5667 13.1333 14.4 13.3L12.1 12.3L10.1 15.7L12.1 17.2C12.0333 17.4667 12 17.7333 12 18C12 18.2667 12.0333 18.5333 12.1 18.8L10.1 20.3L12.1 23.7L14.4 22.7C14.5667 22.8667 14.7583 23.0167 14.975 23.15C15.1917 23.2833 15.4333 23.4 15.7 23.5L16 26ZM18 21C17.1667 21 16.4583 20.7083 15.875 20.125C15.2917 19.5417 15 18.8333 15 18C15 17.1667 15.2917 16.4583 15.875 15.875C16.4583 15.2917 17.1667 15 18 15C18.8333 15 19.5417 15.2917 20.125 15.875C20.7083 16.4583 21 17.1667 21 18C21 18.8333 20.7083 19.5417 20.125 20.125C19.5417 20.7083 18.8333 21 18 21Z" fill="#628141"/>
            </svg>
            <span
              style={{
                color: '#1C1917',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 18 : 24,
                fontWeight: 600,
                lineHeight: '32px',
              }}
            >
              Fokus Kognitif
            </span>
            <p
              style={{
                color: '#44403C',
                fontFamily: 'Inter, sans-serif',
                fontSize: isMobileOrTablet ? 14 : 16,
                fontWeight: 400,
                lineHeight: '24px',
                textAlign: 'justify',
                margin: 0,
              }}
            >
              Gizi bukan sekadar sumber tenaga, melainkan fondasi utama fungsi kognitif. Kami
              mengutamakan pemenuhan mikronutrien untuk mencerdaskan generasi muda.
            </p>
          </div>

          {/* 1000 Hari card */}
          <div
            style={{
              gridColumn: isMobileOrTablet ? '1' : '2 / span 2',
              display: 'flex',
              padding: isMobileOrTablet ? '32px' : '48px',
              alignItems: 'center',
              gap: isMobileOrTablet ? 24 : 48,
              borderRadius: 32,
              border: '1px solid #E7E5E4',
              background: '#FFF',
              flexDirection: isMobileOrTablet ? 'column' : 'row',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
              <h3
                style={{
                  color: '#1C1917',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: isMobileOrTablet ? 22 : 30,
                  fontWeight: 900,
                  lineHeight: '36px',
                  margin: 0,
                }}
              >
                1000 Hari Pertama Kehidupan
              </h3>
              <p
                style={{
                  color: '#57534E',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isMobileOrTablet ? 14 : 16,
                  fontWeight: 400,
                  lineHeight: '24px',
                  textAlign: 'justify',
                  margin: 0,
                }}
              >
                Sejak masa kandungan hingga ulang tahun kedua adalah periode emas paling krusial
                bagi kesehatan anak. NutriGrow memprioritaskan panduan lengkap untuk mengawal fase
                ini.
              </p>
              <div
                style={{
                  display: 'flex',
                  paddingTop: 8,
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <AvatarBubbles />
                <span
                  style={{
                    color: '#1C1917',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 14,
                    fontWeight: 700,
                    lineHeight: '20px',
                  }}
                >
                  Dipercaya oleh 50.000+ Ibu
                </span>
              </div>
            </div>
            <img
              src={CircleAsset}
              alt=""
              aria-hidden="true"
              style={{
                width: isMobileOrTablet ? 120 : 192,
                height: isMobileOrTablet ? 120 : 192,
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Section 4: PERJALANAN MEREKA ────────────────────────────────────
const SectionOurStory = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileOrTablet = isMobile || isTablet
  const paddingInline = getPaddingInline(bp)

  const testimonials = [
    {
      img: Member1Img,
      name: 'Pengguna 1',
      text: '"Fitur growth tracker-nya mudah digunakan dan penjelasannya juga mudah dipahami. Saya juga suka karena ada rekomendasi makanan bergizi."',
    },
    {
      img: Member2Img,
      name: 'Pengguna 2',
      text: '"NutriGrow bagus banget untuk ibu yang ingin lebih aware dengan nutrisi anak. Saya paling sering pakai fitur Health Log untuk tracking zat besi."',
    },
    {
      img: Member3Img,
      name: 'Pengguna 3',
      text: '"Saya suka dengan NutriGrow karena tampilannya simpel dan nyaman dipakai. Fitur konsultasi dan NutriShop juga memudahkan saya mendapatkan informasi dan produk nutrisi dalam satu aplikasi."',
    },
  ]

  return (
    <div
      style={{
        width: '100%',
        background: '#FFF',
        paddingTop: isMobileOrTablet ? 40 : 56,
        paddingBottom: isMobileOrTablet ? 40 : 56,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          display: 'flex',
          flexDirection: isMobileOrTablet ? 'column' : 'row',
          gap: isMobileOrTablet ? 40 : 48,
          alignItems: 'flex-start',
          boxSizing: 'border-box',
        }}
      >
        {/* Family image */}
        <div
          style={{
            width: isMobileOrTablet ? '50%' : 480,
            margin: isMobileOrTablet ? '0 auto' : '0',
            maxWidth: '100%',
            flexShrink: 0,
            borderRadius: 24,
            overflow: 'hidden',
            aspectRatio: isMobileOrTablet ? '1/1' : '4/5',
          }}
        >
          <img
            src={FamilyImg}
            alt="Happy family"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
            }}
          />
        </div>

        {/* Right content */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            minWidth: 0,
          }}
        >
          <span
            style={{
              color: '#A8A29E',
              fontFamily: 'Inter, sans-serif',
              fontSize: isMobile ? '12px' : 14,
              fontWeight: 600,
              lineHeight: isMobile ? '14px' : '20px',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
            }}
          >
            Perjalanan Mereka
          </span>

          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 42 : 48,
              lineHeight: isMobile ? '36px' : '56px',
              color: '#1C1917',
              margin: 0,
            }}
          >
            Inspirasi dari Mereka yang{' '}
            <span style={{ color: '#628141' }}>Telah Memulai.</span>
          </h2>

          {/* Testimonials */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40, paddingTop: 8 }}>
            {testimonials.map((t, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <img
                  src={t.img}
                  alt={t.name}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 9999,
                    border: '2px solid rgba(98,129,65,0.20)',
                    objectFit: 'cover',
                    flexShrink: 0,
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span
                    style={{
                      color: '#1C1917',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: isMobileOrTablet ? 16 : 20,
                      fontWeight: 600,
                      lineHeight: '28px',
                    }}
                  >
                    {t.name}
                  </span>
                  <p
                    style={{
                      color: '#57534E',
                      fontFamily: 'Inter, sans-serif',
                      fontSize: isMobileOrTablet ? 13 : 16,
                      fontWeight: 400,
                      lineHeight: '24px',
                      textAlign: 'justify',
                      margin: 0,
                    }}
                  >
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

// ─── Section 5: TIM PENGEMBANG ──────────────────────────────────────────────────────
const SectionTheTeam = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const paddingInline = getPaddingInline(bp)

  const members = [
    { img: Member1Img, name: 'Rynad Gunawan', role: 'Team Lead/QA' },
    { img: Member2Img, name: 'Nazwa Nashatasya', role: 'Frontend Developer' },
    { img: Member3Img, name: 'Siti Nailah Eko', role: 'Frontend Developer' },
    { img: Member4Img, name: 'Exsfo Al Banjari', role: 'Backend Developer' },
    { img: Member5Img, name: 'M. Raihan Rizky Zain', role: 'Backend Developer' },
  ]

  return (
    <div
      style={{
        width: '100%',
        background: '#FAFAF9',
        paddingTop: isMobile ? 48 : 60,
        paddingBottom: isMobile ? 48 : 80,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              color: '#A8A29E',
              fontFamily: 'Inter, sans-serif',
              fontSize: isMobile ? '12px' : 14,
              fontWeight: 700,
              lineHeight: isMobile ? '14px' : '20px',
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Tim Pengembang
          </span>
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 42 : 48,
              lineHeight: isMobile ? '36px' : '56px',
              color: '#1C1917',
              textAlign: 'center',
              margin: 0,
              maxWidth: 770,
            }}
          >
            Dipandu oleh Sains,{' '}
            <br />
            <span style={{ color: '#628141' }}>Digerakkan oleh Kepedulian.</span>
          </h2>
          <p
            style={{
              color: '#57534E',
              fontFamily: 'Inter, sans-serif',
              fontSize: isMobile ? 14 : 16,
              fontWeight: 400,
              lineHeight: '24px',
              textAlign: 'center',
              margin: 0,
              maxWidth: 680,
            }}
          >
            Tim multidisiplin kami didorong oleh inovator teknologi, pengembang perangkat lunak, dan
            talenta digital yang berdedikasi tinggi.
          </p>
        </div>

        {/* Members */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: isMobile ? 24 : 32,
            width: '100%',
          }}
        >
          {members.map((m, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                width: isMobile ? 'calc(50% - 12px)' : 200,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  position: 'relative',
                  width: bp === 'mobile' ? 118 : bp === 'tablet' ? 118 : 218,
                  height: bp === 'mobile' ? 163 : bp === 'tablet' ? 163 : 273,
                  borderRadius: 16,
                  background: 'rgba(54, 83, 20, 1.0)',
                  overflow: 'hidden',
                }}
              >
                <img
                  src={m.img}
                  alt={m.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 0,
                    objectFit: 'cover',
                    objectPosition: 'top center',
                  }}
                />
              </div>

              <span
                style={{
                  color: '#1C1917',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isMobile ? 14 : 18,
                  fontWeight: 600,
                  lineHeight: '28px',
                  textAlign: 'center',
                }}
              >
                {m.name}
              </span>
              <span
                style={{
                  color: '#628141',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: isMobile ? 12 : 14,
                  fontWeight: 500,
                  lineHeight: '5px',
                  textAlign: 'center',
                }}
              >
                {m.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Section 6: KATA AJAKAN ─────────────────────────────────────────────────────────
const SectionReady = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const isMobileorTablet = isMobile || isTablet
  const paddingInline = getPaddingInline(bp)
  const navigate = useNavigate()

  const handleStartTracker = () => {
    if (isLoggedIn()) {
      navigate('/growth-tracker')
    } else {
      navigate('/sign-in')
    }
  }

  const handleExploreArticles = () => {
    navigate('/artikel')
  }

  return (
    <div
      style={{
        width: '100%',
        background: '#3F6212',
        paddingTop: isMobileorTablet ? 48 : 56,
        paddingBottom: isMobileorTablet ? 48 : 56,
        paddingInline,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        boxSizing: 'border-box',
      }}
    >
      <h2
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 900,
          fontSize: bp === 'mobile' ? 28 : bp === 'tablet' ? 42 : 48,
          lineHeight: isMobileorTablet ? '36px' : '56px',
          color: '#FFF',
          textAlign: 'center',
          margin: 0,
        }}
      >
        Mari tumbuh bersama kami !
      </h2>
      <p
        style={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 400,
          fontSize: isMobileorTablet ? 14 : 18,
          lineHeight: '28px',
          color: '#D9F99D',
          textAlign: 'center',
          margin: 0,
          maxWidth: 1280,
        }}
      >
        Bergabunglah menjadi bagian dari ribuan keluarga yang peduli pada pilihan nutrisi setiap hari.
      </p>
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Start Tracker */}
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            handleStartTracker();
          }}
          style={{
            display: 'flex',
            padding: isMobileorTablet ? '14px 28px' : '18px 40px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
            background: '#FFFFFF',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.background = '#f0fdf4'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.background = '#FFFFFF'
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: isMobileorTablet ? 14 : 16,
              lineHeight: '24px',
              color: '#1C1917',
              whiteSpace: 'nowrap',
            }}
          >
            Mulai Pemantauan
          </span>
        </button>

        {/* Jelajahi Artikel */}
        <button
          onClick={() => {
            window.scrollTo(0, 0);
            handleExploreArticles();
          }}
          style={{
            display: 'flex',
            padding: isMobileorTablet ? '14px 28px' : '18px 40px',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
            border: '2px solid rgba(255,255,255,0.30)',
            background: 'transparent',
            cursor: 'pointer',
          }}
          onMouseEnter={e => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.60)'
          }}
          onMouseLeave={e => {
            ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.30)'
          }}
        >
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontWeight: 900,
              fontSize: isMobileorTablet ? 14 : 16,
              lineHeight: '24px',
              color: '#FFF',
              whiteSpace: 'nowrap',
            }}
          >
            Jelajahi Artikel
          </span>
        </button>
      </div>
    </div>
  )
}

// ─── Main About Us Page ───────────────────────────────────────────────────────
const AboutUs = () => {
  const bp = useBreakpoint()

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: '#FAFAF9',
        width: '100%',
        overflowX: 'hidden',
      }}
    >
      <SectionOurRoots bp={bp} />
      <SectionOurMission bp={bp} />
      <SectionThePurpose bp={bp} />
      <SectionOurStory bp={bp} />
      <SectionTheTeam bp={bp} />
      <SectionReady bp={bp} />
    </div>
  )
}

export default AboutUs