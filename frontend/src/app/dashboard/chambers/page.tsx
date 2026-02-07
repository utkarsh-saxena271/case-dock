'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchChambers, createChamber, clearError } from '@/store/slices/chambersSlice';

export default function ChambersPage() {
    const dispatch = useAppDispatch();
    const { chambers, loading, error } = useAppSelector((state) => state.chambers);
    const [showModal, setShowModal] = useState(false);
    const [newChamber, setNewChamber] = useState({ name: '', description: '' });
    const [creating, setCreating] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchChambers());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setLocalError(error);
            dispatch(clearError());
        }
    }, [error, dispatch]);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newChamber.name.trim()) {
            setLocalError('Chamber name is required');
            return;
        }

        setCreating(true);
        setLocalError(null);

        try {
            const result = await dispatch(createChamber(newChamber));
            if (createChamber.fulfilled.match(result)) {
                setShowModal(false);
                setNewChamber({ name: '', description: '' });
            } else if (createChamber.rejected.match(result)) {
                setLocalError(result.payload as string);
            }
        } catch (err) {
            setLocalError('Failed to create chamber');
        }
        setCreating(false);
    };

    const closeModal = () => {
        setShowModal(false);
        setNewChamber({ name: '', description: '' });
        setLocalError(null);
    };

    return (
        <div className="max-w-7xl mx-auto animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">My Chambers</h1>
                    <p className="text-slate-600">Collaborate with your legal team</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-slate-900 transition-all hover:scale-105 shadow-lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Chamber
                </button>
            </div>

            {/* Global Error */}
            {localError && (
                <div className="mb-6 p-4 rounded-xl flex items-center justify-between" className="bg-red-50 border border-red-200">
                    <span className="text-red-600">{localError}</span>
                    <button onClick={() => setLocalError(null)} className="text-slate-600 hover:text-slate-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}

            {/* Chambers List */}
            {loading && chambers.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg border border-slate-200-2xl p-6 animate-pulse">
                            <div className="w-14 h-14 bg-slate-200 rounded-xl mb-4" />
                            <div className="h-6 bg-slate-200 rounded w-1/2 mb-3" />
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : chambers.length === 0 ? (
                <div className="bg-white rounded-lg border border-slate-200-2xl p-16 text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center" className="bg-violet-100">
                        <svg className="w-10 h-10 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-3">No chambers yet</h3>
                    <p className="text-slate-600 mb-8 max-w-md mx-auto">Create a chamber to start collaborating with your team, or find and join an existing one.</p>
                    <div className="flex items-center justify-center gap-4">
                        <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-900 transition-all hover:scale-105"
                            className="bg-indigo-600 hover:bg-indigo-700"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Create Chamber
                        </button>
                        <Link
                            href="/dashboard/chambers/search"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-slate-700 hover:text-slate-900 transition-all border border-slate-300 hover:border-gray-500"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            Find Chambers
                        </Link>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {chambers.map((chamber) => (
                        <Link
                            key={chamber._id}
                            href={`/dashboard/chambers/${chamber._id}`}
                            className="bg-white rounded-lg border border-slate-200-2xl p-6 card-hover group relative overflow-hidden"
                        >
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" className="bg-indigo-50/50" />

                            <div className="relative">
                                <div className="flex items-start justify-between mb-5">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" className="bg-violet-100">
                                        <span className="text-violet-600">
                                            {chamber.name?.charAt(0)?.toUpperCase() || 'C'}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${chamber.role === 'admin'
                                            ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                            : 'bg-blue-500/15 text-indigo-600 border border-blue-500/30'
                                        }`}>
                                        {chamber.role === 'admin' ? '👑 Admin' : 'Member'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                    {chamber.name}
                                </h3>
                                <p className="text-slate-600 text-sm line-clamp-2 mb-4">{chamber.description || 'No description provided'}</p>

                                <div className="flex items-center justify-between text-xs text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {new Date(chamber.createdAt).toLocaleDateString()}
                                    </span>
                                    <svg className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Create Chamber Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative bg-white rounded-lg border border-slate-200 p-8 w-full max-w-lg animate-fadeIn shadow-xl">
                        <button onClick={closeModal} className="absolute top-4 right-4 p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-violet-100">
                                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900">Create New Chamber</h2>
                                <p className="text-sm text-slate-600">Start collaborating with your team</p>
                            </div>
                        </div>

                        {localError && (
                            <div className="mb-4 p-3 rounded-lg text-sm bg-red-50 text-red-600">
                                {localError}
                            </div>
                        )}

                        <form onSubmit={handleCreate} className="space-y-5">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                                    Chamber Name <span className="text-red-600">*</span>
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    value={newChamber.name}
                                    onChange={(e) => setNewChamber((prev) => ({ ...prev, name: e.target.value }))}
                                    required
                                    autoFocus
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="e.g., Smith & Associates"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                                    Description <span className="text-slate-500">(optional)</span>
                                </label>
                                <textarea
                                    id="description"
                                    value={newChamber.description}
                                    onChange={(e) => setNewChamber((prev) => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Describe your chamber and its focus..."
                                />
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !newChamber.name.trim()}
                                    className="px-6 py-2.5 rounded-xl font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {creating ? (
                                        <span className="flex items-center gap-2">
                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : (
                                        'Create Chamber'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
