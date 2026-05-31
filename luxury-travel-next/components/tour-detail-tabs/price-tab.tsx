'use client';

import { Info, Tag } from 'lucide-react';

interface PricingRow {
  label: string;
  price: string;
  originalPrice?: string;
  badge?: string;
}

interface PriceTabProps {
  pricing: PricingRow[];
  notes?: string[];
}

export function PriceTab({ pricing, notes }: PriceTabProps) {
  return (
    <div className="space-y-6">
      {/* Price Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-gray-800 mb-2" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          Tour Pricing
        </h2>
        <p className="text-gray-500 text-sm mb-5">All prices shown are per person based on twin/double sharing</p>

        <div className="space-y-3">
          {pricing.map((tier, i) => (
            <div
              key={i}
              className={`relative rounded-xl border-2 p-4 flex items-center justify-between transition-all hover:shadow-md cursor-pointer ${
                tier.badge ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white hover:border-orange-200'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-4">
                  <span className="text-xs bg-orange-500 text-white px-3 py-0.5 rounded-full shadow">
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">
                  🏨
                </div>
                <div>
                  <p className="text-gray-800 text-sm" style={{ fontWeight: 600 }}>
                    {tier.label}
                  </p>
                </div>
              </div>

              <div className="text-right">
                {tier.originalPrice && (
                  <div className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-gray-400 text-sm line-through">{tier.originalPrice}</span>
                  </div>
                )}
                <div className="text-gray-800" style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  {tier.price}
                </div>
                <p className="text-gray-400 text-xs">/pax</p>
              </div>
            </div>
          ))}
        </div>

        {/* Price Notes */}
        {notes && notes.length > 0 && (
          <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="flex items-start gap-2 mb-2">
              <Info className="w-4 h-4 text-gray-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-600" style={{ fontWeight: 600 }}>
                Notes:
              </p>
            </div>
            <ul className="space-y-1.5 ml-6">
              {notes.map((note, i) => (
                <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                  <span>•</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
