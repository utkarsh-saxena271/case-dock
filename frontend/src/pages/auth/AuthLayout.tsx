import { Outlet, Link } from 'react-router-dom'
import { motion } from 'motion/react'

const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between p-4 sm:p-8">
      <div className="max-w-md w-full mx-auto pt-8">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="w-8 h-8 rounded bg-zinc-900 text-white font-bold text-base flex items-center justify-center font-mono">
              CD
            </span>
            <span className="text-xl font-bold text-zinc-900 tracking-tight">
              Case-Dock
            </span>
          </Link>
          <p className="text-xs text-zinc-500 mt-1">Case & Chamber Management System</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-zinc-200 rounded-lg p-6 sm:p-8 shadow-xs"
        >
          <Outlet />
        </motion.div>
      </div>

      <div className="text-center text-xs text-zinc-400 py-4">
        &copy; {new Date().getFullYear()} Case-Dock. All rights reserved.
      </div>
    </div>
  )
}

export default AuthLayout