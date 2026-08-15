import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import type { Permission } from '../../types/permissions'
import { deleteChamber, fetchMyChamberById } from '../../store/actions/chamberActions'
import { fetchJoinRequests, reviewJoinRequest } from '../../store/actions/membershipActions'
import { fetchChamberCases } from '../../store/actions/caseActions'
import { getErrorMessage } from '../../utils/getErrorMessage'

const ALL_PERMISSIONS: Permission[] = [
  'READ_CASE',
  'CREATE_CASE',
  'UPDATE_CASE',
  'DELETE_CASE',
  'INVITE_MEMBERS',
  'REMOVE_MEMBERS',
  'EDIT_GROUP'
]

const ChamberDetails = () => {
  const [chamberError, setChamberError] = useState<string>('')
  const [chamberStatus, setChamberStatus] = useState<'error' | 'success' | 'idle' | 'loading'>('idle')

  const [inviteError, setInviteError] = useState<string>('')
  const [inviteStatus, setInviteStatus] = useState<'error' | 'success' | 'idle' | 'loading'>('idle')

  const [casesError, setCasesError] = useState<string>('')
  const [casesStatus, setCasesStatus] = useState<'error' | 'success' | 'idle' | 'loading'>('idle')

  const [requestPermissions, setRequestPermissions] = useState<Record<string, Permission[]>>({})

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const params = useParams()
  const chamberId = params.chamberId

  const chamber = useSelector((state: RootState) => state.chamber.currentChamber)
  const joinRequests = useSelector((state: RootState) => state.membership.joinRequests)
  const chamberCases = useSelector((state: RootState) => state.cases.chamberCases)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const myMembership = chamber?.memberships.find((m) => m.user.id === currentUser?.id)
  const isOwner = myMembership?.role === 'OWNER'
  const canInvite = isOwner || myMembership?.permissions.includes('INVITE_MEMBERS')
  const canEdit = isOwner || myMembership?.permissions.includes('EDIT_GROUP')
  const canReadCases = isOwner || myMembership?.permissions.includes('READ_CASE')
  const canCreateCase = isOwner || myMembership?.permissions.includes('CREATE_CASE')

  useEffect(() => {
    if (!chamberId) return
    ;(async () => {
      try {
        setChamberStatus('loading')
        await dispatch(fetchMyChamberById(chamberId))
        setChamberStatus('success')
      } catch (error) {
        setChamberStatus('error')
        setChamberError(getErrorMessage(error, 'Could not fetch chamber data'))
      }
    })()
  }, [chamberId, dispatch])

  useEffect(() => {
    if (!chamberId || !canInvite) return
    ;(async () => {
      try {
        setInviteStatus('loading')
        await dispatch(fetchJoinRequests(chamberId))
        setInviteStatus('success')
      } catch (error) {
        setInviteStatus('error')
        setInviteError(getErrorMessage(error, 'Could not fetch join requests'))
      }
    })()
  }, [chamberId, canInvite, dispatch])

  useEffect(() => {
    if (!chamberId || !canReadCases) return
    ;(async () => {
      try {
        setCasesStatus('loading')
        await dispatch(fetchChamberCases(chamberId))
        setCasesStatus('success')
      } catch (error) {
        setCasesStatus('error')
        setCasesError(getErrorMessage(error, 'Could not fetch chamber cases'))
      }
    })()
  }, [chamberId, canReadCases, dispatch])

  const toggleRequestPermission = (reqId: string, perm: Permission) => {
    setRequestPermissions((prev) => {
      const current = prev[reqId] || []
      const updated = current.includes(perm)
        ? current.filter((p) => p !== perm)
        : [...current, perm]
      return { ...prev, [reqId]: updated }
    })
  }

  const reviewHandler = async (membershipId: string, action: 'approve' | 'reject') => {
    if (!chamberId) return
    try {
      const permissions = action === 'approve' ? requestPermissions[membershipId] || [] : undefined
      await dispatch(reviewJoinRequest({ chamberId, membershipId, action, permissions }))
      if (action === 'approve') {
        await dispatch(fetchMyChamberById(chamberId))
      }
    } catch (error) {
      console.error('Failed to review join request', error)
    }
  }

  const deleteChamberHandler = async (id: string) => {
    if (!id) return
    if (!window.confirm('Are you sure you want to delete this chamber? This cannot be undone.')) return
    try {
      await dispatch(deleteChamber(id))
      navigate('/chamber')
    } catch (error) {
      console.error('Failed to delete chamber', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="max-w-4xl mx-auto p-6 space-y-8"
    >
      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
        <Link to="/chamber" className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          ← Back to Chambers
        </Link>
        {isOwner && chamberId && (
          <div className="flex items-center gap-3">
            <Link
              to={`/chamber/${chamberId}/edit`}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              Edit Chamber
            </Link>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => deleteChamberHandler(chamberId)}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete Chamber
            </motion.button>
          </div>
        )}
      </div>

      {chamberStatus === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {chamberError}
        </div>
      )}
      {chamberStatus === 'loading' && <div className="text-sm text-zinc-500">Loading...</div>}

      {chamber && (
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-zinc-900">{chamber.name}</h1>
          {chamber.description ? (
            <p className="text-sm text-zinc-600">{chamber.description}</p>
          ) : (
            <p className="text-sm text-zinc-400 italic">No description provided</p>
          )}
        </div>
      )}

      {canReadCases && (
        <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-900">Chamber Cases</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Active and archived cases in this chamber</p>
            </div>
            {canCreateCase && (
              <Link
                to="/case/create"
                className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
              >
                + New Case
              </Link>
            )}
          </div>

          {casesStatus === 'loading' && <div className="text-xs text-zinc-500">Loading cases...</div>}
          {casesStatus === 'error' && <div className="text-xs text-red-600">{casesError}</div>}

          {casesStatus !== 'loading' && chamberCases.length === 0 && (
            <p className="text-xs text-zinc-500 py-3">No cases found for this chamber.</p>
          )}

          {chamberCases.length > 0 && (
            <div className="divide-y divide-zinc-100">
              {chamberCases.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <Link
                      to={`/case/${c.id}`}
                      className="text-sm font-medium text-zinc-900 hover:text-zinc-700 hover:underline"
                    >
                      {c.name}
                    </Link>
                    {c.description && (
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{c.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded font-mono ${
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
                      className="text-xs text-zinc-500 hover:text-zinc-800"
                    >
                      View →
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Members</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Lawyers and staff active in this chamber</p>
        </div>

        <div className="divide-y divide-zinc-100">
          {chamber?.memberships.map((member) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="py-3 flex items-center justify-between"
            >
              <div>
                <h3 className="text-sm font-medium text-zinc-900">
                  {member.user.firstName} {member.user.lastName}
                </h3>
                <p className="text-xs text-zinc-500">
                  @{member.user.userName} · {member.user.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded border border-zinc-200">
                  {member.role}
                </span>
                {canEdit && chamber && member.role !== 'OWNER' && (
                  <Link
                    to={`/chamber/${chamber.id}/edit/${member.id}`}
                    className="text-xs font-medium text-zinc-600 hover:text-zinc-900 px-2 py-1 bg-zinc-50 hover:bg-zinc-100 rounded border border-zinc-200 transition-colors"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {canInvite && (
        <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Pending Join Requests</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Review and assign permissions to join requests</p>
          </div>

          {inviteStatus === 'error' && <div className="text-xs text-red-600">{inviteError}</div>}
          {inviteStatus === 'loading' && <div className="text-xs text-zinc-500">Loading requests...</div>}

          {inviteStatus !== 'loading' && joinRequests.length === 0 && (
            <p className="text-xs text-zinc-500 py-2">No pending requests.</p>
          )}

          {joinRequests.map((req) => {
            const currentReqPerms = requestPermissions[req.id] || []
            return (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 border border-zinc-200 rounded-md bg-zinc-50 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-zinc-900">
                      {req.user.firstName} {req.user.lastName}
                    </p>
                    <p className="text-xs text-zinc-500">
                      @{req.user.userName} · {req.user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => reviewHandler(req.id, 'approve')}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      Approve
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => reviewHandler(req.id, 'reject')}
                      className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-white border border-zinc-300 hover:bg-zinc-100 rounded-md transition-colors"
                    >
                      Reject
                    </motion.button>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-200">
                  <span className="block text-xs font-medium text-zinc-700 mb-1.5">
                    Assign Permissions on Approval:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {ALL_PERMISSIONS.map((perm) => (
                      <label
                        key={perm}
                        className="flex items-center gap-2 text-xs text-zinc-600 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={currentReqPerms.includes(perm)}
                          onChange={() => toggleRequestPermission(req.id, perm)}
                          className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600"
                        />
                        <span className="font-mono text-[11px]">{perm}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default ChamberDetails