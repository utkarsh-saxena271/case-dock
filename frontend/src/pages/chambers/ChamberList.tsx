import { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { fetchMyChambers } from '../../store/actions/chamberActions'

interface ChamberListItemProps {
  id: string
  name: string
  description?: string | null
}

const ChamberListItem = memo(({ id, name, description }: ChamberListItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between"
    >
      <div className="space-y-1">
        <Link
          to={`/chamber/${id}`}
          className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 hover:underline"
        >
          {name}
        </Link>
        {description ? (
          <p className="text-xs text-zinc-500 line-clamp-1">{description}</p>
        ) : (
          <p className="text-xs text-zinc-400 italic">No description</p>
        )}
      </div>
      <Link
        to={`/chamber/${id}`}
        className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
      >
        View Chamber →
      </Link>
    </motion.div>
  )
})
ChamberListItem.displayName = 'ChamberListItem'

const ChamberList = () => {
  const [status, setStatus] = useState<'loading' | 'empty' | 'idle' | 'error'>('idle')
  const [error, setError] = useState<string>('')
  const chambers = useSelector((state: RootState) => state.chamber.chambers)
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    ;(async () => {
      try {
        setStatus('loading')
        const result = await dispatch(fetchMyChambers())
        if (result.length === 0) {
          setStatus('empty')
        } else {
          setStatus('idle')
        }
      } catch (err) {
        setStatus('error')
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('Error in fetching chambers')
        }
      }
    })()
  }, [dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Chambers</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Law chambers and collaborative practices</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/case"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
          >
            My Cases
          </Link>
          <Link
            to="/chamber/discover"
            className="text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-md transition-colors"
          >
            Discover
          </Link>
          <Link
            to="/chamber/create"
            className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
          >
            + Create Chamber
          </Link>
        </div>
      </div>

      {status === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {status === 'loading' && <div className="text-sm text-zinc-500">Loading chambers...</div>}

      {status === 'empty' && (
        <div className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-300 rounded-lg">
          You have not joined any chambers yet.{' '}
          <Link to="/chamber/discover" className="text-zinc-900 font-medium underline">
            Discover chambers
          </Link>{' '}
          or create a new one.
        </div>
      )}

      {status === 'idle' && chambers.length > 0 && (
        <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100">
          {chambers.map((chamber) => (
            <ChamberListItem
              key={chamber.id}
              id={chamber.id}
              name={chamber.name}
              description={chamber.description}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default ChamberList