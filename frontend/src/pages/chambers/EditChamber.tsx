import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { fetchMyChamberById, updateChamber } from '../../store/actions/chamberActions'

const EditChamber = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const params = useParams()
  const chamberId = params.chamberId
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const chamber = useSelector((state: RootState) => state.chamber.currentChamber)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const [name, setName] = useState<string>(() => (chamber?.id === chamberId ? chamber?.name || '' : ''))
  const [description, setDescription] = useState<string>(() =>
    chamber?.id === chamberId ? chamber?.description || '' : ''
  )

  const myMembership = chamber?.memberships.find((m) => m.user.id === currentUser?.id)
  const isOwner = myMembership?.role === 'OWNER'
  const canEdit = isOwner || myMembership?.permissions.includes('EDIT_GROUP')

  useEffect(() => {
    if (!chamberId) return
    if (!chamber || chamber.id !== chamberId) {
      ;(async () => {
        try {
          setStatus('loading')
          const fetched = await dispatch(fetchMyChamberById(chamberId))
          setName(fetched.name || '')
          setDescription(fetched.description || '')
          setStatus('idle')
        } catch (err) {
          setStatus('error')
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError('Failed to load chamber')
          }
        }
      })()
    }
  }, [chamberId, chamber, dispatch])

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!chamberId) return
    try {
      setStatus('loading')
      await dispatch(updateChamber({ chamberId, name, description }))
      setStatus('success')
      navigate(`/chamber/${chamberId}`)
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update chamber')
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
        <h1 className="text-xl font-semibold text-zinc-900">Edit Chamber</h1>
        <Link
          to={`/chamber/${chamberId}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Cancel
        </Link>
      </div>

      {status === 'loading' && <div className="text-sm text-zinc-500 mb-4">Loading...</div>}
      {status === 'error' && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {!canEdit && chamber && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md mb-4 border border-red-200">
          You do not have permission to edit this chamber.
        </div>
      )}

      {canEdit && (
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-zinc-700 mb-1">
              Chamber Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
              placeholder="e.g. Apex Law Chambers"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-medium text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
              placeholder="Brief overview of the chamber..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              to={`/chamber/${chamberId}`}
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
              {status === 'loading' ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </form>
      )}
    </motion.div>
  )
}

export default EditChamber
