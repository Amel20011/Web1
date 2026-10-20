'use client';

import React, { useState } from 'react';
import { ServiceProduct } from '@/lib/types';
import {
  Search,
  Sliders,
  Scissors,
  Mic,
  Radio,
  Music,
  GraduationCap,
  Sparkles,
  Clock,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface ServicesCatalogProps {
  products: ServiceProduct[];
  onSelectProduct: (product: ServiceProduct) => void;
  onViewProductDetail?: (product: ServiceProduct) => void;
}

export function ServicesCatalog({
  products,
  onSelectProduct,
  onViewProductDetail,
}: ServicesCatalogProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((product) => {
    if (!product.isActive) return false;
    const matchSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === 'Semua' || product.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Scissors':
        return Scissors;
      case 'Sliders':
        return Sliders;
      case 'Mic':
        return Mic;
      case 'Radio':
        return Radio;
      case 'Music':
        return Music;
      case 'GraduationCap':
        return GraduationCap;
      default:
        return Sparkles;
    }
  };

  return (
    <div id="catalog" className="w-full space-y-4">
      {/* Search & Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-[#253126]">
            Katalog Layanan & Jasa Musik
          </h3>
          <p className="text-xs text-[#586c5a]">
            Pilih kebutuhan audio Anda untuk diproses oleh audio engineer kami
          </p>
        </div>

        {/* Search input */}
        <div className="relative min-w-[240px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari lagu, pensi, mixing..."
            className="w-full px-3.5 py-2.5 pl-10 rounded-2xl bg-white border-2 border-[#DCE8C8] text-[#253126] placeholder:text-[#8b9e8c] text-xs font-bold shadow-[0_3px_0_#D1DEC0] focus:outline-none focus:border-[#63C926] transition"
          />
          <Search className="w-4 h-4 text-[#63C926] absolute left-3.5 top-3" />
        </div>
      </div>

      {/* Category Filter Pills (Claymorphic) */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-[#8FE000] text-[#1a2e14] border-2 border-[#63C926] shadow-[0_3px_0_#61a600] -translate-y-0.5'
                  : 'bg-white text-[#4f6451] border-2 border-[#DDE7CA] hover:bg-[#FDFEFB] shadow-[0_2px_0_#D5E0C2]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Product Cards Grid */}
      {filteredProducts.length === 0 ? (
        <div className="card-clay p-8 text-center my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F5F8E8] border-2 border-[#DDE7CA] flex items-center justify-center mx-auto mb-3 text-[#798e7b]">
            <Search className="w-7 h-7" />
          </div>
          <h4 className="font-black text-[#253126] text-sm mb-1">
            Layanan tidak ditemukan
          </h4>
          <p className="text-xs text-[#637765]">
            Coba gunakan kata kunci lain seperti &ldquo;Pensi&rdquo;, &ldquo;Mixing&rdquo;, atau &ldquo;Vokal&rdquo;.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => {
            const Icon = getProductIcon(product.iconName);

            return (
              <div
                key={product.id}
                className="card-clay p-5 flex flex-col justify-between hover:-translate-y-1 transition-all"
              >
                <div>
                  {/* Top Bar with Icon & Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-[#E8F8D6] border-2 border-[#C2E898] flex items-center justify-center text-[#2d730f] shadow-[0_3px_0_#b5de8a]">
                      <Icon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    {product.badge && (
                      <span className="badge-clay bg-[#EEFCD9] text-[#24660a] border border-[#C5EA9B]">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  {/* Category & Title */}
                  <span className="text-[11px] font-extrabold text-[#38A9F4] uppercase tracking-wider block mb-1">
                    {product.category}
                  </span>
                  <h4 className="text-base font-black text-[#253126] leading-snug mb-2">
                    {product.name}
                  </h4>

                  <p className="text-xs text-[#526654] font-medium leading-relaxed mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Feature specs: days, revisions, commercial license */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-[#F5F8E8] border border-[#DEE9CE] mb-4 text-[10px] font-bold text-[#4c604e]">
                    <div className="flex flex-col items-center text-center">
                      <Clock className="w-3.5 h-3.5 text-[#38A9F4] mb-0.5" />
                      <span>{product.estimatedDays} Hari</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <RotateCcw className="w-3.5 h-3.5 text-[#FF9B27] mb-0.5" />
                      <span>{product.maxRevisions}x Revisi</span>
                    </div>
                    <div className="flex flex-col items-center text-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#63C926] mb-0.5" />
                      <span>Komersial</span>
                    </div>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="pt-3 border-t border-[#E8F2D5] flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-[#718673] font-bold block leading-none">
                      Mulai dari
                    </span>
                    <span className="text-base font-black text-[#253126]">
                      Rp {product.price.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() => onSelectProduct(product)}
                    className="btn-clay-green px-4 py-2 text-xs font-black shadow-[0_3px_0_#61a600]"
                  >
                    <span>Pesan</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
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
