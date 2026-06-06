'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WelcomeSection from '@/components/WelcomeSection';
import AartiSchedule from '@/components/AartiSchedule';
import GallerySection from '@/components/GallerySection';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import FestivalSpotLight from '@/components/FestivalSpotLight';
import { useLanguage } from '@/lib/LanguageContext';
import RenovationCampaign from '@/components/RenovationCampaign';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import QuickDonationModal from '@/components/QuickDonationModal';

export default function Home() {
  const { t, lang } = useLanguage();
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAmountClick = (amountStr: string) => {
    // Extract number from "₹101" -> "101"
    const amount = amountStr.replace('₹', '');
    setSelectedAmount(amount);
    setIsModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <Hero />

        {/* About/Welcome Section */}
        <WelcomeSection />

        {/* Aarti Schedule Section */}
        <AartiSchedule />
        <RenovationCampaign />

        {/* Gallery Section */}
        <GallerySection />



        <FestivalSpotLight />

        <section className="relative py-12 overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50">

          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-60 h-60 bg-orange-200/20 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-yellow-100/30 blur-3xl rounded-full"></div>

          <div className="max-w-7xl mx-auto px-6 lg:px-24 relative z-10">

            {/* MAIN CARD */}
            <div className="relative bg-white rounded-[28px] shadow-[0_15px_45px_rgba(0,0,0,0.08)] overflow-hidden border border-orange-100">

              {/* TOP STRIP */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400"></div>

              <div className="grid lg:grid-cols-2 items-center">

                {/* LEFT SIDE */}
                <div className="p-6 lg:p-7">

                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[11px] font-semibold mb-3">
                    {t('renovation.badge')}
                  </div>

                  {/* Heading */}
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-3" dangerouslySetInnerHTML={{ __html: t('renovation.title') }} />

                  {/* Description */}
                  <p className="text-sm text-gray-600 leading-6 mb-5">
                    {t('renovation.desc')}
                  </p>

                  {/* Donation Amounts */}
                  <div className="flex flex-wrap gap-2.5 mb-5">

                    {["₹101", "₹501", "₹1100", "₹2100"].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => handleAmountClick(amount)}
                        className="px-4 py-2 rounded-lg border border-orange-200 text-orange-600 text-sm font-medium hover:bg-orange-500 hover:text-white transition-all duration-300"
                      >
                        {amount}
                      </button>
                    ))}

                  </div>

                  {/* CTA Buttons */}
                  <div className="flex flex-wrap gap-3">

                    <Link
                      href="/donation"
                      className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all duration-300 flex items-center gap-2 w-fit"
                    >
                      🙏 {t('renovation.cta_donate')}
                    </Link>

                    {/* <button className="border border-orange-200 hover:bg-orange-50 text-orange-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300">
                      अधिक माहिती
                    </button> */}

                  </div>

                  {/* Bottom Info */}
                  <div className="flex flex-wrap gap-4 mt-5 text-[11px] text-gray-500">

                    <div className="flex items-center gap-1.5">
                      ✅ {t('common.secured_payment')}
                    </div>

                    <div className="flex items-center gap-1.5">
                      🛕 {t('footer.about_trust')}
                    </div>

                    <div className="flex items-center gap-1.5">
                      💠 {t('renovation.floating.title')}
                    </div>

                  </div>
                </div>

                {/* RIGHT SIDE */}
                <div className="relative h-full min-h-[340px] bg-gradient-to-br from-orange-100 to-yellow-50 flex items-center justify-center p-5 overflow-hidden">

                  {/* Decorative Circle */}
                  <div className="absolute w-[250px] h-[250px] rounded-full border border-orange-200/40"></div>

                  {/* QR CARD */}
                  <div className="relative bg-white rounded-[24px] shadow-xl p-5 w-full max-w-[270px] border border-orange-100 text-center z-10">

                    {/* Temple Icon */}
                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-2xl mx-auto mb-3">
                      🛕
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {t('donation.title')}
                    </h3>

                    <p className="text-xs text-gray-600 leading-5 mb-4">
                      {t('donation.subtitle')}
                    </p>

                    {/* QR CODE */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-dashed border-orange-200 mb-4">

                      <img
                        src="/qr.png"
                        alt="Donation QR"
                        className="w-36 h-36 object-contain mx-auto"
                      />

                    </div>

                    {/* UPI */}
                    <div className="bg-orange-50 rounded-lg py-2.5 px-3 mb-3">

                      <p className="text-[10px] text-gray-500 mb-1">
                        UPI ID
                      </p>

                      <p className="text-sm font-bold text-orange-700">
                        ekveeradevi@upi
                      </p>

                    </div>

                    {/* Note */}
                    <p className="text-[10px] text-gray-500 leading-4">
                      {t('renovation.donor_note')}
                    </p>

                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-5 right-5 text-4xl opacity-10">
                    ✨
                  </div>

                  <div className="absolute bottom-5 left-5 text-4xl opacity-10">
                    🪔
                  </div>

                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="relative py-8 md:py-10 bg-gradient-to-br from-orange-200 via-orange-100 to-amber-100 overflow-hidden">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none grayscale">
            <img src="/devi.png" alt="Pattern" className="w-full h-full object-cover scale-110" />
          </div>

          {/* Soft Glow */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/30 blur-3xl rounded-full" />

          <div className="max-w-3xl mx-auto px-4 relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="space-y-5"
            >
              {/* Icon */}
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow">
                  <Sparkles className="w-5 h-5 text-orange-600" />
                </div>
              </div>

              <h2 className="text-2xl md:text-4xl font-bold text-gray-800 leading-[1.3] tracking-tight">
                {t('impact.quote')}
              </h2>

              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-0.5 bg-gray-300 rounded-full" />
                <p className="text-gray-500 font-semibold uppercase tracking-[0.2em] text-[11px]">
                  {t('hero.title_1')} {t('hero.title_2')}, {t('hero.info.place')}
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
      <QuickDonationModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        amount={selectedAmount} 
      />
    </div>
  );
}
