import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { registerUser } from '../../store/actions/authActions'
import type { AppDispatch } from '../../store/store'

const Register = () => {
  const [firstName, setFirstName] = useState<string>('')
  const [lastName, setLastName] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [enrollment, setEnrollment] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()

  const registerHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')
      setError('')
      const payload = {
        fullName: {
          firstName,
          lastName
        },
        userName,
        email,
        enrollmentNumber: enrollment,
        password
      }
      await dispatch(registerUser(payload))
      setStatus('success')
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Registration failed')
      }
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="space-y-6 text-center"
      >
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 font-bold text-xl">
          ✓
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold text-zinc-900">Check your email</h2>
          <p className="text-xs text-zinc-500">
            We&apos;ve sent a verification link to activate your account.
          </p>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md text-left space-y-2">
          <div className="text-xs text-zinc-500">Sent to:</div>
          <div className="text-sm font-semibold text-zinc-900 break-all">{email}</div>
          <p className="text-xs text-zinc-600 pt-1 leading-relaxed">
            Click the link in the email to confirm your account and sign in. If you don&apos;t see it within a few minutes, please check your spam folder.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/auth/login"
            className="w-full inline-block py-2 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Create your account</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Register as an advocate or legal practitioner</p>
      </div>

      {status === 'error' && (
        <div className="text-xs text-red-600 bg-red-50 p-3 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={registerHandler} className="space-y-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label htmlFor="firstName" className="block text-xs font-medium text-zinc-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
              placeholder="John"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-medium text-zinc-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
              placeholder="Doe"
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            />
          </div>
        </div>

        <div>
          <label htmlFor="userName" className="block text-xs font-medium text-zinc-700 mb-1">
            Username
          </label>
          <input
            id="userName"
            type="text"
            required
            value={userName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserName(e.target.value)}
            placeholder="johndoe_adv"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-zinc-700 mb-1">
            Email Address
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="john.doe@barcouncil.org"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="enrollment" className="block text-xs font-medium text-zinc-700 mb-1">
            Bar / Enrollment Number
          </label>
          <input
            id="enrollment"
            type="text"
            required
            value={enrollment}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEnrollment(e.target.value)}
            placeholder="D/1234/2024"
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-xs font-medium text-zinc-700 mb-1">
            Password
          </label>
          <input
            id="reg-password"
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
          className="w-full py-2 px-4 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors cursor-pointer mt-2"
        >
          {status === 'loading' ? 'Creating account...' : 'Create Account'}
        </motion.button>
      </form>

      <div className="pt-2 text-center border-t border-zinc-100">
        <p className="text-xs text-zinc-500">
          Already have an account?{' '}
          <Link to="/auth/login" className="font-medium text-zinc-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register