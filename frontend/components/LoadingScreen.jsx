import React from 'react'
import { motion } from 'framer-motion'
import Spinner from './Spinner'

export default function LoadingScreen({ message = 'Cargando...', show = true }) {
  if (!show) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const textVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.2, duration: 0.5 },
    },
  }

  const dotVariants = {
    animate: {
      opacity: [0.3, 1, 0.3],
      transition: {
        duration: 1.5,
        repeat: Infinity,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.3 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50"
    >
      {/* Spinner */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <Spinner size={8} />
      </motion.div>

      {/* Message */}
      <motion.div
        variants={textVariants}
        initial="hidden"
        animate="visible"
        className="text-center"
      >
        <p className="text-lg font-semibold text-white mb-2">{message}</p>
        <div className="flex items-center justify-center gap-1">
          <motion.span
            variants={dotVariants}
            animate="animate"
            className="text-orange-400 text-2xl"
          >
            •
          </motion.span>
          <motion.span
            variants={dotVariants}
            animate="animate"
            transition={{ delay: 0.2 }}
            className="text-orange-400 text-2xl"
          >
            •
          </motion.span>
          <motion.span
            variants={dotVariants}
            animate="animate"
            transition={{ delay: 0.4 }}
            className="text-orange-400 text-2xl"
          >
            •
          </motion.span>
        </div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.5 }}
        className="absolute bottom-10 text-gray-500 text-sm"
      >
        Por favor espera...
      </motion.div>
    </motion.div>
  )
}
