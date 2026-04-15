import { motion } from 'motion/react'
import { useNavigate } from 'react-router'

export interface ProductCardProps {
  id: number
  image?: string
  title: string
  description: string
  price: number
}

export const CardNutrishop = ({ id, image, title, description, price }: ProductCardProps) => {
  const navigate = useNavigate()

  const formatPrice = (p: number) => p.toLocaleString('id-ID')

  const fallbackImage = 'https://via.placeholder.com/300x220?text=No+Image'
  const imgSrc = image && image.trim() !== '' ? image : fallbackImage

  return (
    <motion.div
      onClick={() => navigate(`/nutrishop/${id}`)}
      style={{
        background: '#fff',
        borderRadius: 16,
        borderStyle: 'solid',
        borderWidth: 2,
        borderColor: '#E7E5E4',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
      }}
      whileHover={{
        y: -7,
        borderColor: '#628141',
        boxShadow: '0 18px 44px rgba(98, 129, 65, 0.18)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
    >
      {/* Product Image */}
      <div
        style={{
          width: '100%',
          height: 220,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#F5F5F0',
        }}
      >
        <img
          src={imgSrc}
          alt={title}
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
      </div>

      {/* Card Body */}
      <div
        style={{
          padding: '20px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          flex: 1,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontFamily: 'Montserrat, sans-serif',
            fontWeight: 700,
            fontSize: 17,
            color: '#1C1917',
            lineHeight: '24px',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            color: '#78716C',
            lineHeight: '20px',
          }}
        >
          {description}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 6 }}>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: 600,
              color: '#628141',
            }}
          >
            Rp
          </span>
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 22,
              fontWeight: 800,
              color: '#628141',
            }}
          >
            {formatPrice(price)}
          </span>
        </div>
      </div>
    </motion.div>
  )
}