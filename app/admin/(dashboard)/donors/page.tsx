'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { format } from 'date-fns';
import {
    X,
    Eye,
    Trash2,
    Pencil,
    Mail,
    Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function DonorsPage() {

    const { adminToken: token } = useSelector((state: RootState) => state.adminAuth);

    const [donors, setDonors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDonor, setSelectedDonor] = useState<any | null>(null);
    const [search, setSearch] = useState('');

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [donorToEdit, setDonorToEdit] = useState<any>(null);
    const [donorToDelete, setDonorToDelete] = useState<any>(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    const fetchDonors = async () => {
        try {
            setLoading(true);

            const res = await fetch('/api/admin/donations', {

                credentials: 'include',
                headers: { Authorization: `Bearer ${token}` }
            });

            let data;
            if (res.status === 404) {
                const fallbackRes = await fetch('/api/donations', {
                    credentials: 'include',
                    headers: { Authorization: `Bearer ${token}` }
                });
                data = await fallbackRes.json();
            } else {
                data = await res.json();

            }

            console.log('DONATIONS API:', data);

            // ✅ SAFE ARRAY FIX
            const donationsList = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                    ? data.data
                    : [];

            // ✅ GROUP DONORS
            const grouped = donationsList.reduce((acc: any, curr: any) => {

                if (!curr) return acc;

                const key =
                    curr.email ||
                    curr.mobileNumber ||
                    curr.donorName ||
                    Math.random().toString();

                if (!acc[key]) {
                    acc[key] = {
                        name: curr.donorName || 'Unknown',
                        email: curr.email || '',
                        phone: curr.mobileNumber || '',
                        totalAmount: 0,
                        donationsCount: 0,
                        latestType:
                            curr.reason ||
                            curr.purpose ||
                            'General',
                        latestStatus:
                            curr.paymentStatus || 'pending',
                        latestDate:
                            curr.donationDate ||
                            curr.createdAt ||
                            new Date(),
                        history: [],
                    };
                }

                acc[key].totalAmount += Number(curr.amount || 0);

                acc[key].donationsCount += 1;

                acc[key].history.push(curr);

                const currDate = new Date(
                    curr.donationDate || curr.createdAt || new Date()
                );

                const latestDate = new Date(acc[key].latestDate);

                // ✅ UPDATE LATEST DONATION
                if (currDate > latestDate) {
                    acc[key].latestDate = currDate;

                    acc[key].latestType =
                        curr.reason ||
                        curr.purpose ||
                        'General';

                    acc[key].latestStatus =
                        curr.paymentStatus || 'pending';
                }

                return acc;
            }, {});

            // ✅ SORT DONORS
            const groupedArray = Object.values(grouped).sort(
                (a: any, b: any) =>
                    new Date(b.latestDate).getTime() -
                    new Date(a.latestDate).getTime()
            );

            setDonors(groupedArray);

        } catch (err) {
            console.error('Failed to fetch donors:', err);
            setDonors([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        if (token) {
            fetchDonors();
        } else {
            setLoading(false);
        }
    }, [token]);

    // 🔍 SEARCH
    const filteredDonors = donors.filter((d) =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.email?.toLowerCase().includes(search.toLowerCase()) ||
        d.phone?.includes(search)
    );

    // ✏️ EDIT
    const handleEdit = (donor: any) => {
        setDonorToEdit(donor);
        setEditFormData({
            name: donor.name,
            email: donor.email,
            phone: donor.phone
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            const ids = donorToEdit.history.map((h: any) => h._id);
            const res = await fetch('/api/admin/donors', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    ids,
                    data: {
                        donorName: editFormData.name,
                        email: editFormData.email,
                        mobileNumber: editFormData.phone
                    }
                })
            });

            if (res.ok) {
                setIsEditModalOpen(false);
                fetchDonors();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to update donor');
            }
        } catch (err) {
            console.error('Update donor error:', err);
            alert('Something went wrong');
        }
    };

    // 🗑️ DELETE
    const handleDeleteClick = (donor: any) => {
        setDonorToDelete(donor);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const ids = donorToDelete.history.map((h: any) => h._id);
            const res = await fetch('/api/admin/donors', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ ids })
            });

            if (res.ok) {
                setIsDeleteModalOpen(false);
                setDonorToDelete(null);
                fetchDonors();
            } else {
                const err = await res.json();
                alert(err.message || 'Failed to delete donor');
            }
        } catch (err) {
            console.error('Delete donor error:', err);
            alert('Something went wrong');
        }
    };

    return (
        <div className="p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-secondary">
                    Donors Directory
                </h1>

                {/* SEARCH */}
                <div className="relative w-72">
                    <input
                        type="text"
                        placeholder="Search by name, email or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-10 px-4 rounded-xl border border-border bg-muted/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm shadow-sm"
                    />
                </div>
            </div>

            {/* TABLE */}
            <div className="bg-white rounded-2xl shadow border border-border overflow-hidden">

                {loading ? (
                    <div className="p-12 flex justify-center">
                        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    </div>
                ) : filteredDonors.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                        No donors found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">

                            {/* HEADER */}
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="p-4">Donor</th>
                                    <th className="p-4">Contact</th>
                                    <th className="p-4">Total Amount</th>
                                    <th className="p-4">Last Occasion</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4">Last Date</th>
                                    <th className="p-4">Actions</th>
                                </tr>
                            </thead>

                            {/* BODY */}
                            <tbody className="divide-y divide-border/50">

                                {filteredDonors.map((d, i) => (

                                    <tr
                                        key={i}
                                        className="hover:bg-muted/20"
                                    >

                                        {/* DONOR */}
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                {d.name?.[0]?.toUpperCase() || 'U'}
                                            </div>

                                            <span className="font-bold text-secondary">
                                                {d.name}
                                            </span>
                                        </td>

                                        {/* CONTACT */}
                                        <td className="p-4 space-y-1 text-xs">

                                            <div className="flex items-center gap-2 text-secondary">
                                                <Mail className="w-3.5 h-3.5 text-gray-700" />
                                                {d.email || 'No email'}
                                            </div>

                                            <div className="flex items-center gap-2 text-muted-foreground">
                                                <Phone className="w-3.5 h-3.5 text-gray-700" />
                                                {d.phone || 'No phone'}
                                            </div>

                                        </td>

                                        {/* AMOUNT */}
                                        <td className="p-4 font-black text-primary">
                                            ₹{Number(d.totalAmount || 0).toLocaleString('en-IN')}
                                        </td>

                                        {/* OCCASION */}
                                        <td className="p-4">
                                            {d.latestType}
                                        </td>

                                        {/* STATUS */}
                                        <td className="p-4">
                                            <span className="text-green-600 text-xs font-bold">
                                                {d.latestStatus}
                                            </span>
                                        </td>

                                        {/* DATE */}
                                        <td className="p-4">
                                            {d.latestDate
                                                ? format(
                                                    new Date(d.latestDate),
                                                    'dd MMM yyyy'
                                                )
                                                : 'N/A'}
                                        </td>

                                        {/* ACTIONS */}
                                        <td className="p-4 flex gap-3">

                                            {/* VIEW */}
                                            <button
                                                onClick={() => setSelectedDonor(d)}
                                                className="text-black hover:text-gray-700 p-1 rounded-full hover:bg-muted/50"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>

                                            {/* EDIT */}
                                            <button
                                                onClick={() => handleEdit(d)}
                                                className="text-blue-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>

                                            {/* DELETE */}
                                            <button
                                                onClick={() => handleDeleteClick(d)}
                                                className="text-red-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>

                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* MODALS */}
            <AnimatePresence>
                {/* VIEW MODAL */}
                {selectedDonor && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
                                <div>
                                    <h2 className="text-xl font-bold text-secondary">Donor Details</h2>
                                    <p className="text-sm text-muted-foreground">{selectedDonor.name}</p>
                                </div>
                                <button onClick={() => setSelectedDonor(null)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 overflow-y-auto max-h-[70vh]">
                                {/* STATS */}
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Total Donated</p>
                                        <p className="text-xl font-black text-primary">₹{selectedDonor.totalAmount.toLocaleString('en-IN')}</p>
                                    </div>
                                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Times Donated</p>
                                        <p className="text-xl font-black text-blue-600">{selectedDonor.donationsCount}</p>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Avg. Donation</p>
                                        <p className="text-xl font-black text-green-600">₹{(selectedDonor.totalAmount / selectedDonor.donationsCount).toLocaleString('en-IN')}</p>
                                    </div>
                                </div>

                                <h3 className="font-bold mb-3 flex items-center gap-2">
                                    Donation History
                                    <span className="text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{selectedDonor.history.length} records</span>
                                </h3>
                                <div className="border border-border rounded-xl overflow-hidden">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/30 border-b border-border">
                                            <tr>
                                                <th className="p-3">Date</th>
                                                <th className="p-3 text-right">Amount</th>
                                                <th className="p-3">Purpose / Reason</th>
                                                <th className="p-3">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/50">
                                            {selectedDonor.history.map((h: any, idx: number) => (
                                                <tr key={idx} className="hover:bg-muted/10">
                                                    <td className="p-3">{format(new Date(h.donationDate || h.createdAt), 'dd MMM yyyy')}</td>
                                                    <td className="p-3 text-right font-bold text-primary">₹{h.amount.toLocaleString('en-IN')}</td>
                                                    <td className="p-3 max-w-[200px] truncate" title={h.purpose || h.reason}>{h.purpose || h.reason}</td>
                                                    <td className="p-3">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${h.paymentStatus === 'completed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                            {h.paymentStatus}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-border flex justify-end">
                                <button
                                    onClick={() => setSelectedDonor(null)}
                                    className="px-6 py-2 bg-secondary text-white rounded-xl font-bold hover:bg-secondary/90 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* EDIT MODAL */}
                {isEditModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-border flex justify-between items-center bg-gray-50">
                                <h2 className="text-xl font-bold text-secondary">Edit Donor Details</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Donor Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.name}
                                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        value={editFormData.email}
                                        onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-secondary mb-1">Phone Number</label>
                                    <input
                                        type="text"
                                        value={editFormData.phone}
                                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <p className="text-[10px] text-muted-foreground italic">
                                    * Editing these details will update all {donorToEdit?.history?.length} donation records associated with this donor.
                                </p>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-border flex gap-3">
                                <button
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="flex-1 px-4 py-2 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* DELETE MODAL */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl"
                        >
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 className="w-8 h-8" />
                                </div>
                                <h2 className="text-xl font-bold text-secondary mb-2">Delete Donor?</h2>
                                <p className="text-sm text-muted-foreground mb-6">
                                    Are you sure you want to delete <span className="font-bold text-secondary">{donorToDelete?.name}</span>?<br/>
                                    This will also delete <span className="font-bold text-red-600">{donorToDelete?.history?.length} donation records</span>. This action cannot be undone.
                                </p>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setIsDeleteModalOpen(false)}
                                        className="flex-1 px-4 py-2 border border-border rounded-xl font-bold hover:bg-muted transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleConfirmDelete}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                                    >
                                        Yes, Delete All
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}