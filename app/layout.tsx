import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ban Spesialis - Layanan Musik & Audio Production',
  description: 'Platform layanan musik, editing audio, dashboard pelanggan, sistem antrean otomatis dan admin dashboard 3D claymorphic.',
  openGraph: {
    title: 'Ban Spesialis - Layanan Musik & Audio Production',
    description: 'Platform layanan musik, editing audio, dashboard pelanggan, sistem antrean otomatis dan admin dashboard 3D claymorphic.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ban Spesialis - Layanan Musik & Audio Production',
    description: 'Platform layanan musik, editing audio, dashboard pelanggan, sistem antrean otomatis dan admin dashboard 3D claymorphic.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body
        className="min-h-screen bg-[#F5F8E8] text-[#253126] font-sans antialiased selection:bg-[#8FE000] selection:text-[#1a2e14]"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
