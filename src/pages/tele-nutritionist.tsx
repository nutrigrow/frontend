import { useEffect, useState, useRef, type CSSProperties } from 'react'
import { useNavigate } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import { Search, ChevronLeft, ChevronRight, ChevronDown, ClipboardList, X } from 'lucide-react'
import { CardSpesialis } from '../components/card-spesialis'
import { SPESIALIS_CATEGORIES } from '../data/spesialis'
import { teleNutritionistService, type Spesialis } from '../services/teleNutritionist.service'

// ─── Nutri-Green ──────────────────────────────────────────────────────────────
const NUTRI_GREEN = '#628141'

// ─── Breakpoint Helper ────────────────────────────────────────────────────────
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

const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}



// ─── Pagination ───────────────────────────────────────────────────────────────
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (p: number) => void
}) => {
  if (totalPages <= 1) return null

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (currentPage > 3) pages.push('...')
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    )
      pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const btn: CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: 8,
    border: '1px solid #E7E5E4',
    background: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-heading), sans-serif',
    fontSize: 14,
    fontWeight: 500,
    color: '#44403C',
    transition: 'all 0.15s',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingTop: 32,
        paddingBottom: 8,
      }}
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{
          ...btn,
          opacity: currentPage === 1 ? 0.4 : 1,
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span
            key={`e${idx}`}
            style={{
              width: 36,
              textAlign: 'center',
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 14,
              color: '#78716C',
            }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            style={{
              ...btn,
              background: page === currentPage ? NUTRI_GREEN : '#fff',
              color: page === currentPage ? '#fff' : '#44403C',
              borderColor: page === currentPage ? NUTRI_GREEN : '#E7E5E4',
              fontWeight: page === currentPage ? 700 : 500,
            }}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{
          ...btn,
          opacity: currentPage === totalPages ? 0.4 : 1,
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'
  const paddingInline = getPaddingInline(bp)
  const heroImage =
    'https://images.unsplash.com/photo-1675270745543-883eae091a5c?w=1600&q=80'

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        minHeight: isMobile ? 260 : bp === 'tablet' ? 320 : 360,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${heroImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to bottom, rgba(15,20,10,0.45) 0%, rgba(15,20,10,0.72) 60%, rgba(10,16,8,0.90) 100%)',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          paddingTop: isMobile ? 48 : 72,
          paddingBottom: isMobile ? 36 : 52,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: isMobile ? 10 : 14,
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            padding: '4px 14px',
            borderRadius: 9999,
            background: 'rgba(163,230,53,0.18)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(163,230,53,0.28)',
          }}
        >
          <span
            style={{
              color: '#BEF264',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              lineHeight: '18px',
              letterSpacing: '1.8px',
              textTransform: 'uppercase',
            }}
          >
            TELE-NUTRITIONIST
          </span>
        </div>

        <div>
          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: isMobile ? 28 : bp === 'tablet' ? 40 : 52,
              lineHeight: 1.1,
              margin: 0,
              color: '#F5F5F4',
            }}
          >
            Ahli Gizi Profesional,
          </h1>
          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: isMobile ? 28 : bp === 'tablet' ? 40 : 52,
              lineHeight: 1.15,
              margin: 0,
              color: '#8DB96A',
            }}
          >
            Kini Lebih Dekat.
          </h1>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontWeight: 400,
            fontSize: isMobile ? 13 : 15,
            lineHeight: isMobile ? '20px' : '24px',
            color: '#D6D3D1',
            margin: 0,
            maxWidth: 580,
          }}
        >
          Pilih ahli gizi terbaik dari direktori kami. Lihat profil, harga sesi, dan pilih tanggal
          serta jam konsultasi yang pas untuk Anda.
        </p>
      </div>
    </div>
  )
}

// ─── Category Dropdown ────────────────────────────────────────────────────────
const CategoryDropdown = ({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (cat: string) => void
}) => {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isActive = selected !== 'Semua'

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 16px',
          height: 42,
          borderRadius: 10,
          border: isActive ? `1.5px solid ${NUTRI_GREEN}` : '1.5px solid #E7E5E4',
          background: isActive ? '#F0FDE4' : '#fff',
          color: isActive ? '#3F6212' : '#44403C',
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 13,
          fontWeight: isActive ? 700 : 500,
          cursor: 'pointer',
          transition: 'all 0.15s',
          whiteSpace: 'nowrap',
          minWidth: 250,
          justifyContent: 'space-between',
          boxSizing: 'border-box',
        }}
      >
        <span>{selected === 'Semua' ? 'Semua Kategori' : selected}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {isActive && (
            <span
              onClick={e => {
                e.stopPropagation()
                onSelect('Semua')
                setOpen(false)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: 2,
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              <X size={12} color='#3F6212' strokeWidth={2.5} />
            </span>
          )}
          <ChevronDown
            size={14}
            color={isActive ? '#3F6212' : '#78716C'}
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              minWidth: '100%',
              background: '#fff',
              border: '1.5px solid #E7E5E4',
              borderRadius: 12,
              boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
              zIndex: 100,
              overflow: 'hidden',
              padding: '6px',
            }}
          >
            {SPESIALIS_CATEGORIES.map(cat => {
              const isCurrent = selected === cat
              return (
                <button
                  key={cat}
                  onClick={() => {
                    onSelect(cat)
                    setOpen(false)
                  }}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: 8,
                    border: 'none',
                    background: isCurrent ? '#F0FDE4' : 'transparent',
                    color: isCurrent ? '#3F6212' : '#44403C',
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    fontWeight: isCurrent ? 700 : 500,
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                  onMouseEnter={e => {
                    if (!isCurrent)
                      (e.currentTarget as HTMLElement).style.background = '#FAFAF9'
                  }}
                  onMouseLeave={e => {
                    if (!isCurrent)
                      (e.currentTarget as HTMLElement).style.background = 'transparent'
                  }}
                >
                  <span>{cat}</span>
                  {isCurrent && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        background: NUTRI_GREEN,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Konsultasi Saya Icon Button ──────────────────────────────────────────────
const KonsultasiButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    title='Konsultasi Saya'
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: 42,
      padding: '0 12px',
      borderRadius: 10,
      border: '1.5px solid #E7E5E4',
      background: '#fff',
      cursor: 'pointer',
      fontSize: 13,
      flexShrink: 0,
      transition: 'all 0.2s',
      position: 'relative',
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = NUTRI_GREEN
      el.style.background = '#F0F7E8'
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement
      el.style.borderColor = '#E7E5E4'
      el.style.background = '#fff'
    }}
  >
    <ClipboardList size={18} color={NUTRI_GREEN} strokeWidth={2} />
    Konsultasi Saya
  </button>
)

// ─── Tele-Nutritionist Page ───────────────────────────────────────────────────
export default function TeleNutritionist() {
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const paddingInline = getPaddingInline(bp)

  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [specialists, setSpecialists] = useState<Spesialis[]>([])
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchSpecialists = async () => {
    setLoading(true)
    try {
      const result = await teleNutritionistService.getSpecialists({
        search: searchQuery,
        category: selectedCategory,
        page: currentPage,
      })
      setSpecialists(result.specialists)
      setTotalPages(result.pagination.totalPages)
      setTotalCount(result.pagination.total)
    } catch (error) {
      console.error('Failed to fetch specialists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSpecialists()
  }, [selectedCategory, searchQuery, currentPage])

  const handleSpesialisClick = (id: number) => {
    navigate(`/detail-spesialis/${id}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedCategory])

  return (
    <div
      style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'var(--font-heading), sans-serif' }}
    >
      <HeroSection bp={bp} />

      {/* ── Main Content ── */}
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline,
          paddingTop: 32,
          paddingBottom: 60,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Toolbar: Dropdown + Search + Konsultasi Icon ── */}
        <div style={{ marginBottom: 28 }}>
          {isMobile ? (
            /* ── Mobile: Dropdown row + Search row ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Row 1: Dropdown + Konsultasi icon */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <CategoryDropdown selected={selectedCategory} onSelect={setSelectedCategory} />
                </div>
                <KonsultasiButton onClick={() => navigate('/konsultasi-saya')} />
              </div>
              {/* Row 2: Search */}
              <div style={{ position: 'relative', width: '100%' }}>
                <Search
                  size={16}
                  color='#A8A29E'
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type='text'
                  placeholder='Cari spesialis, keahlian...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    border: '1.5px solid #E7E5E4',
                    borderRadius: 10,
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    color: '#1C1917',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    height: 42,
                  }}
                  onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = NUTRI_GREEN)}
                  onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4')}
                />
              </div>
            </div>
          ) : (
            /* ── Tablet / Desktop: Single row ── */
            <div
              style={{
                display: 'flex',
                flexWrap: isTablet ? 'wrap' : 'nowrap',
                alignItems: 'center',
                gap: 10,
              }}
            >
              {/* Category Dropdown */}
              <CategoryDropdown selected={selectedCategory} onSelect={setSelectedCategory} />

              {/* Search bar */}
              <div
                style={{
                  position: 'relative',
                  flex: isTablet ? '1 1 200px' : '0 0 300px',
                  marginLeft: isTablet ? 0 : 'auto',
                }}
              >
                <Search
                  size={16}
                  color='#A8A29E'
                  style={{
                    position: 'absolute',
                    left: 13,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type='text'
                  placeholder='Cari nama, spesialisasi...'
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px 10px 38px',
                    border: '1.5px solid #E7E5E4',
                    borderRadius: 10,
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    color: '#1C1917',
                    outline: 'none',
                    background: '#fff',
                    boxSizing: 'border-box',
                    height: 42,
                  }}
                  onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = NUTRI_GREEN)}
                  onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4')}
                />
              </div>

              {/* Konsultasi Saya Icon */}
              <KonsultasiButton onClick={() => navigate('/konsultasi-saya')} />
            </div>
          )}
        </div>

        {/* ── Section Title ── */}
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: isMobile ? 20 : 24,
              color: '#1C1917',
              margin: 0,
              lineHeight: '1.2',
            }}
          >
            {selectedCategory === 'Semua' ? 'Semua Spesialis' : selectedCategory}
          </h2>
          <p
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 13,
              color: '#78716C',
              margin: '4px 0 0',
            }}
          >
            Menampilkan{' '}
            <strong style={{ color: NUTRI_GREEN }}>{totalCount}</strong> profesional bersertifikat
          </p>
        </div>

        {/* ── Specialist Grid ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <p style={{ color: '#78716C' }}>Memuat spesialis...</p>
          </div>
        ) : specialists.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? 16 : 20,
            }}
          >
            {specialists.map(sp => (
              <CardSpesialis key={sp.id} spesialis={sp} onClick={handleSpesialisClick} />
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#78716C',
              fontFamily: 'var(--font-heading), sans-serif',
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3
              style={{
                margin: '0 0 8px',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: '#1C1917',
              }}
            >
              Spesialis tidak ditemukan
            </h3>
            <p style={{ margin: 0, fontSize: 14 }}>
              Coba gunakan kata kunci lain atau pilih kategori yang berbeda.
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}