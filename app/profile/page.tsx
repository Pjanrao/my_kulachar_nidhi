'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '@/redux/store';
import { updateUser } from '@/redux/slices/authSlice';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { User, Mail, Phone, Shield, IndianRupee, Heart, MapPin, Calendar, Edit3, X, Check, Loader2, Lock, Cake, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ProfilePage() {
  const { user, isAuthenticated, token } = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: '', phone: '', email: '', dob: '', cityOrVillage: '', pincode: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router, mounted]);

  useEffect(() => {
    if (user) {
      setEditData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
        dob: user.dob || '',
        cityOrVillage: user.cityOrVillage || '',
        pincode: user.pincode || ''
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setError('');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.put('/api/user/profile', {
        name: editData.name,
        phone: editData.phone,
        email: editData.email,
        dob: editData.dob,
        cityOrVillage: editData.cityOrVillage,
        pincode: editData.pincode
      }, config);

      if (response.data.success) {
        dispatch(updateUser({
          name: editData.name,
          phone: editData.phone,
          email: editData.email,
          dob: editData.dob,
          cityOrVillage: editData.cityOrVillage,
          pincode: editData.pincode
        }));
        setIsEditing(false);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !user) return null;

  const formattedJoinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const formattedDOB = user.dob
    ? new Date(user.dob + 'T00:00:00').toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'Not Provided';

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDF9]">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center p-0.5 shadow-2xl">
            <div className="w-full h-full rounded-[20px] bg-white flex items-center justify-center relative overflow-hidden group">
              <User className="w-12 h-12 text-primary" />
              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <Edit3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
          <div className="text-center md:text-left flex-1 min-w-0">
            <h1 className="text-4xl font-black text-secondary truncate">{user.name}</h1>
            <p className="text-accent font-bold uppercase tracking-[0.2em] text-[10px] mt-1">Devotee of Kuldaivat Trust</p>
          </div>
          <div className="md:ml-auto flex gap-3 shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="spiritual-button-outline !px-6 text-xs uppercase tracking-widest font-black"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Account Overview */}
          <div className="md:col-span-2 space-y-6">
            <div className="spiritual-card p-8">
              <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
                <h2 className="text-xl font-black text-secondary">Personal Information</h2>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Email Identity</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Contact Number</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <span className="truncate">{user.phone || 'Not Provided'}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Date of Birth</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Cake className="w-4 h-4 text-primary" />
                      </div>
                      {formattedDOB}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Role Access</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Shield className="w-4 h-4 text-primary" />
                      </div>
                      <span className="capitalize">{user.role}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">City / Village</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Home className="w-4 h-4 text-primary" />
                      </div>
                      {user.cityOrVillage || 'Not Provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Pincode</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-primary" />
                      </div>
                      {user.pincode || 'Not Provided'}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-2">Joined Date</label>
                    <div className="flex items-center gap-3 text-secondary font-bold text-sm">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-primary" />
                      </div>
                      {formattedJoinedDate}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="spiritual-card p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Donation Summary</h3>
                <Heart className="w-4 h-4 text-primary" />
              </div>
              <div className="text-3xl font-black text-secondary flex items-baseline gap-1">
                <IndianRupee className="w-5 h-5 text-accent" />
                {user.totalDonations?.toLocaleString() || '0'}
              </div>
              <p className="text-[10px] text-muted-foreground font-bold mt-2">Lifetime Charity Contribution</p>

              <button
                onClick={() => router.push('/donations')}
                className="w-full mt-6 spiritual-button text-xs py-3"
              >
                View History
              </button>
            </div>

            <div className="spiritual-card p-6">
              <h3 className="text-xs font-black text-secondary uppercase tracking-[0.2em] mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Security Settings
                  </button>
                </li>
                <li>
                  <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Notification Preferences
                  </button>
                </li>
                <li>
                  <button className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" /> Legal & Terms
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        <AnimatePresence>
          {isEditing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsEditing(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-border z-10"
              >
                <div className="bg-secondary px-8 py-5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-secondary to-secondary/80 z-0" />
                  <div className="relative z-10 flex items-center justify-between">
                    <h2 className="text-lg font-black text-white uppercase tracking-widest flex items-center gap-3">
                      <Edit3 className="w-5 h-5 text-primary" /> Edit Profile
                    </h2>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-muted/20 to-white">
                  {error && (
                    <div className="bg-red-50 text-red-500 text-xs font-bold p-3 rounded-xl border border-red-100 flex items-center gap-2">
                      <X className="w-4 h-4 shrink-0" /> {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value.replace(/\D/g, '') })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm"
                          placeholder="Enter your phone number"
                        />
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Date of Birth</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Cake className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="date"
                          value={editData.dob}
                          onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm cursor-pointer"
                        />
                      </div>
                    </div>

                    {/* City / Village */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">City / Village</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Home className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          value={editData.cityOrVillage}
                          onChange={(e) => setEditData({ ...editData, cityOrVillage: e.target.value })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm"
                          placeholder="Enter City or Village"
                        />
                      </div>
                    </div>

                    {/* Pincode */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Pincode</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <input
                          type="text"
                          maxLength={6}
                          value={editData.pincode}
                          onChange={(e) => setEditData({ ...editData, pincode: e.target.value.replace(/\D/g, '') })}
                          className="w-full bg-white border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-bold text-secondary text-sm shadow-sm"
                          placeholder="Enter 6-digit Pincode"
                        />
                      </div>
                    </div>

                    {/* Role Access (Read-Only) */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        Role Access <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="w-4 h-4 text-muted-foreground/60" />
                        </div>
                        <input
                          type="text"
                          value={user.role}
                          disabled
                          readOnly
                          className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none font-bold text-muted-foreground text-sm cursor-not-allowed select-none capitalize"
                        />
                      </div>
                    </div>

                    {/* Joined Date (Read-Only) */}
                    <div>
                      <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1">
                        Joined Date <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="w-4 h-4 text-muted-foreground/60" />
                        </div>
                        <input
                          type="text"
                          value={formattedJoinedDate}
                          disabled
                          readOnly
                          className="w-full bg-muted/40 border border-border rounded-xl pl-10 pr-3 py-2.5 outline-none font-bold text-muted-foreground text-sm cursor-not-allowed select-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-5 flex gap-4 border-t border-border mt-6">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 px-5 py-3 bg-muted text-secondary font-black text-xs uppercase tracking-widest rounded-xl hover:bg-muted/80 transition-all shadow-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 spiritual-button !px-5 !py-3 text-xs uppercase tracking-widest font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/20"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      Save Profile
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}
