import React from 'react'
import { motion } from 'motion/react'

interface AnimatedPageProps {
  children: React.ReactNode
}

export const AnimatedPage = ({ children }: AnimatedPageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', flexGrow: 1 }}
    >
      {children}
    </motion.div>
  )
}

export default AnimatedPage
