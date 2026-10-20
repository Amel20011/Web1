'use client';

import React from 'react';
import { Bell, Sparkles, User, ShieldCheck } from 'lucide-react';
import { UserProfile, NotificationItem } from '@/lib/types';

interface NavbarProps {
  currentUser: UserProfile | null;
  notifications: NotificationItem[];
  onOpenAuth: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onGoToAdmin: () => void;
  brandName?: string;
}

export function Navbar({
  currentUser,
  notifications,
  onOpenAuth,
  onOpenNotifications,
  onOpenProfile,
  onGoToAdmin,
  brandName = 'Ban Spesialis',
}: NavbarProps) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 bg-[#F5F8E8]/90 backdrop-blur-md border-b-2 border-[#E5EFCF] px-4 py-3 sm:px-6">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand Watermark / Logo */}
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center shadow-[0_3px_0_#61a600] text-[#1a2e14] shrink-0">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-xl tracking-tight text-[#253126]">
                {brandName}
              </span>
              <span className="text-[9px] font-bold bg-[#8CEEDC] text-[#0d554a] px-1.5 py-0.5 rounded-lg border border-[#64ddc9] hidden sm:inline-block">
                MUSIC LAB
              </span>
            </div>
            <p className="text-[10px] text-[#556957] font-medium hidden sm:block">
              Layanan Produksi Audio & Antrean Terpadu
            </p>
          </div>
        </div>

        {/* Right Action Icons & User Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick link to Admin */}
          <button
            onClick={onGoToAdmin}
            title="Buka Admin Dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#E1ECCE] text-[#3c513e] text-xs font-bold shadow-[0_3px_0_#D4E2BE] active:translate-y-0.5 active:shadow-[0_1px_0_#D4E2BE] transition"
          >
            <ShieldCheck className="w-4 h-4 text-[#38A9F4]" />
            <span className="hidden md:inline">Admin Ops</span>
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-2xl bg-white border-2 border-[#E1ECCE] text-[#253126] shadow-[0_3px_0_#D4E2BE] active:translate-y-0.5 active:shadow-[0_1px_0_#D4E2BE] transition"
            aria-label="Lihat Notifikasi"
          >
            <Bell className="w-5 h-5 text-[#253126]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#FF9B27] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile or Login Trigger */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-white border-2 border-[#DCE8C8] shadow-[0_3px_0_#CFDEB7] active:translate-y-0.5 active:shadow-[0_1px_0_#CFDEB7] transition"
            >
              <div className="w-7 h-7 rounded-xl bg-[#8FE000] border border-[#63C926] flex items-center justify-center text-[#1a2e14] font-black text-xs">
                {currentUser.name ? currentUser.name[0].toUpperCase() : 'M'}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-extrabold text-[#253126] leading-none">
                  {currentUser.name || 'Musisi'}
                </p>
                <p className="text-[10px] text-[#697d6a] font-medium leading-none mt-0.5">
                  {currentUser.email.split('@')[0]}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn-clay-green px-4 py-1.5 text-xs sm:text-sm font-bold shadow-[0_4px_0_#61a600]"
            >
              <User className="w-4 h-4 mr-1.5" />
              Masuk Gmail
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
