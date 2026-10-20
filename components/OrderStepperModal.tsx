'use client';

import React from 'react';
import { Order } from '@/lib/types';
import { PRODUCTION_STAGES, getStageIndex } from '@/lib/order-logic';
import { calculateQueuePosition } from '@/lib/queue-logic';
import {
  X,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  Mail,
  Headphones,
  Download,
  MessageCircle,
} from 'lucide-react';

interface OrderStepperModalProps {
  order: Order | null;
  allOrders: Order[];
  isOpen: boolean;
  onClose: () => void;
  onOpenCS: (orderId?: string) => void;
}

export function OrderStepperModal({
  order,
  allOrders,
  isOpen,
  onClose,
  onOpenCS,
}: OrderStepperModalProps) {
  if (!isOpen || !order) return null;

  const currentStageIndex = getStageIndex(order.productionStage);
  const queueInfo = order.queueNumber
    ? calculateQueuePosition(order.queueNumber, allOrders)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-[32px] border-4 border-[#E2ECCB] shadow-[0_24px_48px_rgba(37,49,38,0.25),0_8px_0_#D3E2BB] relative my-auto overflow-hidden">
        {/* Pinned Sticky Header */}
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-5 py-4 sm:px-7 border-b-2 border-[#E5EFCF] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center shadow-[0_3px_0_#61a600] text-[#1a2e14] shrink-0">
              <Headphones className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-[#647966]">
                  {order.orderNumber}
                </span>
                {order.queueNumber && (
                  <span className="badge-clay bg-[#8FE000] text-[#1a2e14] border border-[#63C926] font-black text-[10px]">
                    {order.queueNumber}
                  </span>
                )}
                {order.isPriority && (
                  <span className="badge-clay bg-[#38A9F4] text-white border border-[#208dd7] font-black text-[9px]">
                    VIP Priority
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-[#253126] truncate">
                {order.projectName || order.serviceName}
              </h3>
            </div>
          </div>

          {/* Close button always visible in header */}
          <button
            onClick={onClose}
            aria-label="Tutup modal"
            className="p-2 rounded-2xl bg-[#F5F8E8] hover:bg-[#EBF3D6] text-[#526654] border border-[#DEEAC4] transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 pt-4 space-y-5">
          {/* Live Queue Position Card (if queued or active) */}
          {queueInfo && order.productionStage !== 'completed' && order.productionStage !== 'sent' && (
            <div className="card-clay-lime p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#C2E898] flex items-center justify-center text-[#2d730f] font-black text-sm shadow-xs">
                  #{queueInfo.position}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1a2e14]">
                    Posisi Antrean Saat Ini: #{queueInfo.position}
                  </p>
                  <p className="text-[11px] text-[#4d6642]">
                    {queueInfo.aheadCount === 0
                      ? 'Pesanan Anda saat ini berada di urutan terdepan!'
                      : `Ada ${queueInfo.aheadCount} pesanan di depan Anda dalam antrean.`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 border border-[#C5EA9B] text-xs font-bold text-[#2d730f]">
                <Clock className="w-3.5 h-3.5 text-[#38A9F4]" />
                <span>Est. ~{queueInfo.estimatedMinutes} menit</span>
              </div>
            </div>
          )}

          {/* Audio Engineer Note if available */}
          {order.customerNote && (
            <div className="p-3.5 rounded-2xl bg-[#FFF9E6] border-2 border-[#F6E96B] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#FF9B27] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-extrabold text-[#74500d] mb-0.5">
                  Catatan dari Tim Audio Engineer:
                </p>
                <p className="text-xs text-[#523d13] font-medium leading-relaxed">
                  &ldquo;{order.customerNote}&rdquo;
                </p>
              </div>
            </div>
          )}

          {/* Stepper Timeline (9 Stages) */}
          <div>
            <h4 className="text-xs sm:text-sm font-black text-[#253126] mb-3">
              Pelacakan Status Pengerjaan (9 Tahapan)
            </h4>

            <div className="space-y-3 relative before:absolute before:left-4 before:top-4 before:bottom-4 before:w-1 before:bg-[#E5EFCF] before:-z-0">
              {PRODUCTION_STAGES.map((stage, idx) => {
                const isPast = idx < currentStageIndex;
                const isCurrent = idx === currentStageIndex;

                return (
                  <div
                    key={stage.id}
                    className={`relative z-10 flex items-start gap-3 p-3 rounded-2xl transition-all ${
                      isCurrent
                        ? 'bg-[#F2FBE2] border-2 border-[#BCE888] shadow-sm'
                        : isPast
                        ? 'bg-white/80 opacity-90'
                        : 'opacity-50'
                    }`}
                  >
                    {/* Step circle indicator */}
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-black text-xs border-2 shadow-xs ${
                        isPast
                          ? 'bg-[#63C926] border-[#4fa81c] text-white'
                          : isCurrent
                          ? 'bg-[#8FE000] border-[#63C926] text-[#1a2e14] ring-4 ring-[#8FE000]/30 animate-pulse'
                          : 'bg-white border-[#D6E2C2] text-[#849a85]'
                      }`}
                    >
                      {isPast ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : stage.number}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <p
                          className={`text-xs font-black ${
                            isCurrent ? 'text-[#1a2e14]' : isPast ? 'text-[#384c3a]' : 'text-[#7e9480]'
                          }`}
                        >
                          Tahap {stage.number}: {stage.title}
                        </p>
                        {stage.estimatedTime && (
                          <span className="text-[10px] font-bold text-[#647966] bg-white/70 px-2 py-0.5 rounded-lg border border-[#DCE8C8]">
                            {stage.estimatedTime}
                          </span>
                        )}
                      </div>

                      <p
                        className={`text-[11px] leading-relaxed mt-0.5 ${
                          isCurrent ? 'text-[#3f5742] font-semibold' : 'text-[#647966]'
                        }`}
                      >
                        {stage.description}
                      </p>

                      {/* Special Gmail Delivery Action Box on Stage 8 */}
                      {stage.id === 'sent' && isCurrent && (
                        <div className="mt-3 p-3 rounded-2xl bg-white border-2 border-[#8CEEDC] shadow-sm space-y-2.5">
                          <div className="flex items-center gap-2 text-xs font-extrabold text-[#0e5c51]">
                            <Mail className="w-4 h-4 text-[#38A9F4]" />
                            <span>File Terkirim ke: {order.recipientGmail}</span>
                          </div>
                          <p className="text-[11px] text-[#4d6350] leading-relaxed">
                            Jika hasil belum muncul, periksa folder <strong>Spam</strong>, <strong>Promosi</strong>, atau folder lain di Gmail Anda.
                          </p>

                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <a
                              href="https://mail.google.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-clay-blue px-4 py-2 text-xs font-black"
                            >
                              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                              Buka Gmail Anda
                            </a>

                            {order.delivery?.downloadUrl && (
                              <a
                                href={order.delivery.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn-clay-green px-4 py-2 text-xs font-black"
                              >
                                <Download className="w-3.5 h-3.5 mr-1.5" />
                                Unduh File Final Langsung
                              </a>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 sm:px-7 border-t-2 border-[#E5EFCF] bg-[#F5F8E8]/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-[#647966]">
            <span>Penerima: </span>
            <strong className="text-[#253126]">{order.recipientGmail}</strong>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenCS(order.orderNumber)}
              className="px-3.5 py-2 rounded-xl bg-white border-2 border-[#DCE8C8] text-[#344836] text-xs font-bold hover:bg-[#FDFEFB] shadow-[0_2px_0_#D1DEC0] flex items-center gap-1.5"
            >
              <MessageCircle className="w-3.5 h-3.5 text-[#38A9F4]" />
              <span>Bantuan CS</span>
            </button>
            <button
              onClick={onClose}
              className="btn-clay-white px-4 py-2 text-xs font-black"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
