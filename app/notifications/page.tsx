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
                                {displayedNotifications.map((n, i) => (
                                    <motion.div
                                        key={n._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="group relative overflow-hidden rounded-[28px] border border-[#E9DED2] bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.04)] hover:shadow-[0_18px_60px_rgba(0,0,0,0.08)] transition-all duration-500 hover:-translate-y-1 p-6 flex flex-col h-full"
                                    >
                                        {/* Soft Gradient Glow */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-orange-50/40 via-transparent to-red-50/30 pointer-events-none" />

                                        {/* Top Section */}
                                        <div className="relative z-10 flex items-start justify-between mb-6">
                                            <div
                                                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border transition-all duration-300 ${n.type === 'event'
                                                    ? 'bg-orange-50 text-orange-600 border-orange-100'
                                                    : n.type === 'donation'
                                                        ? 'bg-rose-50 text-rose-600 border-rose-100'
                                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}
                                            >
                                                {getTypeIcon(n.type)}
                                            </div>

                                            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] bg-[#F8F5F1] text-[#8A7E72] px-3 py-1.5 rounded-full">
                                                {new Date(n.createdAt).toLocaleDateString('en-IN', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                })}
                                            </span>
                                        </div>

                                        {/* Content */}
                                        <div className="relative z-10 flex-grow">
                                            <h3 className="text-[24px] leading-tight font-black text-[#3D2B1F] mb-3 group-hover:text-primary transition-colors duration-300">
                                                {lang === 'mr' && n.titleMr ? n.titleMr : n.title}
                                            </h3>

                                            <p className="text-[15px] leading-7 text-[#7B6D63] line-clamp-4">
                                                {lang === 'mr' && n.messageMr ? n.messageMr : n.message}
                                            </p>
                                        </div>

                                        {/* Bottom */}
                                        <div className="relative z-10 mt-8 pt-5 border-t border-[#EFE7DE] flex items-center justify-between">
                                            <span
                                                className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full ${n.type === 'event'
                                                    ? 'bg-orange-100 text-orange-700'
                                                    : n.type === 'donation'
                                                        ? 'bg-rose-100 text-rose-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {n.type}
                                            </span>

                                            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                                                <span>Details</span>
                                                <ChevronRight className="w-4 h-4" />
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
