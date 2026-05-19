'use client';

import { useEffect, useState } from 'react';
import { Bell, Trash2, CheckCircle2, Plus, Sparkles, Megaphone, Info, Calendar, Heart, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/lib/LanguageContext';

// Toast Component
const Toast = ({ message, type, onClose }: any) => {
    useEffect(() => {
        const t = setTimeout(onClose, 3000);
        return () => clearTimeout(t);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 right-4 px-6 py-3 rounded-2xl text-white font-bold shadow-2xl z-[100] flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
            {message}
        </motion.div>
    );
};

export default function AdminNotificationsPage() {
    const { lang } = useLanguage();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [toast, setToast] = useState<any>(null);

    const [form, setForm] = useState({
        title: '',
        titleMr: '',
        message: '',
        messageMr: '',
        type: 'general',
    });

    // FETCH
    const fetchData = async () => {
        try {
            const res = await fetch('/api/notifications?admin=true', {
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setNotifications(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5000); // auto refresh
        return () => clearInterval(interval);
    }, []);

    // CREATE
    const handleCreate = async () => {
        if (!form.title || !form.message) return;

        try {
            const payload = {
                ...form,
                role: 'user', // By default broadcasts from admin are for users
            };

            const res = await fetch('/api/notifications', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed');

            setToast({ message: 'Notification broadcasted', type: 'success' });
            setShowCreate(false);
            setForm({ title: '', titleMr: '', message: '', messageMr: '', type: 'general' });
            fetchData();
        } catch {
            setToast({ message: 'Failed to create', type: 'error' });
        }
    };

    // DELETE
    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}?admin=true`, {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            setToast({ message: 'Notification removed', type: 'success' });
            fetchData();
        } catch {
            setToast({ message: 'Failed to delete', type: 'error' });
        }
    };

    // MARK READ
    const markRead = async (id: string) => {
        try {
            const res = await fetch(`/api/notifications/${id}?admin=true`, {
                method: 'PATCH',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            fetchData();
        } catch {
            setToast({ message: 'Action failed', type: 'error' });
        }
    };

    // MARK ALL READ
    const markAllRead = async () => {
        try {
            const res = await fetch('/api/notifications?admin=true', {
                method: 'PATCH',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            setToast({ message: 'All marked as read', type: 'success' });
            fetchData();
        } catch {
            setToast({ message: 'Action failed', type: 'error' });
        }
    };

    // CLEAR ALL
    const clearAll = async () => {
        if (!confirm('Are you sure you want to delete all notifications? This cannot be undone.')) return;
        try {
            const res = await fetch('/api/notifications?admin=true', {
                method: 'DELETE',
                credentials: 'include',
            });
            if (!res.ok) throw new Error('Failed');
            setToast({ message: 'All notifications cleared', type: 'success' });
            fetchData();
        } catch {
            setToast({ message: 'Action failed', type: 'error' });
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'event': return <Calendar className="w-4 h-4 text-orange-600" />;
            case 'donation': return <Heart className="w-4 h-4 text-red-600" />;
            default: return <Info className="w-4 h-4 text-blue-600" />;
        }
    };

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const past = new Date(date);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

        if (diffInMins < 1) return 'Just now';
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return past.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center items-center h-full">
                <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div>
                    <div className="text-[10px] uppercase font-black tracking-[0.2em] text-primary mb-1 flex items-center gap-2">
                        <Megaphone className="w-3 h-3" /> System Announcements
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">
                        Notifications Management
                    </h1>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {notifications.length > 0 && (
                        <>
                            <button
                                onClick={markAllRead}
                                className="spiritual-button-outline px-4 py-2.5 text-xs flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                Mark All Read
                            </button>
                            <button
                                onClick={clearAll}
                                className="spiritual-button-outline px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 border-red-100 flex items-center gap-2"
                            >
                                <Trash2 className="w-4 h-4" />
                                Clear All
                            </button>
                        </>
                    )}
                    <button
                        onClick={() => setShowCreate(true)}
                        className="spiritual-button flex items-center gap-2 shadow-xl shadow-primary/20"
                    >
                        <Plus className="w-4 h-4" />
                        Create New Broadcast
                    </button>
                </div>
            </div>

            {/* MAIN CONTENT CARD */}
            <div className="spiritual-card bg-white border-border shadow-sm p-6 min-h-[500px]">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                    <h2 className="text-lg font-black text-secondary flex items-center gap-2 italic">
                        <Bell className="w-5 h-5 text-primary" /> Active Alerts
                    </h2>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Live updates enabled
                        </div>
                    </div>
                </div>

                {/* LIST */}
                <div className="space-y-4">
                    <AnimatePresence mode='popLayout'>
                        {notifications.map((n) => (
                            <motion.div
                                layout
                                key={n._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className={`group p-5 rounded-[1.5rem] border transition-all duration-300 flex justify-between items-center bg-white hover:shadow-lg ${n.isRead
                                    ? 'opacity-60 bg-muted/20 border-transparent hover:border-border'
                                    : 'border-primary/20 shadow-sm shadow-primary/5 hover:border-primary/40'
                                    }`}
                            >
                                <div className="flex gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${n.isRead ? 'bg-muted' : 'bg-primary/5'
                                        }`}>
                                        {getTypeIcon(n.type)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-black text-secondary italic tracking-tight">
                                                {lang === 'mr' && n.titleMr ? n.titleMr : n.title}
                                            </h3>
                                            {!n.isRead && (
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
                                            {lang === 'mr' && n.messageMr ? n.messageMr : n.message}
                                        </p>
                                        <div className="mt-2 flex items-center gap-3">
                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${n.type === 'event' ? 'bg-orange-100 text-orange-600' :
                                                n.type === 'donation' ? 'bg-red-100 text-red-600' :
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                {n.type}
                                            </span>
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                {formatTimeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!n.isRead && (
                                        <button
                                            onClick={() => markRead(n._id)}
                                            className="p-2.5 text-green-600 bg-green-50 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm"
                                            title="Mark as Read"
                                        >
                                            <CheckCircle2 className="w-5 h-5" />
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleDelete(n._id)}
                                        className="p-2.5 text-red-600 bg-red-50 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm"
                                        title="Delete Broadcast"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {notifications.length === 0 && (
                        <div className="py-24 text-center">
                            <div className="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Megaphone className="w-8 h-8 text-muted-foreground opacity-30" />
                            </div>
                            <p className="text-muted-foreground font-black italic">No notifications found in the history.</p>
                            <button
                                onClick={() => setShowCreate(true)}
                                className="mt-4 text-primary font-bold text-sm hover:underline"
                            >
                                Broadcast your first announcement
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* CREATE MODAL */}
            <AnimatePresence>
                {showCreate && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/20 relative overflow-hidden"
                        >
                            {/* Decorative background circle */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>

                            <div className="flex justify-between items-center mb-6">
                                <h2 className="font-black text-2xl text-secondary italic">Create Broadcast</h2>
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="p-2 hover:bg-muted rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Broadcast Title (English)</label>
                                    <input
                                        placeholder="Announcement Header"
                                        className="spiritual-input w-full"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Broadcast Title (Marathi)</label>
                                    <input
                                        placeholder="घोषणा शीर्षक"
                                        className="spiritual-input w-full"
                                        value={form.titleMr}
                                        onChange={(e) => setForm({ ...form, titleMr: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Body (English)</label>
                                    <textarea
                                        placeholder="Type the detailed announcement here..."
                                        className="spiritual-input w-full min-h-[80px] py-4"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Message Body (Marathi)</label>
                                    <textarea
                                        placeholder="येथे सविस्तर घोषणा टाईप करा..."
                                        className="spiritual-input w-full min-h-[80px] py-4"
                                        value={form.messageMr}
                                        onChange={(e) => setForm({ ...form, messageMr: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Broadcast Type</label>
                                    <select
                                        className="spiritual-input w-full appearance-none bg-no-repeat bg-[right_1rem_center]"
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.2em' }}
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        <option value="general">General Update</option>
                                        <option value="event">Temple Event</option>
                                        <option value="donation">Donation Appeal</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-8">
                                <button
                                    onClick={() => setShowCreate(false)}
                                    className="flex-1 border-2 border-border py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-secondary hover:bg-muted transition-all"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={handleCreate}
                                    disabled={!form.title || !form.message}
                                    className="flex-1 spiritual-button !py-3.5 shadow-xl shadow-primary/20 disabled:opacity-50"
                                >
                                    Send Broadcast
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}