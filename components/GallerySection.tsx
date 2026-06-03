'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Maximize2, Image as ImageIcon, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

interface GalleryImage {
  _id: string;
  caption: string;
  imageUrl: string;
  size?: 'large' | 'tall' | 'square';
}

export default function GallerySection() {
  const { t } = useLanguage();

  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  // IMAGE PREVIEW STATE
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery', { cache: 'no-store' });

        if (!res.ok) throw new Error('Failed to fetch gallery');

        const data = await res.json();

        if (data.length === 0) {
          setImages([
            {
              _id: 'f1',
              imageUrl: '/devi.png',
              caption: t('gallery.main_sanctum'),
              size: 'large',
            },
            {
              _id: 'f2',
              imageUrl: '/devi.png',
              caption: t('gallery.entrance'),
              size: 'tall',
            },
            {
              _id: 'f3',
              imageUrl: '/devi.png',
              caption: t('gallery.deepotsav'),
              size: 'square',
            },
            {
              _id: 'f4',
              imageUrl: '/devi.png',
              caption: t('gallery.festival'),
              size: 'square',
            },
          ]);
        } else {
          const transformedData = data.slice(0, 4).map((img: any, index: number) => ({
            ...img,
            size:
              index === 0
                ? 'large'
                : index === 1
                  ? 'tall'
                  : 'square',
          }));

          setImages(transformedData);
        }
      } catch (error) {
        console.error('Gallery fetch error:', error);

        setImages([
          {
            _id: 'f1',
            imageUrl: '/devi.png',
            caption: t('gallery.main_sanctum'),
            size: 'large',
          },
          {
            _id: 'f2',
            imageUrl: '/devi.png',
            caption: t('gallery.entrance'),
            size: 'tall',
          },
          {
            _id: 'f3',
            imageUrl: '/devi.png',
            caption: t('gallery.deepotsav'),
            size: 'square',
          },
          {
            _id: 'f4',
            imageUrl: '/devi.png',
            caption: t('gallery.festival'),
            size: 'square',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [t]);

  return (
    <section
      id="gallery"
      className="pt-12 md:pt-16 pb-12 md:pb-16 bg-white overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest mb-4 shadow-sm">
            ✨ {t('gallery.badge') || 'Sacred Vision'}
          </div>

          <h2 className="text-2xl md:text-3xl font-black text-secondary tracking-tight">
            {t('gallery.title')}
          </h2>

          <div className="h-1 w-12 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full mt-4" />
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]">

          {loading ? (
            [1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className={`bg-muted animate-pulse rounded-[2.5rem]
                  ${n === 1 ? 'md:col-span-2 md:row-span-2' : ''}
                  ${n === 2 ? 'md:col-span-1 md:row-span-2' : ''}
                  ${n > 2 ? 'md:col-span-1 md:row-span-1' : ''}
                `}
              />
            ))
          ) : (
            images.map((img, index) => (
              <motion.div
                key={img._id}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}

                // CLICK IMAGE
                onClick={() => setSelectedImage(img)}

                className={`group relative rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-muted cursor-pointer shadow-sm hover:shadow-2xl transition-all duration-500
                  ${img.size === 'large' ? 'md:col-span-2 md:row-span-2 row-span-2' : ''}
                  ${img.size === 'tall' ? 'md:col-span-1 md:row-span-2 row-span-2' : ''}
                  ${img.size === 'square' ? 'md:col-span-1 md:row-span-1' : ''}
                `}
              >

                {/* IMAGE */}
                <img
                  src={img.imageUrl}
                  alt={img.caption}
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/90 via-secondary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    className="space-y-3"
                  >
                    <p className="text-white font-black text-sm md:text-lg tracking-tight leading-tight">
                      {img.caption}
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="h-[2px] w-8 bg-primary" />
                      <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                        Sacred Vision
                      </span>
                    </div>
                  </motion.div>

                  <div className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Corner Icon */}
                <div className="absolute bottom-6 right-6 text-white/20 group-hover:opacity-0 transition-opacity">
                  <ImageIcon className="w-5 h-5" />
                </div>

              </motion.div>
            ))
          )}
        </div>

        {/* View More */}
        <div className="mt-16 flex justify-center">
          <Link
            href="/gallery"
            className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-orange-200 transition-all duration-300 flex items-center gap-3 group"
          >
            {t('gallery.view_all') || 'View Full Gallery'}

            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* IMAGE PREVIEW MODAL */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
            onPointerDown={() => setSelectedImage(null)}
          >

            {/* CLOSE BUTTON */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="fixed top-4 right-4 z-[100000] w-14 h-14 rounded-full bg-black/80 text-white flex items-center justify-center active:scale-95"
            >
              <X className="w-7 h-7" />
            </button>

            {/* IMAGE */}
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.25 }}
              src={selectedImage.imageUrl}
              alt={selectedImage.caption}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />

          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}