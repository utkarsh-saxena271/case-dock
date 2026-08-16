import { motion } from 'motion/react'

const OpeningLoader = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex items-center gap-3"
      >
        <span className="w-9 h-9 rounded bg-zinc-900 text-white font-bold text-base flex items-center justify-center font-mono select-none">
          CD
        </span>
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-bold text-zinc-900 tracking-tight">
            Opening case-dock
          </span>
          <motion.span
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xl font-bold text-zinc-400 leading-none"
          >
            …
          </motion.span>
        </div>
      </motion.div>
    </div>
  )
}

export default OpeningLoader
