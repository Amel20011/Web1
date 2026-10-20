'use client';

import React, { useState } from 'react';
import { UserProfile } from '@/lib/types';
import { isValidPin } from '@/lib/auth-logic';
import { saveUserCredential } from '@/lib/storage';
import {
  UserCircle,
  Mail,
  KeyRound,
  ShieldCheck,
  HelpCircle,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Headphones,
  Lock,
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenCS: () => void;
}

export function ProfileView({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenCS,
}: ProfileViewProps) {
  const [showPinChange, setShowPinChange] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [pinSuccess, setPinSuccess] = useState('');
  const [pinError, setPinError] = useState('');

  if (!currentUser) {
    return (
      <div className="card-clay p-8 text-center my-6 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center mx-auto mb-4 text-[#1a2e14] shadow-[0_4px_0_#61a600]">
          <UserCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-[#253126] mb-1">
          Belum Masuk Akun
        </h3>
        <p className="text-xs text-[#526654] mb-6 leading-relaxed">
          Masuk dengan akun Gmail Anda untuk melihat profil, mengelola PIN keamanan, dan mengakses pesanan Anda.
        </p>
        <button
          onClick={onOpenAuth}
          className="btn-clay-green w-full py-3 text-sm font-black shadow-[0_4px_0_#61a600]"
        >
          Masuk dengan Gmail
        </button>
      </div>
    );
  }

  const handleUpdatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    setPinSuccess('');

    if (!isValidPin(newPin)) {
      setPinError('PIN baru harus tepat 4 angka');
      return;
    }

    if (newPin !== confirmNewPin) {
      setPinError('Konfirmasi PIN baru tidak sesuai');
      return;
    }

    saveUserCredential(currentUser.email, newPin, currentUser.name);
    setPinSuccess('PIN keamanan 4-digit berhasil diperbarui!');
    setOldPin('');
    setNewPin('');
    setConfirmNewPin('');
    setTimeout(() => {
      setShowPinChange(false);
      setPinSuccess('');
    }, 1500);
  };

  return (
    <div className="w-full space-y-4 max-w-2xl mx-auto">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-[#253126]">
          Profil & Keamanan Akun
        </h2>
        <p className="text-xs text-[#526654]">
          Kelola data akun, PIN 4-digit, dan layanan bantuan Ban Spesialis
        </p>
      </div>

      {/* User Card */}
      <div className="card-clay p-5 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        <div className="w-16 h-16 rounded-3xl bg-[#8FE000] border-3 border-[#63C926] flex items-center justify-center text-[#1a2e14] font-black text-2xl shadow-[0_5px_0_#61a600] shrink-0">
          {currentUser.name ? currentUser.name[0].toUpperCase() : 'M'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
            <h3 className="text-lg font-black text-[#253126]">
              {currentUser.name}
            </h3>
            <span className="badge-clay bg-[#EEFCD9] text-[#24660a] border border-[#C5EA9B] text-[10px]">
              Akun Terverifikasi
            </span>
          </div>

          <p className="text-xs text-[#526654] font-semibold flex items-center justify-center sm:justify-start gap-1 mb-2">
            <Mail className="w-3.5 h-3.5 text-[#38A9F4]" />
            <span>{currentUser.email}</span>
          </p>

          <p className="text-[11px] text-[#718673]">
            Bergabung sejak: {new Date(currentUser.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Security & PIN Section */}
      <div className="card-clay p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E8F6FE] border-2 border-[#BCE2FB] flex items-center justify-center text-[#1f84c8] shadow-[0_2px_0_#b2dcf8]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-black text-[#253126]">
                PIN Keamanan 4-Digit
              </h4>
              <p className="text-[11px] text-[#556957]">
                Digunakan untuk autentikasi saat masuk akun
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowPinChange(!showPinChange)}
            className="btn-clay-white px-3.5 py-1.5 text-xs font-bold"
          >
            {showPinChange ? 'Batal' : 'Ubah PIN'}
          </button>
        </div>

        {showPinChange && (
          <form onSubmit={handleUpdatePin} className="pt-3 border-t border-[#E8F2D5] space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  PIN Baru (4 Digit)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  required
                  className="w-full text-center tracking-[0.5em] text-lg font-black px-4 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#354937] mb-1">
                  Konfirmasi PIN Baru
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmNewPin}
                  onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  required
                  className="w-full text-center tracking-[0.5em] text-lg font-black px-4 py-2 rounded-xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>
            </div>

            {pinError && (
              <p className="text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl border border-red-200">
                {pinError}
              </p>
            )}

            {pinSuccess && (
              <p className="text-xs font-bold text-green-700 bg-green-50 p-2 rounded-xl border border-green-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span>{pinSuccess}</span>
              </p>
            )}

            <button
              type="submit"
              className="btn-clay-green px-5 py-2 text-xs font-black shadow-[0_3px_0_#61a600]"
            >
              Simpan PIN Baru
            </button>
          </form>
        )}
      </div>

      {/* Customer Service & Help */}
      <div className="card-clay p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#FFF3E6] border-2 border-[#FBDCB5] flex items-center justify-center text-[#c56d07] shadow-[0_2px_0_#f4cca1]">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-black text-[#253126]">
              Customer Service Center
            </h4>
            <p className="text-[11px] text-[#556957]">
              FAQ, panduan pengiriman Gmail, & tiket bantuan
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCS}
          className="btn-clay-blue px-4 py-2 text-xs font-black"
        >
          Buka CS
        </button>
      </div>

      {/* Logout Action */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-3 rounded-2xl bg-white border-2 border-red-200 text-red-600 hover:bg-red-50 text-xs font-black shadow-[0_3px_0_#fbd3d3] active:translate-y-0.5 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar dari Akun (Logout)</span>
        </button>
      </div>
    </div>
  );
}
