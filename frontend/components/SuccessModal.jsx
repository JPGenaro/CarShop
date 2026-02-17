import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'

export default function SuccessModal({ isOpen, message = 'Operación completada exitosamente' }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.5, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-[#1a1a1a] border border-green-500/30 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', damping: 15, stiffness: 200 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 rounded-full bg-green-500/20">
                <CheckCircle size={48} className="text-green-400" />
              </div>
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-green-400 mb-2"
            >
              ¡Éxito!
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-gray-300"
            >
              {message}
            </motion.p>

            {/* Barra de progreso */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 2 }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-green-500 to-green-400"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
