import { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch } from '../../store/store'
import { verifyEmail } from '../../store/actions/authActions'

const VerifyEmail = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
    token ? 'loading' : 'error'
  )
  const [error, setError] = useState<string | null>(
    token ? null : 'No verification token found in URL.'
  )
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return

    const verify = async () => {
      try {
        await dispatch(verifyEmail(token))
        setStatus('success')
        setTimeout(() => navigate('/auth/login'), 2000)
      } catch (err) {
        setStatus('error')
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Verification failed')
        }
      }
    }

    verify()
  }, [token, dispatch, navigate])

  return (
    <div className="space-y-6 text-center">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Email Verification</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Confirming your practitioner account</p>
      </div>

      {status === 'loading' && (
        <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-md">
          <div className="text-sm text-zinc-700 font-medium">Verifying your email...</div>
          <p className="text-xs text-zinc-400 mt-1">Please wait a moment while we validate your token.</p>
        </div>
      )}

      {status === 'success' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-emerald-50 border border-emerald-200 rounded-md space-y-2"
        >
          <div className="text-sm font-semibold text-emerald-800">Email Verified Successfully!</div>
          <p className="text-xs text-emerald-600">
            Your email is confirmed. Redirecting you to the sign in page...
          </p>
          <div className="pt-2">
            <Link
              to="/auth/login"
              className="text-xs font-medium text-emerald-900 underline hover:text-emerald-700"
            >
              Click here if you are not redirected automatically
            </Link>
          </div>
        </motion.div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50 border border-red-200 rounded-md space-y-3">
          <div className="text-sm font-semibold text-red-800">Verification Failed</div>
          <p className="text-xs text-red-600">{error || 'The verification link may be expired or invalid.'}</p>
          <div className="pt-2">
            <Link
              to="/auth/login"
              className="inline-block px-4 py-2 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      )}

      {!token && (
        <div className="pt-2">
          <p className="text-xs text-zinc-500">
            Check your email inbox for the verification link sent upon registration.
          </p>
        </div>
      )}
    </div>
  )
}

export default VerifyEmail