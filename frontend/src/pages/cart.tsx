import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { ArrowLeft, Search, ShoppingBasket } from 'lucide-react'
import { CardCart } from '../components/card-cart'
import type { CartItem } from '../components/card-cart'

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

const INITIAL_ITEMS: CartItem[] = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=200&h=200&fit=crop',
    title: 'Organic Veggie Puree Set',
    price: 50000,
    quantity: 2,
    checked: true,
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop',
    title: 'Whole Grain Baby Cereal',
    price: 85000,
    quantity: 1,
    checked: true,
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1543362906-acfc16c67564?w=200&h=200&fit=crop',
    title: 'Prenatal Vitamin Complex',
    price: 240000,
    quantity: 1,
    checked: false,
  },
]

// ─── Empty State ──────────────────────────────────────────────────────────────
const EmptyCart = ({ onShop }: { onShop: () => void }) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      padding: '80px 24px',
      gap: 20,
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: 96,
        height: 96,
        borderRadius: '50%',
        background: '#F0FDE4',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ShoppingBasket size={44} color="#628141" strokeWidth={1.5} />
    </div>
    <div>
      <h3
        style={{
          margin: '0 0 8px',
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 800,
          fontSize: 20,
          color: '#1C1917',
        }}
      >
        Keranjangmu masih kosong
      </h3>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--font-heading), sans-serif',
          fontSize: 14,
          color: '#78716C',
        }}
      >
        Yuk, tambahkan produk bergizi ke keranjangmu!
      </p>
    </div>
    <button
      onClick={onShop}
      style={{
        padding: '12px 32px',
        background: '#628141',
        color: '#fff',
        border: 'none',
        borderRadius: 99,
        fontFamily: 'Montserrat, sans-serif',
        fontWeight: 700,
        fontSize: 14,
        cursor: 'pointer',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#4d6632')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#628141')}
    >
      Mulai Belanja
    </button>
  </div>
)

// ─── Cart Page ────────────────────────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigate()
  const bp = useBreakpoint()
  const isMobile = bp === 'mobile'
  const isTablet = bp === 'tablet'

  const [items, setItems] = useState<CartItem[]>(INITIAL_ITEMS)
  const [searchQuery, setSearchQuery] = useState('')

  const displayedItems = items.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const allChecked = items.length > 0 && items.every(i => i.checked)
  const checkedItems = items.filter(i => i.checked)
  const total = checkedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const checkedCount = checkedItems.length

  const formatPrice = (p: number) => p.toLocaleString('id-ID')

  const handleToggleAll = () => {
    const next = !allChecked
    setItems(prev => prev.map(i => ({ ...i, checked: next })))
  }

  const handleToggleCheck = (id: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, checked: !i.checked } : i)))
  }

  const handleQuantityChange = (id: number, qty: number) => {
    setItems(prev => prev.map(i => (i.id === id ? { ...i, quantity: qty } : i)))
  }

  const handleRemove = (id: number) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }

  const handleDeleteChecked = () => {
    setItems(prev => prev.filter(i => !i.checked))
  }

  const paddingInline = isMobile ? '16px' : isTablet ? '32px' : 'clamp(16px, 4.8vw, 61px)'

  return (
    <div
      style={{
        background: '#F4F6F2',
        fontFamily: 'var(--font-heading), sans-serif',
      }}
    >
      {/* ── Page Header ── */}
      <div
        style={{
          background: '#fff',
          borderBottom: '1px solid #E7E5E4',
          paddingInline,
          paddingBlock: '20px',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: isMobile ? 'wrap' : 'nowrap',
          }}
        >
          <h1
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 800,
              fontSize: isMobile ? 22 : 28,
              color: '#1C1917',
            }}
          >
            Keranjang
            {items.length > 0 && (
              <span
                style={{
                  marginLeft: 10,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: isMobile ? 16 : 20,
                  color: '#628141',
                }}
              >
                ({items.length})
              </span>
            )}
          </h1>

          {/* Search */}
          <div style={{ position: 'relative', width: isMobile ? '100%' : 280, flexShrink: 0 }}>
            <Search
              size={15}
              color="#A8A29E"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Cari produk di keranjang..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 34px',
                border: '1.5px solid #E7E5E4',
                borderRadius: 10,
                fontFamily: 'var(--font-heading), sans-serif',
                fontSize: 13,
                color: '#1C1917',
                outline: 'none',
                background: '#FAFAF9',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => ((e.target as HTMLInputElement).style.borderColor = '#628141')}
              onBlur={e => ((e.target as HTMLInputElement).style.borderColor = '#E7E5E4')}
            />
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          paddingInline,
          paddingTop: 24,
          paddingBottom: 80,
          boxSizing: 'border-box',
          minHeight: isTablet ? '60vh' : undefined,
          display: 'flex',
          gap: isMobile ? 0 : 24,
          alignItems: 'flex-start',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        {/* ── Left Column ── */}
        <div
          style={{
            flex: 1,
            width: isMobile ? '100%' : undefined,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              alignSelf: 'flex-start',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              background: '#fff',
              border: '1.5px solid #E7E5E4',
              borderRadius: 9999,
              fontFamily: 'Montserrat, sans-serif',
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

          {/* Select All + Bulk Delete */}
          {items.length > 0 && (
            <div
              style={{
                background: '#fff',
                border: '1.5px solid #E7E5E4',
                borderRadius: 14,
                padding: '14px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Pilih Semua Checkbox */}
                <button
                  onClick={handleToggleAll}
                  aria-label={allChecked ? 'Uncheck all' : 'Check all'}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    border: allChecked ? 'none' : '2px solid #D1D5DB',
                    background: allChecked ? '#628141' : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'all 0.15s',
                  }}
                >
                  {allChecked && (
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                      <path
                        d="M1 5L4.5 8.5L12 1"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#1C1917',
                  }}
                >
                  Pilih Semua
                  {checkedCount > 0 && (
                    <span style={{ color: '#78716C', fontWeight: 500 }}> ({checkedCount})</span>
                  )}
                </span>
              </div>

              {checkedCount > 0 && (
                <button
                  onClick={handleDeleteChecked}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    color: '#EF4444',
                    padding: '4px 8px',
                    borderRadius: 6,
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FEF2F2')}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
                >
                  Hapus
                </button>
              )}
            </div>
          )}

          {/* Cart Items */}
          {displayedItems.length === 0 ? (
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1.5px solid #E7E5E4',
              }}
            >
              <EmptyCart onShop={() => navigate('/nutrishop')} />
            </div>
          ) : (
            <div
              style={{
                background: '#fff',
                borderRadius: 14,
                border: '1.5px solid #E7E5E4',
                padding: isMobile ? '12px' : '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Seller group header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  paddingBottom: 12,
                  borderBottom: '1px solid #F5F5F0',
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: '#ECFCCB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ShoppingBasket size={15} color="#3F6212" />
                </div>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#1C1917',
                  }}
                >
                  NutriShop
                </span>
              </div>

              {displayedItems.map(item => (
                <CardCart
                  key={item.id}
                  {...item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemove}
                  onToggleCheck={handleToggleCheck}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Right Column — Sticky Summary ── */}
        <div
          style={{
            width: isMobile ? '100%' : 300,
            flexShrink: 0,
            position: isMobile ? 'static' : 'sticky',
            top: 24,
            marginTop: isMobile ? 14 : 0,
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1.5px solid #E7E5E4',
              borderRadius: 14,
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: 17,
                color: '#1C1917',
              }}
            >
              Ringkasan Belanja
            </h2>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                paddingBottom: 18,
                borderBottom: '1px dashed #E7E5E4',
              }}
            >
              {checkedItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'var(--font-heading), sans-serif',
                      fontSize: 13,
                      color: '#57534E',
                      flex: 1,
                      minWidth: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title} ×{item.quantity}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Montserrat, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#1C1917',
                      flexShrink: 0,
                    }}
                  >
                    Rp{formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              {checkedItems.length === 0 && (
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-heading), sans-serif',
                    fontSize: 13,
                    color: '#A8A29E',
                    textAlign: 'center',
                  }}
                >
                  Belum ada produk dipilih
                </p>
              )}
            </div>

            {/* Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  fontSize: 15,
                  color: '#1C1917',
                }}
              >
                Total
              </span>
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 800,
                  fontSize: 18,
                  color: '#628141',
                }}
              >
                Rp{formatPrice(total)}
              </span>
            </div>

            {/* Buy Button */}
            <button
              disabled={checkedCount === 0}
              style={{
                padding: '14px',
                background: checkedCount > 0 ? '#628141' : '#D1D5DB',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 800,
                fontSize: 15,
                cursor: checkedCount > 0 ? 'pointer' : 'not-allowed',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => {
                if (checkedCount > 0)
                  (e.currentTarget as HTMLElement).style.background = '#4d6632'
              }}
              onMouseLeave={e => {
                if (checkedCount > 0)
                  (e.currentTarget as HTMLElement).style.background = '#628141'
              }}
            >
              {checkedCount > 0 ? `Beli (${checkedCount})` : 'Pilih produk dahulu'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}