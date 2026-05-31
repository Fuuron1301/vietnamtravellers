'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, MapPin, Hotel, Utensils } from 'lucide-react';

interface ItineraryDay {
  day: number | string;
  title: string;
  location?: string;
  description: string;
  activities?: string[];
  meals?: string;
  accommodation?: string;
  highlight?: boolean;
}

interface ItineraryTabProps {
  itinerary: ItineraryDay[];
}

export function ItineraryTab({ itinerary }: ItineraryTabProps) {
  const [expandedDays, setExpandedDays] = useState<Set<number | string>>(new Set([itinerary[0]?.day]));

  const toggleDay = (day: number | string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-gray-800 mb-6" style={{ fontSize: '1.4rem', fontWeight: 700 }}>
        Day-by-Day Itinerary
      </h2>

      <div className="space-y-3">
        {itinerary.map((dayItem, index) => {
          const isExpanded = expandedDays.has(dayItem.day);
          const dayNum = typeof dayItem.day === 'number' ? dayItem.day : index + 1;

          return (
            <div
              key={dayItem.day}
              className={`border rounded-lg overflow-hidden transition-all ${
                dayItem.highlight
                  ? 'border-orange-300 bg-orange-50'
                  : isExpanded
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {/* Day Header */}
              <button
                onClick={() => toggleDay(dayItem.day)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1 text-left">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">Day {dayNum}</span>
                  </div>
                  <div>
                    <h3 className="text-gray-800 font-semibold text-sm">{dayItem.title}</h3>
                    {dayItem.location && (
                      <p className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" />
                        {dayItem.location}
                      </p>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>

              {/* Day Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 px-4 py-4 space-y-4">
                  {dayItem.description && (
                    <p className="text-gray-600 text-sm leading-relaxed">{dayItem.description}</p>
                  )}

                  {dayItem.activities && dayItem.activities.length > 0 && (
                    <div>
                      <p className="text-gray-700 text-sm font-semibold mb-2">Activities:</p>
                      <ul className="space-y-1.5">
                        {dayItem.activities.map((activity, i) => (
                          <li key={i} className="text-gray-600 text-sm flex items-start gap-2">
                            <span className="text-orange-500 mt-1">•</span>
                            <span>{activity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Meals & Accommodation */}
                  <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
                    {dayItem.meals && (
                      <div className="flex items-start gap-2">
                        <Utensils className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Meals</p>
                          <p className="text-gray-800 text-sm font-medium">{dayItem.meals}</p>
                        </div>
                      </div>
                    )}
                    {dayItem.accommodation && (
                      <div className="flex items-start gap-2">
                        <Hotel className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-500 text-xs">Accommodation</p>
                          <p className="text-gray-800 text-sm font-medium">{dayItem.accommodation}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
