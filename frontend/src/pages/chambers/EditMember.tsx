import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import type { Permission } from '../../types/permissions'
import { fetchMyChamberById } from '../../store/actions/chamberActions'
import { removeMemberDel, updateMember } from '../../store/actions/membershipActions'

const ALL_PERMISSIONS: Permission[] = [
  'READ_CASE',
  'CREATE_CASE',
  'UPDATE_CASE',
  'DELETE_CASE',
  'INVITE_MEMBERS',
  'REMOVE_MEMBERS',
  'EDIT_GROUP'
]

const EditMember = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string>('')

  const params = useParams()
  const chamberId = params.chamberId
  const membershipId = params.membershipId

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const chamber = useSelector((state: RootState) => state.chamber.currentChamber)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const targetMember = chamber?.memberships.find((m) => m.id === membershipId)

  const [role, setRole] = useState<'ADMIN' | 'MEMBER'>(() =>
    targetMember?.role === 'ADMIN' ? 'ADMIN' : 'MEMBER'
  )
  const [selectedPermissions, setSelectedPermissions] = useState<Permission[]>(
    () => targetMember?.permissions || []
  )

  const myMembership = chamber?.memberships.find((m) => m.user.id === currentUser?.id)
  const isOwner = myMembership?.role === 'OWNER'
  const canEdit = isOwner || myMembership?.permissions.includes('EDIT_GROUP')
  const canRemove = isOwner || myMembership?.permissions.includes('REMOVE_MEMBERS')

  useEffect(() => {
    if (!chamberId) return
    if (!chamber || chamber.id !== chamberId) {
      ;(async () => {
        try {
          setStatus('loading')
          const fetched = await dispatch(fetchMyChamberById(chamberId))
          const mem = fetched?.memberships?.find((m: { id: string }) => m.id === membershipId)
          if (mem) {
            if (mem.role === 'ADMIN' || mem.role === 'MEMBER') {
              setRole(mem.role)
            }
            setSelectedPermissions(mem.permissions || [])
          }
          setStatus('idle')
        } catch (err) {
          setStatus('error')
          if (err instanceof Error) {
            setError(err.message)
          } else {
            setError('Failed to fetch chamber details')
          }
        }
      })()
    }
  }, [chamberId, chamber, membershipId, dispatch])

  const togglePermission = (perm: Permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    )
  }

  const saveMemberHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!chamberId || !membershipId) return
    try {
      setStatus('loading')
      await dispatch(
        updateMember({
          chamberId,
          membershipId,
          role,
          permissions: selectedPermissions
        })
      )
      setStatus('success')
      navigate(`/chamber/${chamberId}`)
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to update member')
      }
    }
  }

  const removeHandler = async () => {
    if (!chamberId || !membershipId) return
    if (!window.confirm('Are you sure you want to remove this member from the chamber?')) return
    try {
      setStatus('loading')
      await dispatch(removeMemberDel({ chamberId, membershipId }))
      setStatus('success')
      navigate(`/chamber/${chamberId}`)
    } catch (err) {
      setStatus('error')
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to remove member')
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
          <h1 className="text-xl font-semibold text-zinc-900">Edit Member</h1>
          <p className="text-xs text-zinc-500 mt-0.5">{chamber?.name}</p>
        </div>
        <Link
          to={`/chamber/${chamberId}`}
          className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          Back to Chamber
        </Link>
      </div>

      {status === 'loading' && <div className="text-sm text-zinc-500 mb-4">Loading...</div>}
      {status === 'error' && <div className="text-sm text-red-600 mb-4">{error}</div>}

      {!canEdit && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md mb-4 border border-red-200">
          You do not have permission to manage members in this chamber.
        </div>
      )}

      {canEdit && targetMember && (
        <form onSubmit={saveMemberHandler} className="space-y-6">
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="text-sm font-medium text-zinc-900">
              {targetMember.user.firstName} {targetMember.user.lastName}
            </div>
            <div className="text-xs text-zinc-500">
              @{targetMember.user.userName} · {targetMember.user.email}
            </div>
            <div className="text-xs font-mono text-zinc-400 mt-1">Role: {targetMember.role}</div>
          </div>

          {targetMember.role !== 'OWNER' && (
            <div>
              <label htmlFor="role" className="block text-xs font-medium text-zinc-700 mb-1">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as 'ADMIN' | 'MEMBER')}
                className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
              >
                <option value="MEMBER">Member</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          )}

          <div>
            <span className="block text-xs font-medium text-zinc-700 mb-2">Permissions</span>
            <div className="space-y-2 border border-zinc-200 rounded-md p-3 bg-white">
              {ALL_PERMISSIONS.map((perm) => (
                <label key={perm} className="flex items-center gap-2.5 text-xs text-zinc-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-600"
                  />
                  <span className="font-mono">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200">
            {canRemove && targetMember.role !== 'OWNER' ? (
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={removeHandler}
                disabled={status === 'loading'}
                className="px-3 py-2 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                Remove from Chamber
              </motion.button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
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
                {status === 'loading' ? 'Saving...' : 'Save Permissions'}
              </motion.button>
            </div>
          </div>
        </form>
      )}

      {canEdit && !targetMember && status !== 'loading' && (
        <div className="text-sm text-zinc-500">Member not found in this chamber.</div>
      )}
    </motion.div>
  )
}

export default EditMember
