'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCases } from '@/store/slices/casesSlice';
import { fetchChambers } from '@/store/slices/chambersSlice';

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const { cases, loading: casesLoading } = useAppSelector((state) => state.cases);
    const { chambers, loading: chambersLoading } = useAppSelector((state) => state.chambers);
    const { user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        dispatch(fetchCases(undefined));
        dispatch(fetchChambers());
    }, [dispatch]);

    const openCases = cases.filter((c) => c.status === 'open');
    const upcomingCases = cases
        .filter((c) => c.nextDate && new Date(c.nextDate) >= new Date())
        .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime())
        .slice(0, 5);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
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

    return (
        <div className="max-w-6xl mx-auto animate-fadeIn">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                    Welcome back, {user?.fullName ? `${user.fullName.firstName}` : 'User'}
                </h1>
                <p className="text-sm text-slate-600">Overview of your legal practice</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{cases.length}</p>
                            <p className="text-xs text-slate-500">Total Cases</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{openCases.length}</p>
                            <p className="text-xs text-slate-500">Open Cases</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-100">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{chambers.length}</p>
                            <p className="text-xs text-slate-500">Chambers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-4 card-hover">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-amber-100">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-xl font-semibold text-slate-900">{upcomingCases.length}</p>
                            <p className="text-xs text-slate-500">Upcoming</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900">Upcoming Hearings</h2>
                        <Link href="/dashboard/cases" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>
                    {casesLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-14 rounded-md bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : upcomingCases.length === 0 ? (
                        <div className="text-center py-10">
                            <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-slate-500">No upcoming hearings</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {upcomingCases.map((caseItem) => (
                                <Link
                                    key={caseItem._id}
                                    href={`/dashboard/cases/${caseItem._id}`}
                                    className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-amber-100">
                                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{caseItem.title}</p>
                                        <p className="text-xs text-slate-500">{formatDate(caseItem.nextDate)}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                                        {caseItem.status}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-slate-900">My Chambers</h2>
                        <Link href="/dashboard/chambers" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
                            View all
                        </Link>
                    </div>
                    {chambersLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-14 rounded-md bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : chambers.length === 0 ? (
                        <div className="text-center py-10">
                            <svg className="w-10 h-10 mx-auto text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-sm text-slate-500 mb-4">No chambers yet</p>
                            <Link
                                href="/dashboard/chambers/search"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                            >
                                Find Chambers
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {chambers.slice(0, 5).map((chamber) => (
                                <Link
                                    key={chamber._id}
                                    href={`/dashboard/chambers/${chamber._id}`}
                                    className="flex items-center gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-9 h-9 rounded-md flex items-center justify-center bg-violet-100">
                                        <span className="text-sm font-semibold text-violet-600">
                                            {chamber.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{chamber.name}</p>
                                        <p className="text-xs text-slate-500 capitalize">{chamber.role || 'Member'}</p>
                                    </div>
                                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
                <h2 className="font-semibold text-slate-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <Link
                        href="/dashboard/cases/new"
                        className="flex items-center gap-3 p-4 rounded-md border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-indigo-100">
                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-900">New Case</span>
                    </Link>
                    <Link
                        href="/dashboard/chambers"
                        className="flex items-center gap-3 p-4 rounded-md border border-slate-200 hover:border-violet-300 hover:bg-violet-50/50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-violet-100">
                            <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-900">Create Chamber</span>
                    </Link>
                    <Link
                        href="/dashboard/chambers/search"
                        className="flex items-center gap-3 p-4 rounded-md border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-emerald-100">
                            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-900">Find Chambers</span>
                    </Link>
                    <Link
                        href="/dashboard/cases"
                        className="flex items-center gap-3 p-4 rounded-md border border-slate-200 hover:border-amber-300 hover:bg-amber-50/50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-md flex items-center justify-center bg-amber-100">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </div>
                        <span className="text-sm font-medium text-slate-900">View All Cases</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
