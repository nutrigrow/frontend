import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Clock,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react'
import { DUMMY_ARTICLES, getArticleContent, type Article, type ArticleSection } from '../data/articles'
import { CardArtikel } from '../components/card-artikel'

// ─── Breakpoint Hook ──────────────────────────────────────────────────────────
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

// ─── Category Color Map ───────────────────────────────────────────────────────
const CATEGORY_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  MPASI: { bg: '#ECFCCB', text: '#3F6212', border: '#D9F99D' },
  Kehamilan: { bg: '#FEE2E2', text: '#9F1239', border: '#FECACA' },
  Menyusui: { bg: '#E0F2FE', text: '#075985', border: '#BAE6FD' },
  'Tumbuh Kembang': { bg: '#FFF7ED', text: '#9A3412', border: '#FED7AA' },
}

// ─── Section Renderer ─────────────────────────────────────────────────────────
function RenderSection({
  section,
  isMobile,
}: {
  section: ArticleSection
  isMobile: boolean
}) {
  if (section.type === 'heading2') {
    return (
      <h2
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          fontSize: isMobile ? 20 : 26,
          color: '#1C1917',
          margin: '36px 0 14px',
          lineHeight: 1.3,
          letterSpacing: '-0.3px',
        }}
      >
        {section.text}
      </h2>
    )
  }

  if (section.type === 'heading3') {
    return (
      <h3
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 600,
          fontSize: isMobile ? 17 : 20,
          color: '#292524',
          margin: '28px 0 10px',
          lineHeight: 1.35,
        }}
      >
        {section.text}
      </h3>
    )
  }

  if (section.type === 'paragraph') {
    return (
      <p
        style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: isMobile ? 14 : 16,
          color: '#44403C',
          lineHeight: 1.8,
          margin: '0 0 16px',
        }}
      >
        {section.text}
      </p>
    )
  }

  if (section.type === 'list') {
    return (
      <ul
        style={{
          listStyle: 'none',
          padding: 0,
          margin: '16px 0 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {section.items.map((item, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
            }}
          >
            <CheckCircle2
              size={18}
              color="#65A30D"
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <span
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: isMobile ? 14 : 15,
                color: '#1C1917',
                lineHeight: 1.65,
              }}
            >
              {item.label && (
                <strong style={{ fontWeight: 700, color: '#292524' }}>
                  {item.label}:{' '}
                </strong>
              )}
              {item.text}
            </span>
          </li>
        ))}
      </ul>
    )
  }

  if (section.type === 'blockquote') {
    return (
      <blockquote
        style={{
          margin: '32px 0',
          padding: isMobile ? '16px 20px' : '20px 28px',
          background: 'linear-gradient(135deg, #F7FEE7 0%, #ECFCCB 100%)',
          borderLeft: '5px solid #84CC16',
          borderRadius: '0 12px 12px 0',
          boxShadow: '0 2px 12px rgba(132,204,22,0.10)',
        }}
      >
        <p
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 500,
            fontSize: isMobile ? 15 : 18,
            color: '#44403C',
            lineHeight: 1.7,
            margin: 0,
            fontStyle: 'italic',
          }}
        >
          {section.text}
        </p>
      </blockquote>
    )
  }

  if (section.type === 'images') {
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: 16,
          margin: '28px 0',
        }}
      >
        {section.items.map((img, idx) => (
          <div
            key={idx}
            style={{
              borderRadius: 16,
              overflow: 'hidden',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              aspectRatio: '4/3',
              background: '#F5F5F0',
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  return null
}

// ─── Article Not Found ────────────────────────────────────────────────────────
function ArticleNotFound() {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 24,
        padding: '40px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: '#FEF2F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 36,
        }}
      >
        🔍
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 900,
            fontSize: 28,
            color: '#1C1917',
            margin: '0 0 8px',
          }}
        >
          Artikel Tidak Ditemukan
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 15,
            color: '#78716C',
            margin: 0,
          }}
        >
          Artikel yang Anda cari tidak tersedia atau telah dihapus.
        </p>
      </div>
      <button
        onClick={() => navigate('/artikel')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          background: '#628141',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 15,
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#4D6632')}
        onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#628141')}
      >
        <ArrowLeft size={16} />
        Kembali ke Daftar Artikel
      </button>
    </motion.div>
  )
}

// ─── Baca Artikel Page ────────────────────────────────────────────────────────
export default function BacaArtikel() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'
  const relatedScrollRef = useRef<HTMLDivElement>(null)

  const paddingInline = isMobile ? '20px' : isTablet ? '36px' : 'clamp(16px, 4.8vw, 80px)'

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [id])

  const article: Article | undefined = DUMMY_ARTICLES.find(a => a.id === Number(id))

  const relatedArticles = article
    ? DUMMY_ARTICLES.filter(a => a.category === article.category && a.id !== article.id)
    : []

  const articleContent = article ? getArticleContent(article) : null

  const categoryColor = article
    ? (CATEGORY_COLOR[article.category] ?? CATEGORY_COLOR['MPASI'])
    : CATEGORY_COLOR['MPASI']

  const scrollRelated = (dir: 'left' | 'right') => {
    if (!relatedScrollRef.current) return
    const container = relatedScrollRef.current
    const itemWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 300
    container.scrollBy({ left: dir === 'right' ? itemWidth + 16 : -(itemWidth + 16), behavior: 'smooth' })
  }

  const fallbackImage = 'https://images.unsplash.com/photo-1490818387583-1baba5e638af?w=1200&q=80'
  const heroSrc = article?.image && article.image.trim() !== '' ? article.image : fallbackImage

  if (!article) {
    return <div style={{ padding: 100 }}>Error: Artikel dengan ID {id} tidak ada di data.</div>;
  }

  if (!articleContent) {
    return <div style={{ padding: 100 }}>Error: Konten untuk kategori {article.category} tidak ditemukan.</div>;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#FAFAF9',
        fontFamily: 'var(--font-heading), sans-serif',
      }}
    >
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          paddingTop: isMobile ? 20 : 36,
          paddingBottom: 80,
          paddingInline,
          boxSizing: 'border-box',
        }}
      >
        {/* ── Breadcrumb & Back ─────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: isMobile ? 24 : 36,
          }}
        >
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/artikel"
              style={{
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13,
                fontWeight: 500,
                color: '#78716C',
                textDecoration: 'none',
                transition: 'color 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#628141')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#78716C')}
            >
              Artikel
            </Link>
            {article && (
              <>
                <span style={{ color: '#A8A29E', fontSize: 13 }}>›</span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#78716C',
                  }}
                >
                  {article.category}
                </span>
                <span style={{ color: '#A8A29E', fontSize: 13 }}>›</span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1C1917',
                    maxWidth: isMobile ? 140 : 320,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {article.title}
                </span>
              </>
            )}
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/artikel')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: '#fff',
              border: '1.5px solid #E7E5E4',
              borderRadius: 9999,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#44403C',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#628141'
              el.style.color = '#628141'
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLElement
              el.style.borderColor = '#E7E5E4'
              el.style.color = '#44403C'
            }}
          >
            <ArrowLeft size={14} />
            Kembali
          </button>
        </motion.div>

        {/* ── Not Found ─────────────────────────────────────── */}
        {!article && <ArticleNotFound />}

        {/* ── Article Detail ─────────────────────────────────── */}
        {article && articleContent && (
          <>
            {/* ── Article Header (Centered) ── */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
              style={{
                maxWidth: isMobile ? '100%' : 800,
                margin: '0 auto',
                textAlign: 'center',
                marginBottom: isMobile ? 28 : 40,
              }}
            >
              {/* Category Pill */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 14px',
                  borderRadius: 9999,
                  background: categoryColor.bg,
                  border: `1px solid ${categoryColor.border}`,
                  marginBottom: 18,
                }}
              >
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    color: categoryColor.text,
                    letterSpacing: '1.2px',
                    textTransform: 'uppercase',
                  }}
                >
                  {article.category}
                </span>
              </div>

              {/* Article Title */}
              <h1
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 900,
                  fontSize: isMobile ? 26 : isTablet ? 34 : 44,
                  lineHeight: 1.2,
                  color: '#1C1917',
                  margin: '0 0 20px',
                  letterSpacing: isMobile ? '-0.5px' : '-1px',
                }}
              >
                {article.title}
              </h1>

              {/* Meta Row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: isMobile ? 8 : 0,
                }}
              >
                {/* Author */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #628141 0%, #3F6212 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <User size={14} color="#fff" />
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: isMobile ? 13 : 14,
                      fontWeight: 500,
                      color: '#44403C',
                    }}
                  >
                    {article.author}
                  </span>
                </div>

                {/* Separator */}
                {!isMobile && (
                  <span style={{ color: '#D6D3D1', margin: '0 12px', fontSize: 16 }}>•</span>
                )}

                {/* Date */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="#78716C" />
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: isMobile ? 13 : 14,
                      color: '#78716C',
                    }}
                  >
                    {article.date}
                  </span>
                </div>

                {/* Separator */}
                {!isMobile && (
                  <span style={{ color: '#D6D3D1', margin: '0 12px', fontSize: 16 }}>•</span>
                )}

                {/* Read Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="#78716C" />
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: isMobile ? 13 : 14,
                      color: '#78716C',
                    }}
                  >
                    {article.readTime} Menit Baca
                  </span>
                </div>
              </div>
            </motion.div>

            {/* ── Hero Image ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.65, ease: 'easeOut', delay: 0.12 }}
              style={{
                maxWidth: isMobile ? '100%' : 1100,
                margin: '0 auto',
                marginBottom: isMobile ? 32 : 56,
                borderRadius: isMobile ? 16 : 28,
                overflow: 'hidden',
                boxShadow: '0 20px 60px -10px rgba(0,0,0,0.18)',
                aspectRatio: isMobile ? '4/3' : '21/9',
                background: '#E7E5E4',
              }}
            >
              <img
                src={heroSrc}
                alt={article.title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src = fallbackImage
                }}
              />
            </motion.div>

            {/* ── Article Content ── */}
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
              style={{
                maxWidth: 800,
                margin: '0 auto',
                marginBottom: isMobile ? 40 : 72,
              }}
            >
              {/* Intro paragraph */}
              <p
                style={{
                  fontFamily: 'var(--font-heading), sans-serif',
                  fontSize: isMobile ? 14 : 16,
                  color: '#44403C',
                  lineHeight: 1.85,
                  margin: '0 0 24px',
                }}
              >
                {articleContent.intro}
              </p>

              {/* Divider */}
              <div
                style={{
                  height: 1,
                  background: 'linear-gradient(to right, transparent, #E7E5E4, transparent)',
                  margin: '24px 0 32px',
                }}
              />

              {/* Sections */}
              {articleContent.sections.map((section, idx) => (
                <RenderSection key={idx} section={section} isMobile={isMobile} />
              ))}
            </motion.div>

            {/* ── Artikel Terkait ── */}
            {relatedArticles.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.3 }}
              >
                {/* Divider */}
                <div
                  style={{
                    height: 1,
                    background: '#E7E5E4',
                    marginBottom: isMobile ? 28 : 40,
                  }}
                />

                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontFamily: 'Montserrat, sans-serif',
                        fontWeight: 900,
                        fontSize: isMobile ? 20 : 28,
                        color: '#1C1917',
                        margin: '0 0 4px',
                      }}
                    >
                      Perluas Wawasanmu
                    </h2>
                    <p
                      style={{
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 13,
                        color: '#78716C',
                        margin: 0,
                      }}
                    >
                      Artikel lain dalam kategori{' '}
                      <strong style={{ color: '#628141' }}>{article.category}</strong>
                    </p>
                  </div>

                  {/* Prev / Next Arrows */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[
                      { dir: 'left' as const, icon: ChevronLeft, label: 'Sebelumnya' },
                      { dir: 'right' as const, icon: ChevronRight, label: 'Selanjutnya' },
                    ].map(({ dir, icon: Icon, label }) => (
                      <button
                        key={dir}
                        onClick={() => scrollRelated(dir)}
                        aria-label={label}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          border: '1.5px solid #E7E5E4',
                          background: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.borderColor = '#628141'
                          el.style.background = '#F0F7E8'
                        }}
                        onMouseLeave={e => {
                          const el = e.currentTarget as HTMLElement
                          el.style.borderColor = '#E7E5E4'
                          el.style.background = '#fff'
                        }}
                      >
                        <Icon size={18} color="#44403C" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrollable Cards */}
                <div
                  ref={relatedScrollRef}
                  style={{
                    display: 'flex',
                    gap: 16,
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    paddingBottom: 16,
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  className="hide-scrollbar"
                >
                  {relatedArticles.map(a => (
                    <div
                      key={a.id}
                      style={{
                        flex: `0 0 ${isMobile ? '82%' : isTablet ? '46%' : '30%'}`,
                        maxWidth: isMobile ? 300 : isTablet ? 360 : 340,
                        scrollSnapAlign: 'start',
                        display: 'flex', 
                        alignItems: 'stretch' 
                      }}
                    >
                      <CardArtikel
                        id={a.id}
                        image={a.image}
                        title={a.title}
                        description={a.description}
                        category={a.category}
                        readTime={a.readTime}
                      />
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </>
        )}
      </main>
    </div>
  )
}