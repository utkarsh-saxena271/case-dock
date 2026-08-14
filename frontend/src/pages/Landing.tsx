import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { RootState } from '../store/store'

const Landing = () => {
  const navigate = useNavigate()
  const currentUser = useSelector((state: RootState) => state.auth.user)
  if(currentUser){
    navigate('/chamber')
  }
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col justify-between">
      <header className="border-b border-zinc-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded bg-zinc-900 text-white font-bold text-base flex items-center justify-center font-mono">
              CD
            </span>
            <span className="text-lg font-bold text-zinc-900 tracking-tight">
              Case-Dock
            </span>
          </Link>

          <nav className="flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/chamber"
                  className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                >
                  Chambers
                </Link>
                <Link
                  to="/case"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                >
                  Dashboard ({currentUser.firstName})
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/auth/login"
                  className="text-xs font-medium text-zinc-700 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                >
                  Get Started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16 sm:py-24 space-y-20 flex-1">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="text-center space-y-6 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 border border-zinc-200 rounded-full text-xs font-medium text-zinc-700">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Built for Litigators & Law Chambers
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 leading-tight sm:leading-tight">
            Precision Case Management for Modern Legal Practice
          </h1>

          <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl mx-auto">
            Orchestrate personal and collaborative cases, track hearings chronologically, manage attached pleadings and filings, and govern team access with granular permissions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {currentUser ? (
              <>
                <Link
                  to="/case"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-xs"
                >
                  Open Cases →
                </Link>
                <Link
                  to="/chamber"
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  My Chambers
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/auth/register"
                  className="px-5 py-2.5 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors shadow-xs"
                >
                  Create Free Account
                </Link>
                <Link
                  to="/auth/login"
                  className="px-5 py-2.5 text-sm font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            className="p-6 bg-white border border-zinc-200 rounded-lg space-y-3"
          >
            <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono font-bold text-sm">
              01
            </div>
            <h2 className="text-base font-semibold text-zinc-900">Chamber Collaboration</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Form multi-lawyer chambers, review incoming join requests with customized permissions, and collaborate seamlessly across shared litigation dockets.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="p-6 bg-white border border-zinc-200 rounded-lg space-y-3"
          >
            <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono font-bold text-sm">
              02
            </div>
            <h2 className="text-base font-semibold text-zinc-900">Chronological Hearings</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Track court appearances, orders, and arguments in a clear timeline. Attach specific evidence or interim orders directly to the corresponding hearing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: 0.15 }}
            className="p-6 bg-white border border-zinc-200 rounded-lg space-y-3"
          >
            <div className="w-9 h-9 rounded bg-zinc-100 flex items-center justify-center text-zinc-800 font-mono font-bold text-sm">
              03
            </div>
            <h2 className="text-base font-semibold text-zinc-900">Document Vault</h2>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Upload case filings, petitions, affidavits, and exhibits with custom labels. Access your legal documents anywhere with cloud storage integration.
            </p>
          </motion.div>
        </div>

        <div className="p-8 bg-zinc-900 text-white rounded-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-lg font-bold">Ready to streamline your legal practice?</h3>
            <p className="text-xs text-zinc-400">Join chambers or organize your personal legal matters with Case-Dock.</p>
          </div>
          <Link
            to={currentUser ? '/case' : '/auth/register'}
            className="px-4 py-2 text-xs font-semibold text-zinc-900 bg-white hover:bg-zinc-100 rounded-md transition-colors whitespace-nowrap"
          >
            {currentUser ? 'Go to Cases →' : 'Get Started Now →'}
          </Link>
        </div>
      </main>

      <footer className="border-t border-zinc-200 bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-700">Case-Dock</span>
            <span>· Case management for lawyers & chambers</span>
          </div>
          <div>&copy; {new Date().getFullYear()} Case-Dock. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}

export default Landing
