import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../store/store'
import { fetchMyCases } from '../store/actions/caseActions'
import { fetchMyChambers } from '../store/actions/chamberActions'

const Dashboard = () => {
  const [loadingCases, setLoadingCases] = useState(false)
  const [loadingChambers, setLoadingChambers] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)
  const myCases = useSelector((state: RootState) => state.cases.myCases)
  const chambers = useSelector((state: RootState) => state.chamber.chambers)

  useEffect(() => {
    // Only fetch if cases are not already loaded in the Redux store
    if (myCases.length === 0) {
      ;(async () => {
        try {
          setLoadingCases(true)
          await dispatch(fetchMyCases())
        } catch (err) {
          console.error('Failed to fetch cases for dashboard:', err)
        } finally {
          setLoadingCases(false)
        }
      })()
    }
  }, [dispatch, myCases.length])

  useEffect(() => {
    // Only fetch if chambers are not already loaded in the Redux store
    if (chambers.length === 0) {
      ;(async () => {
        try {
          setLoadingChambers(true)
          await dispatch(fetchMyChambers())
        } catch (err) {
          console.error('Failed to fetch chambers for dashboard:', err)
        } finally {
          setLoadingChambers(false)
        }
      })()
    }
  }, [dispatch, chambers.length])

  // Case counts by status
  const activeCount = myCases.filter((c) => c.status === 'ACTIVE').length
  const onHoldCount = myCases.filter((c) => c.status === 'ON_HOLD').length
  const closedCount = myCases.filter((c) => c.status === 'CLOSED').length

  // Recent cases (first 5 items from myCases array, as Case model has no createdAt field)
  const recentCases = myCases.slice(0, 5)
  // Recent chambers (first 4 items)
  const recentChambers = chambers.slice(0, 4)

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-6xl mx-auto p-4 sm:p-6 space-y-8"
    >
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Welcome back, {user?.firstName || 'Advocate'}
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Case management and chamber collaboration overview
          </p>
        </div>

        {/* Quick Actions Row */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/case/create"
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>+</span> Create Case
          </Link>
          <Link
            to="/chamber/create"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors inline-flex items-center gap-1.5"
          >
            <span>+</span> Create Chamber
          </Link>
          <Link
            to="/chamber/discover"
            className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-md transition-colors"
          >
            Discover Chambers
          </Link>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Cases Card */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">Total Cases</span>
            <Link
              to="/case"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 underline"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {loadingCases ? '...' : myCases.length}
          </div>
          <p className="text-[11px] text-zinc-400">Personal and chamber matters</p>
        </div>

        {/* Active Cases Card */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-700">Active Matters</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {loadingCases ? '...' : activeCount}
          </div>
          <div className="text-[11px] text-zinc-400">
            {onHoldCount} on hold · {closedCount} closed
          </div>
        </div>

        {/* My Chambers Card */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500">My Chambers</span>
            <Link
              to="/chamber"
              className="text-[11px] font-medium text-zinc-500 hover:text-zinc-900 underline"
            >
              View all →
            </Link>
          </div>
          <div className="text-3xl font-bold text-zinc-900">
            {loadingChambers ? '...' : chambers.length}
          </div>
          <p className="text-[11px] text-zinc-400">Collaborative law practices</p>
        </div>

        {/* Case Status Distribution */}
        <div className="p-5 bg-white border border-zinc-200 rounded-lg space-y-2">
          <span className="text-xs font-medium text-zinc-500">Status Breakdown</span>
          <div className="flex items-center gap-1.5 pt-1">
            <div
              className="h-2 rounded-sm bg-emerald-500"
              style={{
                width: myCases.length > 0 ? `${(activeCount / myCases.length) * 100}%` : '0%',
                minWidth: activeCount > 0 ? '8px' : '0px'
              }}
              title={`Active: ${activeCount}`}
            />
            <div
              className="h-2 rounded-sm bg-amber-400"
              style={{
                width: myCases.length > 0 ? `${(onHoldCount / myCases.length) * 100}%` : '0%',
                minWidth: onHoldCount > 0 ? '8px' : '0px'
              }}
              title={`On Hold: ${onHoldCount}`}
            />
            <div
              className="h-2 rounded-sm bg-zinc-300"
              style={{
                width: myCases.length > 0 ? `${(closedCount / myCases.length) * 100}%` : '0%',
                minWidth: closedCount > 0 ? '8px' : '0px'
              }}
              title={`Closed: ${closedCount}`}
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1">
            <span className="text-emerald-700 font-medium">{activeCount} Active</span>
            <span className="text-amber-700 font-medium">{onHoldCount} Hold</span>
            <span className="text-zinc-600 font-medium">{closedCount} Closed</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Recent Cases & Recent Chambers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases (2 Columns) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Recent Cases</h2>
            <Link
              to="/case"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              View all ({myCases.length}) →
            </Link>
          </div>

          {loadingCases ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-white border border-zinc-200 rounded-lg">
              Loading cases...
            </div>
          ) : recentCases.length === 0 ? (
            <div className="p-8 text-center bg-white border border-dashed border-zinc-300 rounded-lg space-y-3">
              <p className="text-xs text-zinc-500">No cases recorded yet.</p>
              <Link
                to="/case/create"
                className="inline-block px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
              >
                Create your first case
              </Link>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              {recentCases.map((c) => (
                <div
                  key={c.id}
                  className="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <Link
                      to={`/case/${c.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 hover:underline truncate block"
                    >
                      {c.name}
                    </Link>
                    {c.description ? (
                      <p className="text-xs text-zinc-500 line-clamp-1">{c.description}</p>
                    ) : (
                      <p className="text-xs text-zinc-400 italic">No description</p>
                    )}
                    <div className="text-[11px] text-zinc-400">
                      Owner: <span className="font-mono">{c.ownerType}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded font-mono font-medium ${
                        c.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : c.status === 'ON_HOLD'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {c.status}
                    </span>
                    <Link
                      to={`/case/${c.id}`}
                      className="text-xs text-zinc-500 hover:text-zinc-900 hidden sm:inline"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Chambers Overview (1 Column) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-900">Your Chambers</h2>
            <Link
              to="/chamber"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
            >
              View all ({chambers.length}) →
            </Link>
          </div>

          {loadingChambers ? (
            <div className="p-8 text-center text-xs text-zinc-500 bg-white border border-zinc-200 rounded-lg">
              Loading chambers...
            </div>
          ) : recentChambers.length === 0 ? (
            <div className="p-8 text-center bg-white border border-dashed border-zinc-300 rounded-lg space-y-3">
              <p className="text-xs text-zinc-500">No chambers joined yet.</p>
              <div className="flex flex-col gap-2">
                <Link
                  to="/chamber/create"
                  className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                >
                  Create Chamber
                </Link>
                <Link
                  to="/chamber/discover"
                  className="text-xs text-zinc-600 hover:text-zinc-900 underline"
                >
                  Or discover existing chambers
                </Link>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-zinc-200 rounded-lg divide-y divide-zinc-100">
              {recentChambers.map((chamber) => (
                <div
                  key={chamber.id}
                  className="p-4 hover:bg-zinc-50 transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <Link
                      to={`/chamber/${chamber.id}`}
                      className="text-sm font-semibold text-zinc-900 hover:text-zinc-700 hover:underline"
                    >
                      {chamber.name}
                    </Link>
                    <Link
                      to={`/chamber/${chamber.id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-800"
                    >
                      View →
                    </Link>
                  </div>
                  {chamber.description ? (
                    <p className="text-xs text-zinc-500 line-clamp-2">{chamber.description}</p>
                  ) : (
                    <p className="text-xs text-zinc-400 italic">No description</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard
