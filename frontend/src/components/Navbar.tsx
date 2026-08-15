import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../store/store'
import { logoutUser } from '../store/actions/authActions'

const Navbar = () => {
  const [loggingOut, setLoggingOut] = useState(false)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const user = useSelector((state: RootState) => state.auth.user)

  // useCallback here keeps a stable function reference across re-renders
  // (e.g. every route change re-renders Navbar since it reads useLocation).
  // Without it, a brand-new handleLogout is created every render, which
  // matters the moment this gets passed to a memoized child button —
  // a new reference would defeat that memoization.
  const handleLogout = useCallback(async () => {
    try {
      setLoggingOut(true)
      await dispatch(logoutUser())
      navigate('/auth/login')
    } catch (err) {
      console.error('Logout error:', err)
      // Even if network fails, ensure user is redirected to login
      navigate('/auth/login')
    } finally {
      setLoggingOut(false)
    }
  }, [dispatch, navigate])

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Cases', path: '/case' },
    { label: 'Chambers', path: '/chamber' }
  ]

  const isLinkActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6 sm:gap-8">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            <span className="w-8 h-8 rounded bg-zinc-900 text-white font-bold text-base flex items-center justify-center font-mono group-hover:bg-zinc-800 transition-colors">
              CD
            </span>
            <span className="text-lg font-bold text-zinc-900 tracking-tight hidden sm:inline">
              Case-Dock
            </span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2">
            {navLinks.map((link) => {
              const active = isLinkActive(link.path)
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-xs font-medium px-3 py-1.5 rounded-md transition-colors ${
                    active
                      ? 'bg-zinc-100 text-zinc-900 font-semibold'
                      : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {user && (
            <div className="text-right hidden sm:block">
              <div className="text-xs font-medium text-zinc-900">
                {user.firstName} {user.lastName}
              </div>
              <div className="text-[11px] text-zinc-500">
                @{user.userName}
              </div>
            </div>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            disabled={loggingOut}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {loggingOut ? 'Logging out...' : 'Logout'}
          </motion.button>
        </div>
      </div>
    </header>
  )
}

export default Navbar