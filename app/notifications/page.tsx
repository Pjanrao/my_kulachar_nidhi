'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Sparkles, Calendar, Heart, Info, Loader2, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function UserNotificationsPage() {
    const { lang, t } = useLanguage();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAll, setShowAll] = useState(false);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            // On public side, maybe only show general/event? 
            // Or show all if it's meant to be a public feed.
            setNotifications(data);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 10000); // refresh every 10s
        return () => clearInterval(interval);
    }, []);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'event': return <Calendar className="w-5 h-5" />;
            case 'donation': return <Heart className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const displayedNotifications = showAll
        ? notifications
        : notifications.slice(0, 6);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-grow">
                {/* Hero Section */}
                <section className="relative py-20 bg-secondary text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <img src="/devi.png" alt="Pattern" className="w-full h-full object-cover scale-110" />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-black mb-4 tracking-tight"
                        >
                            {t('nav.notifications') || 'Temple Updates'}
                        </motion.h1>
                        <p className="text-accent font-bold uppercase tracking-[0.3em] text-sm italic">
                            Stay Connected with Sacred Activities
                        </p>
                    </div>
                </section>

                <section className="py-20 bg-[#FFFDF9] relative min-h-[60vh]">
                    <div className="max-w-7xl mx-auto px-4 relative z-10">

                        <div className="text-center mb-16">
                            <div className="flex justify-center items-center gap-2 mb-4">
                                <Sparkles className="w-4 h-4 text-primary" />
                                <span className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                                    Latest Alerts
                                </span>
                            </div>
                            <h2 className="text-4xl font-black text-secondary tracking-tight">
                                Divine Announcements
                            </h2>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                            </div>
                        ) : notifications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notifications.map((n, i) => (
                                    <motion.div
                                        key={n._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="spiritual-card spiritual-card-hover group h-full flex flex-col p-6 hover:translate-y-[-4px]"
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${n.type === 'event' ? 'bg-orange-50 text-orange-600' :
                                                    n.type === 'donation' ? 'bg-red-50 text-red-600' :
                                                        'bg-blue-50 text-blue-600'
                                                }`}>
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest bg-muted/50 px-3 py-1 rounded-full">
                                                {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>

                                        <div className="flex-grow">
                                            <h3 className="text-xl font-black text-secondary mb-3 leading-tight group-hover:text-primary transition-colors">
                                                {lang === 'mr' && n.titleMr ? n.titleMr : n.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                                                {lang === 'mr' && n.messageMr ? n.messageMr : n.message}
                                            </p>
                                        </div>

                                        <div className="mt-8 pt-4 border-t border-border/50 flex items-center justify-between">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-lg ${n.type === 'event' ? 'bg-orange-100 text-orange-700' :
                                                    n.type === 'donation' ? 'bg-red-100 text-red-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {n.type}
                                            </span>
                                            <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                                <span>Details</span>
                                                <ChevronRight className="w-3.5 h-3.5" />
                                            </div>
                                        </div>

                                        {/* Decorative Blur */}
                                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-100/20 blur-3xl rounded-full pointer-events-none" />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-border max-w-2xl mx-auto">
                                <Bell className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-muted-foreground font-bold">No active notifications at this moment.</p>
                            </div>
                        )}
                    </div>

                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                        <img src="/devi.png" alt="Pattern" className="w-full h-full object-cover grayscale" />
                    </div>

                    {/* Read More Button */}
                    {notifications.length > 6 && (
                        <div className="flex justify-center mt-14">
                            <button
                                onClick={() => setShowAll(!showAll)}
                                className="group inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.18em] text-sm shadow-[0_12px_30px_rgba(249,115,22,0.28)] transition-all duration-300 hover:scale-[1.03]"
                            >
                                <span>
                                    {showAll ? 'Show Less' : 'Read More'}
                                </span>

                                <ChevronRight
                                    className={`w-4 h-4 transition-transform duration-300 ${showAll ? 'rotate-90' : 'group-hover:translate-x-1'
                                        }`}
                                />
                            </button>
                        </div>
                    )}

                </section>
            </main>

            <Footer />
        </div>
    );
}
