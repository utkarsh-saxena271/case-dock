import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { createCase } from '../../store/actions/caseActions'
import { fetchMyChambers } from '../../store/actions/chamberActions'

const CreateCase = () => {
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle')
  const [error, setError] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [ownerType, setOwnerType] = useState<'PERSONAL' | 'CHAMBER'>('PERSONAL')
  const [chamberId, setChamberId] = useState<string>('')

  const chambers = useSelector((state: RootState) => state.chamber.chambers)
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchMyChambers())
  }, [dispatch])

  const createCaseHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setStatus('loading')
      const res = await dispatch(
        createCase({
          name,
          description,
          ownerType,
          ...(ownerType === 'CHAMBER' && { chamberId })
        })
      )
      setStatus('success')
      navigate(`/case/${res.id}`)
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Error creating case')
      }
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
          <h1 className="text-xl font-semibold text-zinc-900">Create New Case</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Register a personal case or chamber case</p>
        </div>
        <Link
          to="/case"
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
      {status === 'loading' && <div className="text-sm text-zinc-500 mb-4">Creating case...</div>}

      <form onSubmit={createCaseHandler} className="space-y-4">
        <div>
          <label htmlFor="case-name" className="block text-xs font-medium text-zinc-700 mb-1">
            Case Name
          </label>
          <input
            id="case-name"
            type="text"
            required
            placeholder="e.g. State v. John Doe"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="case-desc" className="block text-xs font-medium text-zinc-700 mb-1">
            Description
          </label>
          <textarea
            id="case-desc"
            rows={3}
            placeholder="Summary of matters, court jurisdiction, citation..."
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          />
        </div>

        <div>
          <label htmlFor="case-owner-type" className="block text-xs font-medium text-zinc-700 mb-1">
            Ownership
          </label>
          <select
            id="case-owner-type"
            value={ownerType}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setOwnerType(e.target.value as 'PERSONAL' | 'CHAMBER')
            }
            className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
          >
            <option value="PERSONAL">Personal Case</option>
            <option value="CHAMBER">Chamber Case</option>
          </select>
        </div>

        {ownerType === 'CHAMBER' && (
          <div>
            <label htmlFor="case-chamber" className="block text-xs font-medium text-zinc-700 mb-1">
              Select Chamber
            </label>
            <select
              id="case-chamber"
              value={chamberId}
              onChange={(e) => setChamberId(e.target.value)}
              required={true}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            >
              <option value="" disabled>
                -- Choose a Chamber --
              </option>
              {chambers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Link
            to="/case"
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
            {status === 'loading' ? 'Creating...' : 'Create Case'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  )
}

export default CreateCase