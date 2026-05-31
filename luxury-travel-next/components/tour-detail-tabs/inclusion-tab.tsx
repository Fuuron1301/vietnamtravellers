'use client';

import { Check, X } from 'lucide-react';

interface InclusionTabProps {
  includes: string[];
  excludes: string[];
  meals?: string;
  transport?: string;
  accommodation?: string;
}

export function InclusionTab({ includes, excludes, meals, transport, accommodation }: InclusionTabProps) {
  return (
    <div className="space-y-6">
      {/* Inclusion Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-gray-800 mb-5" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
          What's Included
        </h2>

        <div className="space-y-4">
          {/* Meals */}
          {meals && (
            <div className="flex items-start gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <div className="text-3xl flex-shrink-0">🍽️</div>
              <div className="flex-1">
                <p className="text-gray-800 mb-1" style={{ fontWeight: 700 }}>
                  Meals
                </p>
                <p className="text-gray-600 text-sm">{meals}</p>
              </div>
            </div>
          )}

          {/* Transport */}
          {transport && (
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="text-3xl flex-shrink-0">🚌</div>
              <div className="flex-1">
                <p className="text-gray-800 mb-1" style={{ fontWeight: 700 }}>
                  Transport
                </p>
                <p className="text-gray-600 text-sm">{transport}</p>
              </div>
            </div>
          )}

          {/* Accommodation */}
          {accommodation && (
            <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
              <div className="text-3xl flex-shrink-0">🏨</div>
              <div className="flex-1">
                <p className="text-gray-800 mb-1" style={{ fontWeight: 700 }}>
                  Accommodation
                </p>
                <p className="text-gray-600 text-sm">{accommodation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Included Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <Check className="w-5 h-5 text-green-500" />
            Included
          </h3>
          <div className="space-y-2">
            {includes.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-green-50 rounded-lg border border-green-100">
                <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Excluded Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-gray-800 mb-4 flex items-center gap-2" style={{ fontWeight: 700 }}>
            <X className="w-5 h-5 text-gray-400" />
            Not Included
          </h3>
          <div className="space-y-2">
            {excludes.map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 bg-gray-50 rounded-lg border border-gray-200">
                <X className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-600">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
