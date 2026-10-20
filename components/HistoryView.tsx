'use client';

import React from 'react';
import { ActivityHistoryItem } from '@/lib/types';
import { Clock, Eye, ShoppingBag, Mail, Disc3, Sparkles } from 'lucide-react';

interface HistoryViewProps {
  historyItems: ActivityHistoryItem[];
  onExploreServices: () => void;
}

export function HistoryView({ historyItems, onExploreServices }: HistoryViewProps) {
  const getEventIcon = (eventType: ActivityHistoryItem['eventType']) => {
    switch (eventType) {
      case 'product_viewed':
      case 'service_viewed':
        return Eye;
      case 'order_created':
      case 'checkout_started':
        return ShoppingBag;
      case 'delivery_opened':
        return Mail;
      default:
        return Disc3;
    }
  };

  return (
    <div className="w-full space-y-4">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#253126]">
          Riwayat Aktivitas
        </h2>
        <p className="text-xs text-[#526654]">
          Catatan aktivitas, layanan yang Anda lihat, dan riwayat pengerjaan audio
        </p>
      </div>

      {historyItems.length === 0 ? (
        <div className="card-clay p-8 text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] flex items-center justify-center mx-auto mb-3 text-[#798e7b]">
            <Clock className="w-7 h-7" />
          </div>
          <h4 className="font-black text-[#253126] text-sm mb-1">
            Belum ada riwayat aktivitas
          </h4>
          <p className="text-xs text-[#637765] mb-5 max-w-sm mx-auto">
            Jelajahi layanan Ban Spesialis untuk memulai.
          </p>
          <button
            onClick={onExploreServices}
            className="btn-clay-green px-5 py-2 text-xs font-black shadow-[0_3px_0_#61a600]"
          >
            Jelajahi Katalog Musik
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {historyItems.map((item) => {
            const Icon = getEventIcon(item.eventType);

            return (
              <div
                key={item.id}
                className="card-clay p-4 flex items-start gap-3.5 hover:border-[#C5EA9B] transition"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#EEFCD9] border-2 border-[#C2E898] flex items-center justify-center text-[#2d730f] shrink-0 shadow-[0_2px_0_#b5de8a]">
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <h4 className="text-xs sm:text-sm font-black text-[#253126] truncate">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-[#718673] font-bold shrink-0">
                      {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-[#526654] font-medium leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
