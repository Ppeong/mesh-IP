import React from 'react';
import { ShieldCheck, MapPin, Database, FileSpreadsheet } from 'lucide-react';
import { BrandName } from '../types';

interface HeaderNavigationProps {
  currentView: 'dashboard' | 'map';
  onViewChange: (view: 'dashboard' | 'map') => void;
  onOpenSyncModal: () => void;
  hasGoogleAuth: boolean;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  currentView,
  onViewChange,
  onOpenSyncModal,
  hasGoogleAuth,
}) => {
  return (
    <header className="bg-white border-b border-[#B2D4EB]/50 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-2 sm:py-0 min-h-16 gap-2 sm:gap-4">
          {/* Brand & Portal Name */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#B2D4EB] flex items-center justify-center text-[#4A6B82] border border-[#9ec8e4] shadow-xs shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-base font-bold text-[#252525] tracking-tight truncate">
                  IP Asset Tracker
                </span>
              </div>
              <p className="text-[9.5px] sm:text-[11px] text-[#4A6B82] leading-tight truncate sm:whitespace-normal">
                Trademarks, Patents, & Industrial Designs Patents Portfolio
              </p>
            </div>
          </div>

          {/* View Switcher Tabs & Sync CTA */}
          <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2 w-full sm:w-auto">
            {/* View Switcher: Dashboard vs World Map */}
            <div className="flex items-center bg-[#F5F8FA] p-0.5 sm:p-1 rounded-xl border border-[#B2D4EB]/50 flex-1 sm:flex-initial">
              <button
                id="nav-dashboard-tab"
                onClick={() => onViewChange('dashboard')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  currentView === 'dashboard'
                    ? 'bg-[#B2D4EB] text-[#1C3A50] shadow-xs'
                    : 'text-[#4A6B82] hover:bg-[#D9C9EB]/30'
                }`}
              >
                <Database className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span>IP Registry</span>
              </button>
              <button
                id="nav-map-tab"
                onClick={() => onViewChange('map')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3.5 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold transition-all whitespace-nowrap ${
                  currentView === 'map'
                    ? 'bg-[#B2D4EB] text-[#1C3A50] shadow-xs'
                    : 'text-[#4A6B82] hover:bg-[#D9C9EB]/30'
                }`}
              >
                <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="sm:hidden">Territories</span>
                <span className="hidden sm:inline">Brand Territory Maps</span>
              </button>
            </div>

            {/* Google Sheets Sync Trigger */}
            <button
              id="open-sheets-sync-btn"
              onClick={onOpenSyncModal}
              className={`inline-flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-2 rounded-xl text-[10px] sm:text-xs font-bold transition-all border shrink-0 ${
                hasGoogleAuth
                  ? 'bg-[#C1E9D7] border-[#A7DEC6] text-[#164E39] hover:bg-[#a9e0c8]'
                  : 'bg-white border-[#B2D4EB] text-[#4A6B82] hover:bg-[#B2D4EB]/20'
              }`}
              title="Google Sheets Sync"
            >
              <FileSpreadsheet className={`w-3 h-3 sm:w-4 sm:h-4 ${hasGoogleAuth ? 'text-[#164E39]' : 'text-[#4A6B82]'}`} />
              <span className="hidden sm:inline">Google Sheets Sync</span>
              <span className="sm:hidden">Sync</span>
              {hasGoogleAuth && <span className="w-1.5 h-1.5 rounded-full bg-[#164E39]" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
