import { Trash2 } from 'lucide-react'

export interface CartItem {
  id: number
  image?: string
  title: string
  price: number
  quantity: number
  checked?: boolean
}

export interface CardCartProps extends CartItem {
  onQuantityChange: (id: number, qty: number) => void
  onRemove: (id: number) => void
  onToggleCheck: (id: number) => void
  onWishlist?: (id: number) => void
}

export const CardCart = ({
  id,
  image,
  title,
  price,
  quantity,
  checked = true,
  onQuantityChange,
  onRemove,
  onToggleCheck,
}: CardCartProps) => {
  const formatPrice = (p: number) => p.toLocaleString('id-ID')
  const fallback = 'https://via.placeholder.com/80x80?text=No+Image'
  const imgSrc = image && image.trim() !== '' ? image : fallback

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 14,
        border: '1.5px solid #E7E5E4',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        transition: 'border-color 0.15s, box-shadow 0.15s',
      }}
      onMouseEnter={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#c9d9b3'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(98,129,65,0.10)'
      }}
      onMouseLeave={e => {
        ;(e.currentTarget as HTMLElement).style.borderColor = '#E7E5E4'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggleCheck(id)}
        aria-label={checked ? 'Uncheck item' : 'Check item'}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: checked ? 'none' : '2px solid #D1D5DB',
          background: checked ? '#628141' : '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        {checked && (
          <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
            <path d="M1 5L4.5 8.5L12 1" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Thumbnail */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: 10,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#F5F5F0',
        }}
      >
        <img
          src={imgSrc}
          alt={title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => {
            ;(e.currentTarget as HTMLImageElement).src = fallback
          }}
        />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: '0 0 4px',
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 14,
            color: '#1C1917',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 11,
              fontWeight: 600,
              color: '#628141',
            }}
          >
            Rp
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 800,
              color: '#628141',
            }}
          >
            {formatPrice(price)}
          </span>
        </div>

        {/* Actions row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 10,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {/* Delete */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => onRemove(id)}
              aria-label="Hapus produk"
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                border: '1px solid #E7E5E4',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#FFF5F5')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#fff')}
            >
              <Trash2 size={15} color="#A8A29E" />
            </button>
          </div>

          {/* Quantity Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 0,
              border: '1.5px solid #E7E5E4',
              borderRadius: 9,
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => onQuantityChange(id, Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              style={{
                width: 32,
                height: 32,
                background: '#F9FAF6',
                border: 'none',
                cursor: quantity <= 1 ? 'not-allowed' : 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 18,
                fontWeight: 600,
                color: quantity <= 1 ? '#D1D5DB' : '#44403C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => {
                if (quantity > 1) (e.currentTarget as HTMLElement).style.background = '#ECFCCB'
              }}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#F9FAF6')}
            >
              −
            </button>
            <span
              style={{
                minWidth: 36,
                textAlign: 'center',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                color: '#1C1917',
                padding: '0 4px',
              }}
            >
              {quantity}
            </span>
            <button
              onClick={() => onQuantityChange(id, quantity + 1)}
              style={{
                width: 32,
                height: 32,
                background: '#F9FAF6',
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 18,
                fontWeight: 600,
                color: '#44403C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'background 0.12s',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = '#ECFCCB')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = '#F9FAF6')}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}