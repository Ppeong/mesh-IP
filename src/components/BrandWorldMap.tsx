import React, { useState, useMemo, useRef } from 'react';
import { BrandName, IPAsset } from '../types';
import { SMOOTH_WORLD_COUNTRIES, WorldCountryFeature } from '../data/worldMapData';
import {
  CheckCircle2,
  Clock,
  Globe,
  Info,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  MapPin,
  Sparkles,
  ExternalLink,
  Layers,
} from 'lucide-react';

interface BrandWorldMapProps {
  initialBrand?: BrandName;
  assets?: IPAsset[];
  customMapStatus?: Record<string, { registered: string[]; pending: string[] }>;
  onSelectCountry?: (countryCode: string) => void;
  onSelectAsset?: (asset: IPAsset) => void;
}

// Default territorial baseline portfolio for UNIQ, Skinarma, Energea
const DEFAULT_BRAND_PORTFOLIOS: Record<BrandName, { registered: string[]; pending: string[] }> = {
  UNIQ: {
    registered: ['SG', 'US', 'MY', 'ID', 'TH', 'VN', 'PH', 'JP', 'KR', 'DE', 'GB', 'AU', 'CA', 'AE'],
    pending: ['CN', 'IN', 'BR', 'MX', 'SA', 'TW'],
  },
  Skinarma: {
    registered: ['JP', 'KR', 'SG', 'US', 'CN', 'HK', 'TH', 'MY', 'ID', 'TW'],
    pending: ['GB', 'DE', 'FR', 'IT', 'ES', 'AU', 'AE', 'VN'],
  },
  Energea: {
    registered: ['SG', 'MY', 'ID', 'TH', 'PH', 'VN', 'CN', 'US', 'AE'],
    pending: ['GB', 'DE', 'JP', 'KR', 'AU', 'IN', 'SA'],
  },
};

// Common Country name to ISO-2 Code mapping for flawless sync with database entries
const COUNTRY_NAME_TO_CODE: Record<string, string> = {
  singapore: 'SG',
  'united states': 'US',
  usa: 'US',
  china: 'CN',
  japan: 'JP',
  'south korea': 'KR',
  korea: 'KR',
  germany: 'DE',
  'united kingdom': 'GB',
  uk: 'GB',
  australia: 'AU',
  malaysia: 'MY',
  canada: 'CA',
  france: 'FR',
  italy: 'IT',
  spain: 'ES',
  thailand: 'TH',
  vietnam: 'VN',
  indonesia: 'ID',
  philippines: 'PH',
  brazil: 'BR',
  mexico: 'MX',
  india: 'IN',
  'saudi arabia': 'SA',
  'united arab emirates': 'AE',
  uae: 'AE',
  'hong kong': 'HK',
  taiwan: 'TW',
  switzerland: 'CH',
  netherlands: 'NL',
  sweden: 'SE',
  turkey: 'TR',
  egypt: 'EG',
  qatar: 'QA',
  bahrain: 'BH',
};

const resolveCountryCode = (countryName: string, code?: string): string => {
  if (code && code.trim().length === 2) return code.trim().toUpperCase();
  const normalized = countryName.trim().toLowerCase();
  if (COUNTRY_NAME_TO_CODE[normalized]) return COUNTRY_NAME_TO_CODE[normalized];
  const found = SMOOTH_WORLD_COUNTRIES.find(
    (c) => c.name.toLowerCase() === normalized || c.code.toLowerCase() === normalized
  );
  return found?.code || '';
};

// Micro-jurisdictions that benefit from an explicit circular beacon dot on the world map
const MICRO_HUBS = new Set(['SG', 'HK', 'BH', 'QA', 'MC', 'LU', 'TW', 'CY', 'MT']);

interface RegionPreset {
  name: string;
  viewBox: string;
}

const REGION_PRESETS: RegionPreset[] = [
  { name: 'World View', viewBox: '0 0 960 520' },
  { name: 'Asia-Pacific', viewBox: '460 80 480 380' },
  { name: 'Europe & ME', viewBox: '360 40 360 280' },
  { name: 'Americas', viewBox: '120 40 400 440' },
];

export const BrandWorldMap: React.FC<BrandWorldMapProps> = ({
  initialBrand = 'UNIQ',
  assets = [],
  customMapStatus,
  onSelectCountry,
  onSelectAsset,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<BrandName>(initialBrand);
  const [hoveredCountry, setHoveredCountry] = useState<WorldCountryFeature | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const [activeRegion, setActiveRegion] = useState<string>('World View');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedCountryTag, setSelectedCountryTag] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // Derive territorial rights synchronized directly with the database table assets
  const currentBrandData = useMemo(() => {
    // 1. Start with baseline portfolio
    const base = customMapStatus?.[selectedBrand] || DEFAULT_BRAND_PORTFOLIOS[selectedBrand];
    const registeredSet = new Set<string>(base.registered);
    const pendingSet = new Set<string>(base.pending);

    // 2. Filter assets for this brand from the database table
    const brandAssets = assets.filter((a) => a.brand === selectedBrand);

    // 3. Group assets by country code
    const countryAssetsMap = new Map<string, IPAsset[]>();
    brandAssets.forEach((a) => {
      const cCode = resolveCountryCode(a.country, a.countryCode);
      if (cCode) {
        if (!countryAssetsMap.has(cCode)) {
          countryAssetsMap.set(cCode, []);
        }
        countryAssetsMap.get(cCode)!.push(a);
      }
    });

    // 4. Synchronize status with database table:
    countryAssetsMap.forEach((cAssets, cCode) => {
      const hasRegistered = cAssets.some((a) => a.status === 'Registered');
      const hasPending = cAssets.some(
        (a) =>
          a.status === 'Pending Examination' ||
          a.status === 'To Be Filed' ||
          a.status === 'Refusal Responded' ||
          a.status === 'Refusal'
      );
      const allAbandoned = cAssets.length > 0 && cAssets.every((a) => a.status === 'Abandoned');

      if (hasRegistered) {
        registeredSet.add(cCode);
        pendingSet.delete(cCode);
      } else if (hasPending) {
        if (!registeredSet.has(cCode)) {
          pendingSet.add(cCode);
        }
      } else if (allAbandoned) {
        registeredSet.delete(cCode);
        pendingSet.delete(cCode);
      }
    });

    return {
      registered: Array.from(registeredSet),
      pending: Array.from(pendingSet),
      countryAssetsMap,
    };
  }, [assets, customMapStatus, selectedBrand]);

  // Color logic according to requested palette:
  // - Registered mark: #C1E9D7 (Pastel Green)
  // - Filed / pending registration: #FFF4B0 (Pastel Yellow)
  // - Rest: #FFFFFF (White)
  const getCountryFill = (countryCode: string): string => {
    if (currentBrandData.registered.includes(countryCode)) {
      return '#C1E9D7';
    }
    if (currentBrandData.pending.includes(countryCode)) {
      return '#FFF4B0';
    }
    return '#FFFFFF';
  };

  const getCountryStatusMeta = (countryCode: string) => {
    const dbAssets = currentBrandData.countryAssetsMap.get(countryCode) || [];

    if (currentBrandData.registered.includes(countryCode)) {
      return {
        status: 'Registered Mark',
        color: 'text-[#164E39]',
        bg: 'bg-[#C1E9D7]',
        badgeBorder: 'border-[#A5D8C1]',
        dotColor: '#164E39',
        description: 'Trademark/Patent grant in force with statutory protection.',
        dbAssets,
      };
    }
    if (currentBrandData.pending.includes(countryCode)) {
      return {
        status: 'Filed / Pending Registration',
        color: 'text-[#854D0E]',
        bg: 'bg-[#FFF4B0]',
        badgeBorder: 'border-[#F2DF7E]',
        dotColor: '#CA8A04',
        description: 'Application submitted, undergoing formal examination or publication.',
        dbAssets,
      };
    }
    return {
      status: 'Unfiled / Inactive',
      color: 'text-[#4A6B82]',
      bg: 'bg-white',
      badgeBorder: 'border-[#B2D4EB]/40',
      dotColor: '#4A6B82',
      description: 'No active trademark or patent registration in this jurisdiction.',
      dbAssets,
    };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.min(Math.max(prev + delta, 0.8), 3.0));
  };

  const handleResetView = () => {
    setActiveRegion('World View');
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    setSelectedCountryTag(null);
  };

  const handleRegionSelect = (preset: RegionPreset) => {
    setActiveRegion(preset.name);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  };

  // Base view box calculation
  const currentViewBox = useMemo(() => {
    const preset = REGION_PRESETS.find((r) => r.name === activeRegion) || REGION_PRESETS[0];
    const parts = preset.viewBox.split(' ').map(Number);
    const [baseX, baseY, baseW, baseH] = parts;

    // Adjust based on zoomLevel and pan
    const w = baseW / zoomLevel;
    const h = baseH / zoomLevel;
    const x = baseX + (baseW - w) / 2 + panOffset.x;
    const y = baseY + (baseH - h) / 2 + panOffset.y;

    return `${x} ${y} ${w} ${h}`;
  }, [activeRegion, zoomLevel, panOffset]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>, country: WorldCountryFeature) => {
    setHoveredCountry(country);
    if (mapContainerRef.current) {
      const rect = mapContainerRef.current.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  // Count total assets in database synced for this brand
  const totalBrandAssetsInDb = useMemo(() => {
    let count = 0;
    currentBrandData.countryAssetsMap.forEach((list) => {
      count += list.length;
    });
    return count;
  }, [currentBrandData]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Brand Selection Tabs Bar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#B2D4EB]/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-xl font-bold text-[#252525] flex items-center gap-2">
              <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6B82] shrink-0" />
              <span>Global Intellectual Property Territory Map</span>
            </h2>
            <p className="text-[10px] sm:text-xs text-[#4A6B82] mt-0.5 leading-snug">
              Accurate smooth geographic world map projection synced live with database IP assets
            </p>
          </div>

          {/* Three Brand Buttons */}
          <div className="w-full md:w-auto grid grid-cols-3 sm:flex items-center p-1 bg-[#F5F8FA] rounded-xl border border-[#B2D4EB]/50 gap-1">
            {(['UNIQ', 'Skinarma', 'Energea'] as BrandName[]).map((brand) => (
              <button
                key={brand}
                id={`brand-tab-${brand.toLowerCase()}`}
                onClick={() => {
                  setSelectedBrand(brand);
                  setSelectedCountryTag(null);
                }}
                className={`px-2 sm:px-5 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all text-center justify-center flex items-center ${
                  selectedBrand === brand
                    ? 'bg-[#B2D4EB] text-[#1C3A50] shadow-xs'
                    : 'text-[#4A6B82] hover:bg-[#D9C9EB]/30'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>

        {/* Legend bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mt-3.5 sm:mt-6 pt-3 sm:pt-5 border-t border-[#B2D4EB]/40 text-[10px] sm:text-xs">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-6">
            {/* Registered Mark (Green) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border border-[#85C7AB] shadow-2xs shrink-0"
                style={{ backgroundColor: '#C1E9D7' }}
              />
              <span className="font-semibold text-[#252525]">Registered</span>
              <span className="bg-[#C1E9D7] border border-[#A7DEC6] px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[#164E39] text-[9px] sm:text-[10px]">
                {currentBrandData.registered.length}
              </span>
            </div>

            {/* Filed / Pending Registration (Yellow) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border border-[#ECC94B] shadow-2xs shrink-0"
                style={{ backgroundColor: '#FFF4B0' }}
              />
              <span className="font-semibold text-[#252525]">Filed / Pending</span>
              <span className="bg-[#FFF4B0] border border-[#F2DF7E] px-1.5 sm:px-2 py-0.5 rounded-full font-bold text-[#854D0E] text-[9px] sm:text-[10px]">
                {currentBrandData.pending.length}
              </span>
            </div>

            {/* Unfiled / Inactive */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span
                className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border border-[#CBD5E1] shadow-2xs shrink-0"
                style={{ backgroundColor: '#FFFFFF' }}
              />
              <span className="font-semibold text-[#4A6B82]">Unfiled</span>
            </div>
          </div>

          {/* Quick Info Pill with Database Sync Status */}
          <div className="text-[10px] sm:text-[11px] text-[#1C3A50] bg-[#B2D4EB]/50 border border-[#B2D4EB] px-2.5 sm:px-3 py-1 rounded-full font-medium flex items-center gap-1.5 shrink-0 self-start sm:self-auto">
            <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#1C3A50]" />
            <span>Synced with Database ({totalBrandAssetsInDb} assets)</span>
          </div>
        </div>
      </div>

      {/* World Map Interactive Canvas */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-6 border border-[#B2D4EB]/50 shadow-xs relative">
        {/* Map Header Toolbar: Region Presets & Zoom Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3 sm:mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#4A6B82]">
              Jurisdiction: {selectedBrand}
            </span>
            <span className="text-[10px] sm:text-xs text-[#4A6B82]">
              • {currentBrandData.registered.length + currentBrandData.pending.length} Active Territories
            </span>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
            {/* Region Presets */}
            <div className="flex items-center p-0.5 sm:p-1 bg-[#F5F8FA] rounded-lg border border-[#B2D4EB]/50 gap-0.5 sm:gap-1 overflow-x-auto max-w-[240px] sm:max-w-none">
              {REGION_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleRegionSelect(preset)}
                  className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[9.5px] sm:text-[11px] font-semibold transition-all shrink-0 ${
                    activeRegion === preset.name
                      ? 'bg-white text-[#1C3A50] shadow-xs'
                      : 'text-[#4A6B82] hover:text-[#1C3A50]'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>

            {/* Zoom In/Out/Reset */}
            <div className="flex items-center bg-[#F5F8FA] rounded-lg border border-[#B2D4EB]/50 p-0.5 sm:p-1 gap-0.5 shrink-0">
              <button
                onClick={() => handleZoom(0.3)}
                className="p-1 text-[#4A6B82] hover:bg-white rounded transition-colors"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleZoom(-0.3)}
                className="p-1 text-[#4A6B82] hover:bg-white rounded transition-colors"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleResetView}
                className="p-1 text-[#4A6B82] hover:bg-white rounded transition-colors"
                title="Reset zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* SVG World Map Viewport */}
        <div
          ref={mapContainerRef}
          className="w-full bg-[#F5F8FA] rounded-xl p-3 border border-[#B2D4EB]/40 flex items-center justify-center relative overflow-hidden select-none"
        >
          <svg
            viewBox={currentViewBox}
            className="w-full h-auto min-h-[380px] max-h-[620px] transition-all duration-300"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.03))' }}
          >
            <defs>
              {/* Graticule ocean grid */}
              <pattern id="oceanCoordGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#4A6B82" strokeWidth="0.25" strokeOpacity="0.12" />
              </pattern>
            </defs>

            {/* Ocean Basin Background */}
            <rect x="-200" y="-100" width="1400" height="800" fill="#F5F8FA" />
            <rect x="-200" y="-100" width="1400" height="800" fill="url(#oceanCoordGrid)" />

            {/* Graticule lines: Equator, Tropics, and Prime Meridian */}
            <line x1="-100" y1="260" x2="1100" y2="260" stroke="#4A6B82" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.25" />
            <line x1="-100" y1="180" x2="1100" y2="180" stroke="#4A6B82" strokeWidth="0.35" strokeDasharray="2 4" strokeOpacity="0.15" />
            <line x1="-100" y1="340" x2="1100" y2="340" stroke="#4A6B82" strokeWidth="0.35" strokeDasharray="2 4" strokeOpacity="0.15" />
            <line x1="480" y1="-50" x2="480" y2="600" stroke="#4A6B82" strokeWidth="0.5" strokeDasharray="4 4" strokeOpacity="0.25" />

            {/* Render Country Polygons with Smooth Natural Earth Coastlines */}
            {SMOOTH_WORLD_COUNTRIES.map((country, idx) => {
              const isRegistered = currentBrandData.registered.includes(country.code);
              const isPending = currentBrandData.pending.includes(country.code);
              const isHovered = hoveredCountry?.code === country.code;
              const isSelectedTag = selectedCountryTag === country.code;
              const fill = getCountryFill(country.code);

              // Border stroke color
              let strokeColor = '#CBD5E1';
              let strokeWidth = 0.65;

              if (isHovered || isSelectedTag) {
                strokeColor = '#4A6B82';
                strokeWidth = 1.8;
              } else if (isRegistered) {
                strokeColor = '#85C7AB';
                strokeWidth = 0.9;
              } else if (isPending) {
                strokeColor = '#E6C84F';
                strokeWidth = 0.9;
              }

              return (
                <path
                  key={`country-${country.code || country.id || country.name}-${idx}`}
                  d={country.path}
                  fill={fill}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="cursor-pointer transition-colors duration-150"
                  onMouseEnter={(e) => handleMouseMove(e, country)}
                  onMouseMove={(e) => handleMouseMove(e, country)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    setSelectedCountryTag(country.code);
                    if (onSelectCountry) onSelectCountry(country.code);
                  }}
                />
              );
            })}

            {/* Micro-territory Beacon Pins (ensures small jurisdictions like Singapore SG, Hong Kong HK, Bahrain BH are clearly visible) */}
            {SMOOTH_WORLD_COUNTRIES.filter(
              (c) =>
                MICRO_HUBS.has(c.code) ||
                ((currentBrandData.registered.includes(c.code) || currentBrandData.pending.includes(c.code)) &&
                  (c.code === 'SG' || c.code === 'HK' || c.code === 'TW' || c.code === 'QA' || c.code === 'BH'))
            ).map((hub, hubIdx) => {
              if (hub.cx <= 0 || hub.cy <= 0) return null;
              const isReg = currentBrandData.registered.includes(hub.code);
              const isPend = currentBrandData.pending.includes(hub.code);
              const pinColor = isReg ? '#164E39' : isPend ? '#CA8A04' : '#4A6B82';
              const isHovered = hoveredCountry?.code === hub.code;

              return (
                <g
                  key={`hub-marker-${hub.code || hub.id}-${hubIdx}`}
                  className="cursor-pointer"
                  onMouseEnter={(e) => handleMouseMove(e, hub)}
                  onMouseMove={(e) => handleMouseMove(e, hub)}
                  onMouseLeave={() => setHoveredCountry(null)}
                  onClick={() => {
                    setSelectedCountryTag(hub.code);
                    if (onSelectCountry) onSelectCountry(hub.code);
                  }}
                >
                  {/* Glowing halo for registered / pending hubs */}
                  {(isReg || isPend) && (
                    <circle
                      cx={hub.cx}
                      cy={hub.cy}
                      r={isHovered ? 8 : 6}
                      fill={pinColor}
                      fillOpacity={0.25}
                      className="animate-pulse"
                    />
                  )}
                  {/* Center beacon dot */}
                  <circle
                    cx={hub.cx}
                    cy={hub.cy}
                    r={isHovered ? 4 : 3}
                    fill={isReg ? '#C1E9D7' : isPend ? '#FFF4B0' : '#FFFFFF'}
                    stroke={pinColor}
                    strokeWidth={1.2}
                  />
                  {/* Hub ISO code label */}
                  {(isReg || isPend || isHovered) && (
                    <text
                      x={hub.cx + 5}
                      y={hub.cy - 4}
                      className="text-[9px] font-bold fill-[#252525] pointer-events-none select-none"
                      style={{ textShadow: '0 0 3px #FFFFFF, 0 0 3px #FFFFFF' }}
                    >
                      {hub.code}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Floating High-Precision Hover Tooltip */}
          {hoveredCountry && tooltipPos && (
            <div
              className="absolute z-20 pointer-events-none bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-[#B2D4EB]/60 shadow-lg text-xs transition-transform duration-75 max-w-xs"
              style={{
                left: `${Math.min(tooltipPos.x + 15, (mapContainerRef.current?.clientWidth || 800) - 260)}px`,
                top: `${Math.max(tooltipPos.y - 75, 15)}px`,
              }}
            >
              <div className="flex items-center justify-between gap-2 border-b border-[#B2D4EB]/30 pb-1.5 mb-1.5">
                <span className="font-bold text-[#252525] truncate">
                  {hoveredCountry.name} ({hoveredCountry.code})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    getCountryStatusMeta(hoveredCountry.code).color
                  } ${getCountryStatusMeta(hoveredCountry.code).bg} border ${
                    getCountryStatusMeta(hoveredCountry.code).badgeBorder
                  }`}
                >
                  {getCountryStatusMeta(hoveredCountry.code).status}
                </span>
              </div>
              <p className="text-[11px] text-[#4A6B82]">
                Brand: <strong className="text-[#252525]">{selectedBrand}</strong>
              </p>
              <p className="text-[10px] text-[#4A6B82] mt-0.5">
                {getCountryStatusMeta(hoveredCountry.code).description}
              </p>

              {/* Database Assets info if present */}
              {getCountryStatusMeta(hoveredCountry.code).dbAssets.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-[#B2D4EB]/30 space-y-1">
                  <span className="text-[10px] font-bold text-[#1C3A50] block">
                    Database Assets ({getCountryStatusMeta(hoveredCountry.code).dbAssets.length}):
                  </span>
                  {getCountryStatusMeta(hoveredCountry.code).dbAssets.map((asset) => (
                    <div key={asset.id} className="text-[10px] text-[#252525] flex items-center justify-between gap-1">
                      <span className="truncate font-medium">{asset.assetName}</span>
                      <span className="font-mono text-[#4A6B82] shrink-0 text-[9px]">({asset.status})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Territory Status Breakdown Table for Selected Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-4 sm:mt-6">
          {/* Registered List (Green) */}
          <div className="bg-[#C1E9D7]/20 rounded-xl p-3.5 sm:p-4 border border-[#C1E9D7]">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-[#164E39] uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#164E39] shrink-0" />
                Registered Countries ({currentBrandData.registered.length})
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#164E39] bg-[#C1E9D7] px-2 py-0.5 rounded-full border border-[#A7DEC6]">
                Registered
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {Array.from(new Set(currentBrandData.registered)).map((c, i) => {
                const geo = SMOOTH_WORLD_COUNTRIES.find((g) => g.code === c);
                const isSelected = selectedCountryTag === c;
                const dbCount = currentBrandData.countryAssetsMap.get(c)?.length || 0;
                return (
                  <button
                    key={`reg-${c}-${i}`}
                    onClick={() => {
                      setSelectedCountryTag(c);
                      if (onSelectCountry) onSelectCountry(c);
                    }}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold shadow-2xs border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#164E39] text-white border-[#164E39] scale-105'
                        : 'bg-[#C1E9D7] text-[#164E39] border-[#A7DEC6] hover:bg-[#A9DEC7]'
                    }`}
                  >
                    <span>{geo ? geo.name : c} ({c})</span>
                    {dbCount > 0 && (
                      <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white text-[#164E39]' : 'bg-[#164E39] text-white'
                      }`}>
                        {dbCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filed / Pending List (Yellow) */}
          <div className="bg-[#FFF4B0]/25 rounded-xl p-3.5 sm:p-4 border border-[#F2DF7E]">
            <div className="flex flex-wrap items-center justify-between gap-1.5 mb-2.5 sm:mb-3">
              <span className="text-[11px] sm:text-xs font-bold text-[#854D0E] uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#CA8A04] shrink-0" />
                Filed / Pending Countries ({currentBrandData.pending.length})
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-[#854D0E] bg-[#FFF4B0] px-2 py-0.5 rounded-full border border-[#F2DF7E]">
                Pending
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {Array.from(new Set(currentBrandData.pending)).map((c, i) => {
                const geo = SMOOTH_WORLD_COUNTRIES.find((g) => g.code === c);
                const isSelected = selectedCountryTag === c;
                const dbCount = currentBrandData.countryAssetsMap.get(c)?.length || 0;
                return (
                  <button
                    key={`pend-${c}-${i}`}
                    onClick={() => {
                      setSelectedCountryTag(c);
                      if (onSelectCountry) onSelectCountry(c);
                    }}
                    className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold shadow-2xs border transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#854D0E] text-white border-[#854D0E] scale-105'
                        : 'bg-[#FFF4B0] text-[#854D0E] border-[#F2DF7E] hover:bg-[#FDF09D]'
                    }`}
                  >
                    <span>{geo ? geo.name : c} ({c})</span>
                    {dbCount > 0 && (
                      <span className={`text-[9px] px-1 py-0.2 rounded-full font-bold ${
                        isSelected ? 'bg-white text-[#854D0E]' : 'bg-[#854D0E] text-white'
                      }`}>
                        {dbCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Informational Guidance Banner */}
        <div className="mt-3.5 sm:mt-4 flex items-start sm:items-center gap-2 text-[10px] sm:text-xs text-[#4A6B82] bg-[#F5F8FA] p-2.5 sm:p-3 rounded-xl border border-[#B2D4EB]/50 leading-relaxed">
          <Info className="w-4 h-4 text-[#4A6B82] shrink-0 mt-0.5 sm:mt-0" />
          <span>
            Territorial coverage for <strong>{selectedBrand}</strong> is synced directly with your database table assets as well as statutory international filings (WIPO Madrid Protocol, IPOS, USPTO, JPO, EUIPO).
          </span>
        </div>
      </div>
    </div>
  );
};
