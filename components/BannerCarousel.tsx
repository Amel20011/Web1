'use client';

import React, { useState } from 'react';
import { BannerItem } from '@/lib/types';
import { ChevronLeft, ChevronRight, Music, Sparkles, Headphones } from 'lucide-react';

interface BannerCarouselProps {
  banners: BannerItem[];
  onBannerAction: (banner: BannerItem) => void;
}

export function BannerCarousel({ banners, onBannerAction }: BannerCarouselProps) {
  const activeBanners = banners.filter((b) => b.isActive).sort((a, b) => a.order - b.order);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (activeBanners.length === 0) return null;

  const current = activeBanners[currentIndex % activeBanners.length];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === activeBanners.length - 1 ? 0 : prev + 1));
  };

  const bannerIcons = [Music, Sparkles, Headphones];
  const IconComp = bannerIcons[currentIndex % bannerIcons.length];

  return (
    <div className="relative w-full">
      {/* Banner Card with 3D Puffy Clay Style */}
      <div
        className={`w-full rounded-[30px] p-5 sm:p-7 text-white shadow-[0_14px_28px_-6px_rgba(37,49,38,0.2),0_6px_0_rgba(0,0,0,0.15)] border-3 border-white/60 bg-gradient-to-r ${current.bgGradient} transition-all duration-300 relative overflow-hidden`}
      >
        {/* Soft cartoon background bubbles */}
        <div className="absolute -right-6 -bottom-8 w-44 h-44 rounded-full bg-white/15 blur-xl pointer-events-none" />
        <div className="absolute left-1/2 -top-10 w-32 h-32 rounded-full bg-white/10 blur-lg pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-[11px] font-extrabold uppercase tracking-wider mb-2.5">
              <IconComp className="w-3.5 h-3.5" />
              <span>Layanan Spesialis Musik</span>
            </div>

            <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-snug drop-shadow-sm mb-2">
              {current.title}
            </h2>

            <p className="text-xs sm:text-sm text-white/95 font-medium leading-relaxed drop-shadow-sm line-clamp-2 sm:line-clamp-none">
              {current.description}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={() => onBannerAction(current)}
                className="px-5 py-2.5 rounded-2xl bg-white text-[#1d2a1e] text-xs sm:text-sm font-black shadow-[0_4px_0_#d8e5c8] active:translate-y-0.5 active:shadow-[0_1px_0_#d8e5c8] hover:bg-[#FDFEFB] transition"
              >
                {current.buttonText}
              </button>
            </div>
          </div>

          {/* Right Icon Illustration */}
          <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-3xl bg-white/20 backdrop-blur-md border-2 border-white/40 items-center justify-center shadow-inner">
            <IconComp className="w-12 h-12 text-white stroke-[2.2] drop-shadow-md" />
          </div>
        </div>

        {/* Carousel Dots & Controls */}
        <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/20">
          <div className="flex items-center gap-1.5">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2.5 rounded-full transition-all ${
                  idx === currentIndex % activeBanners.length
                    ? 'w-7 bg-white shadow-sm'
                    : 'w-2.5 bg-white/40 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/30 active:scale-95"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition border border-white/30 active:scale-95"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
