import { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { fetchMyCases } from '../../store/actions/caseActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

interface CaseListItemProps {
  id: string
  name: string
  description?: string | null
  ownerType: string
  status: string
}

const CaseListItem = memo(({ id, name, description, ownerType, status }: CaseListItemProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between"
    >
      <div className="space-y-1">
        <Link
          to={`/case/${id}`}
          className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 hover:underline"
        >
          {name}
        </Link>
        {description && (
          <p className="text-xs text-zinc-500 line-clamp-1">{description}</p>
        )}
        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
          <span>Owner: {ownerType}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-xs px-2.5 py-0.5 rounded font-mono font-medium ${
            status === 'ACTIVE'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : status === 'ON_HOLD'
              ? 'bg-amber-50 text-amber-700 border border-amber-200'
              : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
          }`}
        >
          {status}
        </span>
        <Link
          to={`/case/${id}`}
          className="text-xs text-zinc-500 hover:text-zinc-900"
        >
          View →
        </Link>
      </div>
    </motion.div>
  )
})
CaseListItem.displayName = 'CaseListItem'

const CaseList = () => {
  const [error, setError] = useState<string>('')
  const [status, setStatus] = useState<'idle' | 'success' | 'loading' | 'error'>('idle')

  const dispatch = useDispatch<AppDispatch>()
  const myCases = useSelector((state: RootState) => state.cases.myCases)

  useEffect(() => {
    ;(async () => {
      try {
        setStatus('loading')
        await dispatch(fetchMyCases())
        setStatus('success')
      } catch (err) {
        setStatus('error')
        setError(getErrorMessage(err, 'Error fetching cases'))
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
          <h1 className="text-2xl font-bold text-zinc-900">Cases</h1>
          <p className="text-xs text-zinc-500 mt-0.5">Manage your personal and chamber cases</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/chamber"
            className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-3 py-1.5 rounded-md hover:bg-zinc-100 transition-colors"
          >
            Chambers
          </Link>
          <Link
            to="/case/create"
            className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
          >
            + Create Case
          </Link>
        </div>
      </div>

      {status === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {status === 'loading' && <div className="text-sm text-zinc-500">Loading cases...</div>}

      {status !== 'loading' && myCases.length === 0 && (
        <div className="text-sm text-zinc-500 py-6 text-center border border-dashed border-zinc-300 rounded-lg">
          No cases found. Create your first case to get started.
        </div>
      )}

      {myCases.length > 0 && (
        <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100">
          {myCases.map((myCase) => (
            <CaseListItem
              key={myCase.id}
              id={myCase.id}
              name={myCase.name}
              description={myCase.description}
              ownerType={myCase.ownerType}
              status={myCase.status}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default CaseList