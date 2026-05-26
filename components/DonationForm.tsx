'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IndianRupee, User, Phone, MapPin, CheckCircle2, QrCode, Download, Printer, Heart, Mail, CreditCard, Info, Trash2, ArrowLeft, ShieldCheck, Sparkles, ChevronDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import Receipt from './Receipt';
import { downloadPDF } from '@/lib/pdf';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface Country {
  name: string;
  code: string;
  flag: string;
}

export default function DonationForm() {
  const { t, lang: language, setLang: setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'form' | 'scanner' | 'processing' | 'success'>('form');
  const [lastDonation, setLastDonation] = useState<any>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [fetchingCountries, setFetchingCountries] = useState(true);
  const { user, token } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    donorType: 'individual',
    purpose: '',
    donorName: '',
    panNumber: '',
    occasion: '',
    amount: '',
    email: '',
    countryCode: '+91',
    mobileNumber: '',
    address: '',
    occasionDate: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        donorName: user.name || prev.donorName,
        email: user.email || prev.email,
        mobileNumber: user.phone?.slice(-10) || prev.mobileNumber,
      }));
    }
  }, [user]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await axios.get('https://restcountries.com/v3.1/all?fields=name,idd,flags');
        const formatted = response.data
          .filter((c: any) => c.idd?.root)
          .map((c: any) => ({
            name: c.name.common,
            code: c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : ''),
            flag: c.flags.png
          }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setCountries(formatted);
        const india = formatted.find((c: any) => c.name === 'India');
        if (india) {
          setFormData(prev => ({ ...prev, countryCode: india.code }));
        }
      } catch (err) {
        console.error('Failed to fetch countries:', err);
        setCountries([{ name: 'India', code: '+91', flag: 'https://flagcdn.com/w320/in.png' }]);
      } finally {
        setFetchingCountries(false);
      }
    };
    fetchCountries();
  }, []);



  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    document.body.appendChild(script);
  }, []);




  const purposes = [
    t('donation.purposes.general'),
    t('donation.purposes.building'),
    t('donation.purposes.education'),
    t('donation.purposes.medical'),
    t('donation.purposes.annakshetra'),
    t('donation.purposes.other'),
  ];

  const occasions = [
    t('donation.occasions.birthday'),
    t('donation.occasions.anniversary'),
    t('donation.occasions.memorial'),
    t('donation.occasions.navratri'),
    t('donation.occasions.other'),
  ];

  const handleClear = () => {
    setFormData({
      donorType: 'individual',
      purpose: '',
      donorName: user?.name || '',
      panNumber: '',
      occasion: '',
      amount: '',
      email: user?.email || '',
      countryCode: '+91',
      mobileNumber: user?.phone?.slice(-10) || '',
      address: '',
      occasionDate: '',
    });
  };

  const handleDonateClick = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    try {
      setLoading(true);

      // 1. Create Order
      const { data } = await axios.post('/api/payment/create-order', {
        amount: formData.amount
      });

      if (!data.success) {
        throw new Error(data.message || "Failed to create order");
      }

      const { order } = data;

      // 2. Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Kulachar Nidhi",
        description: "Donation Payment",
        order_id: order.id,
        handler: async function (response: any) {
          // Handle Payment Success
          await handlePaymentSuccess(response, order.id);
        },
        prefill: {
          name: formData.donorName,
          email: formData.email,
          contact: formData.mobileNumber,
        },
        theme: {
          color: "#E65100",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        alert("Payment Failed: " + response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || err.message || "Something went wrong");
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response: any, orderId: string) => {
    setLoading(true);
    setStep('processing');

    try {
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const res = await axios.post('/api/donations', {
        ...formData,
        amount: Number(formData.amount),
        reason: formData.purpose || formData.occasion || 'General Donation',
        mobileNumber: formData.countryCode + formData.mobileNumber,
        occasionDate: formData.occasionDate ? new Date(formData.occasionDate) : undefined,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpayOrderId: response.razorpay_order_id,
        razorpaySignature: response.razorpay_signature,
      }, config);

      if (res.data.success) {
        setLastDonation(res.data.data);
        setTimeout(() => {
          setStep('success');
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#E65100', '#D4AF37', '#4E342E']
          });
          setLoading(false);
        }, 3000);
      }
    } catch (err) {
      console.error(err);
      alert('Payment succeeded but donation save failed.');
      setStep('form');
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (lastDonation) {
      downloadPDF('receipt-content', `Receipt_${lastDonation.receiptNumber.replace(/\//g, '_')}.pdf`);
    }
  };



  if (step === 'processing') {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-16 border border-border shadow-2xl text-center flex flex-col items-center justify-center space-y-8 min-h-[500px]">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <Heart className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse fill-primary" />
        </div>
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-secondary tracking-tight">Verifying Your Divine Contribution...</h2>
          <p className="text-muted-foreground text-sm font-medium">Please do not refresh the page or click back.</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-primary/5 px-4 py-2 rounded-full">
          <Sparkles className="w-3 h-3" /> Divine Connection Active <Sparkles className="w-3 h-3" />
        </div>
      </div>
    );
  }

  if (step === 'success' && lastDonation) {
    return (
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl mx-auto bg-white rounded-[2.5rem] p-10 border border-border shadow-2xl text-center space-y-8"
      >
        <div className="space-y-3">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-secondary">{t('donation.thank_you')}</h2>
            <p className="text-muted-foreground text-sm font-medium">{t('donation.receipt_desc')}</p>
          </div>
        </div>

        <div className="transform scale-[0.8] origin-top -mb-[100px] shadow-2xl rounded-3xl overflow-hidden border border-border">
          <Receipt donation={lastDonation} />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-10">
          <button onClick={handleDownload} className="spiritual-button px-8 h-12 text-xs gap-2">
            <Download className="w-4 h-4" /> {t('donation.download')}
          </button>
          <button onClick={() => window.print()} className="spiritual-button-outline px-8 h-12 text-xs gap-2">
            <Printer className="w-4 h-4" /> {t('donation.print')}
          </button>
        </div>

        <div className="pt-4">
          <button onClick={() => { setStep('form'); handleClear(); }} className="text-[10px] font-black text-muted-foreground hover:text-primary transition-all uppercase tracking-widest border-b border-border hover:border-primary">
            {t('donation.another')}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-white rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">

        <div className="bg-amber-50/50 p-6 md:p-8 border-b border-amber-100">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
                <Info className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-secondary">{t('donation.instructions.title')}</h2>
            </div>

            <div className="flex items-center gap-6 bg-white p-2 px-4 rounded-2xl border border-amber-200 shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="lang"
                  checked={language === 'en'}
                  onChange={() => setLanguage('en')}
                  className="w-4 h-4 text-primary focus:ring-primary border-amber-300"
                />
                <span className={`text-xs font-bold ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>English</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="lang"
                  checked={language === 'mr'}
                  onChange={() => setLanguage('mr')}
                  className="w-4 h-4 text-primary focus:ring-primary border-amber-300"
                />
                <span className={`text-xs font-bold ${language === 'mr' ? 'text-primary' : 'text-muted-foreground'}`}>मराठी</span>
              </label>
            </div>
          </div>

          <ul className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <li key={i} className="flex items-start gap-3 text-xs md:text-sm text-secondary/70 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 shrink-0" />
                {t(`donation.instructions.point${i}`)}
              </li>
            ))}
          </ul>
        </div>

        <form onSubmit={handleDonateClick} className="p-6 md:p-10 space-y-10">

          <div className="space-y-4">
            <label className="text-xs font-black text-muted-foreground uppercase tracking-widest">{t('donation.donor_type')} :</label>
            <div className="flex items-center gap-8">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.donorType === 'individual' ? 'border-primary bg-primary' : 'border-border'}`}>
                  {formData.donorType === 'individual' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  name="donorType"
                  value="individual"
                  checked={formData.donorType === 'individual'}
                  onChange={(e) => setFormData({ ...formData, donorType: e.target.value })}
                />
                <span className="text-sm font-bold text-secondary">{t('donation.individual')}</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.donorType === 'organization' ? 'border-primary bg-primary' : 'border-border'}`}>
                  {formData.donorType === 'organization' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <input
                  type="radio"
                  className="hidden"
                  name="donorType"
                  value="organization"
                  checked={formData.donorType === 'organization'}
                  onChange={(e) => setFormData({ ...formData, donorType: e.target.value })}
                />
                <span className="text-sm font-bold text-secondary">{t('donation.organization')}</span>
              </label>
            </div>
          </div>

          <div className="h-px bg-border/50" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">{t('donation.purpose')} <span className="text-primary">*</span></label>
              <select
                required
                className="spiritual-input h-12 w-full font-bold text-sm bg-white"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              >
                <option value="">{t('donation.purpose_placeholder')}</option>
                {purposes.map((p, i) => <option key={i} value={p}>{p}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">
                {formData.donorType === 'organization' ? t('donation.organization_name') : t('donation.name')} <span className="text-primary">*</span>
              </label>
              <input
                required
                type="text"
                placeholder={formData.donorType === 'organization' ? t('donation.organization_placeholder') : t('donation.name')}
                className="spiritual-input h-12 w-full px-4 font-bold text-sm"
                value={formData.donorName}
                onChange={(e) => setFormData({ ...formData, donorName: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">
                {formData.donorType === 'organization' ? t('donation.gstn') : t('donation.pan')}
              </label>
              <input
                type="text"
                placeholder={formData.donorType === 'organization' ? t('donation.gstn_placeholder') : t('donation.pan')}
                className="spiritual-input h-12 w-full px-4 font-bold text-sm"
                value={formData.panNumber}
                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
              />
              {formData.donorType === 'individual' && (
                <p className="text-[10px] text-primary font-bold">{t('donation.pan_warning')}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">{t('donation.occasion')} <span className="text-primary">*</span></label>
              <select
                required
                className="spiritual-input h-12 w-full font-bold text-sm bg-white"
                value={formData.occasion}
                onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
              >
                <option value="">{t('donation.occasion_placeholder')}</option>
                {occasions.map((o, i) => <option key={i} value={o}>{o}</option>)}
              </select>
            </div>

            {formData.occasion && (
              <div className="space-y-2">
                <label className="text-xs font-black text-secondary uppercase tracking-tight">Occasion Date</label>
                <input
                  type="date"
                  className="spiritual-input h-12 w-full px-4 font-bold text-sm"
                  value={formData.occasionDate}
                  onChange={(e) => setFormData({ ...formData, occasionDate: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">{t('donation.amount')} (₹) <span className="text-primary">*</span></label>
              <input
                required
                type="number"
                placeholder="0.00"
                className="spiritual-input h-12 w-full px-4 font-black text-lg"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>

          </div>

          <div className="h-px bg-border/50" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">{t('donation.email')} <span className="text-primary">*</span></label>
              <input
                required
                type="email"
                placeholder="example@mail.com"
                className="spiritual-input h-12 w-full px-4 font-bold text-sm"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-secondary uppercase tracking-tight">{t('donation.mobile')} <span className="text-primary">*</span></label>
              <div className="flex gap-0 items-stretch h-12 bg-white border border-border rounded-2xl overflow-hidden focus-within:border-primary transition-all">
                <div className="relative flex items-center bg-muted/20 min-w-[80px]">
                  {fetchingCountries ? (
                    <div className="flex items-center px-4">
                      <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : (
                    <>
                      <select
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        value={formData.countryCode}
                        onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                      >
                        {countries.map((c, i) => (
                          <option key={i} value={c.code}>{c.name} ({c.code})</option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1.5 px-4 pointer-events-none">
                        <img
                          src={countries.find(c => c.code === formData.countryCode)?.flag || 'https://flagcdn.com/w320/in.png'}
                          alt="flag"
                          className="w-5 h-3.5 object-cover rounded-sm"
                        />
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                    </>
                  )}
                </div>

                <div className="w-px h-6 bg-border self-center" />
                <div className="flex items-center px-4 font-black text-secondary text-sm bg-muted/5 min-w-[60px] justify-center">
                  {formData.countryCode}
                </div>

                <div className="w-px h-6 bg-border self-center" />

                <input
                  required
                  type="tel"
                  placeholder="Mobile Number"
                  className="flex-1 bg-transparent px-4 font-bold text-sm focus:outline-none"
                  value={formData.mobileNumber}
                  onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                />
              </div>
            </div>

          </div>

          <div className="flex flex-col md:flex-row justify-end items-center gap-4 pt-6">
            <button
              type="button"
              onClick={handleClear}
              className="w-full md:w-auto px-10 h-14 rounded-2xl bg-muted text-secondary font-black text-sm uppercase tracking-widest hover:bg-muted/80 transition-all flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> {t('donation.clear')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-16 h-14 rounded-2xl bg-primary text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Heart className="w-5 h-5 fill-white" /> {t('nav.donate')}
                </>
              )}
            </button>
          </div>

        </form>

      </div>

      <p className="text-center text-[10px] text-muted-foreground mt-8 font-bold uppercase tracking-widest leading-relaxed">
        © {new Date().getFullYear()} {t('hero.title_1')} {t('hero.title_2')}. All Rights Reserved. <br className="md:hidden" />
        Payment processed securely via encrypted gateway.
      </p>
    </div>
  );
}
