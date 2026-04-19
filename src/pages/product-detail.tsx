import React from 'react'
import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'
import { shopService } from '../services/shop.service'
import { CardNutrishop } from '../components/card-nutrishop'

// ─── Category label map ───────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  mpasi: 'MPASI / Baby Food',
  snacks: 'Healthy Snacks',
  supplements: 'Supplements',
  cooking: 'Cooking Basics',
}

// ─── Stock Indicator ──────────────────────────────────────────────────────────
function StockIndicator({ stock }: { stock: number }) {
  const isLow = stock > 0 && stock <= 20
  const isOut = stock === 0

  if (isOut) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <AlertTriangle size={16} color="#DC2626" />
        <span
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 16,
            fontWeight: 600,
            color: '#DC2626',
          }}
        >
          Stok Habis
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <CheckCircle size={16} color={isLow ? '#D97706' : '#3F6212'} />
      <span
        style={{
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 16,
          fontWeight: 600,
          color: isLow ? '#D97706' : '#3F6212',
        }}
      >
        Stok: {stock}{isLow ? ' (Hampir Habis!)' : ''}
      </span>
    </div>
  )
}

// ─── Product Not Found ────────────────────────────────────────────────────────
function ProductNotFound() {
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
        }}
      >
        <AlertTriangle size={36} color="#DC2626" />
      </div>
      <div>
        <h2
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontWeight: 900,
            fontSize: 28,
            color: '#1C1917',
            margin: '0 0 8px',
          }}
        >
          Produk Tidak Ditemukan
        </h2>
        <p
          style={{
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 15,
            color: '#78716C',
            margin: 0,
          }}
        >
          Produk yang Anda cari tidak tersedia atau telah dihapus.
        </p>
      </div>
      <button
        onClick={() => navigate('/nutrishop')}
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
        Kembali ke NutriShop
      </button>
    </motion.div>
  )
}

// ─── Product Detail Page ──────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const relatedScrollRef = useRef<HTMLDivElement>(null)
  const [cartAdded, setCartAdded] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  const [product, setProduct] = useState<{
    id: number; category: string; image?: string
    title: string; description: string; price: number; stock: number
  } | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<{
    id: number; category: string; image?: string
    title: string; description: string; price: number; stock: number
  }[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    shopService.getProductById(Number(id))
      .then(async (p) => {
        if (cancelled) return
        setProduct(p)
        // fetch all products to get related by category
        const all = await shopService.getProducts()
        if (!cancelled)
          setRelatedProducts(all.filter(x => x.category === p.category && x.id !== p.id))
      })
      .catch(() => { if (!cancelled) setProduct(null) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const formatPrice = (p: number) =>
    p.toLocaleString('id-ID')

  const handleAddToCart = async () => {
    if (!product) return
    setAddingToCart(true)
    try {
      await shopService.addToCart(product.id, 1)
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    } catch {
      setCartAdded(false)
      navigate('/sign-in')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleBuyNow = () => {
    if (!product) return
    navigate('/checkout', {
      state: {
        mode: 'direct',
        produkId: product.id,
        kuantitas: 1,
      },
    })
  }

  const scrollRelated = (dir: 'left' | 'right') => {
  if (!relatedScrollRef.current) return
  
  const container = relatedScrollRef.current
  const itemWidth = (container.firstElementChild as HTMLElement)?.offsetWidth || 300
  const gap = 16
  const scrollAmount = itemWidth + gap

  container.scrollBy({ 
    left: dir === 'right' ? scrollAmount : -scrollAmount, 
    behavior: 'smooth' 
  })
}

  const [imgError, setImgError] = React.useState(false)

  // Reset setiap ganti produk
  useEffect(() => {
    setImgError(false)
  }, [id])

  const hasValidImage = !imgError && !!product?.image && product.image.trim() !== ''

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#78716C', fontFamily: 'var(--font-heading), sans-serif' }}>
          <div style={{ width: 40, height: 40, border: '3px solid #628141', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Memuat produk...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', background: '#FAFAF9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#78716C', fontFamily: 'var(--font-heading), sans-serif' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
          <p style={{ fontWeight: 700, fontSize: 18, color: '#1c1917', marginBottom: 8 }}>Produk tidak ditemukan</p>
          <button onClick={() => navigate('/nutrishop')} style={{ background: '#628141', color: 'white', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
            Kembali ke NutriShop
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FAFAF9', fontFamily: 'var(--font-heading), sans-serif' }}>
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 'clamp(24px, 4vw, 48px) clamp(16px, 4.8vw, 80px) 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Breadcrumbs & Back ── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 32 }}
        >
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link
              to="/nutrishop"
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
              NutriShop
            </Link>
            {product && (
              <>
                <span style={{ color: '#78716C', fontSize: 11 }}>›</span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: '#78716C',
                  }}
                >
                  {CATEGORY_LABELS[product.category] ?? product.category}
                </span>
                <span style={{ color: '#78716C', fontSize: 11 }}>›</span>
                <span
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#1C1917',
                  }}
                >
                  {product.title}
                </span>
              </>
            )}
          </nav>

          {/* Back button */}
          <button
            onClick={() => navigate('/nutrishop')}
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

        {/* ── Product Not Found ── */}
        {!product && <ProductNotFound />}

        {/* ── Product Detail ── */}
        {product && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: 'easeOut', delay: 0.05 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
                gap: 'clamp(24px, 4vw, 64px)',
                alignItems: 'start',
                marginBottom: 64,
              }}
            >
              {/* ── Left: Product Image ── */}
              <div style={{ position: 'relative' }}>
                {/* Image card */}
                <div
                  style={{
                    background: '#E7E5E4',
                    borderRadius: 32,
                    overflow: 'hidden',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                    border: '1px solid #E7E5E4',
                    aspectRatio: '1 / 1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={hasValidImage ? product!.image! : undefined}
                    alt={product.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                    onError={() => {
                      setImgError(true)
                    }}
                  />
                </div>
              </div>

              {/* ── Right: Product Info ── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Category badge */}
                <div
                  style={{
                    display: 'inline-flex',
                    alignSelf: 'flex-start',
                    padding: '4px 14px',
                    borderRadius: 9999,
                    background: 'rgba(98,129,65,0.08)',
                    border: '1px solid rgba(98,129,65,0.2)',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#3F6212',
                      letterSpacing: '1.2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    {CATEGORY_LABELS[product.category] ?? product.category}
                  </span>
                </div>

                {/* Title */}
                <h1
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontWeight: 900,
                    fontSize: 'clamp(28px, 4vw, 48px)',
                    lineHeight: 1.15,
                    color: '#1C1917',
                    margin: 0,
                    letterSpacing: '-1px',
                  }}
                >
                  {product.title}
                </h1>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontWeight: 600,
                      fontSize: 22,
                      color: '#3F6212',
                    }}
                  >
                    Rp
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontWeight: 800,
                      fontSize: 'clamp(32px, 4vw, 45px)',
                      color: '#3F6212',
                      letterSpacing: '-1px',
                    }}
                  >
                    {formatPrice(product.price)}
                  </span>
                </div>

                {/* Stock */}
                <StockIndicator stock={product.stock ?? 100} />

                {/* Divider */}
                <div style={{ height: 1, background: '#E7E5E4', borderRadius: 1 }} />

                {/* Description */}
                <p
                  style={{
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontWeight: 400,
                    fontSize: 'clamp(14px, 1.5vw, 18px)',
                    color: '#57534E',
                    lineHeight: 1.65,
                    margin: 0,
                    textAlign: 'justify',
                  }}
                >
                  {product.description}
                </p>

                {/* Action Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: 16,
                    flexWrap: 'wrap',
                    paddingTop: 8,
                  }}
                >
                  {/* Add to Cart */}
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={cartAdded ? 'added' : 'add'}
                      initial={{ scale: 0.97, opacity: 0.8 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.97, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      onClick={handleAddToCart}
                      style={{
                        flex: 1,
                        minWidth: 160,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '16px 28px',
                        background: '#fff',
                        border: `2px solid ${cartAdded ? '#628141' : '#3F6212'}`,
                        borderRadius: 12,
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 15,
                        fontWeight: 600,
                        color: cartAdded ? '#628141' : '#3F6212',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => {
                        if (!cartAdded) {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = '#F0F7E8'
                        }
                      }}
                      onMouseLeave={e => {
                        if (!cartAdded) {
                          const el = e.currentTarget as HTMLElement
                          el.style.background = '#fff'
                        }
                      }}
                    >
                      {addingToCart ? (
                        <>
                          <div style={{ width: 16, height: 16, border: '2px solid #3F6212', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                          Menambahkan...
                        </>
                      ) : cartAdded ? (
                        <>
                          <CheckCircle size={17} />
                          Ditambahkan!
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={17} />
                          Add to Cart
                        </>
                      )}
                    </motion.button>
                  </AnimatePresence>

                  {/* Buy Now */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBuyNow}
                    style={{
                      flex: 1,
                      minWidth: 160,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '16px 28px',
                      background: '#3F6212',
                      border: 'none',
                      borderRadius: 12,
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 15,
                      fontWeight: 600,
                      color: '#fff',
                      cursor: 'pointer',
                      boxShadow: '0 10px 15px -3px rgba(54,83,20,0.2), 0 4px 6px -4px rgba(54,83,20,0.2)',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#2D4A18')}
                    onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#3F6212')}
                  >
                    Buy Now
                  </motion.button>
                </div>

                {/* Extra info chips */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
                  {['100% Organik', 'Pengiriman Cepat'].map(chip => (
                    <span
                      key={chip}
                      style={{
                        padding: '4px 12px',
                        background: '#F0FDF4',
                        border: '1px solid #BBF7D0',
                        borderRadius: 9999,
                        fontFamily: 'var(--font-heading), sans-serif',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#15803D',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ✓ {chip}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ── Similar Products ── */}
            {relatedProducts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut', delay: 0.2 }}
              >
                {/* Section Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 24,
                    paddingInline: '20px',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontWeight: 900,
                      fontSize: 'clamp(24px, 3vw, 36px)',
                      color: '#1C1917',
                      margin: 0,
                    }}
                  >
                    Similar Products
                  </h2>

                  {/* Prev / Next arrows */}
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => scrollRelated('left')}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: '1px solid #E7E5E4',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
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
                      aria-label="Previous"
                    >
                      <ChevronLeft size={20} color="#1C1917" />
                    </button>
                    <button
                      onClick={() => scrollRelated('right')}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        border: '1px solid #E7E5E4',
                        background: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
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
                      aria-label="Next"
                    >
                      <ChevronRight size={20} color="#1C1917" />
                    </button>
                  </div>
                </div>

                {/* Scrollable grid container */}
                <div
                  ref={relatedScrollRef}
                  style={{
                    display: 'flex',
                    gap: 16, 
                    overflowX: 'auto',
                    scrollbarWidth: 'none',
                    paddingBottom: 20,
                    paddingInline: '20px', 
                    scrollSnapType: 'x mandatory',
                    WebkitOverflowScrolling: 'touch',
                  }}
                  className="hide-scrollbar"
                >
                  {relatedProducts.map(p => (
                    <div
                      key={p.id}
                      style={{
                        flex: '0 0 85%', 
                        maxWidth: '280px', 
                        scrollSnapAlign: 'center', 
                      }}
                    >
                      <CardNutrishop
                        id={p.id}
                        image={p.image}
                        title={p.title}
                        description={p.description}
                        price={p.price}
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