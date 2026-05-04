import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router'
import {
  LayoutGrid,
  Apple,
  Pill,
  ChefHat,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
  Milk,
  ShoppingBasket,
  Package,
} from 'lucide-react'
import { CardNutrishop } from '../components/card-nutrishop'
import FoodsImg from '../assets/images/img-foods.svg'
import { shopService } from '../services/shop.service'
import { useAuth } from '../context/AuthContext'

// ─── Local Product type (matches backend-mapped shape) ────────────────────────
interface Product {
  id: number
  category: string
  image?: string
  title: string
  description: string
  price: number
  stock: number
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

// ─── Shared padding helper ─────────────────────────────────────────────────────
const getPaddingInline = (bp: 'mobile' | 'tablet' | 'desktop'): string => {
  if (bp === 'mobile') return '20px'
  if (bp === 'tablet') return '36px'
  return 'clamp(16px, 4.8vw, 61px)'
}

// ─── Custom SVG Icons ──────────────────────────────────────────────────────────

const CategoriesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="20" viewBox="0 0 19 20" fill="none">
    <path
      d="M3.5 9L9 0L14.5 9H3.5V9M14.5 20C13.25 20 12.1875 19.5625 11.3125 18.6875C10.4375 17.8125 10 16.75 10 15.5C10 14.25 10.4375 13.1875 11.3125 12.3125C12.1875 11.4375 13.25 11 14.5 11C15.75 11 16.8125 11.4375 17.6875 12.3125C18.5625 13.1875 19 14.25 19 15.5C19 16.75 18.5625 17.8125 17.6875 18.6875C16.8125 19.5625 15.75 20 14.5 20V20M0 19.5V11.5H8V19.5H0V19.5M14.5 18C15.2 18 15.7917 17.7583 16.275 17.275C16.7583 16.7917 17 16.2 17 15.5C17 14.8 16.7583 14.2083 16.275 13.725C15.7917 13.2417 15.2 13 14.5 13C13.8 13 13.2083 13.2417 12.725 13.725C12.2417 14.2083 12 14.8 12 15.5C12 16.2 12.2417 16.7917 12.725 17.275C13.2083 17.7583 13.8 18 14.5 18V18M2 17.5H6V13.5H2V17.5V17.5M7.05 7H10.95L9 3.85L7.05 7V7M9 7V7V7V7V7M6 13.5V13.5V13.5V13.5V13.5V13.5M14.5 15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5V15.5"
      fill="#628141"
    />
  </svg>
)

const NeedAdviceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="18" viewBox="0 0 20 18" fill="none">
    <path
      d="M9 18V16H17V16V16V8.9C17 6.95 16.3208 5.29583 14.9625 3.9375C13.6042 2.57917 11.95 1.9 10 1.9C8.05 1.9 6.39583 2.57917 5.0375 3.9375C3.67917 5.29583 3 6.95 3 8.9V15H2C1.45 15 0.979167 14.8042 0.5875 14.4125C0.195833 14.0208 0 13.55 0 13V11C0 10.65 0.0875 10.3208 0.2625 10.0125C0.4375 9.70417 0.683333 9.45833 1 9.275L1.075 7.95C1.20833 6.81667 1.5375 5.76667 2.0625 4.8C2.5875 3.83333 3.24583 2.99167 4.0375 2.275C4.82917 1.55833 5.7375 1 6.7625 0.6C7.7875 0.2 8.86667 0 10 0C11.1333 0 12.2083 0.2 13.225 0.6C14.2417 1 15.15 1.55417 15.95 2.2625C16.75 2.97083 17.4083 3.80833 17.925 4.775C18.4417 5.74167 18.775 6.79167 18.925 7.925L19 9.225C19.3167 9.375 19.5625 9.6 19.7375 9.9C19.9125 10.2 20 10.5167 20 10.85V13.15C20 13.4833 19.9125 13.8 19.7375 14.1C19.5625 14.4 19.3167 14.625 19 14.775V16C19 16.55 18.8042 17.0208 18.4125 17.4125C18.0208 17.8042 17.55 18 17 18H9V18M7 11C6.71667 11 6.47917 10.9042 6.2875 10.7125C6.09583 10.5208 6 10.2833 6 10C6 9.71667 6.09583 9.47917 6.2875 9.2875C6.47917 9.09583 6.71667 9 7 9C7.28333 9 7.52083 9.09583 7.7125 9.2875C7.90417 9.47917 8 9.71667 8 10C8 10.2833 7.90417 10.5208 7.7125 10.7125C7.52083 10.9042 7.28333 11 7 11V11M13 11C12.7167 11 12.4792 10.9042 12.2875 10.7125C12.0958 10.5208 12 10.2833 12 10C12 9.71667 12.0958 9.47917 12.2875 9.2875C12.4792 9.09583 12.7167 9 13 9C13.2833 9 13.5208 9.09583 13.7125 9.2875C13.9042 9.47917 14 9.71667 14 10C14 10.2833 13.9042 10.5208 13.7125 10.7125C13.5208 10.9042 13.2833 11 13 11V11M4.025 9.45C3.90833 7.68333 4.44167 6.16667 5.625 4.9C6.80833 3.63333 8.28333 3 10.05 3C11.5333 3 12.8375 3.47083 13.9625 4.4125C15.0875 5.35417 15.7667 6.55833 16 8.025C14.4833 8.00833 13.0875 7.6 11.8125 6.8C10.5375 6 9.55833 4.91667 8.875 3.55C8.60833 4.88333 8.04583 6.07083 7.1875 7.1125C6.32917 8.15417 5.275 8.93333 4.025 9.45V9.45"
      fill="#628141"
    />
  </svg>
)


// ─── Categories Data ──────────────────────────────────────────────────────────
// Static category definitions — counts are computed dynamically from products
const CATEGORY_DEFS = [
  { id: 'all',         label: 'Semua Produk',   IconComp: LayoutGrid },
  { id: 'mpasi',       label: 'MPASI',          IconComp: Milk       },
  { id: 'supplements', label: 'Suplemen',       IconComp: Pill       },
  { id: 'alat',        label: 'Alat',           IconComp: ChefHat   },
  { id: 'paket',       label: 'Paket',          IconComp: Apple      },
]

const ITEMS_PER_PAGE = 9

// ─── Pagination ───────────────────────────────────────────────────────────────
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null

  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const pages: (number | '...')[] = [1]
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
    return pages
  }

  const btnBase: React.CSSProperties = {
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
        style={{ ...btnBase, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
      >
        <ChevronLeft size={16} />
      </button>

      {getPages().map((page, idx) =>
        page === '...' ? (
          <span
            key={`ellipsis-${idx}`}
            style={{ width: 36, textAlign: 'center', fontFamily: 'var(--font-heading), sans-serif', fontSize: 14, color: '#78716C' }}
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            style={{
              ...btnBase,
              background: page === currentPage ? '#628141' : '#fff',
              color: page === currentPage ? '#fff' : '#44403C',
              borderColor: page === currentPage ? '#628141' : '#E7E5E4',
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
        style={{ ...btnBase, opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}

// ─── Hero Section ─────────────────────────────────────────────────────────────
const HeroSection = ({ bp }: { bp: 'mobile' | 'tablet' | 'desktop' }) => {
  const isMobile = bp === 'mobile'

  return (
    <div
      style={{
        width: '100%',
        height: isMobile ? 260 : 320,
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Background Image — local asset */}
      <img
        src={FoodsImg}
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

      {/* Gradient Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(28,40,18,0.88) 0%, rgba(28,40,18,0.60) 55%, rgba(28,40,18,0.10) 100%)',
        }}
      />

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: 1280,
          margin: '0 auto',
          paddingInline: getPaddingInline(bp),
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
            gap: isMobile ? 12 : 16,
            maxWidth: isMobile ? '100%' : 580,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              padding: '4px 14px',
              borderRadius: 9999,
              background: 'rgba(163,230,53,0.20)',
              backdropFilter: 'blur(2px)',
              border: '1px solid rgba(163,230,53,0.30)',
            }}
          >
            <span
              style={{
                color: '#BEF264',
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 11,
                fontWeight: 700,
                lineHeight: '18px',
                letterSpacing: '1.6px',
                textTransform: 'uppercase',
              }}
            >
              NutriShop
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 900,
              fontSize: bp === 'mobile' ? 26 : bp === 'tablet' ? 36 : 44,
              lineHeight: isMobile ? '34px' : '52px',
              color: '#FFF',
              margin: 0,
            }}
          >
            Penuhi Kebutuhan Gizi dari Rumah
          </h1>

          {/* Subheadline */}
          <p
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontWeight: 400,
              fontSize: isMobile ? 13 : 15,
              lineHeight: isMobile ? '20px' : '24px',
              color: '#D6D3D1',
              margin: 0,
              maxWidth: 480,
            }}
          >
            Jelajahi berbagai pilihan kebutuhan gizi. Temukan nutrisi yang tepat untuk balita,
            remaja, ibu hamil, maupun ibu menyusui.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar Filter ───────────────────────────────────────────────────────────
interface SidebarProps {
  bp: 'mobile' | 'tablet' | 'desktop'
  selectedCategory: string
  onCategoryChange: (id: string) => void
  minPrice: string
  maxPrice: string
  onMinChange: (val: string) => void
  onMaxChange: (val: string) => void
  onApply: () => void
  isMobileOpen: boolean
  onCloseMobile: () => void
}

const SidebarFilter = ({
  bp,
  selectedCategory,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinChange,
  onMaxChange,
  onApply,
  isMobileOpen,
  onCloseMobile,
  categories,
}: SidebarProps & { categories: { id: string; label: string; count: number; IconComp: React.ComponentType<{ size?: number; color?: string; width?: number; height?: number }> }[] }) => {
  const isMobile = bp === 'mobile'
  const navigate = useNavigate()

  const handleNumericInput = (val: string, setter: (v: string) => void) => {
    const cleaned = val.replace(/[^0-9]/g, '')
    setter(cleaned)
  }

  const sidebarContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* ── Categories ── */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          {/* Figma Categories icon */}
          <CategoriesIcon />
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: 16,
              color: '#1C1917',
            }}
          >
            Kategori
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {categories.map(({ id, label, count, IconComp }) => {
            const isActive = selectedCategory === id
            return (
              <button
                key={id}
                onClick={() => {
                  onCategoryChange(id)
                  if (isMobile) onCloseMobile()
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: 10,
                  border: isActive ? '1px solid #628141' : '1px solid transparent',
                  background: isActive ? '#ECFCCB' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  textAlign: 'left',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F5F5F0'
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <IconComp 
                    color={isActive ? '#3F6212' : '#78716C'} 
                    width={15} 
                    height={16} 
                  />
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 14,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#3F6212' : '#44403C',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 12,
                    fontWeight: 600,
                    color: isActive ? '#3F6212' : '#A8A29E',
                    background: isActive ? '#D9F99D' : '#F5F5F4',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    minWidth: 24,
                    textAlign: 'center',
                  }}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Price Range ── */}
      <div>
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 16,
            color: '#1C1917',
            display: 'block',
            marginBottom: 14,
          }}
        >
          Rentang Harga
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <input
            type="text"
            inputMode="numeric"
            placeholder="min"
            value={minPrice}
            onChange={e => handleNumericInput(e.target.value, onMinChange)}
            style={{
              flex: 1,
              maxWidth: '99px',
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: 8,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 13,
              color: '#1C1917',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 14, color: '#78716C', flexShrink: 0 }}>-</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="maks"
            value={maxPrice}
            onChange={e => handleNumericInput(e.target.value, onMaxChange)}
            style={{
              flex: 1,
              maxWidth: '99px',
              padding: '8px 12px',
              border: '1px solid #D1D5DB',
              borderRadius: 8,
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 13,
              color: '#1C1917',
              outline: 'none',
              background: '#fff',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => {
            onApply()
            if (isMobile) onCloseMobile()
          }}
          style={{
            width: '100%',
            padding: '10px',
            background: '#628141',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#4d6632')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#628141')}
        >
          Terapkan
        </button>
      </div>

      {/* ── Need Advice Card ── */}
      <div
        style={{
          background: '#F9FFF2',
          border: '1px solid #D9F99D',
          borderRadius: 14,
          padding: '20px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {/* Figma Need Advice icon inside a circle badge */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#ECFCCB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <NeedAdviceIcon />
        </div>

        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            color: '#1C1917',
          }}
        >
          Butuh bantuan?
        </span>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 13,
            color: '#57534E',
            lineHeight: '20px',
          }}
        >
          Ahli gizi kami siap membantu Anda memilih yang terbaik untuk bayi Anda.
        </p>
        <button
          onClick={() => navigate('/tele-nutritionist')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 13,
            fontWeight: 700,
            color: '#628141',
            letterSpacing: '0.5px',
            textAlign: 'left',
          }}
          onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#3F6212')}
          onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = '#628141')}
        >
          Jadwalkan sekarang →
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        {isMobileOpen && (
          <div
            onClick={onCloseMobile}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          />
        )}
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            background: '#fff',
            zIndex: 50,
            transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
            overflowY: 'auto',
            padding: '24px 20px',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: 18,
                color: '#1C1917',
              }}
            >
              Filters
            </span>
            <button
              onClick={onCloseMobile}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <X size={20} color="#78716C" />
            </button>
          </div>
          {sidebarContent}
        </div>
      </>
    )
  }

  return (
    <div style={{ width: 220, flexShrink: 0 }}>
      {sidebarContent}
    </div>
  )
}

// ─── NutriShop Page ───────────────────────────────────────────────────────────
export default function NutriShop() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const paddingInline = getPaddingInline(bp)
  const [products, setProducts] = useState<Product[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setProductsLoading(true)
    setProductsError(null)
    shopService.getProducts()
      .then((data) => { if (!cancelled) setProducts(data) })
      .catch(() => { if (!cancelled) setProductsError("Gagal memuat produk. Pastikan kamu sudah login.") })
      .finally(() => { if (!cancelled) setProductsLoading(false) })
    return () => { cancelled = true }
  }, [])

  // ── Filter state ──
  const categories = useMemo(() => {
    return CATEGORY_DEFS.map(def => ({
      ...def,
      count: def.id === 'all'
        ? products.length
        : products.filter(p => p.category === def.id).length,
    })).filter(def => def.id === 'all' || def.count > 0)
  }, [products])

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [appliedFilter, setAppliedFilter] = useState<{
    category: string
    min: number | null
    max: number | null
  }>({ category: 'all', min: null, max: null })

  // ── Search state ──
  const [searchQuery, setSearchQuery] = useState('')

  // ── Pagination state ──
  const [currentPage, setCurrentPage] = useState(1)

  // ── Mobile filter drawer ──
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // ── Filter & search ──
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const catMatch = appliedFilter.category === 'all' || p.category === appliedFilter.category
      const minMatch = appliedFilter.min === null || p.price >= appliedFilter.min
      const maxMatch = appliedFilter.max === null || p.price <= appliedFilter.max
      const searchMatch =
        !searchQuery.trim() ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      return catMatch && minMatch && maxMatch && searchMatch
    })
  }, [products, appliedFilter, searchQuery])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleApplyFilter = () => {
    const min = minPriceInput ? parseInt(minPriceInput, 10) : null
    const max = maxPriceInput ? parseInt(maxPriceInput, 10) : null
    setAppliedFilter({ category: selectedCategory, min, max })
    setCurrentPage(1)
  }

  const handleCategoryChange = (id: string) => {
    setSelectedCategory(id)
    setAppliedFilter(prev => ({ ...prev, category: id }))
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'var(--font-heading), sans-serif' }}>
      {/* ── Hero ── */}
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
        <div
          style={{
            display: 'flex',
            gap: isMobile ? 0 : bp === 'tablet' ? 24 : 36,
            alignItems: 'flex-start',
          }}
        >
          {/* ── Sidebar (desktop/tablet) ── */}
          {!isMobile && (
            <SidebarFilter
              bp={bp}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              minPrice={minPriceInput}
              maxPrice={maxPriceInput}
              onMinChange={setMinPriceInput}
              onMaxChange={setMaxPriceInput}
              onApply={handleApplyFilter}
              isMobileOpen={false}
              onCloseMobile={() => {}}
              categories={categories}
            />
          )}

          {/* ── Sidebar (mobile drawer) ── */}
          {isMobile && (
            <SidebarFilter
              bp={bp}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              minPrice={minPriceInput}
              maxPrice={maxPriceInput}
              onMinChange={setMinPriceInput}
              onMaxChange={setMaxPriceInput}
              onApply={handleApplyFilter}
              isMobileOpen={mobileFilterOpen}
              onCloseMobile={() => setMobileFilterOpen(false)}
              categories={categories}
            />
          )}

          {/* ── Products Area ── */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 24,
              }}
            >
              <div 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  width: isMobile ? '100%' : 'auto', 
                  gap: 12 
                }}
              >
                <h2
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 800,
                    fontSize: isMobile ? 20 : 24,
                    color: '#1C1917',
                    margin: 0,
                  }}
                >
                  Nutrisi Esensial
                </h2>
                
                {isMobile && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {isLoggedIn && (
                      <>
                        <button
                          onClick={() => navigate('/orders')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            background: '#fff',
                            border: '1px solid #E7E5E4',
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: '#44403C',
                          }}
                          aria-label="Buka pesanan saya"
                        >
                          <Package size={18} />
                        </button>

                        <button
                          onClick={() => navigate('/cart')}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            background: '#fff',
                            border: '1px solid #E7E5E4',
                            borderRadius: 8,
                            cursor: 'pointer',
                            color: '#44403C',
                          }}
                          aria-label="Buka keranjang"
                        >
                          <ShoppingBasket size={18} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setMobileFilterOpen(true)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 14px',
                        background: '#fff',
                        border: '1px solid #E7E5E4',
                        borderRadius: 8,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#44403C',
                      }}
                    >
                      <Filter size={16} />
                      Filter
                    </button>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: isMobile ? '100%' : 'auto' }}>
                {isLoggedIn && !isMobile && (
                  <>
                    <button
                      onClick={() => navigate('/orders')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 14px',
                        background: '#fff',
                        border: '1px solid #E7E5E4',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#44403C',
                        whiteSpace: 'nowrap',
                      }}
                      aria-label="Buka pesanan saya"
                    >
                      <Package size={17} />
                      Pesanan Saya
                    </button>

                    <button
                      onClick={() => navigate('/cart')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '9px 14px',
                        background: '#fff',
                        border: '1px solid #E7E5E4',
                        borderRadius: 10,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#44403C',
                        whiteSpace: 'nowrap',
                      }}
                      aria-label="Buka keranjang"
                    >
                      <ShoppingBasket size={17} />
                      Keranjang
                    </button>
                  </>
                )}

                {/* Search */}
                <div style={{ position: 'relative', width: isMobile ? '100%' : 280 }}>
                  <Search
                    size={16}
                    color="#A8A29E"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="text"
                    placeholder="Cari Produk Sehat..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      border: '1px solid #E7E5E4',
                      borderRadius: 10,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 13,
                      color: '#1C1917',
                      outline: 'none',
                      background: '#fff',
                      boxSizing: 'border-box',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Product count info */}
            {!productsLoading && !productsError && (
              <p style={{ fontFamily: 'var(--font-heading), sans-serif', fontSize: 13, color: '#78716C', margin: '0 0 20px' }}>
                Menampilkan{' '}
                <strong style={{ color: '#628141' }}>{filteredProducts.length}</strong> produk
                {searchQuery && <> untuk "<strong>{searchQuery}</strong>"</>}
              </p>
            )}

            {/* Loading state */}
            {productsLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : bp === 'tablet' ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: isMobile ? 16 : 20 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: '#f5f5f4', borderRadius: 12, height: 280, animation: 'pulse 1.5s ease-in-out infinite' }} />
                ))}
              </div>
            )}

            {/* Error state */}
            {!productsLoading && productsError && (
              <div style={{ textAlign: 'center', padding: '48px 24px', color: '#78716C', fontFamily: 'var(--font-heading), sans-serif' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
                <p style={{ fontWeight: 700, color: '#1c1917', marginBottom: 6 }}>Produk tidak tersedia</p>
                <p style={{ fontSize: 13 }}>{productsError}</p>
              </div>
            )}

            {/* Products Grid */}
            {!productsLoading && !productsError && paginatedProducts.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : bp === 'tablet' ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                  gap: isMobile ? 16 : 20,
                }}
              >
                {paginatedProducts.map(product => (
                  <CardNutrishop
                    key={product.id}
                    id={product.id}
                    image={product.image}
                    title={product.title}
                    description={product.description}
                    price={product.price}
                  />
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
                  Produk tidak ditemukan
                </h3>
                <p style={{ margin: 0, fontSize: 14 }}>
                  Coba ubah filter atau kata kunci pencarian Anda.
                </p>
              </div>
            )}

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}