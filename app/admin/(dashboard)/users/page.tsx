'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Users, Search, Filter, Phone,
  Mail, Calendar, MapPin, UserCheck, Trash2, Edit, Eye, X, CheckCircle2, AlertCircle, ShieldCheck, UserX, Clock,
  Cake, Home, UserPlus, Hash
} from 'lucide-react';
import { format } from 'date-fns';

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

export default function AdminUsersPage() {
  const formatDateSafe = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return format(new Date(dateStr + 'T00:00:00'), 'dd MMM yyyy');
    } catch (e) {
      return dateStr;
    }
  };

  const { adminToken: token } = useSelector((state: RootState) => state.adminAuth);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for search, filter and pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users', {
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        let usersArray: any[] = [];

        if (Array.isArray(data)) {
          usersArray = data;
        } else if (Array.isArray(data?.users)) {
          usersArray = data.users;
        } else if (Array.isArray(data?.data)) {
          usersArray = data.data;
        }

        setUsers(usersArray || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUsers();
    }
  }, [token]);

  // Handlers
  const handleToggleStatus = async (user: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isActive: !user.isActive }),
      });

      if (res.ok) {
        setUsers(users.map(u => u._id === user._id ? { ...u, isActive: !user.isActive } : u));
        showToast(`User ${!user.isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        showToast('Failed to update status', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUsers(users.filter(u => u._id !== deleteConfirmId));
        showToast('User deleted successfully', 'success');
        setDeleteConfirmId(null);
      } else {
        showToast('Failed to delete user', 'error');
      }
    } catch (error) {
      showToast('An error occurred', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter logic
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (u.name?.toLowerCase() || '').includes(query) ||
      (u.email?.toLowerCase() || '').includes(query) ||
      (u.phone?.toLowerCase() || '').includes(query);

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? u.isActive !== false : u.isActive === false);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <div className="h-10 w-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 lg:p-12 max-w-[1600px] mx-auto relative">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-[0.2em] text-[10px] mb-2">
            <UserCheck className="w-4 h-4" /> User Management
          </div>
          <h1 className="text-4xl font-black text-secondary tracking-tight">Registered Devotees</h1>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-4 mb-8 bg-white p-2 rounded-2xl border border-border shadow-sm items-center">
        <div className="relative flex-grow w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 h-11 bg-transparent border-transparent text-sm focus:outline-none transition-all placeholder:text-muted-foreground/70"
          />
        </div>

        <div className="hidden lg:block w-px h-8 bg-border"></div>

        <div className="flex flex-row w-full lg:w-auto items-center divide-x divide-border border-t lg:border-t-0 border-border lg:mt-0 mt-2">
          <div className="relative flex-1 lg:flex-none">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-4 pr-10 appearance-none bg-transparent border-transparent font-bold text-xs text-secondary focus:outline-none cursor-pointer hover:bg-muted/30 transition-all rounded-bl-xl lg:rounded-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="collector">Collector</option>
              <option value="staff">Staff</option>
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>

          <div className="relative flex-1 lg:flex-none">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full h-11 pl-4 pr-10 appearance-none bg-transparent border-transparent font-bold text-xs text-secondary focus:outline-none cursor-pointer hover:bg-muted/30 transition-all rounded-br-xl lg:rounded-r-xl"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <UserX className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="spiritual-card overflow-hidden bg-white border-border shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">User Info</th>
                <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Role & Permissions</th>
                <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Joined Date</th>
                <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Account Status</th>
                <th className="px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {paginatedUsers.map((u: any) => (
                <tr key={u._id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-secondary text-sm">{u.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {u.email}
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 items-center">
                          {u.phone && (
                            <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider italic">{u.phone}</div>
                          )}
                          {u.cityOrVillage && (
                            <div className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5 text-primary/70" /> {u.cityOrVillage}{u.pincode ? `, ${u.pincode}` : ''}
                            </div>
                          )}
                          {u.familyMembers && u.familyMembers.length > 0 && (
                            <div className="text-[10px] text-primary/80 font-bold flex items-center gap-1">
                              <Users className="w-2.5 h-2.5" /> {u.familyMembers.length} {u.familyMembers.length === 1 ? 'member' : 'members'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' ? 'bg-red-50 text-red-700 border border-red-100' :
                      u.role === 'collector' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                      u.role === 'staff' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                      'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {u.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                      {u.role}
                    </span>
                    {u.approvalStatus && u.approvalStatus !== 'approved' && (
                      <div className="text-[9px] text-amber-600 font-black uppercase mt-1 tracking-widest">{u.approvalStatus}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      disabled={actionLoading}
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${
                        u.isActive !== false
                        ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                        : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      }`}
                    >
                      {u.isActive !== false ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button onClick={() => setSelectedUser(u)} className="p-1.5 text-secondary hover:bg-muted rounded-lg transition-colors" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteConfirmId(u._id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 text-muted-foreground/50">
                      <Users className="w-8 h-8" />
                    </div>
                    <p className="font-bold text-secondary text-sm">No devotees found</p>
                    <p className="text-xs text-muted-foreground mt-1">Try adjusting your filters or search query</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between bg-muted/10">
            <p className="text-xs text-muted-foreground font-medium">
              Showing <span className="font-bold text-secondary">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-secondary">{Math.min(currentPage * itemsPerPage, filteredUsers.length)}</span> of <span className="font-bold text-secondary">{filteredUsers.length}</span> results
            </p>
            <div className="flex gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-3 py-1.5 text-xs font-bold bg-white border border-border rounded-lg disabled:opacity-50 hover:bg-muted transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ✅ PROFILE MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden flex flex-col my-8">
            <div className="flex justify-between items-center px-8 py-6 border-b shrink-0 bg-muted/10">
              <div>
                <h2 className="text-xl font-black text-secondary">User Profile</h2>
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Devotee Information</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-muted-foreground hover:text-secondary text-xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-secondary">{selectedUser.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-1 items-center">
                    <span className="inline-block px-2 py-0.5 bg-muted rounded-md text-[10px] font-black uppercase text-muted-foreground border border-border">{selectedUser.role}</span>
                    {selectedUser.referralCode && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 rounded-md text-[10px] font-black uppercase text-primary border border-primary/20">
                        <Hash className="w-3 h-3" /> Code: {selectedUser.referralCode}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Email</p>
                  <p className="text-sm font-bold text-secondary truncate">{selectedUser.email}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Phone</p>
                  <p className="text-sm font-bold text-secondary">{selectedUser.phone || 'N/A'}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Date of Birth</p>
                  <p className="text-sm font-bold text-secondary">{formatDateSafe(selectedUser.dob)}</p>
                </div>
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Member Since</p>
                  <p className="text-sm font-bold text-secondary">{selectedUser.createdAt ? format(new Date(selectedUser.createdAt), 'dd MMM yyyy') : 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">City / Village & Pincode</p>
                  <p className="text-sm font-bold text-secondary">
                    {selectedUser.cityOrVillage || 'N/A'} {selectedUser.pincode ? `(${selectedUser.pincode})` : ''}
                  </p>
                </div>
                <div className="bg-muted/20 p-4 rounded-2xl border border-border/50">
                  <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Total Donations</p>
                  <p className="text-sm font-bold text-primary">₹{(selectedUser.totalDonations || 0).toLocaleString('en-IN')}</p>
                </div>
              </div>

              <div className="bg-muted/10 p-4 rounded-2xl border border-border/50 space-y-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-1">
                  <UserPlus className="w-3.5 h-3.5 text-primary" /> Referral Network
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Devotee Referral Code</p>
                    <p className="text-xs font-bold text-secondary">{selectedUser.referralCode || 'None Generated'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-muted-foreground">Referred By</p>
                    {selectedUser.referredBy && typeof selectedUser.referredBy === 'object' ? (
                      <div>
                        <p className="text-xs font-bold text-secondary">{selectedUser.referredBy.name || 'Unknown User'}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {selectedUser.referredBy.phone || selectedUser.referredBy.email || ''}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs font-medium text-muted-foreground">Direct Registration</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <h4 className="text-sm font-black text-secondary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" /> Family Members
                  {selectedUser.familyMembers && selectedUser.familyMembers.length > 0 && (
                    <span className="px-2 py-0.5 bg-primary/10 rounded-full text-[10px] font-black text-primary border border-primary/20">
                      {selectedUser.familyMembers.length}
                    </span>
                  )}
                </h4>
                {selectedUser.familyMembers && selectedUser.familyMembers.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedUser.familyMembers.map((member: any, index: number) => (
                      <div key={index} className="bg-muted/15 p-3.5 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-bold text-secondary text-xs">{member.name}</h5>
                          {member.dob && (
                            <span className="inline-flex items-center gap-1 text-[9px] text-muted-foreground bg-white border border-border px-1.5 py-0.5 rounded-md font-bold uppercase">
                              <Cake className="w-2.5 h-2.5 text-primary/70" /> 
                              {formatDateSafe(member.dob)}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {member.mobile && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium">
                              <Phone className="w-3 h-3 text-primary/60" /> {member.mobile}
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-medium truncate">
                              <Mail className="w-3 h-3 text-primary/60" /> {member.email}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-muted/5 border border-dashed border-border rounded-xl">
                    <p className="text-xs text-muted-foreground font-medium">No family members registered</p>
                  </div>
                )}
              </div>

              <div className="pt-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="w-full h-14 rounded-2xl bg-secondary text-white font-black text-sm uppercase tracking-widest hover:bg-secondary/90 transition-all"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-secondary mb-2">Remove Devotee?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete this user? This will permanently remove their access and donation history from the system.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                disabled={actionLoading}
                className="flex-1 border border-gray-300 py-3 rounded-xl font-bold hover:bg-gray-50 transition text-secondary text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-red-600/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {actionLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}