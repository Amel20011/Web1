import { ProductionStage, StageInfo } from './types';

export const PRODUCTION_STAGES: StageInfo[] = [
  {
    id: 'paid_queued',
    number: 1,
    title: 'Pembayaran Berhasil',
    shortLabel: 'Lunas',
    description:
      'Pembayaran Anda telah berhasil diverifikasi. Pesanan sudah tercatat di sistem dan akan diproses sesuai urutan antrean. Mohon menunggu dan periksa halaman ini secara berkala untuk mendapatkan pembaruan.',
    estimatedTime: 'Seketika',
  },
  {
    id: 'queued',
    number: 2,
    title: 'Menunggu Giliran',
    shortLabel: 'Dalam Antrean',
    description:
      'Pesanan Anda sudah masuk antrean. Tim kami akan mulai mengerjakan pesanan ketika giliran Anda tiba.',
    estimatedTime: '15-45 Menit',
  },
  {
    id: 'in_progress',
    number: 3,
    title: 'Sedang Dikerjakan',
    shortLabel: 'Pengerjaan',
    description:
      'Tim kami sedang mengerjakan pesanan Anda sesuai detail dan kebutuhan yang telah dikirimkan.',
    estimatedTime: '2-4 Jam',
  },
  {
    id: 'quality_control',
    number: 4,
    title: 'Quality Control',
    shortLabel: 'QC Audio',
    description:
      'Hasil pengerjaan sedang diperiksa untuk memastikan kualitas audio, kelengkapan file, dan kesesuaian dengan permintaan Anda.',
    estimatedTime: '10-20 Menit',
  },
  {
    id: 'qc_revision',
    number: 5,
    title: 'Penyempurnaan Hasil',
    shortLabel: 'Revisi QC',
    description:
      'Tim kami sedang melakukan penyesuaian berdasarkan hasil pemeriksaan kualitas sebelum hasil akhir disiapkan.',
    estimatedTime: '20-30 Menit',
  },
  {
    id: 'final_review',
    number: 6,
    title: 'Pemeriksaan Akhir',
    shortLabel: 'Human Error Check',
    description:
      'Kami memeriksa kembali hasil pengerjaan untuk memastikan tidak ada kesalahan manusia, termasuk nada yang tidak sesuai, bagian audio yang terlewat, kesalahan pemotongan, atau ketidaksesuaian lain dengan instruksi Anda.',
    estimatedTime: '15 Menit',
  },
  {
    id: 'packing',
    number: 7,
    title: 'Menyiapkan File',
    shortLabel: 'Packing',
    description:
      'Hasil akhir sedang disiapkan, diperiksa kelengkapannya, dan dikemas untuk dikirim ke alamat Gmail yang terdaftar.',
    estimatedTime: '10 Menit',
  },
  {
    id: 'sent',
    number: 8,
    title: 'Dikirim melalui Gmail',
    shortLabel: 'Dikirim ke Gmail',
    description:
      'Hasil pesanan telah dikirim ke alamat Gmail yang Anda daftarkan. Silakan periksa kotak masuk, folder Spam, dan folder lain apabila email belum terlihat.',
    estimatedTime: 'Terkirim',
  },
  {
    id: 'completed',
    number: 9,
    title: 'Pesanan Selesai',
    shortLabel: 'Selesai',
    description:
      'Pesanan telah diselesaikan dan hasil pengiriman sudah dicatat oleh sistem. Jika Anda belum menerima email, silakan periksa folder Spam atau hubungi Customer Service.',
    estimatedTime: 'Tuntas',
  },
];

export function getStageIndex(stage: ProductionStage): number {
  return PRODUCTION_STAGES.findIndex((s) => s.id === stage);
}

export function getStageInfo(stage: ProductionStage): StageInfo {
  const found = PRODUCTION_STAGES.find((s) => s.id === stage);
  return found || PRODUCTION_STAGES[0];
}

export function isStagePassed(currentStage: ProductionStage, checkStage: ProductionStage): boolean {
  return getStageIndex(currentStage) >= getStageIndex(checkStage);
}

export function getNextStage(currentStage: ProductionStage): ProductionStage | null {
  const currentIndex = getStageIndex(currentStage);
  if (currentIndex < PRODUCTION_STAGES.length - 1) {
    return PRODUCTION_STAGES[currentIndex + 1].id;
  }
  return null;
}
