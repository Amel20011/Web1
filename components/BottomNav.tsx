'use client';

import React from 'react';
import { Home, Disc3, Clock, ReceiptText, UserCircle } from 'lucide-react';

export type TabKey = 'home' | 'services' | 'history' | 'transactions' | 'profile';

interface BottomNavProps {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  activeOrderCount?: number;
}

export function BottomNav({ activeTab, onChangeTab, activeOrderCount = 0 }: BottomNavProps) {
  const tabs = [
    { key: 'home' as TabKey, label: 'Beranda', icon: Home },
    { key: 'services' as TabKey, label: 'Layanan', icon: Disc3 },
    { key: 'history' as TabKey, label: 'Riwayat', icon: Clock },
    {
      key: 'transactions' as TabKey,
      label: 'Transaksi',
      icon: ReceiptText,
      badge: activeOrderCount > 0 ? activeOrderCount : undefined,
    },
    { key: 'profile' as TabKey, label: 'Profil', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F5F8E8]/95 backdrop-blur-lg border-t-2 border-[#E1ECCE] py-2 px-3">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => onChangeTab(tab.key)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-150 ${
                isActive
                  ? 'bg-white shadow-[0_4px_0_#D4E2BD] border-2 border-[#DCE8C8] -translate-y-1'
                  : 'hover:bg-white/60 active:translate-y-0.5'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#63C926] stroke-[2.5]' : 'text-[#566a58]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-[#FF9B27] text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 border border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] font-bold mt-1 transition-colors ${
                  isActive ? 'text-[#1d2a1e]' : 'text-[#637865]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
