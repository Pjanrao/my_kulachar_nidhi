'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, ExternalLink, Sparkles } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/lib/LanguageContext';

export default function GlobalNotificationToast() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const router = useRouter();
    const pathname = usePathname();
    const { lang } = useLanguage();

    const fetchUnseenNotifications = async () => {
        try {
            const res = await fetch(`/api/notifications?t=${Date.now()}`);
            if (!res.ok) return;
            const data = await res.json();
            
            if (data && data.length > 0) {
                // If user is on the notifications page, mark ALL existing notifications as seen
                if (pathname === '/notifications') {
                    const allIds = data.map((n: any) => n._id);
                    const seenIdsStr = localStorage.getItem('seen_notif_ids');
                    const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
                    
                    const newSeenIds = Array.from(new Set([...seenIds, ...allIds]));
                    localStorage.setItem('seen_notif_ids', JSON.stringify(newSeenIds));
                    setNotifications([]);
                    return;
                }

                if (pathname?.startsWith('/admin')) {
                    setNotifications([]);
                    return;
                }
                
                // Get list of seen IDs from localStorage
                const seenIdsStr = localStorage.getItem('seen_notif_ids');
                const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
                
                // Filter for notifications NOT in the seen list
                const unseen = data.filter((n: any) => !seenIds.includes(n._id));
                
                setNotifications(unseen.slice(0, 3)); 
            } else {
                setNotifications([]);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchUnseenNotifications();
        const interval = setInterval(fetchUnseenNotifications, 10000);
        return () => clearInterval(interval);
    }, [pathname]);

    const handleDismiss = (id: string) => {
        const seenIdsStr = localStorage.getItem('seen_notif_ids');
        const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
        
        if (!seenIds.includes(id)) {
            const updated = [...seenIds, id];
            localStorage.setItem('seen_notif_ids', JSON.stringify(updated));
        }
        
        // Immediately refresh the list to 'refill' from more unseen notifications if available
        fetchUnseenNotifications();
    };

    const handleClick = (id: string) => {
        // When clicking ANY notification, mark ALL currently visible notifications as seen
        // as the user is now heading to the main notifications page.
        const seenIdsStr = localStorage.getItem('seen_notif_ids');
        const seenIds = seenIdsStr ? JSON.parse(seenIdsStr) : [];
        const currentVisibleIds = notifications.map(n => n._id);
        
        const updated = Array.from(new Set([...seenIds, ...currentVisibleIds]));
        localStorage.setItem('seen_notif_ids', JSON.stringify(updated));
        
        setNotifications([]);
        router.push('/notifications');
    };

    if (notifications.length === 0) return null;

    return (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-4 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map((notif) => (
                    <motion.div
                        key={notif._id}
                        layout
                        initial={{ opacity: 0, x: 100, y: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 100, scale: 0.8 }}
                        className="pointer-events-auto"
                    >
                        <div 
                            onClick={() => handleClick(notif._id)}
                            className="bg-white border-2 border-primary/20 rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.12)] p-4 cursor-pointer group hover:border-primary/40 transition-all duration-300 overflow-hidden relative"
                        >
                            {/* Decorative flare */}
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                            
                            <div className="flex gap-3 relative z-10">
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary relative">
                                        <Bell className="w-5 h-5 animate-bounce" />
                                        <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
                                    </div>
                                </div>
                                
                                <div className="flex-grow min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary flex items-center gap-1">
                                            <Sparkles className="w-2.5 h-2.5" />
                                            Update
                                        </span>
                                    </div>
                                    <h4 className="font-black text-sm text-secondary italic truncate">
                                        {lang === 'mr' && notif.titleMr ? notif.titleMr : notif.title}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-relaxed">
                                        {lang === 'mr' && notif.messageMr ? notif.messageMr : notif.message}
                                    </p>
                                </div>
                                
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDismiss(notif._id);
                                    }}
                                    className="flex-shrink-0 self-start p-1 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
