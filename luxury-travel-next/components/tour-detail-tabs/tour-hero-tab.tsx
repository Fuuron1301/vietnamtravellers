'use client';

import { Star, Clock, MapPin, Users, ChevronRight, Shield, Award, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';

interface TourHeroTabProps {
  title: string;
  heroImage: string;
  rating: number;
  reviewCount: string;
  duration: string;
  route: string;
  style: string;
  groupSize: string;
  gallery: string[];
  breadcrumbs?: { label: string; href?: string }[];
}

export function TourHeroTab({
  title,
  heroImage,
  rating,
  reviewCount,
  duration,
  route,
  style,
  groupSize,
  gallery,
  breadcrumbs = []
}: TourHeroTabProps) {
  const [galleryIndex, setGalleryIndex] = useState(0);
  const displayGallery = gallery.slice(0, 8);

  const nextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % Math.ceil(displayGallery.length / 4));
  };

  const prevGallery = () => {
    setGalleryIndex((prev) => (prev - 1 + Math.ceil(displayGallery.length / 4)) % Math.ceil(displayGallery.length / 4));
  };

  return (
    <div className="relative">
      {/* Main Hero Image */}
      <div className="relative h-[520px] overflow-hidden bg-gray-900">
        <img
          src={heroImage}
          alt={title}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Breadcrumb */}
        {breadcrumbs.length > 0 && (
          <div className="absolute top-5 left-0 right-0 px-6 md:px-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 text-white/80 text-sm flex-wrap">
                {breadcrumbs.map((crumb, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <ChevronRight className="w-3 h-3" />}
                    <span className={i === breadcrumbs.length - 1 ? 'text-white' : ''}>{crumb.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 px-6 md:px-10 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Badge */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide">
                {style}
              </span>
              <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full">
                ✓ Available
              </span>
            </div>

            <h1 className="text-white mb-2" style={{ fontSize: '2.4rem', fontWeight: 700, lineHeight: 1.2 }}>
              {title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-white font-semibold">{rating.toFixed(1)} / 10</span>
              <span className="text-white/80 text-sm">based on {reviewCount}</span>
              <span className="text-white/60">•</span>
              <span className="text-white/80 text-sm flex items-center gap-1">
                <Award className="w-3 h-3 text-yellow-400" /> Top Rated
              </span>
            </div>

            {/* Tour Info Pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
                <Clock className="w-4 h-4 text-orange-300" />
                <span>{duration}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
                <MapPin className="w-4 h-4 text-orange-300" />
                <span>{route}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
                <Users className="w-4 h-4 text-orange-300" />
                <span>{groupSize}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm border border-white/20">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Flexible</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mini Gallery Strip */}
      {displayGallery.length > 0 && (
        <div className="bg-gray-900 px-6 md:px-10 py-3">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            {displayGallery.length > 4 && (
              <button
                onClick={prevGallery}
                className="flex-shrink-0 w-8 h-8 rounded hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <div className="flex items-center gap-2 overflow-x-auto flex-1">
              {displayGallery.map((img, i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-24 h-16 rounded overflow-hidden cursor-pointer hover:ring-2 hover:ring-orange-400 transition-all"
                >
                  <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {displayGallery.length > 4 && (
              <button
                onClick={nextGallery}
                className="flex-shrink-0 w-8 h-8 rounded hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
