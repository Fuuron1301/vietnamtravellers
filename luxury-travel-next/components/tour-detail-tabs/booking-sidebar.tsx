'use client';

import { useState } from 'react';
import { Calendar, Users, Star, Check, Phone, Mail, Shield, Zap, ChevronDown } from 'lucide-react';

interface PriceTier {
  label: string;
  price: number;
}

interface BookingSidebarProps {
  rating?: number;
  reviewCount?: string;
  priceTiers?: PriceTier[];
  basePrice?: number;
  phone?: string;
  email?: string;
}

const defaultPriceTiers = [
  { label: '2★ Economy', price: 1348 },
  { label: '3★ Superior', price: 1443 },
  { label: '4★ First Class', price: 1662 },
  { label: '5★ Deluxe', price: 2111 },
];

export function BookingSidebar({
  rating = 9.5,
  reviewCount = '50+',
  priceTiers = defaultPriceTiers,
  basePrice,
  phone = '+84 904 699 428',
  email = 'info@luxurytravelnext.com'
}: BookingSidebarProps) {
  const [selectedTier, setSelectedTier] = useState(1);
  const [travelers, setTravelers] = useState(2);
  const [showTierDropdown, setShowTierDropdown] = useState(false);

  const price = priceTiers[selectedTier]?.price || (basePrice || priceTiers[0].price);
  const totalPrice = price * travelers;

  return (
    <div className="space-y-4 sticky top-28">
      {/* Main Booking Card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Price Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 text-white">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="w-3.5 h-3.5 fill-white text-white" />
              ))}
              <span className="ml-1 text-white/90 text-sm">{rating.toFixed(1)} / 10</span>
            </div>
            <span className="text-white/80 text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {reviewCount} reviews
            </span>
          </div>
          <div className="flex items-end gap-2">
            <div>
              <p className="text-white/70 text-xs">from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl" style={{ fontWeight: 800 }}>
                  US ${price.toLocaleString()}
                </span>
                <span className="text-white/80 text-sm">/pax</span>
              </div>
            </div>
          </div>
          <p className="text-white/70 text-xs mt-1">based on 2 people · twin/double sharing</p>
        </div>

        <div className="p-4 space-y-4">
          {/* Urgency Signal */}
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <Zap className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-xs" style={{ fontWeight: 600 }}>
              🔥 Limited availability
            </p>
          </div>

          {/* Hotel Tier Selector */}
          {priceTiers.length > 1 && (
            <div>
              <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
                Hotel Class
              </label>
              <div className="relative">
                <button
                  onClick={() => setShowTierDropdown(!showTierDropdown)}
                  className="w-full flex items-center justify-between px-3 py-2.5 border border-gray-300 rounded-lg bg-white hover:border-orange-400 transition-colors text-sm"
                >
                  <span className="text-gray-800">{priceTiers[selectedTier]?.label}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-orange-500" style={{ fontWeight: 700 }}>
                      US ${priceTiers[selectedTier].price.toLocaleString()}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </div>
                </button>
                {showTierDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {priceTiers.map((tier, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSelectedTier(i);
                          setShowTierDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-orange-50 transition-colors ${
                          selectedTier === i ? 'bg-orange-50 border-l-2 border-orange-500' : ''
                        }`}
                      >
                        <span className="text-gray-800">{tier.label}</span>
                        <span className="text-orange-500" style={{ fontWeight: 700 }}>
                          US ${tier.price.toLocaleString()}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Departure Date */}
          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
              Departure Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Number of Travelers */}
          <div>
            <label className="block text-sm text-gray-700 mb-1" style={{ fontWeight: 600 }}>
              Number of Travelers
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setTravelers((t) => Math.max(2, t - 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-orange-400 text-gray-600 hover:text-orange-500 transition-colors text-lg"
              >
                −
              </button>
              <div className="flex-1 flex items-center gap-2 justify-center bg-gray-50 rounded-lg py-2">
                <Users className="w-4 h-4 text-orange-500" />
                <span className="text-gray-800" style={{ fontWeight: 700 }}>
                  {travelers} Adults
                </span>
              </div>
              <button
                onClick={() => setTravelers((t) => Math.min(20, t + 1))}
                className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-orange-400 text-gray-600 hover:text-orange-500 transition-colors text-lg"
              >
                +
              </button>
            </div>
          </div>

          {/* Total Price */}
          {travelers > 2 && (
            <div className="bg-orange-50 rounded-lg px-4 py-3 border border-orange-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {travelers} × US ${price.toLocaleString()}
                </span>
                <span className="text-orange-600" style={{ fontWeight: 700 }}>
                  Total: US ${totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Book Now CTA */}
          <button
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl transition-colors shadow-md hover:shadow-lg"
            style={{ fontWeight: 700, fontSize: '1rem' }}
          >
            Book Now – Reserve Your Spot
          </button>

          {/* Get Quote */}
          <button className="w-full border-2 border-orange-500 text-orange-500 hover:bg-orange-50 py-3 rounded-xl transition-colors" style={{ fontWeight: 600 }}>
            Get a Free Quote
          </button>

          {/* Trust Signals */}
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-green-50 rounded-lg p-2.5 border border-green-100">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span>Free Cancellation</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-blue-50 rounded-lg p-2.5 border border-blue-100">
              <Shield className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span>Secure Booking</span>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            Cancel up to 7 days before departure for a full refund
          </p>
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          <p className="text-sm text-gray-700 mb-3" style={{ fontWeight: 600 }}>
            Need Help? Talk to Us!
          </p>
          <div className="space-y-2">
            <a
              href={`tel:${phone}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{phone}</span>
            </a>
            <a
              href={`mailto:${email}`}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-orange-500 transition-colors"
            >
              <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{email}</span>
            </a>
          </div>
          <div className="flex gap-2 mt-3">
            {['💬 Chat', '📱 WhatsApp', '✈️ Email'].map((app, i) => (
              <button
                key={i}
                className="flex-1 text-xs bg-white border border-gray-200 rounded-lg py-1.5 text-gray-600 hover:border-orange-300 hover:text-orange-500 transition-colors"
              >
                {app}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Why Book With Us */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <p className="text-sm text-gray-800 mb-3" style={{ fontWeight: 700 }}>
          Why Book With Us?
        </p>
        <div className="space-y-2">
          {[
            { icon: '🏆', text: 'Award-winning Vietnam specialist' },
            { icon: '👍', text: 'Verified reviews – 9.5/10 score' },
            { icon: '💰', text: 'Best price guarantee' },
            { icon: '🔒', text: '100% secure payment' },
            { icon: '🌟', text: 'Private & customizable tours' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
