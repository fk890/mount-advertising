import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface FadeInViewProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right' | 'none'
}

export function FadeInView({ 
  children, 
  delay = 0, 
  duration = 0.8, 
  className = '',
  direction = 'up' 
}: FadeInViewProps) {
  const directionVariants = {
    up: { opacity: 0, y: 50 },
    down: { opacity: 0, y: -50 },
    left: { opacity: 0, x: 50 },
    right: { opacity: 0, x: -50 },
    none: { opacity: 0 }
  }

  const animateVariants = {
    up: { opacity: 1, y: 0 },
    down: { opacity: 1, y: 0 },
    left: { opacity: 1, x: 0 },
    right: { opacity: 1, x: 0 },
    none: { opacity: 1 }
  }

  return (
    <motion.div
      initial={directionVariants[direction]}
      whileInView={animateVariants[direction]}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ 
        duration, 
        delay,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Staggered container for multiple items
export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  className = '' 
}: { 
  children: ReactNode
  staggerDelay?: number
  className?: string 
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-10%" }}
      variants={{
        visible: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Individual stagger item
export function StaggerItem({ 
  children, 
  className = '',
  direction = 'up'
}: {
  children: ReactNode
  className?: string
  direction?: 'up' | 'down' | 'left' | 'right'
}) {
  const variants = {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
      x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0
    }
  }

  return (
    <motion.div
      variants={variants}
      transition={{
        duration: 0.6,
        ease: "easeOut"
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
