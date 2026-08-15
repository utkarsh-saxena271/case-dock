import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch } from '../../store/store'
import { forgotPassword } from '../../store/actions/authActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

const ForgotPassword = () => {
  const [email, setEmail] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()

  const forgotPasswordHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')
      setError('')
      await dispatch(forgotPassword({ email }))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(getErrorMessage(err, 'Password reset request failed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Forgot your password?</h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Enter your registered email address to receive password reset instructions.
        </p>
      </div>

      {status === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {status === 'success' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 bg-emerald-50 border border-emerald-200 rounded-md space-y-2 text-center"
        >
          <div className="text-sm font-semibold text-emerald-800">Reset Email Sent</div>
          <p className="text-xs text-emerald-600">
            If an account exists for <span className="font-medium text-emerald-800">{email}</span>, you will receive password reset instructions.
          </p>
          <div className="pt-3">
            <Link
              to="/auth/login"
              className="inline-block px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={forgotPasswordHandler} className="space-y-4">
          <div>
            <label htmlFor="fp-email" className="block text-xs font-medium text-zinc-700 mb-1">
              Email Address
            </label>
            <input
              id="fp-email"
              type="email"
              required
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
              placeholder="advocate@chambers.com"
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
            {status === 'loading' ? 'Sending reset link...' : 'Send Reset Link'}
          </motion.button>
        </form>
      )}

      <div className="pt-2 text-center border-t border-zinc-100">
        <Link to="/auth/login" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
          ← Back to Sign In
        </Link>
      </div>
    </div>
  )
}

export default ForgotPassword