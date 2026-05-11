import { useEffect, useState } from 'react'
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { CardArtikel } from '../components/card-artikel'
import { articleService, type ArticleCard } from '../services/article.service'

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

const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = ['Semua', 'MPASI', 'Kehamilan', 'Menyusui', 'Tumbuh Kembang']

const ITEMS_PER_PAGE = 9

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
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i)
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const btn: React.CSSProperties = {
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, paddingTop: 32, paddingBottom: 8 }}>
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        style={{ ...btn, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        <ChevronLeft size={16} />
      </button>
      {getPages().map((page, idx) =>
        page === '...' ? (
          <span key={`e${idx}`} style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-heading), sans-serif', fontSize: 14, color: '#78716C' }}>
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            style={{
              ...btn,
              background: page === currentPage ? '#628141' : '#fff',
              color: page === currentPage ? '#fff' : '#44403C',
              borderColor: page === currentPage ? '#628141' : '#E7E5E4',
              fontWeight: page === currentPage ? 700 : 500,
            }}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        style={{ ...btn, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
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
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1600&q=80'

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
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("${heroImage}")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 30%',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(15,20,10,0.45) 0%, rgba(15,20,10,0.72) 60%, rgba(10,16,8,0.90) 100%)',
        }}
      />

      {/* Content */}
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
        {/* Badge pill */}
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
            ARTIKEL
          </span>
        </div>

        {/* Two-line headline */}
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
            Pusat Literasi
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
            NutriGrow
          </h1>
        </div>

        {/* Subtitle */}
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
          Dapatkan akses ke informasi kesehatan terkini dan edukasi nutrisi yang mendalam. Sumber literasi tepercaya untuk mendukung upaya Anda dalam mewujudkan kualitas hidup yang lebih baik.
        </p>
      </div>
    </div>
  )
}

// ─── Mobile Category Sheet ─────────────────────────────────────────────────────
const MobileCategorySheet = ({
  isOpen,
  onClose,
  categories,
  selected,
  onSelect,
}: {
  isOpen: boolean
  onClose: () => void
  categories: string[]
  selected: string
  onSelect: (cat: string) => void
}) => {
  if (!isOpen) return null
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.4)',
          zIndex: 200,
        }}
      />
      {/* Sheet */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#fff',
          borderRadius: '20px 20px 0 0',
          zIndex: 201,
          padding: '20px 20px 36px',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.12)',
        }}
      >
        {/* Handle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 800, fontSize: 16, color: '#1C1917' }}>
            Pilih Kategori
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <X size={20} color="#78716C" />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {categories.map(cat => {
            const isActive = selected === cat
            return (
              <button
                key={cat}
                onClick={() => { onSelect(cat); onClose() }}
                style={{
                  width: '100%',
                  padding: '12px 18px',
                  borderRadius: 10,
                  border: isActive ? '1.5px solid #628141' : '1.5px solid #E7E5E4',
                  background: isActive ? '#F0FDE4' : '#FAFAF9',
                  color: isActive ? '#3F6212' : '#44403C',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 14,
                  fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )
}

// ─── Artikel Page ─────────────────────────────────────────────────────────────
export default function Artikel() {
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const paddingInline = getPaddingInline(bp)

  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  const [articles, setArticles] = useState<ArticleCard[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const result = await articleService.getArticles({
          kategori: selectedCategory,
          search: searchQuery,
          page: currentPage,
          limit: ITEMS_PER_PAGE,
        })
        setArticles(result.articles)
        setTotalCount(result.total)
        setTotalPages(result.totalPages)
      } catch (err) {
        console.error('Failed to fetch articles:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchArticles()
  }, [selectedCategory, searchQuery, currentPage])

  // Reset to page 1 when filter/search changes
  useEffect(() => { setCurrentPage(1) }, [searchQuery, selectedCategory])

  const handleArticleClick = (id: number) => {
    window.location.href = `/baca-artikel/${id}`
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'var(--font-heading), sans-serif' }}>
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
        {isMobile ? (
          /* ── Mobile toolbar layout ── */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
            {/* Row 1: Filter button + active badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => setMobileSheetOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '9px 16px',
                  background: selectedCategory !== 'Semua' ? '#F0FDE4' : '#fff',
                  border: selectedCategory !== 'Semua' ? '1.5px solid #628141' : '1.5px solid #E7E5E4',
                  borderRadius: 9,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  color: selectedCategory !== 'Semua' ? '#3F6212' : '#44403C',
                  transition: 'all 0.15s',
                }}
              >
                <Filter size={15} strokeWidth={2.2} />
                Filter
              </button>
              {selectedCategory !== 'Semua' && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '5px 12px 5px 14px',
                    background: 'rgba(98,129,65,0.10)',
                    border: '1.5px solid rgba(98,129,65,0.25)',
                    borderRadius: 9999,
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 12, fontWeight: 700, color: '#628141' }}>
                    {selectedCategory}
                  </span>
                  <button
                    onClick={() => setSelectedCategory('Semua')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                  >
                    <X size={13} color="#628141" strokeWidth={2.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Row 2: Search bar full-width */}
            <div style={{ position: 'relative', width: '100%' }}>
              <Search
                size={16}
                color="#A8A29E"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Cari artikel..."
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
                onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#628141')}
                onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4')}
              />
            </div>
          </div>
        ) : (
          /* ── Desktop / Tablet toolbar layout ── */
          <div
            style={{
              display: 'flex',
              flexWrap: isTablet ? 'wrap' : 'nowrap',
              alignItems: isTablet ? 'flex-start' : 'center',
              gap: isTablet ? 10 : 12,
              marginBottom: 28,
            }}
          >
            {/* Category buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                flex: isTablet ? '1 1 100%' : '0 1 auto', 
              }}
            >
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: '9px 20px',
                      borderRadius: 9999,
                      border: isActive ? '1.5px solid #628141' : '1.5px solid #E7E5E4',
                      background: isActive ? '#628141' : '#fff',
                      color: isActive ? '#fff' : '#44403C',
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 13,
                      fontWeight: isActive ? 700 : 500,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      whiteSpace: 'nowrap',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.background = '#F5F5F0'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#D1D5DB'
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        ;(e.currentTarget as HTMLElement).style.background = '#fff'
                        ;(e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4'
                      }
                    }}
                  >
                    {cat}
                  </button>
                )
              })}
            </div>

            {/* Search bar */}
            <div
              style={{
                position: 'relative',
                flex: isTablet ? '1 1 100%' : '0 0 280px',
                marginLeft: isTablet ? 0 : 'auto',
              }}
            >
              <Search
                size={16}
                color="#A8A29E"
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                placeholder="Cari artikel..."
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
                onFocus={e => ((e.currentTarget as HTMLElement).style.borderColor = '#628141')}
                onBlur={e => ((e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4')}
              />
            </div>
          </div>
        )}

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
            Artikel Terbaru
          </h2>
          <p style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#78716C', margin: '3px 0 0' }}>
            Menampilkan <strong style={{ color: '#628141' }}>{totalCount}</strong> artikel
          </p>
        </div>

        {/* ── Articles Grid ── */}
        {loading ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? 16 : 20,
            }}
          >
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
              <div
                key={i}
                style={{
                  background: '#F5F5F4',
                  borderRadius: 16,
                  height: 320,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              />
            ))}
          </div>
        ) : articles.length > 0 ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: isMobile ? 16 : 20,
            }}
          >
            {articles.map(article => (
              <CardArtikel
                key={article.id}
                id={article.id}
                image={article.image ?? undefined}
                title={article.title}
                description={article.description}
                category={article.category}
                readTime={article.readTime}
                onClick={handleArticleClick}
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#78716C', fontFamily: 'var(--font-heading), sans-serif' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <h3 style={{ margin: '0 0 8px', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 18, color: '#1C1917' }}>
              Artikel tidak ditemukan
            </h3>
            <p style={{ margin: 0, fontSize: 14 }}>Coba gunakan kata kunci lain atau pilih kategori yang berbeda.</p>
          </div>
        )}

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>

      {/* ── Mobile Category Sheet ── */}
      <MobileCategorySheet
        isOpen={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        categories={CATEGORIES}
        selected={selectedCategory}
        onSelect={setSelectedCategory}
      />
    </div>
  )
}