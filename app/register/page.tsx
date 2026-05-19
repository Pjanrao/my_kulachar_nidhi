'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, Eye, EyeOff, Cake, Home, MapPin } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') || '';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    dob: '',
    cityOrVillage: '',
    pincode: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, referralCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9] px-4 py-12">
      <div className="max-w-3xl w-full spiritual-card p-8 sm:p-10 space-y-8 bg-white border border-[#E8E2D9] shadow-2xl rounded-[2rem]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-[#E65100]/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-8 w-8 text-[#E65100]" />
          </div>
          <h2 className="text-3xl font-black text-[#4E342E]">Join Devotees</h2>
          <p className="mt-2 text-sm text-[#8B7361] uppercase tracking-widest font-bold">Create your account</p>
        </div>

        {referralCode && !success && (
          <div className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-orange-500" />
            <p className="text-xs text-orange-700 font-medium">Referral code <span className="font-bold">{referralCode}</span> applied</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3 rounded-r-xl">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 flex items-start gap-3 rounded-r-xl">
            <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-sm text-green-700">
              <p className="font-bold">Success!</p>
              <p>Your account has been created. Redirecting to login...</p>
            </div>
          </div>
        )}

        {!success && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="name"
                    type="text"
                    required
                    className="spiritual-input !pl-12"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="email"
                    type="email"
                    required
                    className="spiritual-input !pl-12"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="phone"
                    type="tel"
                    required
                    className="spiritual-input !pl-12"
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Date of Birth</label>
                <div className="relative">
                  <Cake className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="dob"
                    type="date"
                    required
                    className="spiritual-input !pl-12 cursor-pointer text-secondary"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">City / Village</label>
                <div className="relative">
                  <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="cityOrVillage"
                    type="text"
                    required
                    className="spiritual-input !pl-12"
                    placeholder="Enter your City or Village"
                    value={formData.cityOrVillage}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Pincode</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="pincode"
                    type="text"
                    maxLength={6}
                    required
                    className="spiritual-input !pl-12"
                    placeholder="Enter 6-digit Pincode"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-black text-[#4E342E] uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="spiritual-input !pl-12 !pr-12"
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8B7361]/50 hover:text-[#E65100] transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="spiritual-button w-full h-12 text-base font-black uppercase tracking-widest"
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>
        )}

        <div className="text-center text-sm">
          <p className="text-[#8B7361]">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-[#E65100] hover:underline underline-offset-4">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="h-10 w-10 border-4 border-[#E65100]/30 border-t-[#E65100] rounded-full animate-spin"></div>
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
