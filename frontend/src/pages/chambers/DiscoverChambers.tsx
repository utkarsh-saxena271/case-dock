import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { discoverChambers } from '../../store/actions/chamberActions'
import { createJoinRequest } from '../../store/actions/membershipActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

const DiscoverChambers = () => {
  const [page, setPage] = useState<number>(1)
  const [query, setQuery] = useState<string>('')
  const [requestedMap, setRequestedMap] = useState<Record<string, boolean>>({})
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const limit = 10

  const chambers = useSelector((state: RootState) => state.chamber.discoverResults)
  const pagination = useSelector((state: RootState) => state.chamber.discoverPagination)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        setStatus('loading')
        await dispatch(discoverChambers({ q: query, page, limit }))
        setStatus('idle')
      } catch (err) {
        setStatus('error')
        setError(getErrorMessage(err, 'Failed to discover chambers'))
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, page, dispatch])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setPage(1)
  }

  const joinHandler = async (id: string) => {
    try {
      await dispatch(createJoinRequest(id))
      setRequestedMap((prev) => ({ ...prev, [id]: true }))
    } catch (err) {
      console.error('Failed to send join request', err)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Discover Chambers</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Explore chambers to join and collaborate</p>
        </div>
        <Link
          to="/chamber"
          className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
        >
          ← My Chambers
        </Link>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleQueryChange(e.target.value)}
          placeholder="Search chambers by name..."
          className="w-full px-4 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
        />
      </div>

      {status === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {status === 'loading' && <div className="text-sm text-zinc-500">Searching chambers...</div>}

      {status !== 'loading' && chambers.length === 0 && (
        <div className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-300 rounded-lg">
          No chambers found matching your search.
        </div>
      )}

      <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100">
        {chambers.map((chamber) => {
          const isRequested = requestedMap[chamber.id]
          return (
            <motion.div
              key={chamber.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-900">{chamber.name}</h3>
                {chamber.description ? (
                  <p className="text-xs text-zinc-500 line-clamp-1">{chamber.description}</p>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No description</p>
                )}
              </div>

              <div>
                {isRequested ? (
                  <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-md font-medium">
                    Request Sent
                  </span>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => joinHandler(chamber.id)}
                    className="px-3 py-1.5 text-xs font-medium text-zinc-900 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 rounded-md transition-colors"
                  >
                    Request to Join
                  </motion.button>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 rounded-md transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 rounded-md transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </motion.div>
  )
}

export default DiscoverChambers