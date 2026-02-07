'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { searchChambers, requestJoinChamber } from '@/store/slices/chambersSlice';

export default function SearchChambersPage() {
    const dispatch = useAppDispatch();
    const { searchResults, loading, error } = useAppSelector((state) => state.chambers);
    const [query, setQuery] = useState('');
    const [requestingId, setRequestingId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(searchChambers(undefined));
    }, [dispatch]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch(searchChambers(query));
    };

    const handleJoinRequest = async (chamberId: string) => {
        setRequestingId(chamberId);
        await dispatch(requestJoinChamber({ chamberId }));
        setRequestingId(null);
    };

    return (
        <div className="max-w-4xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Find Chambers</h1>
                <p className="text-slate-600">Search for chambers to join and collaborate</p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="bg-white rounded-lg border border-slate-200-xl p-4 mb-8">
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-300 bg-slate-100 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Search chambers by name..."
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 rounded-lg font-medium text-slate-900 transition-all disabled:opacity-50"
                        style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-lg" style={{ background: 'hsl(0 84% 60% / 0.1)', color: 'hsl(0 84% 60%)' }}>
                    {error}
                </div>
            )}

            {/* Results */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-slate-200-xl p-6 animate-pulse">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-200 rounded-lg" />
                                <div className="flex-1">
                                    <div className="h-6 bg-slate-200 rounded w-1/4 mb-2" />
                                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : searchResults.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200-xl p-12 text-center">
                    <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No chambers found</h3>
                    <p className="text-slate-600">
                        {query ? `No chambers matching "${query}"` : 'No chambers available to join'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {searchResults.map((chamber) => (
                        <div key={chamber._id} className="bg-white rounded-lg border border-slate-200-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.2) 0%, hsl(217 91% 60% / 0.2) 100%)' }}>
                                    <span className="text-xl font-bold text-violet-600">
                                        {chamber.name?.charAt(0)?.toUpperCase() || 'C'}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-semibold text-slate-900 mb-1">{chamber.name}</h3>
                                    <p className="text-slate-600 text-sm line-clamp-2 mb-2">{chamber.description || 'No description'}</p>
                                    {chamber.admin && (
                                        <p className="text-xs text-slate-500">Created by {chamber.admin.fullName?.firstName ? `${chamber.admin.fullName.firstName} ${chamber.admin.fullName.lastName}` : 'Unknown'}</p>
                                    )}
                                </div>
                                <div className="flex-shrink-0">
                                    {chamber.hasPendingRequest ? (
                                        <span className="px-4 py-2 rounded-lg text-sm font-medium bg-amber-500/10 text-amber-400">
                                            Request Pending
                                        </span>
                                    ) : (
                                        <button
                                            onClick={() => handleJoinRequest(chamber._id)}
                                            disabled={requestingId === chamber._id}
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-900 transition-all disabled:opacity-50"
                                            style={{ background: 'linear-gradient(135deg, hsl(217 91% 60%) 0%, hsl(262 83% 58%) 100%)' }}
                                        >
                                            {requestingId === chamber._id ? 'Requesting...' : 'Request to Join'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
