'use client';

import React, { useState } from 'react';
import { UserProfile, CustomerServiceTicket } from '@/lib/types';
import { INITIAL_FAQS } from '@/lib/mock-data';
import { createTicket, getTickets } from '@/lib/storage';
import {
  X,
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  Send,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface CustomerServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  initialOrderNumber?: string;
}

export function CustomerServiceModal({
  isOpen,
  onClose,
  currentUser,
  initialOrderNumber = '',
}: CustomerServiceModalProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'ticket' | 'my_tickets'>('faq');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  // Form state
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [category, setCategory] = useState<CustomerServiceTicket['category']>('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const userTickets = currentUser ? getTickets(currentUser.id) : [];

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    createTicket({
      userId: currentUser.id,
      userEmail: currentUser.email,
      orderNumber: orderNumber.trim() || undefined,
      category,
      subject,
      message,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSubject('');
      setMessage('');
      setActiveTab('my_tickets');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="w-full max-w-xl bg-white rounded-[32px] border-4 border-[#E2ECCB] shadow-[0_24px_48px_rgba(37,49,38,0.2),0_8px_0_#D3E2BB] p-5 sm:p-7 relative my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[#F5F8E8] hover:bg-[#EBF3D6] text-[#526654] border border-[#DEEAC4] transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#38A9F4] border-2 border-[#208dd7] flex items-center justify-center shadow-[0_4px_0_#1c79b9] text-white">
            <HelpCircle className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#38A9F4]">
              Pusat Dukungan
            </span>
            <h3 className="text-xl font-black text-[#253126]">
              Customer Service Center
            </h3>
          </div>
        </div>

        {/* Tab switchers */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-[#F5F8E8] border border-[#DEEAC4] mb-5">
          <button
            onClick={() => setActiveTab('faq')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'faq'
                ? 'bg-white text-[#253126] shadow-xs border border-[#DCE8C8]'
                : 'text-[#647966] hover:text-[#253126]'
            }`}
          >
            FAQ & Panduan
          </button>
          <button
            onClick={() => setActiveTab('ticket')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'ticket'
                ? 'bg-white text-[#253126] shadow-xs border border-[#DCE8C8]'
                : 'text-[#647966] hover:text-[#253126]'
            }`}
          >
            Kirim Tiket
          </button>
          <button
            onClick={() => setActiveTab('my_tickets')}
            className={`flex-1 py-2 rounded-xl text-xs font-black transition ${
              activeTab === 'my_tickets'
                ? 'bg-white text-[#253126] shadow-xs border border-[#DCE8C8]'
                : 'text-[#647966] hover:text-[#253126]'
            }`}
          >
            Tiket Saya ({userTickets.length})
          </button>
        </div>

        {/* TAB 1: FAQ */}
        {activeTab === 'faq' && (
          <div className="space-y-3">
            {INITIAL_FAQS.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border-2 border-[#DEEAC4] bg-[#FDFEFB] overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-3.5 text-left flex items-center justify-between gap-2 hover:bg-[#F5F8E8] transition"
                  >
                    <span className="text-xs font-black text-[#253126]">
                      {faq.q}
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#63C926] shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#7b917c] shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="p-3.5 pt-0 text-xs text-[#526654] font-medium leading-relaxed border-t border-[#EBF3D8] bg-[#F8FAF0]">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="p-3.5 rounded-2xl bg-[#E8F6FE] border border-[#C5E6FC] flex items-center justify-between text-xs font-bold text-[#1a5b8a] mt-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#38A9F4]" />
                <span>Jam Operasional: 08.00 - 22.00 WIB</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBMIT TICKET */}
        {activeTab === 'ticket' && (
          <div>
            {!currentUser ? (
              <p className="text-xs text-center text-[#556957] py-6">
                Silakan masuk dengan akun Gmail Anda terlebih dahulu untuk mengirimkan tiket bantuan.
              </p>
            ) : submitted ? (
              <div className="text-center py-6">
                <CheckCircle2 className="w-12 h-12 text-[#63C926] mx-auto mb-2" />
                <h4 className="text-sm font-black text-[#253126]">
                  Tiket Berhasil Terkirim!
                </h4>
                <p className="text-xs text-[#556957]">
                  Admin Ban Spesialis akan segera membalas pertanyaan Anda.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitTicket} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Nomor Pesanan (Jika relevan)
                  </label>
                  <input
                    type="text"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="Contoh: ORD-202610-001"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold focus:outline-none focus:border-[#63C926] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Kategori Pertanyaan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold focus:outline-none focus:border-[#63C926] transition"
                  >
                    <option value="general">Pertanyaan Umum</option>
                    <option value="audio_revision">Permintaan Revisi Audio</option>
                    <option value="queue_status">Status Nomor Antrean</option>
                    <option value="file_delivery">Pengiriman File via Gmail</option>
                    <option value="payment">Konfirmasi Pembayaran</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Subjek / Judul Kendala
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Contoh: Belum menerima email pengiriman audio"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold focus:outline-none focus:border-[#63C926] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#354937] mb-1">
                    Pesan Detail
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tuliskan kendala Anda secara lengkap..."
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-xs font-semibold focus:outline-none focus:border-[#63C926] transition"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-clay-green py-2.5 text-xs font-black shadow-[0_3px_0_#61a600] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Tiket Bantuan</span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* TAB 3: MY TICKETS */}
        {activeTab === 'my_tickets' && (
          <div className="space-y-3">
            {userTickets.length === 0 ? (
              <p className="text-xs text-center text-[#556957] py-6">
                Belum ada tiket bantuan yang diajukan.
              </p>
            ) : (
              userTickets.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#253126]">
                      {t.ticketNumber} • {t.subject}
                    </span>
                    <span
                      className={`badge-clay text-[9px] ${
                        t.status === 'resolved'
                          ? 'bg-[#EEFCD9] text-[#24660a]'
                          : 'bg-[#FFF3E6] text-[#c56d07]'
                      }`}
                    >
                      {t.status === 'resolved' ? 'Terjawab' : 'Menunggu Balasan'}
                    </span>
                  </div>
                  <p className="text-xs text-[#526654]">{t.message}</p>
                  {t.adminReply && (
                    <div className="mt-2 p-2.5 rounded-xl bg-white border border-[#DCE8C8] text-xs">
                      <strong className="text-[#253126] block mb-0.5">
                        Balasan Admin Ban Spesialis:
                      </strong>
                      <p className="text-[#3b4f3d]">{t.adminReply}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
