'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Phone, Mail, Clock, Newspaper, Video, ChevronRight, Monitor, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Sidebar() {
  const { t, lang } = useLanguage();

  const services = [
    {
      label: lang === 'mr' ? 'उत्सव आणि कार्यक्रम' : 'Festivals / Events',
      icon: Sparkles,
      href: '/festivals'
    },
    {
      label: lang === 'mr' ? 'मंदिर व्हिडिओ' : 'Temple Videos',
      icon: Video,
      href: '/gallery/videos'
    }
  ];

  return (
    <aside className="space-y-8">
      {/* Trust Services Section */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-border">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-6 text-secondary border-b-2 border-primary w-fit pb-1">
          {t('about.sidebar_title')}
        </h3>

        <div className="space-y-3">
          {services.map((service, index) => (
            <Link
              key={index}
              href={service.href}
              className="flex items-center gap-4 p-4 bg-white border border-border hover:border-primary/30 rounded-2xl transition-all group hover:shadow-md hover:-translate-y-0.5"
            >
              <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <service.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-black text-secondary group-hover:text-primary transition-colors">
                {service.label}
              </span>
              <ChevronRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Temple Image Card */}
      <div className="rounded-[2rem] overflow-hidden shadow-lg border-4 border-white group relative h-[240px] md:h-[300px] lg:h-[360px]">
        <img
          src="/devi.png"
          alt="Shri Ekavira Devi"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <div className="absolute bottom-6 left-6 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent mb-1">
            Temple View
          </p>

          <p className="font-black text-lg leading-tight tracking-tight">
            Shri Kulaswamini
            <br />
            Ekavira Devi Mandir Trust
          </p>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-[#41312C] text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        {/* Abstract Background Element */}
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-500" />

        <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 text-accent border-b border-white/10 w-fit pb-1">
          {t('about.contact_info')}
        </h3>

        <div className="space-y-6 relative z-10">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <MapPin className="w-5 h-5 text-accent" />
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-medium pt-1">
              {t('common.mumbai_address')}
            </p>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <Phone className="w-5 h-5 text-accent" />
            </div>
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Phone</p>
              <p className="text-sm text-white font-bold">{t('hero.info.phone')}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10">
              <Mail className="w-5 h-5 text-accent" />
            </div>
            <div className="pt-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-0.5">Email</p>
              <p className="text-sm text-white font-bold truncate">info@kuldaivattrust.org</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
