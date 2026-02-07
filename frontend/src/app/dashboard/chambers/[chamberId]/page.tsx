'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchChamberById,
  fetchJoinRequests,
  fetchMembers,
  handleJoinRequest,
  updateMemberPermissions,
  removeMember,
  leaveChamber,
  clearCurrentChamber,
  clearError,
} from '@/store/slices/chambersSlice';

interface Permissions {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export default function ChamberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const chamberId = params.chamberId as string;
  const dispatch = useAppDispatch();

  const { currentChamber, members, joinRequests, loading, error } = useAppSelector((state) => state.chambers);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'requests'>('overview');
  const [localError, setLocalError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [permissionEdits, setPermissionEdits] = useState<Record<string, Permissions>>({});
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const isAdmin = currentChamber?.userRole === 'admin';

  useEffect(() => {
    if (chamberId) {
      dispatch(fetchChamberById(chamberId));
    }
    return () => {
      dispatch(clearCurrentChamber());
    };
  }, [dispatch, chamberId]);

  useEffect(() => {
    if (chamberId && currentChamber) {
      dispatch(fetchMembers(chamberId));
      if (currentChamber.userRole === 'admin') {
        dispatch(fetchJoinRequests(chamberId));
      }
    }
  }, [chamberId, currentChamber?.userRole]);

  useEffect(() => {
    if (error) {
      setLocalError(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleApproveRequest = async (requestId: string, permissions?: Permissions) => {
    setProcessingId(requestId);
    const result = await dispatch(
      handleJoinRequest({
        chamberId,
        requestId,
        action: 'approve',
        permissions: permissions || {
          canRead: true,
          canCreate: false,
          canUpdate: false,
          canDelete: false,
        },
      })
    );
    setProcessingId(null);
    if (handleJoinRequest.fulfilled.match(result)) {
      dispatch(fetchChamberById(chamberId));
      dispatch(fetchMembers(chamberId));
    } else if (handleJoinRequest.rejected.match(result)) {
      setLocalError(result.payload as string);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    setProcessingId(requestId);
    const result = await dispatch(
      handleJoinRequest({ chamberId, requestId, action: 'reject' })
    );
    setProcessingId(null);
    if (handleJoinRequest.fulfilled.match(result)) {
      dispatch(fetchJoinRequests(chamberId));
    }
  };

  const handleUpdatePermissions = async (memberId: string) => {
    const perms = permissionEdits[memberId];
    if (!perms) return;
    setProcessingId(memberId);
    const result = await dispatch(
      updateMemberPermissions({ chamberId, memberId, permissions: perms })
    );
    setProcessingId(null);
    if (updateMemberPermissions.fulfilled.match(result)) {
      setPermissionEdits((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
      dispatch(fetchChamberById(chamberId));
    } else if (updateMemberPermissions.rejected.match(result)) {
      setLocalError(result.payload as string);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the chamber?')) return;
    setProcessingId(memberId);
    const result = await dispatch(removeMember({ chamberId, memberId }));
    setProcessingId(null);
    if (removeMember.fulfilled.match(result)) {
      dispatch(fetchChamberById(chamberId));
    } else if (removeMember.rejected.match(result)) {
      setLocalError(result.payload as string);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    const result = await dispatch(leaveChamber(chamberId));
    setLeaving(false);
    setShowLeaveConfirm(false);
    if (leaveChamber.fulfilled.match(result)) {
      router.push('/dashboard/chambers');
    } else if (leaveChamber.rejected.match(result)) {
      setLocalError(result.payload as string);
    }
  };

  const initPermissionEdit = (memberId: string, current: Permissions) => {
    setPermissionEdits((prev) => ({
      ...prev,
      [memberId]: { ...current },
    }));
  };

  const updatePermissionEdit = (memberId: string, key: keyof Permissions, value: boolean) => {
    setPermissionEdits((prev) => ({
      ...prev,
      [memberId]: {
        ...(prev[memberId] || {}),
        [key]: value,
      },
    }));
  };

  if (loading && !currentChamber) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-lg border border-slate-200-xl p-8 animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-1/4 mb-8" />
        </div>
      </div>
    );
  }

  if (!currentChamber && !loading) {
    return (
      <div className="max-w-4xl mx-auto animate-fadeIn">
        <div className="bg-white rounded-lg border border-slate-200-xl p-8 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Chamber not found</h2>
          <Link
            href="/dashboard/chambers"
            className="text-indigo-600 hover:text-blue-300"
          >
            Back to Chambers
          </Link>
        </div>
      </div>
    );
  }

  const chamber = currentChamber as {
    _id: string;
    name: string;
    description?: string;
    admin?: any;
    userRole?: string;
    userPermissions?: Permissions;
    members?: any[];
  };

  const displayMembers = chamber.members || members;

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Chambers
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.2) 0%, hsl(217 91% 60% / 0.2) 100%)' }}>
                <span className="text-2xl font-bold text-violet-600">{chamber.name?.charAt(0)?.toUpperCase() || 'C'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{chamber.name}</h1>
                <span
                  className={`inline-block mt-1 px-3 py-1 rounded-lg text-xs font-semibold ${
                    isAdmin ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' : 'bg-blue-500/15 text-indigo-600 border border-blue-500/30'
                  }`}
                >
                  {isAdmin ? 'Admin' : 'Member'}
                </span>
              </div>
            </div>
            {chamber.description && <p className="text-slate-600 mt-2">{chamber.description}</p>}
            {chamber.admin && (
              <p className="text-sm text-slate-500 mt-2">
                Admin: {chamber.admin.fullName?.firstName ? `${chamber.admin.fullName.firstName} ${chamber.admin.fullName.lastName}` : chamber.admin.email}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/dashboard/cases?chamberId=${chamberId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-900 transition-all"
              style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
            >
              View Cases
            </Link>
            {!isAdmin && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="px-4 py-2 rounded-lg font-medium text-red-600 hover:text-slate-900 hover:bg-red-500/20 transition-all"
              >
                Leave Chamber
              </button>
            )}
          </div>
        </div>
      </div>

      {localError && (
        <div className="mb-6 p-4 rounded-xl flex items-center justify-between" style={{ background: 'hsl(0 84% 60% / 0.1)', border: '1px solid hsl(0 84% 60% / 0.3)' }}>
          <span style={{ color: 'hsl(0 84% 60%)' }}>{localError}</span>
          <button onClick={() => setLocalError(null)} className="text-slate-600 hover:text-slate-900">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2">
        {(['overview', 'members', 'requests'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-blue-500/20 text-indigo-600' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'overview' ? 'Overview' : tab === 'members' ? 'Members' : 'Join Requests'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg border border-slate-200-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Permissions</h2>
          {chamber.userPermissions && (
            <div className="flex flex-wrap gap-2">
              {chamber.userPermissions.canRead && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">Read</span>
              )}
              {chamber.userPermissions.canCreate && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-indigo-600">Create</span>
              )}
              {chamber.userPermissions.canUpdate && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">Update</span>
              )}
              {chamber.userPermissions.canDelete && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">Delete</span>
              )}
            </div>
          )}
          <div className="mt-6">
            <Link
              href={`/dashboard/cases/new?chamberId=${chamberId}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-900 transition-all"
              style={{ background: 'hsl(262 83% 58% / 0.2)', border: '1px solid hsl(262 83% 58% / 0.5)' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Case to Chamber
            </Link>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="bg-white rounded-lg border border-slate-200-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Chamber Members</h2>
          {!displayMembers || displayMembers.length === 0 ? (
            <p className="text-slate-600">No members found</p>
          ) : (
            <div className="space-y-4">
              {displayMembers.map((member: any) => {
                const isEditing = permissionEdits[member._id];
                const perms = isEditing ? permissionEdits[member._id] : member.permissions;

                return (
                  <div
                    key={member._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-900 font-semibold" style={{ background: 'hsl(217 91% 60% / 0.2)' }}>
                        {member.user?.fullName?.firstName?.charAt(0)?.toUpperCase() || member.user?.email?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">
                          {member.user?.fullName ? `${member.user.fullName.firstName} ${member.user.fullName.lastName}` : member.user?.email || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">{member.user?.enrollmentNumber || member.user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs ${member.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-600/50 text-slate-600'}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {member.role !== 'admin' && isAdmin && (
                        <>
                          {isEditing ? (
                            <div className="flex items-center gap-4">
                              {(['canRead', 'canCreate', 'canUpdate', 'canDelete'] as const).map((key) => (
                                <label key={key} className="flex items-center gap-1.5 text-sm text-slate-600">
                                  <input
                                    type="checkbox"
                                    checked={perms?.[key] ?? false}
                                    onChange={(e) => updatePermissionEdit(member._id, key, e.target.checked)}
                                    className="rounded border-slate-300"
                                  />
                                  {key.replace('can', '')}
                                </label>
                              ))}
                              <button
                                onClick={() => handleUpdatePermissions(member._id)}
                                disabled={processingId === member._id}
                                className="px-3 py-1 rounded text-sm font-medium text-slate-900 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setPermissionEdits((p) => ({ ...p, [member._id]: undefined }))}
                                className="px-3 py-1 rounded text-sm text-slate-600 hover:text-slate-900"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => initPermissionEdit(member._id, member.permissions)}
                                disabled={processingId === member._id}
                                className="px-3 py-1 rounded text-sm font-medium text-indigo-600 hover:bg-blue-500/10"
                              >
                                Edit Permissions
                              </button>
                              <button
                                onClick={() => handleRemoveMember(member._id)}
                                disabled={processingId === member._id}
                                className="px-3 py-1 rounded text-sm font-medium text-red-600 hover:bg-red-500/10"
                              >
                                Remove
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {!isEditing && member.role !== 'admin' && (
                        <div className="flex gap-1 flex-wrap">
                          {perms?.canRead && <span className="px-2 py-0.5 rounded text-xs bg-green-500/10 text-green-400">R</span>}
                          {perms?.canCreate && <span className="px-2 py-0.5 rounded text-xs bg-blue-500/10 text-indigo-600">C</span>}
                          {perms?.canUpdate && <span className="px-2 py-0.5 rounded text-xs bg-amber-500/10 text-amber-400">U</span>}
                          {perms?.canDelete && <span className="px-2 py-0.5 rounded text-xs bg-red-500/10 text-red-600">D</span>}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Join Requests Tab (Admin only) */}
      {activeTab === 'requests' && isAdmin && (
        <div className="bg-white rounded-lg border border-slate-200-xl p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pending Join Requests</h2>
          {!joinRequests || joinRequests.length === 0 ? (
            <p className="text-slate-600">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {joinRequests.map((req: any) => (
                <div key={req._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg bg-slate-100">
                  <div>
                    <p className="font-medium text-slate-900">
                      {req.user?.fullName ? `${req.user.fullName.firstName} ${req.user.fullName.lastName}` : req.user?.email || 'Unknown'}
                    </p>
                    <p className="text-sm text-slate-500">{req.user?.enrollmentNumber || req.user?.email}</p>
                    {req.message && <p className="text-sm text-slate-600 mt-1">{req.message}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApproveRequest(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-slate-900 bg-green-500 hover:bg-green-600 disabled:opacity-50"
                    >
                      {processingId === req._id ? '...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'requests' && !isAdmin && (
        <div className="bg-white rounded-lg border border-slate-200-xl p-6">
          <p className="text-slate-600">Only chamber admins can view join requests.</p>
        </div>
      )}

      {/* Leave Chamber Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowLeaveConfirm(false)} />
          <div className="relative bg-white rounded-lg border border-slate-200-2xl p-8 w-full max-w-md" style={{ background: 'hsl(222 47% 8%)' }}>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Leave Chamber?</h2>
            <p className="text-slate-600 mb-6">You will lose access to all chamber cases. This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="px-4 py-2 rounded-lg font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleLeave}
                disabled={leaving}
                className="px-4 py-2 rounded-lg font-medium text-slate-900 bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                {leaving ? 'Leaving...' : 'Leave Chamber'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
