'use client';

import React from 'react';
import { PromoCardItem, ServicePackage } from '@/lib/types';
import { Check, Zap, Sparkles, ArrowRight } from 'lucide-react';

interface PromoCardsProps {
  promoCards: PromoCardItem[];
  packages: ServicePackage[];
  onSelectPromo: (promo: PromoCardItem) => void;
  onSelectPackage: (pkg: ServicePackage) => void;
}

export function PromoCards({
  promoCards,
  packages,
  onSelectPromo,
  onSelectPackage,
}: PromoCardsProps) {
  const getCardClass = (colorScheme: PromoCardItem['colorScheme']) => {
    switch (colorScheme) {
      case 'lime':
        return 'card-clay-lime border-[#D0F1AB]';
      case 'blue':
        return 'card-clay-blue border-[#CBE7FC]';
      case 'orange':
        return 'card-clay-orange border-[#FBDDB8]';
      case 'yellow':
        return 'card-clay-yellow border-[#F4E99B]';
      default:
        return 'card-clay';
    }
  };

  const getButtonClass = (colorScheme: PromoCardItem['colorScheme']) => {
    switch (colorScheme) {
      case 'lime':
        return 'btn-clay-green text-xs font-black shadow-[0_4px_0_#61a600]';
      case 'blue':
        return 'btn-clay-blue text-xs font-black shadow-[0_4px_0_#1c79b9]';
      case 'orange':
        return 'btn-clay-orange text-xs font-black shadow-[0_4px_0_#ca6f07]';
      default:
        return 'btn-clay-white text-xs font-black';
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#253126]">
            Paket Unggulan & Promosi
          </h3>
          <p className="text-xs text-[#596e5b] font-medium">
            Pilih paket rekaman & editing audio sesuai kebutuhan Anda
          </p>
        </div>
      </div>

      {/* Horizontal Scroll on Mobile, 3-Columns on Desktop */}
      <div className="flex gap-4 overflow-x-auto pb-4 pt-1 px-1 no-scrollbar sm:grid sm:grid-cols-3 sm:overflow-visible">
        {promoCards.map((promo) => {
          const matchedPkg = packages.find((p) => p.id === promo.linkTarget);
          const price = matchedPkg ? matchedPkg.price : promo.price;

          return (
            <div
              key={promo.id}
              className={`min-w-[285px] sm:min-w-0 p-5 flex flex-col justify-between ${getCardClass(
                promo.colorScheme
              )} transition-transform hover:-translate-y-1`}
            >
              <div>
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-clay bg-white text-[#253126] border border-[#DEE9CE] flex items-center gap-1 whitespace-nowrap">
                    {promo.colorScheme === 'blue' ? (
                      <Zap className="w-3 h-3 text-[#38A9F4] fill-current" />
                    ) : (
                      <Sparkles className="w-3 h-3 text-[#FF9B27] fill-current" />
                    )}
                    {promo.badge}
                  </span>
                </div>

                <h4 className="text-lg font-black text-[#253126] mb-1">
                  {promo.title}
                </h4>

                {/* Price Display */}
                <div className="mb-4">
                  <span className="text-2xl font-black text-[#253126]">
                    Rp {price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] font-bold text-[#647966] ml-1">
                    / pesanan
                  </span>
                </div>

                {/* Benefits List */}
                <ul className="space-y-2 mb-5">
                  {promo.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs font-semibold text-[#3b4e3d]">
                      <div className="w-4 h-4 rounded-full bg-white border border-[#D5E3C0] flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                        <Check className="w-2.5 h-2.5 text-[#63C926] stroke-[3]" />
                      </div>
                      <span className="leading-tight">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  if (matchedPkg) {
                    onSelectPackage(matchedPkg);
                  } else {
                    onSelectPromo(promo);
                  }
                }}
                className={`w-full py-2.5 rounded-2xl ${getButtonClass(
                  promo.colorScheme
                )} flex items-center justify-center gap-1.5`}
              >
                <span>{promo.buttonText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
