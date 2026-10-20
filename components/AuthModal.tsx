'use client';

import React, { useState } from 'react';
import { Mail, KeyRound, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, X, RefreshCw } from 'lucide-react';
import { UserProfile } from '@/lib/types';
import { isValidGmail, normalizeEmail, isValidPin, checkPinRateLimit, registerPinAttempt, RateLimitState } from '@/lib/auth-logic';
import { findUserCredential, saveUserCredential, setCurrentUser } from '@/lib/storage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  welcomeMessage?: string;
}

type AuthStep =
  | 'input_email'
  | 'registered_confirm'
  | 'input_pin'
  | 'verify_otp'
  | 'create_pin'
  | 'confirm_pin'
  | 'recovery_otp'
  | 'reset_pin';

export function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  welcomeMessage = 'Halo, selamat datang di Ban Spesialis. Silakan masukkan alamat Gmail Anda untuk melanjutkan.',
}: AuthModalProps) {
  const [step, setStep] = useState<AuthStep>('input_email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');

  // Rate limiting state
  const [rateLimitState, setRateLimitState] = useState<RateLimitState>({
    failedAttempts: 0,
    lockedUntil: null,
  });

  if (!isOpen) return null;

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanEmail = normalizeEmail(email);

    if (!isValidGmail(cleanEmail)) {
      setErrorMessage('Harap masukkan alamat Gmail yang valid (contoh: nama@gmail.com)');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const existing = findUserCredential(cleanEmail);
      if (existing) {
        setStep('registered_confirm');
      } else {
        // New user -> send simulated OTP
        setSuccessNotice('Kode verifikasi 6 digit telah dikirim ke kotak masuk Gmail Anda (Simulasi: 123456).');
        setStep('verify_otp');
      }
    }, 400);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (otpCode.length < 6) {
      setErrorMessage('Masukkan 6-digit kode verifikasi');
      return;
    }
    // Accept standard demo OTP 123456 or any 6 digits for testing
    setSuccessNotice('Email berhasil diverifikasi! Sekarang buat PIN 4-digit Anda.');
    setStep('create_pin');
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!isValidPin(pin)) {
      setErrorMessage('PIN harus tepat 4 angka (0000 - 9999)');
      return;
    }
    setStep('confirm_pin');
  };

  const handleConfirmPin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (pin !== confirmPin) {
      setErrorMessage('PIN konfirmasi tidak sama. Silakan coba lagi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const cleanEmail = normalizeEmail(email);
      const displayName = name.trim() || cleanEmail.split('@')[0];

      saveUserCredential(cleanEmail, pin, displayName);

      const newUser: UserProfile = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: displayName,
        role: 'customer',
        createdAt: new Date().toISOString(),
        status: 'active',
      };

      setCurrentUser(newUser);
      onSuccess(newUser);
      onClose();
    }, 400);
  };

  const handleLoginPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check rate limit
    const limit = checkPinRateLimit(rateLimitState);
    if (!limit.allowed) {
      setErrorMessage(
        `Terlalu banyak percobaan PIN salah. Akun terkunci sementara selama ${limit.remainingLockSeconds} detik demi keamanan.`
      );
      return;
    }

    if (!isValidPin(pin)) {
      setErrorMessage('PIN harus berupa 4 angka.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const cleanEmail = normalizeEmail(email);
      const cred = findUserCredential(cleanEmail);

      if (cred && cred.pinHash === pin) {
        // Success
        setRateLimitState({ failedAttempts: 0, lockedUntil: null });
        const user: UserProfile = {
          id: `usr-${cleanEmail.replace(/[^a-z0-9]/g, '')}`,
          email: cred.email,
          name: cred.name,
          role: 'customer',
          createdAt: cred.updatedAt,
          status: 'active',
        };
        setCurrentUser(user);
        onSuccess(user);
        onClose();
      } else {
        // Failure
        const nextState = registerPinAttempt(rateLimitState, false);
        setRateLimitState(nextState);
        if (nextState.lockedUntil) {
          setErrorMessage('PIN salah 5 kali! Akun dikunci selama 60 detik untuk mencegah tebakan PIN.');
        } else {
          setErrorMessage(`PIN yang Anda masukkan salah. Sisa percobaan: ${5 - nextState.failedAttempts}`);
        }
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-[32px] border-4 border-[#E2ECCB] shadow-[0_20px_40px_rgba(37,49,38,0.18),0_8px_0_#D3E2BB] p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-[#F5F8E8] hover:bg-[#EBF3D6] text-[#526654] border border-[#DEEAC4] transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Input Gmail */}
        {step === 'input_email' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#61a600] text-[#1a2e14]">
              <Mail className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-[#253126] mb-2">
              Masuk / Registrasi
            </h3>
            <p className="text-xs sm:text-sm text-center text-[#556957] mb-6 leading-relaxed">
              {welcomeMessage}
            </p>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d503f] mb-1.5">
                  Alamat Gmail Anda
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="namaanda@gmail.com"
                    required
                    className="w-full px-4 py-3 pl-11 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] placeholder:text-[#889d8a] font-semibold text-sm focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                  />
                  <Mail className="w-5 h-5 text-[#63C926] absolute left-3.5 top-3.5" />
                </div>
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-clay-green py-3.5 text-sm font-extrabold shadow-[0_5px_0_#61a600]"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1a2e14]" />
                ) : (
                  <>
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Email Already Registered */}
        {step === 'registered_confirm' && (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#38A9F4] border-2 border-[#208dd7] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#1c79b9] text-white">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-[#253126] mb-2">
              Akun Ditemukan
            </h3>
            <p className="text-xs sm:text-sm text-[#4c604e] mb-4 leading-relaxed bg-[#EBF7FD] p-3 rounded-2xl border border-[#C6E6F9]">
              Email <span className="font-bold text-[#145b8a]">{email}</span> sudah terdaftar di database kami. Apakah ini akun Anda? Silakan verifikasi untuk melanjutkan.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => setStep('input_pin')}
                className="w-full btn-clay-green py-3 text-sm font-black"
              >
                Ya, Ini Akun Saya (Masukkan PIN)
              </button>

              <button
                onClick={() => {
                  setEmail('');
                  setErrorMessage('');
                  setStep('input_email');
                }}
                className="w-full btn-clay-white py-3 text-sm font-bold"
              >
                Gunakan Email Lain
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Enter 4-digit PIN for Registered User */}
        {step === 'input_pin' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#61a600] text-[#1a2e14]">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-[#253126] mb-1">
              Masukkan PIN Anda
            </h3>
            <p className="text-xs text-center text-[#556957] mb-6">
              Akun: <span className="font-bold">{email}</span>
            </p>

            <form onSubmit={handleLoginPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d503f] mb-1.5 text-center">
                  PIN 4 Digit
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-black px-4 py-3 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-clay-green py-3.5 text-sm font-extrabold shadow-[0_5px_0_#61a600]"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1a2e14]" /> : 'Masuk ke Dashboard'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessNotice('Kode reset PIN telah dikirim ke Gmail Anda.');
                    setStep('verify_otp');
                  }}
                  className="text-[#38A9F4] font-bold hover:underline"
                >
                  Lupa PIN?
                </button>
                <button
                  type="button"
                  onClick={() => setStep('input_email')}
                  className="text-[#697d6a] hover:underline"
                >
                  Ganti Akun
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 4: OTP Verification for New Email or Recovery */}
        {step === 'verify_otp' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#8CEEDC] border-2 border-[#5cc8b7] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#4cb2a2] text-[#0d554a]">
              <KeyRound className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-[#253126] mb-1">
              Verifikasi Kepemilikan Email
            </h3>
            <p className="text-xs text-center text-[#556957] mb-4">
              Kode OTP 6-digit telah dikirim ke <span className="font-bold">{email}</span>
            </p>

            {successNotice && (
              <div className="p-3 mb-4 rounded-2xl bg-[#EEFAEE] border border-[#BCE8BC] text-[#1c601c] text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#63C926]" />
                <span>{successNotice}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d503f] mb-1.5 text-center">
                  Masukkan Kode 6-Digit
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  autoFocus
                  required
                  className="w-56 mx-auto block text-center tracking-[0.5em] text-xl font-black px-4 py-3 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-clay-green py-3.5 text-sm font-extrabold shadow-[0_5px_0_#61a600]"
              >
                Verifikasi Email
              </button>
            </form>
          </div>
        )}

        {/* Step 5: Create 4-Digit PIN */}
        {step === 'create_pin' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#FF9B27] border-2 border-[#e68310] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#ca6f07] text-white">
              <Lock className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-[#253126] mb-1">
              Buat PIN Keamanan
            </h3>
            <p className="text-xs text-center text-[#556957] mb-5">
              Buat 4 angka rahasia untuk masuk ke akun Anda setiap kali berkunjung.
            </p>

            <form onSubmit={handleCreatePin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#3d503f] mb-1.5">
                  Nama Anda / Musisi
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Amel Musisi"
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] text-[#253126] font-semibold text-sm focus:outline-none focus:border-[#63C926] focus:bg-white transition mb-3"
                />

                <label className="block text-xs font-bold text-[#3d503f] mb-1.5 text-center">
                  PIN 4 Digit
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-black px-4 py-3 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full btn-clay-green py-3.5 text-sm font-extrabold shadow-[0_5px_0_#61a600]"
              >
                Lanjutkan ke Konfirmasi
              </button>
            </form>
          </div>
        )}

        {/* Step 6: Confirm 4-Digit PIN */}
        {step === 'confirm_pin' && (
          <div>
            <div className="w-14 h-14 rounded-2xl bg-[#8FE000] border-2 border-[#63C926] flex items-center justify-center mx-auto mb-4 shadow-[0_6px_0_#61a600] text-[#1a2e14]">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-black text-center text-[#253126] mb-1">
              Konfirmasi PIN Anda
            </h3>
            <p className="text-xs text-center text-[#556957] mb-5">
              Masukkan kembali 4 angka PIN yang baru saja Anda buat.
            </p>

            <form onSubmit={handleConfirmPin} className="space-y-4">
              <div>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="••••"
                  autoFocus
                  required
                  className="w-48 mx-auto block text-center tracking-[1em] text-2xl font-black px-4 py-3 rounded-2xl bg-[#F5F8E8] border-2 border-[#DEEAC4] focus:outline-none focus:border-[#63C926] focus:bg-white transition"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border-2 border-red-200 text-red-700 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-clay-green py-3.5 text-sm font-extrabold shadow-[0_5px_0_#61a600]"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin mx-auto text-[#1a2e14]" /> : 'Simpan & Masuk Akun'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmPin('');
                  setStep('create_pin');
                }}
                className="w-full text-center text-xs text-[#556957] font-bold hover:underline"
              >
                Kembali Ubah PIN
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
