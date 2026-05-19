'use client';

import { useEffect, useState, useRef } from 'react';
import { Bell, Sparkles, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotificationDropdown() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unseenCount, setUnseenCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const { lang } = useLanguage();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?t=${Date.now()}`, {
                credentials: 'include',
            });
            if (!res.ok) return;
            const data = await res.json();
            
            if (data && data.length > 0) {
                const seenIdsStr = localStorage.getItem('seen_notif_ids');
                const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
                
                const unseen = data.filter((n: any) => !seenIds.includes(n._id));
                setUnseenCount(unseen.length);
                
                // Show up to 3 latest unseen notifications
                setNotifications(unseen.slice(0, 3));
            } else {
                setNotifications([]);
                setUnseenCount(0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                // Refresh to remove seen notifications from dropdown
                fetchNotifications();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleOpen = () => {
        if (isOpen) {
            setIsOpen(false);
            // Refresh to remove seen notifications from dropdown
            fetchNotifications();
        } else {
            setIsOpen(true);
            if (unseenCount > 0) {
                // Mark all currently fetched notifications as seen
                const seenIdsStr = localStorage.getItem('seen_notif_ids');
                const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
                const currentIds = notifications.map(n => n._id);
                
                const newSeenIds = Array.from(new Set([...seenIds, ...currentIds]));
                localStorage.setItem('seen_notif_ids', JSON.stringify(newSeenIds));
                setUnseenCount(0);
            }
        }
    };

    const handleNotificationClick = () => {
        setIsOpen(false);
        fetchNotifications();
        router.push('/notifications');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={handleOpen}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center border-2 border-border hover:border-primary transition-all overflow-hidden relative"
                title="Notifications"
            >
                <Bell className="w-5 h-5 text-secondary" />
                {unseenCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-border py-2 z-50 overflow-hidden"
                    >
                        <div className="px-4 py-3 bg-muted/30 border-b border-border/50 flex justify-between items-center">
                            <p className="text-sm font-black text-secondary uppercase tracking-tight">Notifications</p>
                            {unseenCount > 0 && (
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {unseenCount} New
                                </span>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.map((notif) => (
                                    <div
                                        key={notif._id}
                                        onClick={handleNotificationClick}
                                        className="px-4 py-3 border-b border-border/50 hover:bg-muted/50 cursor-pointer transition-colors"
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                    <Bell className="w-4 h-4" />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1 mb-1">
                                                    {notif.type === 'general' && <Sparkles className="w-3 h-3 text-primary" />}
                                                    {notif.type !== 'general' && <AlertCircle className="w-3 h-3 text-primary" />}
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-widest">{notif.type}</span>
                                                </div>
                                                <h4 className="font-bold text-sm text-secondary line-clamp-1">
                                                    {lang === 'mr' && notif.titleMr ? notif.titleMr : notif.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                                                    {lang === 'mr' && notif.messageMr ? notif.messageMr : notif.message}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-6 text-center text-muted-foreground">
                                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-bold">No new notifications</p>
                                </div>
                            )}
                        </div>

                        {notifications.length > 0 && (
                            <div className="px-4 py-2 text-center border-t border-border/50 bg-muted/20">
                                <Link
                                    href="/notifications"
                                    onClick={() => setIsOpen(false)}
                                    className="text-xs font-bold text-primary hover:underline"
                                >
                                    View All Notifications
                                </Link>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
