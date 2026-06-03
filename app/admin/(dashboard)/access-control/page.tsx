'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Shield, UserCheck, UserX, Clock, Search, Filter,
  MoreVertical, Eye, Edit, Trash2, CheckCircle2,
  AlertCircle, X, ShieldCheck, Activity, Users,
  ChevronRight, Lock, Unlock, Database, CreditCard,
  Receipt, BarChart, History, TrendingUp, Calendar,
  Download, FilterX, Check, Ban, UserPlus, Phone, Mail,
  ChevronLeft
} from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface UserPermissions {
  canCollectDonations: boolean;
  canGenerateReceipts: boolean;
  canViewReports: boolean;
  canEditBankDetails: boolean;
  canDeleteDonations: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user' | 'chairman' | 'collector' | 'president' | 'agent';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  permissions: UserPermissions;
  totalCollected?: number;
  receiptCount?: number;
  monthlyCollection?: number;
  activeDonors?: number;
  createdAt: string;
}

interface ActivityLog {
  _id: string;
  user: {
    _id: string;
    name: string;
    role: string;
  };
  action: string;
  details: string;
  amount?: number;
  createdAt: string;
}

// --- Components ---
const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl z-[100] text-sm font-bold text-white ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`}
    >
      {type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity"><X className="w-4 h-4" /></button>
    </motion.div>
  );
};

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => {
  const colors: Record<string, string> = {
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    yellow: 'bg-amber-50 text-amber-600 border-amber-100',
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
};

export default function AccessControlPage() {
  const { adminToken: token, admin } = useSelector((state: RootState) => state.adminAuth);
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Modal States
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, logsRes] = await Promise.all([
        fetch('/api/admin/users?role=staff', { credentials: 'include', headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/activity-logs', { credentials: 'include', headers: { Authorization: `Bearer ${token}` } })
      ]);

      const usersData = await usersRes.json();
      const logsData = await logsRes.json();

      if (usersRes.ok) {
        // Filter out normal 'user' role
        const filtered = usersData.filter((u: User) => u.role !== 'user');
        setUsers(filtered);
      }
      if (logsRes.ok) setLogs(logsData);
    } catch (error) {
      showToast('Failed to fetch data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        showToast('Update successful', 'success');

        // Update both the list and the selected user to reflect changes in UI
        setUsers(prev => prev.map(u => u._id === userId ? updatedUser : u));
        if (selectedUser?._id === userId) {
          setSelectedUser(updatedUser);
        }

        // Close modal after successful save
        setIsEditModalOpen(false);
        setEditForm(null);
      } else {
        const errorData = await res.json();
        showToast(errorData.message || 'Update failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure? This action is permanent.')) return;
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showToast('User removed', 'success');
        fetchData();
      } else {
        showToast('Delete failed', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const getFilteredUsers = () => {
    return users.filter(u => {
      const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phone?.includes(searchQuery);

      let matchesTab = true;
      if (activeTab === 'collectors') matchesTab = u.role === 'collector';
      // else if (activeTab === 'agents') matchesTab = u.role === 'agent';
      else if (activeTab === 'admins') matchesTab = u.role === 'admin' || u.role === 'president';
      else if (activeTab === 'pending') matchesTab = u.approvalStatus === 'pending';
      else if (activeTab === 'rejected') matchesTab = u.approvalStatus === 'rejected';

      return matchesSearch && matchesTab;
    });
  };

  const filteredUsers = getFilteredUsers();
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    totalAgents: users.filter(u => u.role === 'agent').length,
    activeCollectors: users.filter(u => u.role === 'collector' && u.approvalStatus === 'approved').length,
    pendingApprovals: users.filter(u => u.approvalStatus === 'pending').length,
    rejectedUsers: users.filter(u => u.approvalStatus === 'rejected').length,
    totalCollected: users.reduce((acc, u) => acc + (u.totalCollected || 0), 0)
  };

  const getPermissionSummary = (perms: UserPermissions | undefined) => {
    if (!perms) return 'No Access';
    const active = Object.values(perms).filter(Boolean).length;
    if (active === 0) return 'No Access';
    if (active === 5) return 'Full Access';
    if (perms.canCollectDonations && perms.canViewReports) return 'Donation + Reports';
    if (active > 2) return 'Standard Access';
    return 'Limited Access';
  };

  const getRoleColor = (role: string) => {
    if (role === 'president') return 'purple';
    if (role === 'admin') return 'red';
    if (role === 'collector') return 'orange';
    if (role === 'agent') return 'blue';
    return 'blue';
  };

  const getStatusColor = (status: string) => {
    if (status === 'approved') return 'green';
    if (status === 'pending') return 'yellow';
    if (status === 'rejected') return 'red';
    return 'yellow';
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-[10px] mb-2">
            <Shield className="w-3 h-3" /> Personnel Management System
          </div>
          <h1 className="text-3xl font-black text-secondary tracking-tight">Access Control & Security</h1>
          <p className="text-muted-foreground text-sm mt-1">Configure roles, monitor collectors, and manage administrative privileges.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white border border-border px-5 py-2.5 rounded-2xl text-xs font-black text-secondary hover:bg-muted/50 transition-all flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Export Ledger
          </button>
        </div>
      </div>

      {/* Summary Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Total Collection</p>
            <p className="text-2xl font-black text-secondary">₹{stats.totalCollected.toLocaleString()}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Active Collectors</p>
            <p className="text-2xl font-black text-secondary">{stats.activeCollectors}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Pending Approvals</p>
            <p className="text-2xl font-black text-secondary">{stats.pendingApprovals}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border border-border shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
            <Ban className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1">Rejected Users</p>
            <p className="text-2xl font-black text-secondary">{stats.rejectedUsers}</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3 space-y-6">
          {/* Controls & Tabs */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {['all', 'collectors', 'admins', 'pending', 'rejected'].map(tab => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                  className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-secondary text-white shadow-lg' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="bg-white p-3 rounded-[2rem] border border-border shadow-sm flex flex-col md:flex-row gap-3 items-center">
              <div className="relative flex-grow w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by name, mobile, email..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-11 pr-4 h-12 bg-muted/20 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                />
              </div>
              {/* <button className="h-12 px-6 bg-muted/20 hover:bg-muted text-secondary rounded-2xl flex items-center gap-2 text-xs font-bold transition-all">
                <Filter className="w-4 h-4" /> Advanced Filter
              </button> */}
            </div>
          </div>

          {/* ERP Table */}
          <div className="bg-white rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/30 border-b border-border">
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Personnel</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role & Security</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Collections</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">Joined Date</th>
                    <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center">Control Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <FilterX className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                        <p className="text-sm font-bold text-muted-foreground">No personnel records matching your search.</p>
                      </td>
                    </tr>
                  ) : (
                    paginatedUsers.map((u) => (
                      <tr key={u._id} className="hover:bg-muted/10 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary shrink-0 shadow-inner">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-secondary group-hover:text-primary transition-colors">{u.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Phone className="w-2.5 h-2.5 text-muted-foreground" />
                                <p className="text-[10px] text-muted-foreground font-bold tracking-tight">{u.phone || 'No Phone'}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex flex-col gap-2">
                            <Badge color={getRoleColor(u.role)}>{u.role}</Badge>
                            <Badge color={getStatusColor(u.approvalStatus)}>{u.approvalStatus}</Badge>
                            <span className="text-[9px] font-bold text-muted-foreground ml-1">
                              {getPermissionSummary(u.permissions)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-1">
                            <p className="text-xs font-black text-secondary">₹{(u.totalCollected || 0).toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{(u.receiptCount || 0)} Receipts</p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">
                            {format(new Date(u.createdAt), 'dd MMM yyyy')}
                          </p>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center justify-center gap-2">
                            {u.approvalStatus === 'pending' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateUser(u._id, {
                                    approvalStatus: 'approved',
                                    isActive: true,
                                    approvedBy: admin?.id,
                                    approvedAt: new Date()
                                  })}
                                  className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <Check className="w-3.5 h-3.5" /> Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateUser(u._id, { approvalStatus: 'rejected' })}
                                  className="px-3 py-2 bg-rose-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-1.5 shadow-sm"
                                >
                                  <Ban className="w-3.5 h-3.5" /> Reject
                                </button>
                              </>
                            ) : (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => { setSelectedUser(u); setIsViewModalOpen(true); }}
                                  className="p-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {/* <button
                                  onClick={() => { setSelectedUser(u); setEditForm({ ...u }); setIsEditModalOpen(true); }}
                                  className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                                >
                                  <Edit className="w-4 h-4" />
                                </button> */}
                                <button
                                  onClick={() => handleDeleteUser(u._id)}
                                  className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-5 bg-muted/20 border-t border-border flex items-center justify-between">
                <p className="text-xs font-bold text-muted-foreground">Showing {paginatedUsers.length} of {filteredUsers.length} Pages</p>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 rounded-xl bg-white border border-border hover:bg-muted disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex gap-1">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`w-8 h-8 rounded-xl text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-primary text-white shadow-lg' : 'bg-white border border-border text-muted-foreground hover:bg-muted'
                          }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 rounded-xl bg-white border border-border hover:bg-muted disabled:opacity-50 transition-all shadow-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Sections */}
        <div className="space-y-8">
          {/* Activity Logs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-secondary flex items-center gap-2 tracking-tight">
                <History className="w-5 h-5 text-primary" /> Security Logs
              </h2>
              <button onClick={fetchData} className="p-2 rounded-xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all">
                <Activity className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-border shadow-sm p-6 space-y-6">
              {logs.slice(0, 8).map((log, i) => (
                <div key={log._id} className="flex gap-4 relative">
                  {i < logs.length - 1 && <div className="absolute left-6 top-10 bottom-0 w-px bg-border"></div>}
                  <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border flex items-center justify-center shrink-0 font-black text-xs text-secondary shadow-inner">
                    {log.user?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-secondary uppercase tracking-wider leading-none mb-1">
                      {log.user?.name || 'System Audit'}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{log.action}</p>
                    {log.amount && <p className="text-xs font-black text-primary mt-0.5">₹{log.amount.toLocaleString()}</p>}
                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest mt-1">
                      {format(new Date(log.createdAt), 'dd MMM • HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats Card */}
          {/* <div className="bg-secondary rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="relative z-10 space-y-6">
              <div>
                <h3 className="text-lg font-black uppercase tracking-widest text-primary mb-1">Audit Overview</h3>
                <p className="text-xs text-white/60 font-medium">Monthly collection performance</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/80">Growth Rate</p>
                  <p className="text-sm font-black text-primary">+12.5%</p>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full w-[70%] bg-primary rounded-full"></div>
                </div>
              </div>
              <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Download Full Report
              </button>
            </div>
          </div> */}
        </div>
      </div>

      {/* View Detail Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsViewModalOpen(false)} className="absolute inset-0 bg-secondary/90 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative w-full max-w-4xl bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-border">
              <div className="flex flex-col lg:flex-row h-full">
                {/* Left Profile Panel */}
                <div className="lg:w-[40%] bg-muted/30 p-10 border-r border-border space-y-8">
                  <div className="text-center space-y-4">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-white border border-border shadow-xl mx-auto flex items-center justify-center font-black text-5xl text-primary relative">
                      {selectedUser.name[0]}
                      <div className="absolute -bottom-2 -right-2 p-3 bg-emerald-600 rounded-2xl text-white border-4 border-white shadow-lg">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-secondary tracking-tight">{selectedUser.name}</h3>
                      <Badge color={getRoleColor(selectedUser.role)}>{selectedUser.role}</Badge>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-primary transition-all group-hover:scale-110">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Mobile Number</p>
                        <p className="text-xs font-black text-secondary">{selectedUser.phone || 'Not Verified'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-primary transition-all group-hover:scale-110">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Access</p>
                        <p className="text-xs font-black text-secondary">{selectedUser.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="p-3 bg-white rounded-xl shadow-sm text-primary transition-all group-hover:scale-110">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration Date</p>
                        <p className="text-xs font-black text-secondary">{format(new Date(selectedUser.createdAt), 'dd MMMM yyyy')}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    {/* <button
                      onClick={() => { setIsViewModalOpen(false); setEditForm({ ...selectedUser }); setIsEditModalOpen(true); }}
                      className="w-full py-4 bg-secondary hover:bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                    >
                      <Shield className="w-4 h-4" /> Edit Permissions
                    </button> */}
                  </div>
                </div>

                {/* Right Analytics Panel */}
                <div className="lg:w-[60%] p-10 space-y-10">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xl font-black text-secondary uppercase tracking-tight flex items-center gap-3">
                      <BarChart className="w-6 h-6 text-primary" /> Performance Matrix
                    </h4>
                    <button onClick={() => setIsViewModalOpen(false)} className="p-3 rounded-2xl bg-muted/50 hover:bg-muted text-muted-foreground transition-all">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="p-6 bg-orange-50 rounded-[2rem] border border-orange-100">
                      <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Total Collected</p>
                      <p className="text-3xl font-black text-secondary tracking-tighter">₹{(selectedUser.totalCollected || 0).toLocaleString()}</p>
                    </div>
                    <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                      <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Active Donors</p>
                      <p className="text-3xl font-black text-secondary tracking-tighter">{(selectedUser.activeDonors || 0)}</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground ml-1">Recent Activity Logs</h5>
                    <div className="space-y-4">
                      {logs.filter(l => l.user?._id === selectedUser._id).length === 0 ? (
                        <div className="p-10 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
                          <History className="w-10 h-10 text-muted-foreground/20 mx-auto mb-2" />
                          <p className="text-xs font-bold text-muted-foreground">No recent security logs found for this user.</p>
                        </div>
                      ) : (
                        logs.filter(l => l.user?._id === selectedUser._id).slice(0, 4).map(log => (
                          <div key={log._id} className="p-4 bg-white rounded-2xl border border-border shadow-sm flex items-center justify-between group hover:border-primary transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                              <p className="text-xs font-bold text-secondary group-hover:text-primary transition-colors">{log.action}</p>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground/60">{format(new Date(log.createdAt), 'HH:mm • dd MMM')}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Permissions Modal */}
      {/* <AnimatePresence>
        {isEditModalOpen && editForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-secondary/80 backdrop-blur-md" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="relative w-full max-w-xl bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-border">
              <div className="p-8 md:p-10 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-xl text-primary border border-primary/20">
                      {editForm.name[0]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-secondary tracking-tight">Security Portal</h3>
                      <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{editForm.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-2.5 rounded-xl hover:bg-muted/50 text-muted-foreground transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Account Role</label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        className="w-full h-12 px-4 bg-muted/30 border border-border rounded-2xl text-xs font-black text-secondary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer outline-none"
                      >
                        <option value="president">President</option>
                        <option value="admin">Admin</option>
                        <option value="collector">Collector</option>
                        <option value="agent">Agent</option>
                        <option value="staff">Temple Staff</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Access Status</label>
                      <select
                        value={editForm.approvalStatus}
                        onChange={(e) => {
                          const newStatus = e.target.value as 'approved' | 'pending' | 'rejected';
                          setEditForm({
                            ...editForm,
                            approvalStatus: newStatus,
                            isActive: newStatus === 'approved' ? true : (newStatus === 'rejected' ? false : editForm.isActive)
                          });
                        }}
                        className="w-full h-12 px-4 bg-muted/30 border border-border rounded-2xl text-xs font-black text-secondary focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all cursor-pointer outline-none"
                      >
                        <option value="approved">Approved</option>
                        <option value="pending">Pending Approval</option>
                        <option value="rejected">Rejected / Blocked</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Identity & Feature Permissions</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { key: 'canCollectDonations', label: 'Collect Donations', icon: CreditCard },
                        { key: 'canGenerateReceipts', label: 'Generate Receipts', icon: Receipt },
                        { key: 'canViewReports', label: 'View Reports', icon: BarChart },
                        { key: 'canEditBankDetails', label: 'Edit Bank Details', icon: Database },
                        { key: 'canDeleteDonations', label: 'Delete Donations', icon: Trash2 },
                      ].map((perm) => (
                        <div key={perm.key} className="flex items-center justify-between p-4 bg-muted/10 rounded-2xl border border-transparent hover:border-border transition-all group">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-white shadow-sm text-secondary group-hover:text-primary transition-colors"><perm.icon className="w-4 h-4" /></div>
                            <span className="text-xs font-bold text-secondary">{perm.label}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const currentPerms = editForm.permissions || {
                                canCollectDonations: false,
                                canGenerateReceipts: false,
                                canViewReports: false,
                                canEditBankDetails: false,
                                canDeleteDonations: false,
                              };
                              setEditForm({
                                ...editForm,
                                permissions: {
                                  ...currentPerms,
                                  [perm.key]: !(currentPerms as any)[perm.key]
                                }
                              });
                            }}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 ${(editForm.permissions as any)?.[perm.key] ? 'bg-primary' : 'bg-gray-200'}`}
                          >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${(editForm.permissions as any)?.[perm.key] ? 'translate-x-6' : 'translate-x-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 py-4 rounded-2xl bg-muted border border-border text-secondary text-xs font-black uppercase tracking-widest hover:bg-muted/80 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateUser(editForm._id, editForm)}
                    disabled={actionLoading}
                    className="flex-[2] py-4 rounded-2xl bg-secondary text-white text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-secondary/20 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Save Portal Changes
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence> */}
    </div>
  );
}
