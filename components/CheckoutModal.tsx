'use client';

import React, { useState } from 'react';
import { ServiceProduct, ServicePackage, UserProfile, Order } from '@/lib/types';
import { createNewOrder } from '@/lib/storage';
import { isValidGmail } from '@/lib/auth-logic';
import {
  X,
  Sparkles,
  Zap,
  CheckCircle2,
  QrCode,
  CreditCard,
  Wallet,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  selectedProduct: ServiceProduct | null;
  selectedPackage: ServicePackage | null;
  packages: ServicePackage[];
  onOrderSuccess: (order: Order) => void;
  onOpenAuth: () => void;
}

type CheckoutStep = 'form' | 'payment' | 'success';

export function CheckoutModal({
  isOpen,
  onClose,
  currentUser,
  selectedProduct,
  selectedPackage,
  packages,
  onOrderSuccess,
  onOpenAuth,
}: CheckoutModalProps) {
  const [step, setStep] = useState<CheckoutStep>('form');
  const [packageType, setPackageType] = useState<'basic' | 'premium'>(
    selectedPackage ? selectedPackage.id : 'basic'
  );
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [audioReferenceUrl, setAudioReferenceUrl] = useState('');
  const [recipientGmail, setRecipientGmail] = useState(currentUser?.email || '');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('QRIS Real-Time');
  const [loading, setLoading] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate pricing snapshot
  const activePkg = packages.find((p) => p.id === packageType) || packages[0];
  const basePrice = selectedProduct ? selectedProduct.price : activePkg.price;
  // If user chooses Premium package for a custom product, add premium upgrade difference
  const finalPrice =
    packageType === 'premium' ? Math.max(activePkg.price, basePrice + 100000) : basePrice;

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!currentUser) {
      onOpenAuth();
      return;
    }

    if (!projectName.trim()) {
      setErrorMsg('Harap isi nama proyek musik Anda.');
      return;
    }

    if (!isValidGmail(recipientGmail)) {
      setErrorMsg('Alamat Gmail penerima hasil harus berakhiran @gmail.com yang valid.');
      return;
    }

    setStep('payment');
  };

  const handleConfirmPayment = () => {
    if (!currentUser) return;
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const serviceName = selectedProduct ? selectedProduct.name : activePkg.name;
      const serviceId = selectedProduct ? selectedProduct.id : `pkg-${packageType}`;

      const newOrder = createNewOrder({
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        serviceId,
        serviceName,
        packageType,
        projectName,
        projectDescription: projectDescription || 'Pengerjaan standar sesuai paket yang dipilih.',
        audioReferenceUrl: audioReferenceUrl || undefined,
        recipientGmail: recipientGmail.toLowerCase().trim(),
        notes: notes || undefined,
        priceSnapshot: finalPrice,
        paymentStatus: 'paid', // Verified through mock payment gateway
        paymentMethod,
        paymentReference: `PAY-BS-${Date.now().toString().slice(-8)}`,
        isPriority: packageType === 'premium',
      });

      setCreatedOrder(newOrder);
      setStep('success');
      onOrderSuccess(newOrder);
    }, 600);
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

        {/* STEP 1: FORM */}
        {step === 'form' && (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#38A9F4] block mb-1">
                Form Pemesanan Layanan Musik
              </span>
              <h3 className="text-xl font-black text-[#253126]">
                {selectedProduct ? selectedProduct.name : 'Pemesanan Paket Musik'}
              </h3>
            </div>

            <form onSubmit={handleProceedToPayment} className="space-y-4">
              {/* Package selector */}
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-2">
                  Pilihan Paket:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPackageType('basic')}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all ${
                      packageType === 'basic'
                        ? 'bg-[#EEFCD9] border-[#63C926] shadow-[0_3px_0_#61a600]'
                        : 'bg-white border-[#DEEAC4] hover:bg-[#F9FCF2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-[#253126]">
                        Paket Basic
                      </span>
                      <span className="text-[10px] font-bold bg-white text-[#2d730f] px-2 py-0.5 rounded-lg border border-[#C5EA9B]">
                        3x Revisi
                      </span>
                    </div>
                    <p className="text-[11px] text-[#556957]">
                      Format MP3/WAV, Antrean Standar
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPackageType('premium')}
                    className={`p-3.5 rounded-2xl text-left border-2 transition-all ${
                      packageType === 'premium'
                        ? 'bg-[#E8F6FE] border-[#38A9F4] shadow-[0_3px_0_#1e7ebd]'
                        : 'bg-white border-[#DEEAC4] hover:bg-[#F9FCF2]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-black text-[#253126]">
                        Paket Premium VIP
                      </span>
                      <span className="text-[10px] font-bold bg-[#38A9F4] text-white px-1.5 py-0.5 rounded-lg flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5 fill-current" />
                        VIP
                      </span>
                    </div>
                    <p className="text-[11px] text-[#556957]">
                      Prioritas Antrean, 10x Revisi, File Mentah Stems
                    </p>
                  </button>
                </div>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  Nama Proyek Musik <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Contoh: Lagu Senam Pagi / Medley Tari SMA 1"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] font-semibold text-xs focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {/* Recipient Gmail */}
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  Alamat Gmail Penerima Hasil <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={recipientGmail}
                  onChange={(e) => setRecipientGmail(e.target.value)}
                  placeholder="namaanda@gmail.com"
                  required
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] font-semibold text-xs focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
                <p className="text-[10px] text-[#697d6a] mt-0.5">
                  File master audio dan link unduhan privat akan dikirim ke Gmail ini.
                </p>
              </div>

              {/* Project Requirements / Description */}
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  Detail Kebutuhan & Petunjuk Audio
                </label>
                <textarea
                  rows={2}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Jelaskan bagian lagu mana yang ingin dipotong, tempo, atau efek vokal yang diinginkan..."
                  className="w-full px-4 py-2 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] font-semibold text-xs focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {/* Reference Link */}
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  Link Referensi Audio / File Bahan (Opsional)
                </label>
                <input
                  type="url"
                  value={audioReferenceUrl}
                  onChange={(e) => setAudioReferenceUrl(e.target.value)}
                  placeholder="https://drive.google.com/... atau link YouTube"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] font-semibold text-xs focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {/* Pricing summary */}
              <div className="p-3 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-[#647966] block">
                    Total Biaya
                  </span>
                  <span className="text-xl font-black text-[#253126]">
                    Rp {finalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="text-right">
                  <span className="badge-clay bg-white text-[#253126] border border-[#DEEAC4] text-[10px]">
                    {packageType === 'premium' ? 'Antrean Prioritas VIP' : 'Antrean Standar'}
                  </span>
                </div>
              </div>

              {errorMsg && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                  {errorMsg}
                </p>
              )}

              <button
                type="submit"
                className="w-full btn-clay-green py-3 text-sm font-black shadow-[0_4px_0_#61a600]"
              >
                <span>Lanjut ke Pembayaran</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </form>
          </div>
        )}

        {/* STEP 2: PAYMENT METHOD SELECTION */}
        {step === 'payment' && (
          <div>
            <div className="mb-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#63C926] block mb-1">
                Verifikasi Pembayaran
              </span>
              <h3 className="text-xl font-black text-[#253126]">
                Pilih Metode Pembayaran
              </h3>
              <p className="text-xs text-[#556957]">
                Total Bayar:{' '}
                <strong className="text-base text-[#1a2e14]">
                  Rp {finalPrice.toLocaleString('id-ID')}
                </strong>
              </p>
            </div>

            <div className="space-y-2.5 mb-5">
              {[
                { name: 'QRIS Real-Time', icon: QrCode, desc: 'BCA, GoPay, OVO, Dana, ShopeePay' },
                { name: 'BCA Virtual Account', icon: CreditCard, desc: 'Otomatis terverifikasi 24 jam' },
                { name: 'Mandiri / BRI Virtual Account', icon: CreditCard, desc: 'Verifikasi instan' },
                { name: 'GoPay E-Wallet', icon: Wallet, desc: 'Pembayaran praktis satu klik' },
              ].map((m) => (
                <button
                  key={m.name}
                  onClick={() => setPaymentMethod(m.name)}
                  className={`w-full p-3.5 rounded-2xl flex items-center justify-between border-2 transition-all ${
                    paymentMethod === m.name
                      ? 'bg-[#EEFCD9] border-[#63C926] shadow-[0_3px_0_#61a600]'
                      : 'bg-white border-[#DEEAC4] hover:bg-[#F9FCF2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-white border border-[#D8E4C2] flex items-center justify-center text-[#253126]">
                      <m.icon className="w-5 h-5 text-[#63C926]" />
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-black text-[#253126]">{m.name}</p>
                      <p className="text-[10px] text-[#697d6a]">{m.desc}</p>
                    </div>
                  </div>
                  {paymentMethod === m.name && (
                    <CheckCircle2 className="w-5 h-5 text-[#63C926] stroke-[2.5]" />
                  )}
                </button>
              ))}
            </div>

            {/* Simulated QRIS Box */}
            {paymentMethod === 'QRIS Real-Time' && (
              <div className="p-4 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-center mb-5">
                <p className="text-xs font-black text-[#253126] mb-2">
                  QRIS BAN SPESIALIS AUDIO STUDIO
                </p>
                <div className="w-32 h-32 bg-white rounded-2xl border-2 border-[#D2DEC4] mx-auto flex items-center justify-center shadow-inner mb-2">
                  <QrCode className="w-24 h-24 text-[#253126]" />
                </div>
                <p className="text-[10px] text-[#607461]">
                  Scan kode QR di atas menggunakan aplikasi bank atau e-wallet Anda.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="btn-clay-white px-4 py-3 text-xs font-bold"
              >
                Kembali
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={handleConfirmPayment}
                className="flex-1 btn-clay-green py-3 text-sm font-black shadow-[0_4px_0_#61a600]"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1a2e14]" />
                ) : (
                  <span>Konfirmasi & Bayar Sekarang</span>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & QUEUE NUMBER ASSIGNMENT */}
        {step === 'success' && createdOrder && (
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-3xl bg-[#8FE000] border-3 border-[#63C926] flex items-center justify-center mx-auto mb-3 shadow-[0_6px_0_#61a600] text-[#1a2e14]">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <span className="badge-clay bg-[#EEFCD9] text-[#24660a] border border-[#C5EA9B] mb-2">
              Pembayaran Berhasil Diverifikasi
            </span>

            <h3 className="text-2xl font-black text-[#253126] mb-1">
              Nomor Antrean Anda Diterbitkan!
            </h3>

            {/* Big Queue Badge */}
            <div className="my-4 p-4 rounded-3xl bg-gradient-to-r from-[#8FE000] to-[#63C926] text-[#1a2e14] border-3 border-white shadow-[0_8px_0_#4fa81c] inline-block px-8">
              <span className="text-xs font-bold uppercase tracking-wider block opacity-85">
                Nomor Antrean Musik
              </span>
              <span className="text-3xl font-black tracking-wider">
                {createdOrder.queueNumber || '#BANDLAB'}
              </span>
            </div>

            <p className="text-xs text-[#526654] max-w-sm mx-auto mb-6 leading-relaxed">
              Pesanan <strong>{createdOrder.orderNumber}</strong> ({createdOrder.serviceName}) telah masuk antrean produksi. Anda dapat memantau progres pengerjaannya secara langsung.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  onClose();
                  // Reset states for next booking
                  setStep('form');
                }}
                className="w-full btn-clay-green py-3 text-sm font-black shadow-[0_4px_0_#61a600]"
              >
                Lihat Antrean & Lacak Pesanan
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
