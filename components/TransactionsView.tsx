'use client';

import React, { useState } from 'react';
import { Order } from '@/lib/types';
import { getStageInfo } from '@/lib/order-logic';
import {
  ReceiptText,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Search,
  Filter,
  Sparkles,
} from 'lucide-react';

interface TransactionsViewProps {
  orders: Order[];
  onSelectOrder: (order: Order) => void;
  onNewOrderClick: () => void;
}

export function TransactionsView({
  orders,
  onSelectOrder,
  onNewOrderClick,
}: TransactionsViewProps) {
  const [filterStage, setFilterStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { key: 'all', label: 'Semua Transaksi' },
    { key: 'in_progress', label: 'Sedang Dikerjakan' },
    { key: 'queued', label: 'Dalam Antrean' },
    { key: 'quality_control', label: 'Quality Control' },
    { key: 'sent', label: 'Dikirim ke Gmail' },
    { key: 'completed', label: 'Selesai' },
  ];

  const filteredOrders = orders.filter((order) => {
    const matchFilter =
      filterStage === 'all'
        ? true
        : filterStage === 'queued'
        ? order.productionStage === 'paid_queued' || order.productionStage === 'queued'
        : order.productionStage === filterStage;

    const matchSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.queueNumber && order.queueNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      order.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchFilter && matchSearch;
  });

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#253126]">
            Riwayat Pesanan & Transaksi
          </h2>
          <p className="text-xs text-[#526654]">
            Pantau nomor antrean dan progres 9 tahapan pengerjaan secara real-time
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari #BANDLAB / pesanan..."
            className="w-full px-3.5 py-2 pl-9 rounded-2xl bg-white border-2 border-[#DCE8C8] text-[#253126] placeholder:text-[#8b9e8c] text-xs font-bold shadow-[0_2px_0_#D1DEC0] focus:outline-none focus:border-[#63C926] transition"
          />
          <Search className="w-4 h-4 text-[#63C926] absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {filterTabs.map((tab) => {
          const isSelected = filterStage === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setFilterStage(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#8FE000] text-[#1a2e14] border-2 border-[#63C926] shadow-[0_3px_0_#61a600]'
                  : 'bg-white text-[#526654] border-2 border-[#DCE8C8] hover:bg-[#F9FCF2]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Order Cards List */}
      {filteredOrders.length === 0 ? (
        <div className="card-clay p-8 text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] flex items-center justify-center mx-auto mb-3 text-[#798e7b]">
            <ReceiptText className="w-7 h-7" />
          </div>
          <h4 className="font-black text-[#253126] text-sm mb-1">
            Belum ada pesanan pada filter ini
          </h4>
          <p className="text-xs text-[#637765] mb-4">
            Pesan jasa editing musik atau paket audio Anda sekarang juga.
          </p>
          <button
            onClick={onNewOrderClick}
            className="btn-clay-green px-5 py-2 text-xs font-black shadow-[0_3px_0_#61a600]"
          >
            Pesan Layanan Musik
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const stageInfo = getStageInfo(order.productionStage);
            const isCompleted = order.productionStage === 'completed';
            const isSent = order.productionStage === 'sent';

            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="card-clay p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 cursor-pointer hover:border-[#BCE888] hover:shadow-[0_10px_20px_rgba(99,201,38,0.12)] transition-all group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Queue Badge or Order Icon */}
                  <div className="w-12 h-12 rounded-2xl bg-[#EEFCD9] border-2 border-[#C2E898] flex flex-col items-center justify-center text-[#2d730f] shrink-0 shadow-[0_3px_0_#b5de8a]">
                    <span className="text-[9px] font-black uppercase tracking-tight">Antrean</span>
                    <span className="text-xs font-black leading-none">{order.queueNumber || 'WAIT'}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-black text-[#253126]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-[#718673] font-semibold">
                        • {new Date(order.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </span>
                      {order.isPriority && (
                        <span className="badge-clay bg-[#38A9F4] text-white text-[9px] px-1.5 py-0.5">
                          VIP
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-black text-[#253126] truncate">
                      {order.projectName || order.serviceName}
                    </h4>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Current Stage Badge */}
                      <span
                        className={`badge-clay text-[10px] ${
                          isCompleted
                            ? 'bg-[#E5F7DC] text-[#2d730f] border border-[#BCE888]'
                            : isSent
                            ? 'bg-[#E0F7F6] text-[#0d554a] border border-[#8CEEDC]'
                            : 'bg-[#FFF6E5] text-[#b06108] border border-[#FFD99B]'
                        }`}
                      >
                        Tahap {stageInfo.number}: {stageInfo.title}
                      </span>

                      <span className="text-xs font-black text-[#253126]">
                        Rp {order.priceSnapshot.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EBF2DD]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOrder(order);
                    }}
                    className="btn-clay-white px-3.5 py-1.5 text-xs font-bold group-hover:border-[#63C926] flex items-center gap-1"
                  >
                    <span>Lacak Status</span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#63C926]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
