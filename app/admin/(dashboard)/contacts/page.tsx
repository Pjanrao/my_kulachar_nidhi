'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    Search, Filter, Mail, Calendar as CalendarIcon, Trash2, Eye, X, CheckCircle2, AlertCircle, MessageSquare, Clock, Phone, Reply, Download, ChevronDown
} from 'lucide-react';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import {
    useGetContactsQuery,
    useDeleteContactMutation,
    useUpdateContactMutation,
} from '@/redux/api/contactApiSlice';

// Simple Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-4 right-4 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg z-[100] text-sm font-bold text-white transition-all transform translate-y-0 opacity-100 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            {message}
            <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
        </div>
    );
};

export default function ContactsAdminPage() {
    const { data: contacts = [], isLoading } = useGetContactsQuery({});
    const [deleteContact] = useDeleteContactMutation();
    const [updateContact] = useUpdateContactMutation();

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unread' | 'read'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const [selectedContact, setSelectedContact] = useState<any>(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

    // Date Filter State
    const [showDateFilter, setShowDateFilter] = useState(false);
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const dateFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dateFilterRef.current && !dateFilterRef.current.contains(event.target as Node)) {
                setShowDateFilter(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
    };

    const handleView = async (contact: any) => {
        setSelectedContact(contact);
        if (!contact.isRead) {
            try {
                await updateContact({
                    id: contact._id,
                    isRead: true,
                }).unwrap();
            } catch (err) {
                console.error('Failed to mark as read', err);
            }
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmId) return;
        setActionLoading(true);
        try {
            await deleteContact(deleteConfirmId).unwrap();
            showToast('Message deleted successfully', 'success');
            setDeleteConfirmId(null);
            if (selectedContact?._id === deleteConfirmId) {
                setSelectedContact(null);
            }
        } catch (error) {
            showToast('Failed to delete message', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleToggleStatus = async (contact: any) => {
        setActionLoading(true);
        try {
            await updateContact({
                id: contact._id,
                isRead: !contact.isRead,
            }).unwrap();
            showToast(`Message marked as ${!contact.isRead ? 'read' : 'unread'}`, 'success');
        } catch (error) {
            showToast('Failed to update status', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    // Filter logic
    const filteredContacts = useMemo(() => {
        return contacts.filter((c: any) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                (c.name?.toLowerCase() || '').includes(query) ||
                (c.email?.toLowerCase() || '').includes(query) ||
                (c.subject?.toLowerCase() || '').includes(query);

            const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'read' ? c.isRead : !c.isRead);

            let matchesDate = true;
            if (dateRange.start && dateRange.end) {
                const cDate = new Date(c.createdAt);
                const startDate = new Date(dateRange.start);
                const endDate = new Date(dateRange.end);
                endDate.setHours(23, 59, 59, 999);
                matchesDate = cDate >= startDate && cDate <= endDate;
            }

            return matchesSearch && matchesStatus && matchesDate;
        }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [contacts, searchQuery, statusFilter, dateRange]);

    // Pagination
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage) || 1;
    const paginatedContacts = filteredContacts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleExport = () => {
        if (filteredContacts.length === 0) {
            showToast('No data to export', 'error');
            return;
        }

        const exportData = filteredContacts.map((c: any) => ({
            'Date & Time': format(new Date(c.createdAt), 'dd MMM yyyy, hh:mm a'),
            'Name': c.name,
            'Email': c.email,
            'Phone': c.phone || 'N/A',
            'Subject': c.subject,
            'Message': c.message,
            'Status': c.isRead ? 'Read' : 'Unread'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Contact Messages');

        const fileName = `Contact_Messages_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    if (isLoading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto relative">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>
                    <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
                        <MessageSquare className="w-4 h-4" /> Message Management
                    </div>
                    <h1 className="text-4xl font-black text-secondary tracking-tight">Contact Enquiries</h1>
                </div>

                <div className="flex items-center gap-3 relative">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-border text-secondary font-bold rounded-lg hover:bg-muted/30 transition-all text-sm shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export
                    </button>

                    <div ref={dateFilterRef} className="relative">
                        <button
                            onClick={() => setShowDateFilter(!showDateFilter)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-all text-sm shadow-md"
                        >
                            <CalendarIcon className="w-4 h-4" /> Filter Date
                        </button>

                        {showDateFilter && (
                            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Select Range</span>
                                    <button onClick={() => setShowDateFilter(false)} className="text-muted-foreground hover:text-secondary"><X className="w-4 h-4" /></button>
                                </div>
                                <div className="p-4 space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.start}
                                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={dateRange.end}
                                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                            className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <button
                                        onClick={() => { setDateRange({ start: '', end: '' }); setShowDateFilter(false); }}
                                        className="w-full py-2 bg-muted/30 hover:bg-muted/50 text-secondary rounded-lg text-sm font-bold border border-border transition-all"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative w-full md:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or subject..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full pl-9 pr-4 h-10 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/70"
                        />
                    </div>

                    <div className="w-full md:w-auto">
                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full md:w-48 h-10 px-4 border border-border rounded-lg text-sm font-medium text-secondary focus:outline-none focus:border-primary bg-white cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="unread">New / Unread</option>
                            <option value="read">Read / Handled</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-border bg-muted/20">
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Sender</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedContacts.map((c: any) => (
                                <tr key={c._id} className="hover:bg-muted/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                                                {c.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-secondary text-sm truncate">{c.name}</div>
                                                <div className="text-xs text-muted-foreground mt-0.5 truncate flex items-center gap-1">
                                                    <Mail className="w-3 h-3 shrink-0" /> {c.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[250px]">
                                        <div className="flex items-center gap-2">
                                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                                Enquiry
                                            </span>
                                        </div>
                                        <div className="text-sm font-bold text-secondary mt-1.5 truncate cursor-pointer hover:underline" onClick={() => handleView(c)}>
                                            "{c.subject}"
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                            <Phone className="w-3.5 h-3.5" />
                                            {c.phone || 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.isRead ? 'bg-muted/30 text-secondary/60' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {c.isRead ? 'Read' : 'New'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-secondary font-medium">
                                            {c.createdAt ? format(new Date(c.createdAt), 'MMM d, yyyy') : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleView(c)} className="text-secondary hover:bg-muted p-1.5 rounded transition-colors" title="View">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {/* <a href={`mailto:${c.email}?subject=Re: ${c.subject}`} className="text-primary hover:bg-primary/10 p-1.5 rounded transition-colors" title="Reply">
                                                <Reply className="w-4 h-4" />
                                            </a> */}
                                            <button onClick={() => setDeleteConfirmId(c._id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors" title="Delete">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {paginatedContacts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                                            <MessageSquare className="w-8 h-8" />
                                        </div>
                                        <p className="font-bold text-secondary text-sm">No messages found</p>
                                        <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-sm text-secondary">
                        <span>
                            Showing {filteredContacts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredContacts.length)} of {filteredContacts.length} entries
                        </span>
                        <div className="flex items-center gap-2 border-l border-border pl-3">
                            <span>Show:</span>
                            <div className="relative">
                                <select
                                    value={itemsPerPage}
                                    onChange={(e) => {
                                        setItemsPerPage(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="appearance-none border border-border rounded px-2 py-1 pr-6 focus:outline-none focus:border-primary text-sm bg-white"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                                <ChevronDown className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                className="px-3 py-1.5 text-sm font-medium border border-border rounded-md disabled:opacity-50 hover:bg-muted/30 text-secondary bg-white"
                            >
                                Previous
                            </button>

                            <div className="flex gap-1 hidden sm:flex">
                                {[...Array(totalPages)].map((_, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded-md text-sm font-bold flex items-center justify-center transition-all ${currentPage === i + 1
                                            ? 'bg-secondary text-white border border-secondary'
                                            : 'bg-white border border-border text-secondary hover:bg-muted/30'
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                className="px-3 py-1.5 text-sm font-medium border border-border rounded-md disabled:opacity-50 hover:bg-muted/30 text-secondary bg-white"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {selectedContact && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col my-8 border border-border">
                        <div className="flex justify-between items-center px-8 py-6 border-b shrink-0 bg-muted/10">
                            <div>
                                <h2 className="text-xl font-black text-secondary">Message Details</h2>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Contact Enquiry</p>
                            </div>
                            <button
                                onClick={() => setSelectedContact(null)}
                                className="text-muted-foreground hover:text-secondary text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                                    {selectedContact.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-secondary">{selectedContact.name}</h3>
                                    <div className="mt-1">
                                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedContact.isRead ? 'bg-muted/30 text-secondary/60' : 'bg-primary/10 text-primary'
                                            }`}>
                                            {selectedContact.isRead ? 'Read' : 'New'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/10 p-6 rounded-2xl border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Email Address</p>
                                    <p className="font-bold text-sm text-secondary">{selectedContact.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Phone Number</p>
                                    <p className="font-bold text-sm text-secondary">{selectedContact.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Subject</p>
                                    <p className="font-bold text-sm text-secondary">{selectedContact.subject}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Date Received</p>
                                    <p className="font-bold text-sm text-secondary">
                                        {selectedContact.createdAt ? format(new Date(selectedContact.createdAt), 'dd MMM yyyy, hh:mm a') : 'N/A'}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-muted/10 p-6 rounded-2xl border border-border/50">
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Message</p>
                                <div className="text-sm font-medium text-secondary/80 whitespace-pre-wrap leading-relaxed italic">
                                    "{selectedContact.message}"
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-2">
                                <button
                                    onClick={async () => {
                                        await handleToggleStatus(selectedContact);
                                        setSelectedContact({ ...selectedContact, isRead: !selectedContact.isRead });
                                    }}
                                    disabled={actionLoading}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-secondary text-white font-bold text-sm hover:bg-secondary/90 transition-all flex items-center justify-center gap-2 shadow-sm"
                                >
                                    {actionLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    {selectedContact.isRead ? 'Mark as Unread' : 'Mark as Read'}
                                </button>
                                <button
                                    onClick={() => setSelectedContact(null)}
                                    className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white text-secondary border border-border font-bold text-sm hover:bg-muted/30 transition-all flex items-center justify-center gap-2"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-xl overflow-hidden p-6 text-center border border-border">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                            <AlertCircle className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-secondary mb-2">Delete Message?</h3>
                        <p className="text-sm text-muted-foreground mb-6">
                            Are you sure you want to delete this message? This cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                disabled={actionLoading}
                                className="flex-1 border border-border py-3 rounded-xl font-bold hover:bg-muted/30 transition text-secondary text-sm disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={actionLoading}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition text-sm disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                            >
                                {actionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
