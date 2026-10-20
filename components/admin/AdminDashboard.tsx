'use client';

import React, { useState, useEffect } from 'react';
import {
  Order,
  ServiceProduct,
  ServicePackage,
  BannerItem,
  PromoCardItem,
  UserProfile,
  SiteSettings,
  ProductionStage,
  DeliveryStatus,
} from '@/lib/types';
import { PRODUCTION_STAGES, getStageInfo } from '@/lib/order-logic';
import {
  getOrders,
  saveOrders,
  getProducts,
  saveProducts,
  getPackages,
  savePackages,
  getBanners,
  saveBanners,
  getPromoCards,
  savePromoCards,
  getSiteSettings,
  saveSiteSettings,
  updateOrderStage,
  updateOrderQcChecklist,
  dispatchDeliveryEmail,
  getStoredCredentials,
  getTickets,
  replyTicket,
} from '@/lib/storage';
import {
  LayoutDashboard,
  Globe,
  Disc3,
  Users,
  ShoppingBag,
  Clock,
  Wrench,
  Mail,
  Receipt,
  MessageSquare,
  Settings,
  ArrowLeft,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Send,
  Eye,
  FileCheck,
  Shield,
  Edit2,
  Trash2,
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToCustomer: () => void;
}

type AdminTab =
  | 'overview'
  | 'website'
  | 'products'
  | 'orders'
  | 'queue'
  | 'production'
  | 'delivery'
  | 'transactions'
  | 'users'
  | 'cs'
  | 'settings';

export function AdminDashboard({ onBackToCustomer }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [adminRole, setAdminRole] = useState<'super_admin' | 'production_lead' | 'support_admin'>('super_admin');

  // Loaded states from persistent store
  const [orders, setOrders] = useState<Order[]>(() => getOrders());
  const [products, setProducts] = useState<ServiceProduct[]>(() => getProducts());
  const [packages, setPackages] = useState<ServicePackage[]>(() => getPackages());
  const [banners, setBanners] = useState<BannerItem[]>(() => getBanners());
  const [promoCards, setPromoCards] = useState<PromoCardItem[]>(() => getPromoCards());
  const [settings, setSettings] = useState<SiteSettings | null>(() => getSiteSettings());
  const [tickets, setTickets] = useState(() => getTickets());
  const [usersList, setUsersList] = useState(() => getStoredCredentials());

  // Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [selectedOrderForEdit, setSelectedOrderForEdit] = useState<Order | null>(null);

  // Delivery Composer State
  const [deliveryOrder, setDeliveryOrder] = useState<Order | null>(null);
  const [deliverySubject, setDeliverySubject] = useState('');
  const [deliveryLink, setDeliveryLink] = useState('https://drive.google.com/drive/folders/ban-spesialis-output');
  const [deliveryNotice, setDeliveryNotice] = useState('');

  // Ticket reply state
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  // Reload data
  const refreshData = () => {
    setOrders(getOrders());
    setProducts(getProducts());
    setPackages(getPackages());
    setBanners(getBanners());
    setPromoCards(getPromoCards());
    setSettings(getSiteSettings());
    setTickets(getTickets());
    setUsersList(getStoredCredentials());
  };

  // Subscribe to changes without synchronous setState
  useEffect(() => {
    // Empty dependency subscription if needed
  }, []);

  // Compute metrics
  const totalOrders = orders.length;
  const verifiedRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.priceSnapshot, 0);
  const activeQueueCount = orders.filter(
    (o) => o.queueNumber && o.productionStage !== 'completed' && o.productionStage !== 'sent'
  ).length;
  const inProgressCount = orders.filter((o) => o.productionStage === 'in_progress').length;
  const deliveredCount = orders.filter(
    (o) => o.productionStage === 'sent' || o.productionStage === 'completed'
  ).length;

  // Handle stage change from Production tab
  const handleUpdateStage = (
    orderId: string,
    newStage: ProductionStage,
    customerNote?: string,
    internalNote?: string
  ) => {
    updateOrderStage(orderId, newStage, customerNote, internalNote);
    refreshData();
    if (selectedOrderForEdit && selectedOrderForEdit.id === orderId) {
      setSelectedOrderForEdit((prev) => (prev ? { ...prev, productionStage: newStage } : null));
    }
  };

  // Handle sending delivery email
  const handleSendDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryOrder) return;

    dispatchDeliveryEmail(deliveryOrder.id, {
      recipient: deliveryOrder.recipientGmail,
      subject: deliverySubject || `Hasil Pesanan Ban Spesialis — ${deliveryOrder.orderNumber}`,
      downloadUrl: deliveryLink,
      fileSizeMb: 34.8,
    });

    setDeliveryNotice(`Email hasil final berhasil dikirimkan ke ${deliveryOrder.recipientGmail}!`);
    setTimeout(() => {
      setDeliveryNotice('');
      setDeliveryOrder(null);
      refreshData();
    }, 1500);
  };

  // Navigation Items
  const navItems = [
    { key: 'overview', label: 'Ringkasan & Stats', icon: LayoutDashboard },
    { key: 'orders', label: 'Manajemen Pesanan', icon: ShoppingBag, badge: totalOrders },
    { key: 'queue', label: 'Sistem Antrean', icon: Clock, badge: activeQueueCount },
    { key: 'production', label: 'Proses Pengerjaan', icon: Wrench },
    { key: 'delivery', label: 'Pengiriman via Gmail', icon: Mail },
    { key: 'transactions', label: 'Transaksi & Keuangan', icon: Receipt },
    { key: 'products', label: 'Produk & Paket', icon: Disc3 },
    { key: 'website', label: 'Website & Banner', icon: Globe },
    { key: 'users', label: 'Pelanggan', icon: Users },
    { key: 'cs', label: 'Customer Service', icon: MessageSquare, badge: tickets.filter((t) => t.status === 'open').length },
    { key: 'settings', label: 'Pengaturan & RBAC', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F8E8] text-[#253126] flex flex-col md:flex-row">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 bg-white border-r-2 border-[#E1ECCE] p-4 flex flex-col justify-between shrink-0">
        <div>
          {/* Admin Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#E8F2D5] mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#38A9F4] border-2 border-[#208dd7] flex items-center justify-center text-white shadow-[0_3px_0_#1c79b9]">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-black text-[#253126]">Admin Ban Spesialis</h1>
                <span className="text-[10px] font-bold bg-[#E8F6FE] text-[#1a5b8a] px-1.5 py-0.5 rounded-md border border-[#C5E6FC]">
                  {adminRole === 'super_admin' ? 'Super Administrator' : 'Production Lead'}
                </span>
              </div>
            </div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              return (
                <button
                  key={item.key}
                  onClick={() => setActiveTab(item.key as AdminTab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-[#8FE000] text-[#1a2e14] border-2 border-[#63C926] shadow-[0_2px_0_#61a600]'
                      : 'text-[#4c604e] hover:bg-[#F5F8E8] hover:text-[#253126]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#1a2e14] text-white'
                          : 'bg-[#FF9B27] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Back to Customer Web */}
        <div className="pt-4 border-t-2 border-[#E8F2D5] mt-4">
          <button
            onClick={onBackToCustomer}
            className="w-full btn-clay-white py-2 text-xs font-black flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-[#63C926]" />
            <span>Kembali ke Website</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b-2 border-[#E5EFCF] mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#253126]">
              {navItems.find((n) => n.key === activeTab)?.label}
            </h2>
            <p className="text-xs text-[#526654]">
              Sistem operasional privat terintegrasi Ban Spesialis
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-[#647966]">Status Sinkronisasi:</span>
            <span className="badge-clay bg-[#EEFCD9] text-[#24660a] border border-[#C5EA9B] text-[10px] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#63C926] animate-pulse" />
              Tersambung Real-Time
            </span>
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW ================= */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="card-clay p-4">
                <span className="text-[10px] font-extrabold uppercase text-[#647966] block">
                  Total Pendapatan Valid
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#253126]">
                  Rp {verifiedRevenue.toLocaleString('id-ID')}
                </span>
                <span className="text-[10px] text-[#2d730f] font-bold mt-1 block">
                  ✓ Pembayaran terverifikasi
                </span>
              </div>

              <div className="card-clay-lime p-4">
                <span className="text-[10px] font-extrabold uppercase text-[#2d730f] block">
                  Antrean Aktif
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#1a2e14]">
                  {activeQueueCount} Pesanan
                </span>
                <span className="text-[10px] text-[#426137] font-semibold mt-1 block">
                  Mulai dari #BANDLAB
                </span>
              </div>

              <div className="card-clay-blue p-4">
                <span className="text-[10px] font-extrabold uppercase text-[#145a88] block">
                  Sedang Dikerjakan
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#0f4467]">
                  {inProgressCount} Proyek
                </span>
                <span className="text-[10px] text-[#2d730f] font-bold mt-1 block">
                  Di studio sound engineer
                </span>
              </div>

              <div className="card-clay-orange p-4">
                <span className="text-[10px] font-extrabold uppercase text-[#b06108] block">
                  Selesai & Dikirim
                </span>
                <span className="text-xl sm:text-2xl font-black text-[#744005]">
                  {deliveredCount} Pesanan
                </span>
                <span className="text-[10px] text-[#71430b] font-semibold mt-1 block">
                  Via Gmail terdaftar
                </span>
              </div>
            </div>

            {/* Quick Live Queue Table */}
            <div className="card-clay p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-black text-[#253126]">
                  Antrean Pengerjaan Audio Terkini
                </h3>
                <button
                  onClick={() => setActiveTab('queue')}
                  className="text-xs font-bold text-[#38A9F4] hover:underline"
                >
                  Kelola Antrean →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-[#E8F2D5] text-[#647966]">
                      <th className="pb-2 font-black">Nomor Antrean</th>
                      <th className="pb-2 font-black">ID Pesanan</th>
                      <th className="pb-2 font-black">Pelanggan</th>
                      <th className="pb-2 font-black">Layanan / Proyek</th>
                      <th className="pb-2 font-black">Tahap Saat Ini</th>
                      <th className="pb-2 font-black text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F5E6]">
                    {orders.slice(0, 5).map((order) => {
                      const stage = getStageInfo(order.productionStage);
                      return (
                        <tr key={order.id} className="hover:bg-[#F9FCF2]">
                          <td className="py-2.5">
                            <span className="font-black text-[#253126] bg-[#EEFCD9] px-2 py-0.5 rounded-lg border border-[#C5EA9B]">
                              {order.queueNumber || 'Pending'}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold text-[#4c604e]">{order.orderNumber}</td>
                          <td className="py-2.5 font-semibold text-[#253126]">{order.recipientGmail}</td>
                          <td className="py-2.5 font-bold text-[#253126]">{order.projectName || order.serviceName}</td>
                          <td className="py-2.5">
                            <span className="badge-clay bg-white text-[#253126] border border-[#DEEAC4] text-[10px]">
                              T{stage.number}: {stage.shortLabel}
                            </span>
                          </td>
                          <td className="py-2.5 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForEdit(order);
                                setActiveTab('production');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white border border-[#DCE8C8] text-[11px] font-bold text-[#38A9F4] hover:bg-[#EBF7FD]"
                            >
                              Update Tahap
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: PRODUCTION MANAGEMENT (9 STAGES & QC CHECKLIST) ================= */}
        {activeTab === 'production' && (
          <div className="space-y-5">
            <div className="card-clay p-5">
              <h3 className="text-base font-black text-[#253126] mb-2">
                Pilih Pesanan untuk Mengelola 9 Tahap Pengerjaan
              </h3>
              <p className="text-xs text-[#526654] mb-4">
                Pembaruan status di sini otomatis tercatat dalam stepper pelanggan dan memicu notifikasi.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
                {orders.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOrderForEdit(o)}
                    className={`p-3.5 rounded-2xl text-left border-2 transition ${
                      selectedOrderForEdit?.id === o.id
                        ? 'bg-[#EEFCD9] border-[#63C926] shadow-[0_3px_0_#61a600]'
                        : 'bg-white border-[#DEEAC4] hover:bg-[#F9FCF2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-[#253126]">
                        {o.queueNumber || 'Menunggu'}
                      </span>
                      <span className="text-[10px] text-[#647966] font-bold">{o.orderNumber}</span>
                    </div>
                    <p className="text-xs font-bold text-[#354937] truncate mb-1">
                      {o.projectName || o.serviceName}
                    </p>
                    <span className="badge-clay bg-white text-[9px] text-[#253126] border border-[#DEEAC4]">
                      {getStageInfo(o.productionStage).title}
                    </span>
                  </button>
                ))}
              </div>

              {selectedOrderForEdit && (
                <div className="p-5 rounded-3xl bg-[#F5F8E8] border-2 border-[#DEEAC4] space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DEEAC4]">
                    <div>
                      <h4 className="text-base font-black text-[#253126]">
                        Update Progres: {selectedOrderForEdit.orderNumber} ({selectedOrderForEdit.queueNumber})
                      </h4>
                      <p className="text-xs text-[#526654]">
                        Pelanggan: {selectedOrderForEdit.userName} ({selectedOrderForEdit.recipientGmail})
                      </p>
                    </div>
                    <span className="badge-clay bg-[#8FE000] text-[#1a2e14] font-black">
                      Tahap Aktif: {getStageInfo(selectedOrderForEdit.productionStage).title}
                    </span>
                  </div>

                  {/* 9 Stages Selector Buttons */}
                  <div>
                    <label className="block text-xs font-bold text-[#354937] mb-2">
                      Pilih Tahap Pengerjaan Baru:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PRODUCTION_STAGES.map((s) => {
                        const isCurrent = selectedOrderForEdit.productionStage === s.id;
                        return (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() =>
                              handleUpdateStage(
                                selectedOrderForEdit.id,
                                s.id,
                                `Status pesanan Anda telah diperbarui ke Tahap ${s.number}: ${s.title}`
                              )
                            }
                            className={`p-2.5 rounded-xl text-left border-2 transition ${
                              isCurrent
                                ? 'bg-[#8FE000] border-[#63C926] font-black text-[#1a2e14] shadow-[0_2px_0_#61a600]'
                                : 'bg-white border-[#DEEAC4] text-[#435945] hover:bg-[#FDFEFB]'
                            }`}
                          >
                            <span className="text-[10px] font-bold block opacity-75">
                              Tahap {s.number}
                            </span>
                            <span className="text-xs font-black leading-snug">
                              {s.shortLabel}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* QC Checklist */}
                  <div className="p-4 rounded-2xl bg-white border-2 border-[#DEEAC4]">
                    <h5 className="text-xs font-black text-[#253126] mb-2.5 flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-[#63C926]" />
                      <span>Checklist Pemeriksaan Kualitas (QC & Human Error)</span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#3b503e]">
                      {[
                        { key: 'formatMatches', label: '1. Format file sesuai permintaan paket' },
                        { key: 'filenameCorrect', label: '2. Penamaan file master sudah benar' },
                        { key: 'audioNotCutOff', label: '3. Bagian audio tidak terpotong tiba-tiba' },
                        { key: 'transitionSmooth', label: '4. Transisi antarlagu halus & beatmatch' },
                        { key: 'noMissedSections', label: '5. Tidak ada bagian rekaman yang terlewat' },
                        { key: 'filePlayable', label: '6. File audio dapat diputar jernih (No Glitch)' },
                      ].map((chk) => (
                        <label key={chk.key} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-[#F5F8E8]">
                          <input
                            type="checkbox"
                            checked={
                              (selectedOrderForEdit.qcChecklist as any)?.[chk.key] ?? true
                            }
                            onChange={(e) => {
                              const updatedQC = {
                                ...selectedOrderForEdit.qcChecklist,
                                [chk.key]: e.target.checked,
                              } as any;
                              updateOrderQcChecklist(selectedOrderForEdit.id, updatedQC);
                              refreshData();
                              setSelectedOrderForEdit((prev) =>
                                prev ? { ...prev, qcChecklist: updatedQC } : null
                              );
                            }}
                            className="w-4 h-4 rounded text-[#63C926] focus:ring-[#8FE000]"
                          />
                          <span>{chk.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Quick Shortcut to Send via Gmail */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => {
                        setDeliveryOrder(selectedOrderForEdit);
                        setActiveTab('delivery');
                      }}
                      className="btn-clay-blue px-4 py-2 text-xs font-black flex items-center gap-1.5"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Lanjut Kirim Hasil ke Gmail</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 3: DELIVERY MANAGEMENT (GMAIL DISPATCH) ================= */}
        {activeTab === 'delivery' && (
          <div className="space-y-5 max-w-2xl">
            <div className="card-clay p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-[#38A9F4] border-2 border-[#208dd7] flex items-center justify-center text-white shadow-[0_3px_0_#1c79b9]">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#253126]">
                    Pengiriman Hasil Akhir via Gmail
                  </h3>
                  <p className="text-xs text-[#526654]">
                    Kirimkan file master audio atau link Google Drive langsung ke alamat Gmail pelanggan
                  </p>
                </div>
              </div>

              {deliveryNotice && (
                <div className="p-3 mb-4 rounded-2xl bg-[#EEFCD9] border border-[#C5EA9B] text-[#24660a] text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{deliveryNotice}</span>
                </div>
              )}

              <form onSubmit={handleSendDelivery} className="space-y-4">
                {/* Select Order */}
                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Pilih Pesanan yang Siap Dikirim:
                  </label>
                  <select
                    value={deliveryOrder?.id || ''}
                    onChange={(e) => {
                      const found = orders.find((o) => o.id === e.target.value);
                      setDeliveryOrder(found || null);
                      if (found) {
                        setDeliverySubject(`Hasil Pesanan Ban Spesialis — ${found.orderNumber} (${found.queueNumber})`);
                      }
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-bold text-[#253126]"
                  >
                    <option value="">-- Pilih Pesanan --</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} - {o.queueNumber || 'No Queue'} ({o.projectName || o.serviceName}) - {o.recipientGmail}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Recipient Gmail */}
                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Alamat Gmail Penerima
                  </label>
                  <input
                    type="email"
                    value={deliveryOrder?.recipientGmail || ''}
                    readOnly
                    className="w-full px-3.5 py-2 rounded-xl bg-[#E8F2D5]/50 border-2 border-[#DEEAC4] text-xs font-bold text-[#556957]"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Subjek Email
                  </label>
                  <input
                    type="text"
                    value={deliverySubject}
                    onChange={(e) => setDeliverySubject(e.target.value)}
                    required
                    placeholder="Hasil Pesanan Ban Spesialis — ORD-202610-001"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold"
                  />
                </div>

                {/* Cloud Download Link */}
                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Link Unduhan Privat (Google Drive / Cloud Storage)
                  </label>
                  <input
                    type="url"
                    value={deliveryLink}
                    onChange={(e) => setDeliveryLink(e.target.value)}
                    required
                    placeholder="https://drive.google.com/drive/folders/..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold"
                  />
                </div>

                {/* Email Body Preview (Section 13) */}
                <div className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs space-y-1.5 font-mono text-[#384c3b]">
                  <p className="font-bold text-[#253126]">Preview Isi Pesan Email:</p>
                  <p>Halo {deliveryOrder?.userName || 'Pelanggan'},</p>
                  <p>Pesanan audio Anda telah selesai diproses oleh tim Ban Spesialis.</p>
                  <p>• Nomor Pesanan: {deliveryOrder?.orderNumber || '[Nomor Pesanan]'}</p>
                  <p>• Nomor Antrean: {deliveryOrder?.queueNumber || '[Nomor Antrean]'}</p>
                  <p>• Layanan: {deliveryOrder?.serviceName || '[Nama Layanan]'}</p>
                  <p>Hasil pesanan dapat diakses melalui link Google Drive terlampir.</p>
                  <p>Terima kasih telah mempercayakan produksi musik Anda kepada Ban Spesialis.</p>
                </div>

                <button
                  type="submit"
                  disabled={!deliveryOrder}
                  className="w-full btn-clay-green py-3 text-sm font-black shadow-[0_4px_0_#61a600] flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Hasil ke Kotak Masuk Gmail</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ORDERS MANAGEMENT ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Cari pesanan, email, atau antrean..."
                  className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white border-2 border-[#DCE8C8] text-xs font-bold"
                />
                <Search className="w-4 h-4 text-[#63C926] absolute left-3 top-2.5" />
              </div>

              <span className="text-xs font-bold text-[#556957]">
                Total: {orders.length} Pesanan
              </span>
            </div>

            <div className="card-clay overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F5F8E8] border-b-2 border-[#DEEAC4] text-[#4f6451]">
                    <tr>
                      <th className="p-3 font-black">Antrean</th>
                      <th className="p-3 font-black">ID Pesanan</th>
                      <th className="p-3 font-black">Pelanggan</th>
                      <th className="p-3 font-black">Layanan</th>
                      <th className="p-3 font-black">Paket</th>
                      <th className="p-3 font-black">Biaya</th>
                      <th className="p-3 font-black">Status Tahap</th>
                      <th className="p-3 font-black text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBF2DD]">
                    {orders
                      .filter(
                        (o) =>
                          o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          o.recipientGmail.toLowerCase().includes(orderSearch.toLowerCase()) ||
                          (o.queueNumber && o.queueNumber.toLowerCase().includes(orderSearch.toLowerCase()))
                      )
                      .map((o) => (
                        <tr key={o.id} className="hover:bg-[#FDFEFB]">
                          <td className="p-3 font-black text-[#253126]">
                            {o.queueNumber || 'Waiting'}
                          </td>
                          <td className="p-3 font-bold text-[#455c47]">{o.orderNumber}</td>
                          <td className="p-3">
                            <span className="font-bold text-[#253126] block">{o.userName}</span>
                            <span className="text-[10px] text-[#718673]">{o.recipientGmail}</span>
                          </td>
                          <td className="p-3 font-semibold text-[#253126]">
                            {o.projectName || o.serviceName}
                          </td>
                          <td className="p-3">
                            <span
                              className={`badge-clay text-[9px] ${
                                o.packageType === 'premium'
                                  ? 'bg-[#E8F6FE] text-[#145a88]'
                                  : 'bg-[#EEFCD9] text-[#24660a]'
                              }`}
                            >
                              {o.packageType.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 font-black text-[#253126]">
                            Rp {o.priceSnapshot.toLocaleString('id-ID')}
                          </td>
                          <td className="p-3">
                            <span className="badge-clay bg-[#FFF8E6] text-[#935208] text-[9px]">
                              {getStageInfo(o.productionStage).title}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForEdit(o);
                                setActiveTab('production');
                              }}
                              className="px-2.5 py-1 rounded-xl bg-white border border-[#DCE8C8] text-[11px] font-bold text-[#63C926] hover:bg-[#F5F8E8]"
                            >
                              Kelola
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: QUEUE MANAGEMENT ================= */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <div className="card-clay p-5">
              <h3 className="text-base font-black text-[#253126] mb-1">
                Aturan & Antrean Otomatis (#BANDLAB, #BANDLAB1, ...)
              </h3>
              <p className="text-xs text-[#526654] mb-4">
                Nomor antrean dialokasikan permanen saat pembayaran terverifikasi. Paket Premium VIP memperoleh prioritas antrean terdepan.
              </p>

              <div className="space-y-2.5">
                {orders
                  .filter((o) => o.queueNumber)
                  .map((o, idx) => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-2xl bg-white border-2 border-[#DEEAC4] flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EEFCD9] border border-[#C5EA9B] flex items-center justify-center font-black text-xs text-[#24660a]">
                          #{idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-[#253126] text-sm">
                              {o.queueNumber}
                            </span>
                            <span className="text-xs text-[#647966] font-semibold">
                              ({o.orderNumber})
                            </span>
                            {o.isPriority && (
                              <span className="badge-clay bg-[#38A9F4] text-white text-[9px]">
                                VIP PRIORITY
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#4f6451] font-medium">
                            {o.projectName || o.serviceName} • {o.recipientGmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="badge-clay bg-[#F5F8E8] text-[#253126] border border-[#DCE8C8] text-[10px]">
                          {getStageInfo(o.productionStage).title}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedOrderForEdit(o);
                            setActiveTab('production');
                          }}
                          className="btn-clay-white px-3 py-1 text-[11px] font-bold"
                        >
                          Ubah Status
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 6: WEBSITE & BANNER MANAGEMENT ================= */}
        {activeTab === 'website' && (
          <div className="space-y-5 max-w-2xl">
            <div className="card-clay p-5 space-y-4">
              <h3 className="text-base font-black text-[#253126]">
                Kelola 3 Banner Utama Carousel
              </h3>

              {banners.map((b, i) => (
                <div key={b.id} className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#253126]">
                      Banner #{i + 1} ({b.id})
                    </span>
                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={b.isActive}
                        onChange={(e) => {
                          const updated = banners.map((x) =>
                            x.id === b.id ? { ...x, isActive: e.target.checked } : x
                          );
                          setBanners(updated);
                          saveBanners(updated);
                        }}
                        className="rounded text-[#63C926]"
                      />
                      <span>Tampilkan</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4c604e] mb-1">Judul Banner</label>
                    <input
                      type="text"
                      value={b.title}
                      onChange={(e) => {
                        const updated = banners.map((x) =>
                          x.id === b.id ? { ...x, title: e.target.value } : x
                        );
                        setBanners(updated);
                        saveBanners(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DCE8C8] text-xs font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#4c604e] mb-1">Deskripsi Singkat</label>
                    <input
                      type="text"
                      value={b.description}
                      onChange={(e) => {
                        const updated = banners.map((x) =>
                          x.id === b.id ? { ...x, description: e.target.value } : x
                        );
                        setBanners(updated);
                        saveBanners(updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DCE8C8] text-xs font-medium"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 7: PRODUCTS & PACKAGES ================= */}
        {activeTab === 'products' && (
          <div className="space-y-5">
            {/* Packages Pricing Section (Basic & Premium) */}
            <div className="card-clay p-5 space-y-4">
              <h3 className="text-base font-black text-[#253126]">
                Kelola Harga & Manfaat 2 Paket Utama (Basic & Premium)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {packages.map((pkg) => (
                  <div key={pkg.id} className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#253126]">{pkg.name}</span>
                      <span className="badge-clay bg-white text-[10px]">{pkg.id.toUpperCase()}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4c604e] mb-1">
                        Harga Awal Paket (Rp)
                      </label>
                      <input
                        type="number"
                        value={pkg.price}
                        onChange={(e) => {
                          const updated = packages.map((p) =>
                            p.id === pkg.id ? { ...p, price: Number(e.target.value) } : p
                          );
                          setPackages(updated);
                          savePackages(updated);
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE8C8] text-sm font-black text-[#253126]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4c604e] mb-1">
                        Batas Revisi Maksimal
                      </label>
                      <input
                        type="number"
                        value={pkg.maxRevisions}
                        onChange={(e) => {
                          const updated = packages.map((p) =>
                            p.id === pkg.id ? { ...p, maxRevisions: Number(e.target.value) } : p
                          );
                          setPackages(updated);
                          savePackages(updated);
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DCE8C8] text-xs font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Catalog Products */}
            <div className="card-clay p-5 space-y-3">
              <h3 className="text-base font-black text-[#253126]">
                Daftar Layanan Musik Digital ({products.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="p-3.5 rounded-2xl bg-white border-2 border-[#DEEAC4] flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-[#38A9F4] block mb-0.5">
                        {p.category}
                      </span>
                      <h4 className="text-xs font-black text-[#253126] mb-1">{p.name}</h4>
                      <p className="text-sm font-black text-[#253126] mb-2">
                        Rp {p.price.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#F0F5E6]">
                      <span className="text-[10px] text-[#647966] font-semibold">
                        {p.estimatedDays} Hari • {p.maxRevisions}x Rev
                      </span>
                      <button
                        onClick={() => {
                          const updated = products.map((x) =>
                            x.id === p.id ? { ...x, isActive: !x.isActive } : x
                          );
                          setProducts(updated);
                          saveProducts(updated);
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          p.isActive
                            ? 'bg-[#EEFCD9] text-[#24660a] border-[#C5EA9B]'
                            : 'bg-gray-100 text-gray-500 border-gray-300'
                        }`}
                      >
                        {p.isActive ? 'Aktif' : 'Nonaktif'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 8: CUSTOMER SERVICE TICKETS ================= */}
        {activeTab === 'cs' && (
          <div className="space-y-4 max-w-2xl">
            <div className="card-clay p-5">
              <h3 className="text-base font-black text-[#253126] mb-1">
                Tiket Bantuan Pelanggan
              </h3>
              <p className="text-xs text-[#526654] mb-4">
                Balas pesan dan kendala teknis audio dari pelanggan secara langsung.
              </p>

              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#253126]">
                        {t.ticketNumber} • {t.userEmail}
                      </span>
                      <span
                        className={`badge-clay text-[9px] ${
                          t.status === 'resolved'
                            ? 'bg-[#EEFCD9] text-[#24660a]'
                            : 'bg-[#FFF3E6] text-[#b06108]'
                        }`}
                      >
                        {t.status === 'resolved' ? 'Selesai' : 'Perlu Balasan'}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-[#2d4030]">Subjek: {t.subject}</p>
                    <p className="text-xs text-[#4c604e]">{t.message}</p>

                    {t.adminReply ? (
                      <div className="p-2.5 rounded-xl bg-white border border-[#DCE8C8] text-xs">
                        <span className="font-bold text-[#253126] block">Balasan Admin:</span>
                        <p className="text-[#3b503e]">{t.adminReply}</p>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <textarea
                          rows={2}
                          placeholder="Tuliskan jawaban untuk pelanggan..."
                          value={activeTicketId === t.id ? ticketReplyText : ''}
                          onFocus={() => setActiveTicketId(t.id)}
                          onChange={(e) => setTicketReplyText(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl bg-white border border-[#DCE8C8] text-xs"
                        />
                        <button
                          onClick={() => {
                            if (ticketReplyText.trim()) {
                              replyTicket(t.id, ticketReplyText);
                              setTicketReplyText('');
                              refreshData();
                            }
                          }}
                          className="btn-clay-green px-4 py-1.5 text-xs font-black mt-2"
                        >
                          Kirim Balasan
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 9: SETTINGS & RBAC ================= */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-xl">
            <div className="card-clay p-5 space-y-3">
              <h3 className="text-base font-black text-[#253126]">
                Pengaturan Brand & Kontak
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#4c604e] mb-1">Nama Brand Website</label>
                <input
                  type="text"
                  value={settings?.brandName || ''}
                  onChange={(e) => {
                    if (settings) {
                      const updated = { ...settings, brandName: e.target.value };
                      setSettings(updated);
                      saveSiteSettings(updated);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE8C8] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c604e] mb-1">Email Dukungan Bantuan</label>
                <input
                  type="email"
                  value={settings?.supportEmail || ''}
                  onChange={(e) => {
                    if (settings) {
                      const updated = { ...settings, supportEmail: e.target.value };
                      setSettings(updated);
                      saveSiteSettings(updated);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE8C8] text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4c604e] mb-1">Nomor WhatsApp CS</label>
                <input
                  type="text"
                  value={settings?.supportWhatsapp || ''}
                  onChange={(e) => {
                    if (settings) {
                      const updated = { ...settings, supportWhatsapp: e.target.value };
                      setSettings(updated);
                      saveSiteSettings(updated);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DCE8C8] text-xs font-bold"
                />
              </div>
            </div>

            {/* RBAC Role Selector */}
            <div className="card-clay p-5 space-y-3">
              <h3 className="text-base font-black text-[#253126]">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-[#526654]">
                Uji coba hak akses sebagai peran operasional yang berbeda:
              </p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'super_admin' as const, label: 'Super Admin' },
                  { role: 'production_lead' as const, label: 'Production Lead' },
                  { role: 'support_admin' as const, label: 'Support Admin' },
                ].map((r) => (
                  <button
                    key={r.role}
                    onClick={() => setAdminRole(r.role)}
                    className={`p-2.5 rounded-xl text-center text-xs font-black border-2 transition ${
                      adminRole === r.role
                        ? 'bg-[#38A9F4] text-white border-[#208dd7] shadow-[0_2px_0_#1c79b9]'
                        : 'bg-white text-[#4c604e] border-[#DEEAC4]'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fallback for other tabs */}
        {(activeTab === 'transactions' || activeTab === 'users') && (
          <div className="card-clay p-5 space-y-3">
            <h3 className="text-base font-black text-[#253126]">
              {activeTab === 'transactions' ? 'Data Transaksi & Gateway Pembayaran' : 'Daftar Pengguna Gmail Terdaftar'}
            </h3>
            <p className="text-xs text-[#526654]">
              {activeTab === 'transactions'
                ? 'Semua catatan pembayaran masuk diverifikasi secara transparan dengan referensi transaksi.'
                : 'Daftar akun Gmail unik yang telah membuktikan verifikasi email dan memiliki PIN 4-digit.'}
            </p>

            <div className="divide-y divide-[#EBF2DD] bg-white rounded-2xl border border-[#DEEAC4] overflow-hidden">
              {activeTab === 'transactions'
                ? orders.map((o) => (
                    <div key={o.id} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-[#253126] block">{o.paymentReference || 'QRIS-BS'}</span>
                        <span className="text-[#647966]">{o.paymentMethod} • {o.orderNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-[#253126] block">
                          Rp {o.priceSnapshot.toLocaleString('id-ID')}
                        </span>
                        <span className="badge-clay bg-[#EEFCD9] text-[#24660a] text-[9px]">
                          LUNAS
                        </span>
                      </div>
                    </div>
                  ))
                : usersList.map((u, i) => (
                    <div key={i} className="p-3.5 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-black text-[#253126] block">{u.name}</span>
                        <span className="text-[#647966]">{u.email}</span>
                      </div>
                      <span className="badge-clay bg-[#EEFCD9] text-[#24660a] text-[9px]">
                        PIN Terenkripsi
                      </span>
                    </div>
                  ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
