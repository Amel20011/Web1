'use client';

import React from 'react';
import { NotificationItem } from '@/lib/types';
import { X, Bell, CheckCircle2, Clock, Disc3, ShieldCheck, Mail } from 'lucide-react';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/storage';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onNotificationClick: (notif: NotificationItem) => void;
  currentUserId?: string;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onNotificationClick,
  currentUserId,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAllRead = () => {
    markAllNotificationsAsRead('customer', currentUserId);
  };

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'order':
        return Disc3;
      case 'delivery':
        return Mail;
      case 'queue':
        return Clock;
      default:
        return Bell;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/35 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-sm h-full bg-white border-l-4 border-[#E2ECCB] shadow-[0_10px_30px_rgba(0,0,0,0.15)] flex flex-col p-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#E8F2D5] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#8FE000] border border-[#63C926] flex items-center justify-center text-[#1a2e14]">
              <Bell className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#253126]">Notifikasi</h3>
              <span className="text-[10px] text-[#647966] font-semibold">
                {unreadCount > 0 ? `${unreadCount} belum dibaca` : 'Semua telah dibaca'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-[#F5F8E8] hover:bg-[#EAF3D4] text-[#556957] transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="text-[11px] font-bold text-[#38A9F4] hover:underline text-right mb-3"
          >
            Tandai semua sudah dibaca
          </button>
        )}

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 no-scrollbar">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-[#7c917d]">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold">Belum ada notifikasi.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const Icon = getNotifIcon(notif.type);

              return (
                <div
                  key={notif.id}
                  onClick={() => {
                    markNotificationAsRead(notif.id);
                    onNotificationClick(notif);
                  }}
                  className={`p-3 rounded-2xl border-2 transition cursor-pointer ${
                    !notif.isRead
                      ? 'bg-[#EEFCD9] border-[#BCE888]'
                      : 'bg-white border-[#E2ECCB] hover:bg-[#F9FCF2]'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-white border border-[#DCE8C8] flex items-center justify-center text-[#253126] shrink-0 mt-0.5">
                      <Icon className="w-4 h-4 text-[#63C926]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className="text-xs font-black text-[#253126] truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#FF9B27] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-[#4d614f] leading-snug mb-1">
                        {notif.message}
                      </p>

                      <span className="text-[9px] text-[#718673] font-bold">
                        {new Date(notif.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
