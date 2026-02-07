'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';

export default function LandingPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-indigo-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
            <span className="font-semibold text-slate-900">Case Dock</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2">
              Sign In
            </Link>
            <Link href="/signup" className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-md transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <section className="pt-28 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-medium text-indigo-600 mb-4">Legal Case Management</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Streamline your practice with{' '}
            <span className="gradient-text">Case Dock</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Manage cases, collaborate with chambers, and track hearings—all in one platform for legal professionals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-6 py-3 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
            >
              Start Free Today
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-md font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-semibold text-slate-900 mb-2">Everything you need</h2>
            <p className="text-slate-600">Designed for modern legal practice</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Case Management', desc: 'Create, track, and manage cases in one dashboard.', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'bg-indigo-100 text-indigo-600' },
              { title: 'Chamber Collaboration', desc: 'Join chambers, share cases, manage permissions.', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z', color: 'bg-emerald-100 text-emerald-600' },
              { title: 'Document Storage', desc: 'Store and organize PDFs with cloud storage.', icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'bg-amber-100 text-amber-600' },
            ].map((f) => (
              <div key={f.title} className="bg-white rounded-lg border border-slate-200 p-6 card-hover">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Ready to get started?</h2>
          <p className="text-slate-600 mb-6">Join legal professionals using Case Dock.</p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            Get Started Free
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      <footer className="py-6 px-4 border-t border-slate-200 bg-slate-50">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-slate-500">Case Dock</span>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
