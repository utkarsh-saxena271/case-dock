import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch } from '../../store/store'
import { resetPassword } from '../../store/actions/authActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

const ResetPassword = () => {
  const [password, setPassword] = useState<string>('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    token ? 'idle' : 'error'
  )
  const [error, setError] = useState<string>(
    token ? '' : 'No reset token found in URL.'
  )

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const resetPasswordHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) return
    try {
      setStatus('loading')
      setError('')
      await dispatch(resetPassword({ token, password }))
      setStatus('success')
      setTimeout(() => {
        navigate('/auth/login')
      }, 2000)
    } catch (err) {
      setStatus('error')
      setError(getErrorMessage(err, 'Resetting password failed'))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Set new password</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Choose a secure password for your account</p>
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
          <div className="text-sm font-semibold text-emerald-800">Password Reset Complete</div>
          <p className="text-xs text-emerald-600">
            Your password has been updated. Redirecting to sign in...
          </p>
          <div className="pt-2">
            <Link to="/auth/login" className="text-xs font-medium text-emerald-900 underline">
              Click here to sign in now
            </Link>
          </div>
        </motion.div>
      ) : (
        <form onSubmit={resetPasswordHandler} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-xs font-medium text-zinc-700 mb-1">
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              required
              disabled={!token}
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white disabled:bg-zinc-100"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={!token || status === 'loading'}
            className="w-full py-2 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors cursor-pointer"
          >
            {status === 'loading' ? 'Resetting password...' : 'Update Password'}
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

export default ResetPassword