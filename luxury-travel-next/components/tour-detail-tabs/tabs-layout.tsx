'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Phone } from 'lucide-react';

type Tab = 'overview' | 'itinerary' | 'inclusion' | 'price' | 'reviews';

interface TabsLayoutProps {
  tabs: { id: Tab; label: string }[];
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  isSticky: boolean;
  children: React.ReactNode;
  priceInfo?: { price: string; label?: string };
}

export function TabsLayout({
  tabs,
  activeTab,
  onTabChange,
  isSticky,
  children,
  priceInfo
}: TabsLayoutProps) {
  return (
    <>
      {/* Sticky Tab Navigation */}
      <div
        className={`bg-white border-b border-gray-200 z-40 transition-shadow ${
          isSticky ? 'sticky top-0 shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex-shrink-0 px-5 py-4 text-sm transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-600 hover:text-orange-500 hover:border-orange-200'
                }`}
                style={{ fontWeight: activeTab === tab.id ? 700 : 500 }}
              >
                {tab.label}
              </button>
            ))}
            {/* Price in Nav */}
            {isSticky && priceInfo && (
              <div className="ml-auto flex items-center gap-3 flex-shrink-0 pl-4">
                <div>
                  <span className="text-xs text-gray-400">from</span>
                  <span className="text-orange-600 ml-1" style={{ fontWeight: 800 }}>
                    {priceInfo.price}
                  </span>
                  <span className="text-xs text-gray-400">/pax</span>
                </div>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm transition-colors" style={{ fontWeight: 600 }}>
                  Book Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </div>
    </>
  );
}
