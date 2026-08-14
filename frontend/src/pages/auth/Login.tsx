import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { loginUser } from '../../store/actions/authActions'
import type { AppDispatch, RootState } from '../../store/store'

const Login = () => {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)

  const loginHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')
      setError('')
      await dispatch(loginUser({ email, password }))
      setStatus('success')
      navigate('/case')
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Invalid credentials or server error')
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Sign in to your account</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Enter your legal credentials to continue</p>
      </div>

      {status === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={loginHandler} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-zinc-700 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="advocate@chambers.com"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-xs font-medium text-zinc-700">
              Password
            </label>
            <Link
              to="/auth/forgot-password"
              className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
        >
          {status === 'loading' ? 'Signing in...' : 'Sign in'}
        </motion.button>
      </form>

      {user && (
        <p className="text-xs text-emerald-700 bg-emerald-50 p-2 rounded text-center">
          Active session: {user.firstName} {user.lastName}
        </p>
      )}

      <div className="pt-2 text-center border-t border-zinc-100">
        <p className="text-xs text-zinc-500">
          Don&apos;t have an account?{' '}
          <Link to="/auth/register" className="font-medium text-zinc-900 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login