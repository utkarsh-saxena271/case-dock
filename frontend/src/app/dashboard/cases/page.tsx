'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCases, deleteCase, clearError } from '@/store/slices/casesSlice';
import { fetchChambers } from '@/store/slices/chambersSlice';

type StatusFilter = 'all' | 'open' | 'closed' | 'dismissed';

export default function CasesPage() {
    const searchParams = useSearchParams();
    const chamberIdFromUrl = searchParams.get('chamberId') || undefined;
    const dispatch = useAppDispatch();
    const { cases, loading, error } = useAppSelector((state) => state.cases);
    const { chambers } = useAppSelector((state) => state.chambers);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [chamberFilter, setChamberFilter] = useState<'all' | 'personal' | string>(chamberIdFromUrl || 'all');
    const [searchQuery, setSearchQuery] = useState('');
    const [localError, setLocalError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchCases(chamberIdFromUrl));
        dispatch(fetchChambers());
    }, [dispatch, chamberIdFromUrl]);

    useEffect(() => {
        if (chamberIdFromUrl) setChamberFilter(chamberIdFromUrl);
    }, [chamberIdFromUrl]);

    useEffect(() => {
        if (error) {
            setLocalError(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleDelete = async (caseId: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) return;

        setDeletingId(caseId);
        try {
            await dispatch(deleteCase(caseId));
        } catch (err) {
            setLocalError('Failed to delete case');
        }
        setDeletingId(null);
    };

    const filteredCases = cases.filter((c) => {
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        if (chamberFilter === 'personal' && c.chamber) return false;
        if (chamberFilter !== 'all' && chamberFilter !== 'personal' && c.chamber?._id !== chamberFilter) return false;
        if (searchQuery && !c.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30';
            case 'closed': return 'bg-blue-500/15 text-blue-400 border border-blue-500/30';
            case 'dismissed': return 'bg-red-500/15 text-red-400 border border-red-500/30';
            default: return 'bg-gray-500/15 text-slate-600 border border-gray-500/30';
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getDaysUntil = (date: string) => {
        const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        if (days < 0) return { text: `${Math.abs(days)}d overdue`, urgent: true };
        if (days === 0) return { text: 'Today', urgent: true };
        if (days === 1) return { text: 'Tomorrow', urgent: true };
        return { text: `${days} days`, urgent: days <= 7 };
    };

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Cases</h1>
                    <p className="text-slate-600">Manage and track all your legal cases</p>
                </div>
                <Link
                    href="/dashboard/cases/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-slate-900 transition-all hover:scale-105 shadow-lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Case
                </Link>
            </div>

            {/* Error Alert */}
            {localError && (
                <div className="mb-6 p-4 rounded-lg flex items-center justify-between bg-red-50 border border-red-200">
                    <span className="text-red-600">{localError}</span>
                    <button onClick={() => setLocalError(null)} className="text-slate-600 hover:text-slate-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Search cases..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex gap-2 flex-wrap">
                        {(['all', 'open', 'closed', 'dismissed'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${statusFilter === status
                                        ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                                        : 'border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-400'
                                    }`}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    {/* Chamber Filter */}
                    <select
                        value={chamberFilter}
                        onChange={(e) => setChamberFilter(e.target.value)}
                        className="px-4 py-3 rounded-xl border border-slate-300 bg-slate-100 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                        <option value="all">All Chambers</option>
                        <option value="personal">Personal Only</option>
                        {chambers.map((chamber) => (
                            <option key={chamber._id} value={chamber._id}>{chamber.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg border border-slate-200-xl p-4 text-center">
                    <p className="text-2xl font-bold text-slate-900">{cases.length}</p>
                    <p className="text-sm text-slate-600">Total Cases</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200-xl p-4 text-center">
                    <p className="text-2xl font-bold text-emerald-400">{cases.filter(c => c.status === 'open').length}</p>
                    <p className="text-sm text-slate-600">Open</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-400">{cases.filter(c => c.status === 'closed').length}</p>
                    <p className="text-sm text-slate-600">Closed</p>
                </div>
                <div className="bg-white rounded-lg border border-slate-200-xl p-4 text-center">
                    <p className="text-2xl font-bold text-amber-400">{cases.filter(c => c.nextDate && new Date(c.nextDate) >= new Date()).length}</p>
                    <p className="text-sm text-slate-600">Upcoming</p>
                </div>
            </div>

            {/* Cases List */}
            {loading && cases.length === 0 ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-slate-200-2xl p-6 animate-pulse">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-xl" />
                                <div className="flex-1">
                                    <div className="h-5 bg-slate-200 rounded w-1/3 mb-2" />
                                    <div className="h-4 bg-slate-200 rounded w-1/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200-2xl p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" style={{ background: 'hsl(217 91% 60% / 0.1)' }}>
                        <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">
                        {cases.length === 0 ? 'No cases yet' : 'No matching cases'}
                    </h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">
                        {cases.length === 0
                            ? 'Start managing your legal cases by creating your first one.'
                            : 'Try adjusting your filters to find what you\'re looking for.'}
                    </p>
                    {cases.length === 0 && (
                        <Link
                            href="/dashboard/cases/new"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-900 transition-all hover:scale-105"
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create First Case
                        </Link>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredCases.map((caseItem) => {
                        const nextDateInfo = caseItem.nextDate ? getDaysUntil(caseItem.nextDate) : null;
                        return (
                            <Link
                                key={caseItem._id}
                                href={`/dashboard/cases/${caseItem._id}`}
                                className="block bg-white rounded-lg border border-slate-200-2xl p-6 card-hover group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(90deg, hsl(217 91% 60% / 0.03) 0%, transparent 50%)' }} />

                                <div className="relative flex items-start gap-5">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'hsl(217 91% 60% / 0.1)' }}>
                                        <svg className="w-7 h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-400 transition-colors truncate">
                                                {caseItem.title}
                                            </h3>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${getStatusColor(caseItem.status)}`}>
                                                    {caseItem.status.charAt(0).toUpperCase() + caseItem.status.slice(1)}
                                                </span>
                                                <button
                                                    onClick={(e) => handleDelete(caseItem._id, e)}
                                                    disabled={deletingId === caseItem._id}
                                                    className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    {deletingId === caseItem._id ? (
                                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    )}
                                                </button>
                                            </div>
                                        </div>

                                        <p className="text-slate-600 text-sm line-clamp-1 mb-3">{caseItem.description || 'No description provided'}</p>

                                        <div className="flex items-center gap-4 text-sm">
                                            {caseItem.chamber && (
                                                <span className="flex items-center gap-1.5 text-violet-600">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                    {caseItem.chamber.name}
                                                </span>
                                            )}
                                            {nextDateInfo && (
                                                <span className={`flex items-center gap-1.5 ${nextDateInfo.urgent ? 'text-amber-400' : 'text-slate-500'}`}>
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    {formatDate(caseItem.nextDate)} ({nextDateInfo.text})
                                                </span>
                                            )}
                                            {caseItem.files && caseItem.files.length > 0 && (
                                                <span className="flex items-center gap-1.5 text-slate-500">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    {caseItem.files.length} file{caseItem.files.length !== 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0 mt-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
