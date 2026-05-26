'use client';

import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
    const [count, setCount] = useState(0);

    const fetchCount = async () => {
        try {
            // Stop polling if no token is found in localStorage
            if (typeof window !== 'undefined' && !localStorage.getItem('token')) {
                return;
            }

            const res = await fetch('/api/notifications', {
                credentials: 'include',
            });

            if (res.status === 401 || res.status === 403) {
                console.log('NotificationBell: Auth error, stopping poll');
                // The AuthInterceptor will handle the redirect, but we stop further logic here
                return;
            }

            if (!res.ok) return;
            const data = await res.json();
            const unread = data.filter((n: any) => !n.isRead).length;
            setCount(unread);
        } catch {
            // Silently ignore network errors — bell is non-critical UI
        }
    };

    useEffect(() => {
        fetchCount();

        const interval = setInterval(fetchCount, 30000); // Poll every 30s instead of 5s

        return () => clearInterval(interval);
    }, []);

    return (
        <Link href="/admin/notifications" className="relative">
            <Bell className="w-6 h-6 text-secondary" />

            {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {count}
                </span>
            )}
        </Link>
    );
}