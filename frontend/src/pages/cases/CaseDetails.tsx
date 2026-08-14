import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import type { AppDispatch, RootState } from '../../store/store'
import { deleteCase, fetchCaseById, updateCase } from '../../store/actions/caseActions'
import { createHearing, fetchHearings, updateHearing } from '../../store/actions/hearingActions'
import {
  deleteDocument,
  fetchCaseDocuments,
  uploadCaseDocument,
  uploadHearingDocument
} from '../../store/actions/documentActions'
import { fetchMyChamberById } from '../../store/actions/chamberActions'

const CaseDetails = () => {
  const [caseStatus, setCaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [caseError, setCaseError] = useState<string>('')

  const [hearingsStatus, setHearingsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [hearingsError, setHearingsError] = useState<string>('')

  const [docsStatus, setDocsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [docsError, setDocsError] = useState<string>('')

  const [isEditingCase, setIsEditingCase] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editCaseStatus, setEditCaseStatus] = useState<'ACTIVE' | 'ON_HOLD' | 'CLOSED'>('ACTIVE')

  const [isAddingHearing, setIsAddingHearing] = useState(false)
  const [newHearingDate, setNewHearingDate] = useState('')
  const [newHearingNotes, setNewHearingNotes] = useState('')
  const [hearingSubmitStatus, setHearingSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const [editingHearingId, setEditingHearingId] = useState<string | null>(null)
  const [editHearingDate, setEditHearingDate] = useState('')
  const [editHearingNotes, setEditHearingNotes] = useState('')

  const [caseUploadFile, setCaseUploadFile] = useState<File | null>(null)
  const [caseUploadName, setCaseUploadName] = useState('')
  const [caseUploadStatus, setCaseUploadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [caseUploadError, setCaseUploadError] = useState('')

  const [hearingUploadFiles, setHearingUploadFiles] = useState<Record<string, File | null>>({})
  const [hearingUploadNames, setHearingUploadNames] = useState<Record<string, string>>({})
  const [hearingUploadStatuses, setHearingUploadStatuses] = useState<Record<string, 'idle' | 'loading' | 'success' | 'error'>>({})
  const [activeHearingUploadId, setActiveHearingUploadId] = useState<string | null>(null)

  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const params = useParams()
  const caseId = params.caseId

  const currentCase = useSelector((state: RootState) => state.cases.currentCase)
  const hearings = useSelector((state: RootState) => state.hearing.hearings)
  const caseDocuments = useSelector((state: RootState) => state.document.caseDocuments)
  const chamber = useSelector((state: RootState) => state.chamber.currentChamber)
  const currentUser = useSelector((state: RootState) => state.auth.user)

  const isPersonal = currentCase?.ownerType === 'PERSONAL'
  const isPersonalOwner = isPersonal && currentCase?.personalOwnerId === currentUser?.id
  const chamberMembership = chamber?.memberships.find((m) => m.user.id === currentUser?.id)
  const isChamberOwner = chamberMembership?.role === 'OWNER'

  const canUpdate = isPersonal
    ? isPersonalOwner
    : isChamberOwner || Boolean(chamberMembership?.permissions.includes('UPDATE_CASE'))
  const canDelete = isPersonal
    ? isPersonalOwner
    : isChamberOwner || Boolean(chamberMembership?.permissions.includes('DELETE_CASE'))

  useEffect(() => {
    if (!caseId) return
    ;(async () => {
      try {
        setCaseStatus('loading')
        const c = await dispatch(fetchCaseById(caseId))
        setEditName(c.name || '')
        setEditDescription(c.description || '')
        setEditCaseStatus(c.status || 'ACTIVE')
        setCaseStatus('success')
      } catch (err) {
        setCaseStatus('error')
        if (err instanceof Error) {
          setCaseError(err.message)
        } else {
          setCaseError('Failed to fetch case details')
        }
      }
    })()
  }, [caseId, dispatch])

  useEffect(() => {
    if (!caseId) return
    ;(async () => {
      try {
        setHearingsStatus('loading')
        await dispatch(fetchHearings(caseId))
        setHearingsStatus('success')
      } catch (err) {
        setHearingsStatus('error')
        if (err instanceof Error) {
          setHearingsError(err.message)
        } else {
          setHearingsError('Failed to fetch hearings')
        }
      }
    })()
  }, [caseId, dispatch])

  useEffect(() => {
    if (!caseId) return
    ;(async () => {
      try {
        setDocsStatus('loading')
        await dispatch(fetchCaseDocuments(caseId))
        setDocsStatus('success')
      } catch (err) {
        setDocsStatus('error')
        if (err instanceof Error) {
          setDocsError(err.message)
        } else {
          setDocsError('Failed to fetch case documents')
        }
      }
    })()
  }, [caseId, dispatch])

  useEffect(() => {
    if (currentCase?.ownerType === 'CHAMBER' && currentCase.chamberId) {
      if (!chamber || chamber.id !== currentCase.chamberId) {
        dispatch(fetchMyChamberById(currentCase.chamberId))
      }
    }
  }, [currentCase, chamber, dispatch])

  const handleUpdateCase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!caseId) return
    try {
      setCaseStatus('loading')
      await dispatch(
        updateCase({
          caseId,
          name: editName,
          description: editDescription,
          status: editCaseStatus
        })
      )
      setCaseStatus('success')
      setIsEditingCase(false)
    } catch (err) {
      setCaseStatus('error')
      if (err instanceof Error) {
        setCaseError(err.message)
      } else {
        setCaseError('Failed to update case')
      }
    }
  }

  const handleDeleteCase = async () => {
    if (!caseId) return
    if (!window.confirm('Are you sure you want to delete this case? This cannot be undone.')) return
    try {
      setCaseStatus('loading')
      await dispatch(deleteCase(caseId))
      navigate('/case')
    } catch (err) {
      setCaseStatus('error')
      if (err instanceof Error) {
        setCaseError(err.message)
      } else {
        setCaseError('Failed to delete case')
      }
    }
  }

  const handleCreateHearing = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!caseId || !newHearingDate) return
    try {
      setHearingSubmitStatus('loading')
      await dispatch(
        createHearing({
          caseId,
          date: new Date(newHearingDate).toISOString(),
          notes: newHearingNotes
        })
      )
      await dispatch(fetchHearings(caseId))
      setNewHearingDate('')
      setNewHearingNotes('')
      setIsAddingHearing(false)
      setHearingSubmitStatus('success')
    } catch (err) {
      setHearingSubmitStatus('error')
      console.error('Failed to create hearing', err)
    }
  }

  const startEditHearing = (h: { id: string; date: string; notes: string | null }) => {
    setEditingHearingId(h.id)
    const formattedDate = h.date ? new Date(h.date).toISOString().slice(0, 16) : ''
    setEditHearingDate(formattedDate)
    setEditHearingNotes(h.notes || '')
  }

  const handleUpdateHearing = async (hearingId: string) => {
    if (!caseId || !hearingId || !editHearingDate) return
    try {
      await dispatch(
        updateHearing({
          caseId,
          hearingId,
          date: new Date(editHearingDate).toISOString(),
          notes: editHearingNotes
        })
      )
      await dispatch(fetchHearings(caseId))
      setEditingHearingId(null)
    } catch (err) {
      console.error('Failed to update hearing', err)
    }
  }

  const handleCaseDocUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!caseId || !caseUploadFile) return
    try {
      setCaseUploadStatus('loading')
      await dispatch(uploadCaseDocument(caseId, caseUploadFile, caseUploadName || undefined))
      await dispatch(fetchCaseDocuments(caseId))
      setCaseUploadFile(null)
      setCaseUploadName('')
      setCaseUploadStatus('success')
    } catch (err) {
      setCaseUploadStatus('error')
      if (err instanceof Error) {
        setCaseUploadError(err.message)
      } else {
        setCaseUploadError('Failed to upload document')
      }
    }
  }

  const handleHearingDocUpload = async (hearingId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const file = hearingUploadFiles[hearingId]
    if (!caseId || !hearingId || !file) return
    const customName = hearingUploadNames[hearingId] || undefined
    try {
      setHearingUploadStatuses((prev) => ({ ...prev, [hearingId]: 'loading' }))
      await dispatch(uploadHearingDocument(caseId, hearingId, file, customName))
      await dispatch(fetchHearings(caseId))
      setHearingUploadFiles((prev) => ({ ...prev, [hearingId]: null }))
      setHearingUploadNames((prev) => ({ ...prev, [hearingId]: '' }))
      setHearingUploadStatuses((prev) => ({ ...prev, [hearingId]: 'success' }))
      setActiveHearingUploadId(null)
    } catch (err) {
      setHearingUploadStatuses((prev) => ({ ...prev, [hearingId]: 'error' }))
      console.error('Failed to upload hearing document', err)
    }
  }

  const handleDeleteDocument = async (docId: string) => {
    if (!caseId || !docId) return
    if (!window.confirm('Are you sure you want to delete this document?')) return
    try {
      await dispatch(deleteDocument(caseId, docId))
      await dispatch(fetchCaseDocuments(caseId))
      await dispatch(fetchHearings(caseId))
    } catch (err) {
      console.error('Failed to delete document', err)
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
        <Link to="/case" className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          ← Back to Cases
        </Link>
        <div className="flex items-center gap-3">
          {canUpdate && !isEditingCase && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsEditingCase(true)}
              className="px-3 py-1.5 text-xs font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors"
            >
              Edit Case
            </motion.button>
          )}
          {canDelete && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteCase}
              className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              Delete Case
            </motion.button>
          )}
        </div>
      </div>

      {caseStatus === 'error' && (
        <div className="text-sm text-red-600 bg-red-50 p-4 rounded-md border border-red-200">
          {caseError}
        </div>
      )}
      {caseStatus === 'loading' && <div className="text-sm text-zinc-500">Loading case details...</div>}

      {currentCase && !isEditingCase && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-zinc-900">{currentCase.name}</h1>
            <span
              className={`text-xs px-2.5 py-0.5 rounded font-mono font-medium ${
                currentCase.status === 'ACTIVE'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : currentCase.status === 'ON_HOLD'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
              }`}
            >
              {currentCase.status}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>Owner: {currentCase.ownerType}</span>
            {currentCase.ownerType === 'CHAMBER' && chamber && (
              <>
                <span>·</span>
                <Link
                  to={`/chamber/${chamber.id}`}
                  className="text-zinc-700 hover:underline font-medium"
                >
                  Chamber: {chamber.name}
                </Link>
              </>
            )}
          </div>

          {currentCase.description ? (
            <p className="text-sm text-zinc-600 leading-relaxed">{currentCase.description}</p>
          ) : (
            <p className="text-sm text-zinc-400 italic">No description provided</p>
          )}
        </div>
      )}

      {currentCase && isEditingCase && (
        <form onSubmit={handleUpdateCase} className="p-5 border border-zinc-300 rounded-lg bg-zinc-50 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Edit Case Details</h2>
          <div>
            <label htmlFor="edit-name" className="block text-xs font-medium text-zinc-700 mb-1">
              Case Name
            </label>
            <input
              id="edit-name"
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-desc" className="block text-xs font-medium text-zinc-700 mb-1">
              Description
            </label>
            <textarea
              id="edit-desc"
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            />
          </div>

          <div>
            <label htmlFor="edit-status" className="block text-xs font-medium text-zinc-700 mb-1">
              Status
            </label>
            <select
              id="edit-status"
              value={editCaseStatus}
              onChange={(e) => setEditCaseStatus(e.target.value as 'ACTIVE' | 'ON_HOLD' | 'CLOSED')}
              className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-600 bg-white"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="ON_HOLD">ON_HOLD</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsEditingCase(false)}
              className="px-4 py-2 text-sm text-zinc-700 bg-zinc-200 hover:bg-zinc-300 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Hearings</h2>
            <p className="text-xs text-zinc-500 mt-0.5">Chronological hearing timeline and court notes</p>
          </div>
          {canUpdate && !isAddingHearing && (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddingHearing(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
            >
              + Add Hearing
            </motion.button>
          )}
        </div>

        {hearingsStatus === 'loading' && <div className="text-xs text-zinc-500">Loading hearings...</div>}
        {hearingsStatus === 'error' && <div className="text-xs text-red-600">{hearingsError}</div>}

        {isAddingHearing && (
          <form onSubmit={handleCreateHearing} className="p-4 border border-zinc-200 rounded-md bg-zinc-50 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">New Hearing Entry</h3>
            <div>
              <label htmlFor="h-date" className="block text-xs font-medium text-zinc-700 mb-1">
                Date & Time
              </label>
              <input
                id="h-date"
                type="datetime-local"
                required
                value={newHearingDate}
                onChange={(e) => setNewHearingDate(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>
            <div>
              <label htmlFor="h-notes" className="block text-xs font-medium text-zinc-700 mb-1">
                Notes
              </label>
              <textarea
                id="h-notes"
                rows={2}
                value={newHearingNotes}
                onChange={(e) => setNewHearingNotes(e.target.value)}
                placeholder="Key arguments, outcome, orders..."
                className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingHearing(false)}
                className="px-3 py-1.5 text-xs text-zinc-700 bg-zinc-200 hover:bg-zinc-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={hearingSubmitStatus === 'loading'}
                className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors"
              >
                {hearingSubmitStatus === 'loading' ? 'Saving...' : 'Add Hearing'}
              </button>
            </div>
          </form>
        )}

        {hearingsStatus !== 'loading' && hearings.length === 0 && !isAddingHearing && (
          <p className="text-xs text-zinc-500 py-2">No hearings scheduled or recorded for this case.</p>
        )}

        <div className="space-y-4">
          {hearings.map((h, idx) => {
            const isEditingThisHearing = editingHearingId === h.id
            const hearingDocs = ('documents' in h && Array.isArray(h.documents) ? h.documents : []) as Array<{
              id: string
              customName: string
              fileUrl: string
            }>
            const isUploadOpen = activeHearingUploadId === h.id
            const currentUploadFile = hearingUploadFiles[h.id] || null
            const currentUploadName = hearingUploadNames[h.id] || ''
            const uploadStatus = hearingUploadStatuses[h.id] || 'idle'

            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className="border border-zinc-200 rounded-md p-4 bg-zinc-50 space-y-3"
              >
                {isEditingThisHearing ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Date & Time</label>
                      <input
                        type="datetime-local"
                        required
                        value={editHearingDate}
                        onChange={(e) => setEditHearingDate(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">Notes</label>
                      <textarea
                        rows={2}
                        value={editHearingNotes}
                        onChange={(e) => setEditHearingNotes(e.target.value)}
                        className="w-full px-3 py-1.5 text-sm border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingHearingId(null)}
                        className="px-3 py-1.5 text-xs text-zinc-700 bg-zinc-200 hover:bg-zinc-300 rounded-md transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdateHearing(h.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-medium text-zinc-500">#{idx + 1}</span>
                        <span className="text-sm font-semibold text-zinc-900">
                          {new Date(h.date).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </span>
                      </div>
                      {h.notes ? (
                        <p className="text-xs text-zinc-600 mt-1 whitespace-pre-line">{h.notes}</p>
                      ) : (
                        <p className="text-xs text-zinc-400 italic mt-1">No notes recorded</p>
                      )}
                    </div>
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => startEditHearing(h)}
                        className="text-xs text-zinc-500 hover:text-zinc-900 px-2 py-1 bg-white hover:bg-zinc-100 rounded border border-zinc-200 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                )}

                <div className="pt-3 border-t border-zinc-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-zinc-700">Hearing Documents</span>
                    {canUpdate && (
                      <button
                        type="button"
                        onClick={() => setActiveHearingUploadId(isUploadOpen ? null : h.id)}
                        className="text-xs text-zinc-600 hover:text-zinc-900 underline"
                      >
                        {isUploadOpen ? 'Close Upload' : '+ Upload File'}
                      </button>
                    )}
                  </div>

                  {isUploadOpen && (
                    <form
                      onSubmit={(e) => handleHearingDocUpload(h.id, e)}
                      className="p-3 bg-white border border-zinc-200 rounded-md mb-3 space-y-2"
                    >
                      <div>
                        <input
                          type="file"
                          required
                          onChange={(e) => {
                            const f = e.target.files?.[0] || null
                            setHearingUploadFiles((prev) => ({ ...prev, [h.id]: f }))
                          }}
                          className="text-xs text-zinc-700 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-100 file:text-zinc-700 hover:file:bg-zinc-200"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Custom label (optional)"
                          value={currentUploadName}
                          onChange={(e) => {
                            const val = e.target.value
                            setHearingUploadNames((prev) => ({ ...prev, [h.id]: val }))
                          }}
                          className="w-full px-2 py-1 text-xs border border-zinc-300 rounded focus:outline-none focus:ring-1 focus:ring-zinc-600"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="submit"
                          disabled={!currentUploadFile || uploadStatus === 'loading'}
                          className="px-3 py-1 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded disabled:opacity-50 transition-colors"
                        >
                          {uploadStatus === 'loading' ? 'Uploading...' : 'Upload'}
                        </button>
                      </div>
                    </form>
                  )}

                  {hearingDocs.length === 0 ? (
                    <p className="text-[11px] text-zinc-400 italic">No documents attached to this hearing</p>
                  ) : (
                    <div className="space-y-1.5">
                      {hearingDocs.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between text-xs py-1 px-2 bg-white rounded border border-zinc-200"
                        >
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-zinc-800 hover:underline truncate max-w-xs"
                          >
                            {doc.customName || 'Document'}
                          </a>
                          <div className="flex items-center gap-2">
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-zinc-500 hover:text-zinc-800"
                            >
                              View
                            </a>
                            {canUpdate && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-[11px] text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="border border-zinc-200 rounded-lg p-5 bg-white space-y-6">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Case Documents</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Pleadings, evidence, filings, and general case files</p>
        </div>

        {docsStatus === 'loading' && <div className="text-xs text-zinc-500">Loading documents...</div>}
        {docsStatus === 'error' && <div className="text-xs text-red-600">{docsError}</div>}

        {canUpdate && (
          <form onSubmit={handleCaseDocUpload} className="p-4 border border-zinc-200 rounded-md bg-zinc-50 space-y-3">
            <h3 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">Upload Case Document</h3>
            {caseUploadError && <div className="text-xs text-red-600">{caseUploadError}</div>}
            <div>
              <input
                type="file"
                required
                onChange={(e) => setCaseUploadFile(e.target.files?.[0] || null)}
                className="text-xs text-zinc-700 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-zinc-200 file:text-zinc-800 hover:file:bg-zinc-300"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Custom document label (optional)"
                value={caseUploadName}
                onChange={(e) => setCaseUploadName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-zinc-600"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!caseUploadFile || caseUploadStatus === 'loading'}
                className="px-3 py-1.5 text-xs font-medium text-white bg-zinc-900 hover:bg-zinc-800 rounded-md disabled:opacity-50 transition-colors"
              >
                {caseUploadStatus === 'loading' ? 'Uploading...' : 'Upload Document'}
              </button>
            </div>
          </form>
        )}

        {docsStatus !== 'loading' && caseDocuments.length === 0 && (
          <p className="text-xs text-zinc-500 py-2">No general documents uploaded for this case.</p>
        )}

        <div className="divide-y divide-zinc-100">
          {caseDocuments.map((doc) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="py-3 flex items-center justify-between"
            >
              <div>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-zinc-900 hover:underline"
                >
                  {doc.customName || 'Document'}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-zinc-600 hover:text-zinc-900 px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded transition-colors"
                >
                  View File ↗
                </a>
                {canUpdate && (
                  <button
                    type="button"
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default CaseDetails
