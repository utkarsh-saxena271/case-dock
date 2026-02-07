'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCaseById, deleteCase, clearCurrentCase } from '@/store/slices/casesSlice';
import { API_URL } from '@/lib/api';

async function downloadFile(url: string, fileName: string) {
    try {
        const res = await fetch(url, { credentials: 'include' });
        if (!res.ok) throw new Error('Download failed');
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch {
        window.open(url.replace('?download=1', ''), '_blank');
    }
}

export default function CaseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { currentCase, userPermissions, loading, error } = useAppSelector((state) => state.cases);
    const caseId = params.caseId as string;

    useEffect(() => {
        if (caseId) {
            dispatch(fetchCaseById(caseId));
        }
        return () => {
            dispatch(clearCurrentCase());
        };
    }, [dispatch, caseId]);

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this case?')) {
            const result = await dispatch(deleteCase(caseId));
            if (deleteCase.fulfilled.match(result)) {
                router.push('/dashboard/cases');
            }
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open':
                return 'status-open';
            case 'closed':
                return 'status-closed';
            case 'dismissed':
                return 'status-dismissed';
            default:
                return 'status-open';
        }
    };

    if (loading && !currentCase) {
        return (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                <div className="bg-white rounded-lg border border-slate-200-xl p-8 animate-pulse">
                    <div className="h-8 bg-slate-200 rounded w-1/3 mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-1/4 mb-8" />
                    <div className="space-y-3">
                        <div className="h-4 bg-slate-200 rounded w-full" />
                        <div className="h-4 bg-slate-200 rounded w-3/4" />
                        <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto animate-fadeIn">
                <div className="bg-white rounded-lg border border-slate-200-xl p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h2 className="text-xl font-semibold text-slate-900 mb-2">Error Loading Case</h2>
                    <p className="text-slate-600 mb-6">{error}</p>
                    <Link
                        href="/dashboard/cases"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-900 transition-all"
                        style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
                    >
                        Back to Cases
                    </Link>
                </div>
            </div>
        );
    }

    if (!currentCase) {
        return null;
    }

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors mb-4"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Cases
                    </button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold text-slate-900">{currentCase.title}</h1>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentCase.status)}`}>
                            {currentCase.status}
                        </span>
                    </div>
                </div>
                {(currentCase.chamber
                    ? (userPermissions?.canUpdate || userPermissions?.canDelete)
                    : true /* personal case: only owner can access, backend enforces */
                ) && (
                <div className="flex items-center gap-2">
                    {(currentCase.chamber ? userPermissions?.canUpdate : true) && (
                        <Link
                            href={`/dashboard/cases/${caseId}/edit`}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-slate-900 transition-all"
                            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                        </Link>
                    )}
                    {(currentCase.chamber ? userPermissions?.canDelete : true) && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-600 hover:text-slate-900 hover:bg-red-500 transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                        </button>
                    )}
                </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {/* Details Card */}
                <div className="bg-white rounded-lg border border-slate-200-xl p-6">
                    <h2 className="text-lg font-semibold text-slate-900 mb-4">Case Details</h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="text-sm font-medium text-slate-600 mb-1">Description</h3>
                            <p className="text-slate-900 whitespace-pre-wrap">{currentCase.description}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                            <div>
                                <h3 className="text-sm font-medium text-slate-600 mb-1">Next Hearing</h3>
                                <p className="text-slate-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    {formatDate(currentCase.nextDate)}
                                </p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-slate-600 mb-1">Created</h3>
                                <p className="text-slate-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatDate(currentCase.createdAt)}
                                </p>
                            </div>
                            {currentCase.chamber && (
                                <div>
                                    <h3 className="text-sm font-medium text-slate-600 mb-1">Chamber</h3>
                                    <p className="text-violet-600 flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {currentCase.chamber.name}
                                    </p>
                                </div>
                            )}
                            <div>
                                <h3 className="text-sm font-medium text-slate-600 mb-1">Created By</h3>
                                <p className="text-slate-900 flex items-center gap-2">
                                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    {currentCase.createdBy?.fullName?.firstName ? `${currentCase.createdBy.fullName.firstName} ${currentCase.createdBy.fullName.lastName}` : currentCase.createdBy?.email || 'Unknown'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Documents Card */}
                <div className="bg-white rounded-lg border border-slate-200-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Documents</h2>
                        <span className="text-sm text-slate-600">{currentCase.files?.length || 0} file(s)</span>
                    </div>

                    {!currentCase.files || currentCase.files.length === 0 ? (
                        <div className="text-center py-8">
                            <svg className="w-12 h-12 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <p className="text-slate-600">No documents attached</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {currentCase.files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-100 hover:bg-slate-100 transition-all"
                                >
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'hsl(0 84% 60% / 0.1)' }}>
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14,2L20,8V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V4A2,2 0 0,1 6,2H14M18,20V9H13V4H6V20H18M10.92,12.31C10.68,11.54 10.15,9.08 11.55,9.04C12.95,9 12.03,12.16 12.03,12.16C12.42,13.65 14.05,14.72 14.05,14.72C14.55,14.57 17.4,14.24 17,15.72C16.57,17.2 13.5,15.81 13.5,15.81C11.55,15.95 10.09,16.47 10.09,16.47C8.96,18.58 7.64,19.5 7.1,18.61C6.43,17.5 9.23,16.07 9.23,16.07C10.68,13.72 10.9,12.35 10.92,12.31Z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-slate-900 font-medium truncate">{file.fileName}</p>
                                        <p className="text-xs text-slate-500">PDF Document</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <a
                                            href={`${API_URL}/cases/${caseId}/files/${index}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </a>
                                        <button
                                            type="button"
                                            onClick={() => downloadFile(`${API_URL}/cases/${caseId}/files/${index}?download=1`, file.fileName)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-indigo-600 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Permissions Info (for chamber cases) */}
                {currentCase.chamber && userPermissions && (
                    <div className="bg-white rounded-lg border border-slate-200-xl p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">Your Permissions</h2>
                        <div className="flex flex-wrap gap-2">
                            {userPermissions.canRead && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-400">Read</span>
                            )}
                            {userPermissions.canCreate && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-indigo-600">Create</span>
                            )}
                            {userPermissions.canUpdate && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400">Update</span>
                            )}
                            {userPermissions.canDelete && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-600">Delete</span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
