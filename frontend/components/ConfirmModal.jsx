import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, X } from 'lucide-react'

export default function ConfirmModal({ isOpen, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', onConfirm, onCancel, isDangerous = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`p-6 border-b border-white/10 flex items-center justify-between ${isDangerous ? 'bg-red-500/10' : 'bg-blue-500/10'}`}>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isDangerous ? 'bg-red-500/20' : 'bg-blue-500/20'}`}>
                  <AlertTriangle size={20} className={isDangerous ? 'text-red-400' : 'text-blue-400'} />
                </div>
                <h2 className="text-lg font-bold text-gray-100">{title}</h2>
              </div>
              <button
                onClick={onCancel}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Message */}
            <div className="p-6">
              <p className="text-gray-300 mb-6">{message}</p>
            </div>

            {/* Actions */}
            <div className="p-6 border-t border-white/10 bg-black/40 flex gap-3 justify-end">
              <button
                onClick={onCancel}
                className="px-4 py-2 rounded-lg border border-white/10 text-gray-300 hover:bg-white/10 transition-colors font-medium"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                  isDangerous
                    ? 'bg-gradient-to-r from-red-600 to-red-500 hover:shadow-lg hover:shadow-red-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:shadow-lg hover:shadow-blue-500/20'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
