'use client';

import { Check } from 'lucide-react';

interface OverviewTabProps {
  description: string;
  highlights: string[];
  places: string[];
}

export function OverviewTab({ description, highlights, places }: OverviewTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column */}
      <div className="lg:col-span-2 space-y-6">
        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-gray-800 mb-4" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
            About This Tour
          </h2>
          <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>

        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-gray-800 mb-5" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
              Tour Highlights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {highlights.map((highlight, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors">
                  <div className="bg-green-100 rounded-full p-0.5 flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700 text-sm leading-relaxed">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Places */}
      {places.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-28">
          <h3 className="text-gray-800 mb-4" style={{ fontSize: '1.1rem', fontWeight: 700 }}>
            Destinations
          </h3>
          <div className="space-y-2">
            {places.map((place, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 bg-orange-50 rounded-lg border border-orange-100 hover:border-orange-300 transition-colors">
                <div className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="text-sm text-gray-700">{place}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
