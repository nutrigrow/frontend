import { motion } from 'motion/react'
import { Clock } from 'lucide-react'

export interface ArticleCardProps {
  id: number
  image?: string
  title: string
  description: string
  category: string
  readTime: number
  onClick?: (id: number) => void
}

export const CardArtikel = ({
  id,
  image,
  title,
  description,
  category,
  readTime,
  onClick,
}: ArticleCardProps) => {
  const fallbackImage = 'https://via.placeholder.com/300x220?text=No+Image'
  const imgSrc = image && image.trim() !== '' ? image : fallbackImage

  const handleClick = () => {
    if (onClick) {
      onClick(id)
    } else {
      window.location.href = `/baca-artikel/${id}`
    }
  }

  return (
    <motion.div
      onClick={handleClick}
      style={{
        background: '#fff',
        borderRadius: 16,
        borderStyle: 'solid',
        borderWidth: 1.5,
        borderColor: '#E7E5E4',
        cursor: 'pointer',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      whileHover={{
        y: -6,
        borderColor: '#628141',
        boxShadow: '0 16px 40px rgba(98, 129, 65, 0.15)',
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      {/* ── Article Image with Category Tag ── */}
      <div
        style={{
          width: '100%',
          height: 220,
          overflow: 'hidden',
          flexShrink: 0,
          background: '#F5F5F0',
          position: 'relative',
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

        {/* Category Tag  */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px 10px',
            background: '#ECFCCB',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            borderRadius: 15,
            border: '1px solid #ECFCCB',
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 10,
              fontWeight: 700,
              color: '#628141',
              letterSpacing: '0.8px',
              textTransform: 'uppercase',
            }}
          >
            {category}
          </span>
        </div>
      </div>

      {/* ── Card Body ── */}
      <div
        style={{
          padding: '18px 20px 16px',
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
            fontSize: 16,
            color: '#1C1917',
            lineHeight: '22px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {title}
        </h3>

        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-heading), sans-serif',
            fontSize: 13,
            color: '#78716C',
            lineHeight: '20px',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {description}
        </p>

        {/* ── Read Time footer ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            marginTop: 8,
            paddingTop: 12,
            borderTop: '1px solid #F0EDE8',
          }}
        >
          <Clock size={13} color="#628141" strokeWidth={2.5} />
          <span
            style={{
              fontFamily: 'var(--font-heading), sans-serif',
              fontSize: 12,
              fontWeight: 600,
              color: '#628141',
            }}
          >
            {readTime} Menit Baca
          </span>
        </div>
      </div>
    </motion.div>
  )
}