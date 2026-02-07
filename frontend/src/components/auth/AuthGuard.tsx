'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { checkAuth } from '@/store/slices/authSlice';

interface AuthGuardProps {
    children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
    const [isChecking, setIsChecking] = useState(true);
    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        const verify = async () => {
            try {
                await dispatch(checkAuth()).unwrap();
            } catch {
                router.push('/login');
            } finally {
                setIsChecking(false);
            }
        };

        verify();
    }, [dispatch, router]);

    if (isChecking || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
                    <p className="text-sm text-slate-500">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return <>{children}</>;
}
