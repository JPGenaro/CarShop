import { motion, AnimatePresence } from 'framer-motion'
import { Check, AlertCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

function Toast({ id, message, type = 'info', duration = 4000, onClose }) {
  const [isClosing, setIsClosing] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsClosing(true)
      setTimeout(() => onClose(id), 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [id, duration, onClose])

  const icons = {
    success: <Check className="w-5 h-5 text-green-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
  }

  const colors = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    info: 'bg-blue-500/20 border-blue-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -100, y: 0 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: -100, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-xl ${colors[type]} shadow-lg`}
    >
      {icons[type]}
      <span className="text-sm font-medium text-white">{message}</span>
      <button
        onClick={() => {
          setIsClosing(true)
          setTimeout(() => onClose(id), 300)
        }}
        className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
      >
        <X className="w-4 h-4 text-gray-300" />
      </button>
    </motion.div>
  )
}

export default function ToastContainer({ toasts, onRemove }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast {...toast} onClose={onRemove} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
