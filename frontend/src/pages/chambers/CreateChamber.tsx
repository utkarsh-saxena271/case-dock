import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch } from '../../store/store'
import { createChamber } from '../../store/actions/chamberActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

const CreateChamber = () => {
  const [status, setStatus] = useState<'idle' | 'error' | 'loading' | 'success'>('idle')
  const [error, setError] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const createChamberHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')
      const res = await dispatch(createChamber({ name, description }))
      setStatus('success')
      navigate(`/chamber/${res.id}`)
    } catch (err) {
      setStatus('error')
      setError(getErrorMessage(err, 'Error in creating chamber'))
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-xl mx-auto p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Create Chamber</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Establish a new collaborative legal practice</p>
        </div>
        <Link
          to="/chamber"
          className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {status === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md mb-4 border border-red-200">
          {error}
        </div>
      )}
      {status === 'loading' && <div className="text-sm text-zinc-500 mb-4">Creating chamber...</div>}

      <form onSubmit={createChamberHandler} className="space-y-4">
        <div>
          <label htmlFor="chamber-name" className="block text-xs font-medium text-zinc-700 mb-1">
            Chamber Name
          </label>
          <input
            id="chamber-name"
            type="text"
            required
            placeholder="e.g. Blackstone Chambers"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="chamber-desc" className="block text-xs font-medium text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            id="chamber-desc"
            rows={3}
            placeholder="Specialization, jurisdiction, office location..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/chamber"
            className="px-4 py-2 text-sm text-zinc-700 bg-zinc-100 rounded-md hover:bg-zinc-200 transition-colors"
          >
            Cancel
          </Link>
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={status === 'loading'}
            className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 rounded-md hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {status === 'loading' ? 'Creating...' : 'Create Chamber'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default CreateChamber