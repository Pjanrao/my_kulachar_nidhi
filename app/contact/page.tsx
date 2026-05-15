'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send, Sparkles, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage({
  params,
  searchParams
}: {
  params: Promise<any>;
  searchParams: Promise<any>;
}) {
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const contactInfo = [
    {
      icon: MapPin,
      title: t('contact.address'),
      details: t('hero.title_1') + ' ' + t('hero.title_2') + ', Ekvira Devi-Jaitapur-Mulher, Taluka Baglan, District Nashik, Maharashtra - 423301',
      action: t('contact.actions.map')
    },
    {
      icon: Mail,
      title: t('contact.email'),
      details: 'info@kuldaivattrust.org\nsupport@kuldaivattrust.org',
      action: t('contact.actions.email')
    },
    {
      icon: Clock,
      title: t('contact.hours'),
      details: lang === 'en' ? 'Monday to Sunday:\n10:00 AM to 6:00 PM' : 'सोमवार ते रविवार:\nसकाळी १०:०० ते सायंकाळी ६:००',
      action: t('contact.actions.hours')
    },
    {
      icon: Phone,
      title: t('contact.phone'),
      details: '०२२-२३५१ ४७३२\n०२२-२३५१ २२३३',
      action: t('contact.actions.call')
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-grow">
        {mounted ? (
          <>
            {/* Contact Header */}
            <section className="relative py-12 md:py-20 bg-secondary overflow-hidden">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none grayscale invert">
                <img src="/devi.png" alt="Pattern" className="w-full h-full object-cover" />
              </div>
              <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-primary/50" />
                    <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em]">{t('nav.contact')}</span>
                    <div className="h-px w-8 bg-primary/50" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                    {t('contact.title_1')} <span className="text-primary">{t('contact.title_2')}</span>
                  </h1>
                  <p className="text-white/60 text-sm md:text-base max-w-2xl mx-auto font-medium">
                    {t('contact.subtitle')}
                  </p>
                </motion.div>
              </div>
            </section>

            {/* Contact Form Section */}
            <section className="py-12 md:py-20 relative z-20">
              <div className="max-w-7xl mx-auto px-4 space-y-12">

                {/* 1. TOP: FULL WIDTH FEEDBACK CARD */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-secondary p-8 md:p-12 rounded-[2.5rem] text-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32" />
                  <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16">
                    <div className="w-20 h-20 bg-white/10 rounded-[2rem] flex items-center justify-center text-primary shrink-0 shadow-2xl">
                      <MessageCircle className="w-10 h-10" />
                    </div>
                    <div className="flex-grow text-center md:text-left space-y-4">
                      <h4 className="text-2xl md:text-3xl font-black">{t('contact.feedback')}</h4>
                      <p className="text-sm md:text-base text-white/50 leading-relaxed font-bold max-w-3xl">
                        {t('contact.feedback_desc')}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 px-8 py-4 bg-white/5 rounded-2xl border border-white/10 shrink-0">
                      <div className="flex flex-col items-center gap-1">
                        <Sparkles className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Premium Support</span>
                      </div>
                      <div className="w-px h-8 bg-white/10" />
                      <div className="flex flex-col items-center gap-1">
                        <Send className="w-5 h-5 text-primary" />
                        <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">Fast Response</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* 2. BOTTOM: FORM + INFO CARDS GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
                  {/* Form Column */}
                  <div className="lg:col-span-2">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-8 md:p-12 rounded-[3rem] border border-border shadow-2xl shadow-secondary/5"
                    >
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.currentTarget;
                          const formData = new FormData(form);
                          const data = {
                            name: formData.get('name'),
                            email: formData.get('email'),
                            phone: formData.get('phone'),
                            subject: formData.get('subject'),
                            message: formData.get('message'),
                          };

                          try {
                            const btn = form.querySelector('button[type="submit"]');
                            if (btn) (btn as HTMLButtonElement).disabled = true;

                            const res = await fetch('/api/contact', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify(data),
                            });

                            if (res.ok) {
                              alert('Message sent successfully!');
                              form.reset();
                            } else {
                              alert('Failed to send message. Please try again.');
                            }
                          } catch (error) {
                            alert('An error occurred. Please try again later.');
                          } finally {
                            const btn = form.querySelector('button[type="submit"]');
                            if (btn) (btn as HTMLButtonElement).disabled = false;
                          }
                        }}
                        className="space-y-8"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Full Name</label>
                            <input
                              name="name"
                              type="text"
                              required
                              placeholder="Your Name"
                              className="spiritual-input w-full h-16 px-8 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/30 transition-all outline-none text-sm font-bold shadow-inner"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Email Address</label>
                            <input
                              name="email"
                              type="email"
                              required
                              placeholder="your@email.com"
                              className="spiritual-input w-full h-16 px-8 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/30 transition-all outline-none text-sm font-bold shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Phone Number</label>
                            <input
                              name="phone"
                              type="tel"
                              required
                              placeholder="+91 00000 00000"
                              className="spiritual-input w-full h-16 px-8 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/30 transition-all outline-none text-sm font-bold shadow-inner"
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Subject</label>
                            <input
                              name="subject"
                              type="text"
                              required
                              placeholder="What is this about?"
                              className="spiritual-input w-full h-16 px-8 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/30 transition-all outline-none text-sm font-bold shadow-inner"
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">Your Message / Feedback</label>
                          <textarea
                            name="message"
                            required
                            rows={6}
                            placeholder="Type your message here..."
                            className="spiritual-input w-full p-8 rounded-2xl bg-muted/30 border-transparent focus:bg-white focus:border-primary/30 transition-all outline-none text-sm font-bold resize-none shadow-inner"
                          ></textarea>
                        </div>

                        <button
                          type="submit"
                          className="spiritual-button w-full h-16 text-sm font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          Send Message <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </motion.div>
                  </div>

                  {/* Info Column */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="flex flex-col gap-4">
                      {contactInfo.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + (index * 0.1) }}
                          className="bg-white p-6 rounded-[2rem] border border-border hover:border-primary/30 transition-all group flex items-start gap-5 shadow-xl shadow-secondary/5"
                        >
                          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-lg shadow-primary/10">
                            <item.icon className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-black text-secondary tracking-tight">{item.title}</h4>
                            <p className="text-[11px] text-muted-foreground font-bold leading-relaxed whitespace-pre-line opacity-80">
                              {item.details}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {/* Additional Decorative Card */}
                    <div className="bg-gradient-to-br from-orange-500 to-yellow-500 p-8 rounded-[2rem] text-white shadow-2xl shadow-orange-200/50 relative overflow-hidden">
                      <div className="relative z-10">
                        <Sparkles className="w-8 h-8 mb-4 text-white/50" />
                        <h5 className="text-lg font-black mb-2">Visit the Temple</h5>
                        <p className="text-xs font-bold text-white/80 leading-relaxed">
                          Experience the divine energy and historical heritage of Shri Ekavira Devi Mandir in person.
                        </p>
                      </div>
                      <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/20 rounded-full blur-3xl" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* FULL WIDTH MAP SECTION */}
            <section className="relative h-[600px] w-full bg-muted overflow-hidden border-t border-border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119346.98938985093!2d73.93239425028592!3d20.8077304!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bde5ca91223aaab%3A0x2cdf1657f77d4179!2sEkvira%20Devi-Jaitapur-Mulher!5e0!3m2!1sen!2sin!4v1778580926526!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ekavira Devi Temple Location"
              ></iframe>

              {/* Map Overlay Card */}
              <div className="absolute top-10 left-4 md:left-20 z-10 max-w-xs w-full pointer-events-none">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="bg-white p-6 rounded-3xl shadow-2xl border border-border pointer-events-auto"
                >
                  <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-3">
                    <MapPin className="w-3 h-3" /> Visit Us
                  </div>
                  <h4 className="text-lg font-black text-secondary mb-2">Shri Ekvira Devi Temple</h4>
                  <p className="text-[10px] text-muted-foreground font-bold leading-relaxed mb-4 italic">
                    Jaitapur, Taluka Baglan, <br />District Nashik - 423301
                  </p>
                  <a
                    href="https://www.google.com/maps/dir//Ekvira+Devi-Jaitapur-Mulher/@20.8077304,73.9323943,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x3bde5ca91223aaab:0x2cdf1657f77d4179!2m2!1d74.0583333!2d20.5666667?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-secondary text-white text-[10px] font-black uppercase rounded-xl hover:bg-primary transition-all duration-300 shadow-lg shadow-secondary/20"
                  >
                    Open In Google Maps
                  </a>
                </motion.div>
              </div>
            </section>
          </>
        ) : (
          <div className="min-h-screen bg-background" />
        )}
      </main>

      <Footer />
    </div>
  );
}
