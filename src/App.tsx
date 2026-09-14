import React, { useState, useEffect, useMemo } from 'react';
import { User } from 'firebase/auth';
import { IPAsset, BrandName, MetricSummary } from './types';
import { INITIAL_ASSETS, BRAND_DEFAULT_MAPS } from './mockData';
import { initAuth } from './services/firebaseAuth';
import { HeaderNavigation } from './components/HeaderNavigation';
import { MetricCards } from './components/MetricCards';
import { AssetTable } from './components/AssetTable';
import { AssetProfile } from './components/AssetProfile';
import { BrandWorldMap } from './components/BrandWorldMap';
import { AddAssetModal } from './components/AddAssetModal';
import { GoogleSheetsSyncModal } from './components/GoogleSheetsSyncModal';

const STORAGE_KEY = 'ip_assets_portfolio_data_v1';

export default function App() {
  // 1. Assets State (with localStorage persistence)
  const [assets, setAssets] = useState<IPAsset[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed reading from localStorage', e);
    }
    return INITIAL_ASSETS;
  });

  // Save to localStorage whenever assets update
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    } catch (e) {
      console.warn('Failed saving to localStorage', e);
    }
  }, [assets]);

  // 2. View Routing State
  const [currentView, setCurrentView] = useState<'dashboard' | 'map'>('dashboard');
  const [selectedAsset, setSelectedAsset] = useState<IPAsset | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // 3. Filter brand state
  const [filterBrand, setFilterBrand] = useState<BrandName | 'All'>('All');

  // 4. Google Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
      },
      () => {
        // Not signed in or signed out
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // 5. Computed Metrics
  const metrics = useMemo<MetricSummary>(() => {
    const registeredAssets = assets.filter(
      (a) => a.status === 'Registered' || (a.status as any) === 'Active'
    ).length;
    // Count upcoming renewals (due within 90 days, or already marked as renewal due in notes/dates)
    const upcomingRenewals = assets.filter((a) => {
      if (!a.renewalDueDate) return false;
      const due = new Date(a.renewalDueDate).getTime();
      const now = Date.now();
      const ninetyDays = 90 * 24 * 60 * 60 * 1000;
      return due - now <= ninetyDays && due - now >= -30 * 24 * 60 * 60 * 1000;
    }).length;
    const pendingFilings = assets.filter(
      (a) =>
        a.status === 'Pending Examination' ||
        a.status === 'To Be Filed' ||
        a.status === 'Refusal Responded' ||
        (a.status as any) === 'Pending'
    ).length;
    const refusalAlerts = assets.filter((a) => a.status === 'Refusal').length;
    const abandonedAssets = assets.filter((a) => a.status === 'Abandoned').length;

    return {
      totalAssets: assets.length,
      registeredAssets,
      activeAssets: registeredAssets,
      upcomingRenewals,
      pendingFilings,
      refusalAlerts,
      abandonedAssets,
    };
  }, [assets]);

  // 6. Dynamic World Map Data (aggregates assets to automatically enrich brand territories)
  const dynamicBrandMaps = useMemo(() => {
    const maps = {
      UNIQ: { ...BRAND_DEFAULT_MAPS.UNIQ, registered: [...BRAND_DEFAULT_MAPS.UNIQ.registered], pending: [...BRAND_DEFAULT_MAPS.UNIQ.pending] },
      Skinarma: { ...BRAND_DEFAULT_MAPS.Skinarma, registered: [...BRAND_DEFAULT_MAPS.Skinarma.registered], pending: [...BRAND_DEFAULT_MAPS.Skinarma.pending] },
      Energea: { ...BRAND_DEFAULT_MAPS.Energea, registered: [...BRAND_DEFAULT_MAPS.Energea.registered], pending: [...BRAND_DEFAULT_MAPS.Energea.pending] },
    };

    // Integrate any assets into their respective brand maps
    assets.forEach((a) => {
      const brandKey = a.brand as BrandName;
      if (brandKey && maps[brandKey] && a.countryCode) {
        if (
          (a.status === 'Registered' || (a.status as any) === 'Active') &&
          !maps[brandKey].registered.includes(a.countryCode)
        ) {
          maps[brandKey].registered = [...maps[brandKey].registered, a.countryCode];
          maps[brandKey].pending = maps[brandKey].pending.filter((code) => code !== a.countryCode);
        } else if (
          (a.status === 'To Be Filed' ||
            a.status === 'Pending Examination' ||
            a.status === 'Refusal Responded' ||
            (a.status as any) === 'Pending') &&
          !maps[brandKey].pending.includes(a.countryCode) &&
          !maps[brandKey].registered.includes(a.countryCode)
        ) {
          maps[brandKey].pending = [...maps[brandKey].pending, a.countryCode];
        }
      }
    });

    return maps;
  }, [assets]);

  // Handler: Add New Asset
  const handleAddNewAsset = (newAssetData: Omit<IPAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: IPAsset = {
      ...newAssetData,
      id: `IPA-${1000 + assets.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssets((prev) => [newAsset, ...prev]);
  };

  // Handler: Update Notes in Profile
  const handleUpdateNotes = (assetId: string, updatedNotes: string) => {
    setAssets((prev) =>
      prev.map((item) =>
        item.id === assetId
          ? { ...item, notes: updatedNotes, updatedAt: new Date().toISOString() }
          : item
      )
    );
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset((prev) => (prev ? { ...prev, notes: updatedNotes } : null));
    }
  };

  // Handler: Change Status in Profile
  const handleStatusChange = (assetId: string, newStatus: IPAsset['status']) => {
    setAssets((prev) =>
      prev.map((item) =>
        item.id === assetId
          ? { ...item, status: newStatus, updatedAt: new Date().toISOString() }
          : item
      )
    );
    if (selectedAsset && selectedAsset.id === assetId) {
      setSelectedAsset((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Handler: Update Entire Asset from EditAssetModal
  const handleUpdateAsset = (updatedAsset: IPAsset) => {
    setAssets((prev) =>
      prev.map((item) =>
        item.id === updatedAsset.id ? { ...updatedAsset, updatedAt: new Date().toISOString() } : item
      )
    );
    if (selectedAsset && selectedAsset.id === updatedAsset.id) {
      setSelectedAsset(updatedAsset);
    }
  };

  // Handler: Delete Assets (Single or Multi-select)
  const handleDeleteAssets = (assetIdsToDelete: string[]) => {
    const idsSet = new Set(assetIdsToDelete);
    setAssets((prev) => prev.filter((item) => !idsSet.has(item.id)));
    if (selectedAsset && idsSet.has(selectedAsset.id)) {
      setSelectedAsset(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F8FA] text-[#252525] font-sans antialiased flex flex-col">
      {/* Top Corporate Navigation */}
      <HeaderNavigation
        currentView={currentView}
        onViewChange={(view) => {
          setCurrentView(view);
          setSelectedAsset(null);
        }}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        hasGoogleAuth={!!accessToken}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2.5 sm:px-6 lg:px-8 py-3.5 sm:py-6">
        {selectedAsset ? (
          // Detailed Asset Profile View
          <AssetProfile
            asset={selectedAsset}
            onBack={() => setSelectedAsset(null)}
            onUpdateNotes={handleUpdateNotes}
            onStatusChange={handleStatusChange}
            onUpdateAsset={handleUpdateAsset}
          />
        ) : currentView === 'dashboard' ? (
          // Main Dashboard: Metrics + Searchable IP Assets Table
          <div className="space-y-3.5 sm:space-y-6">
            {/* Metric Cards showing Total Active assets and total portfolio */}
            <MetricCards metrics={metrics} />

            {/* Database Table */}
            <AssetTable
              assets={assets}
              onSelectAsset={(asset) => setSelectedAsset(asset)}
              onOpenAddModal={() => setIsAddModalOpen(true)}
              filterBrand={filterBrand}
              onFilterBrandChange={(brand) => setFilterBrand(brand)}
              onDeleteAssets={handleDeleteAssets}
            />
          </div>
        ) : (
          // Brand World Map Page (UNIQ / Skinarma / Energea with Green Registered & Yellow Pending)
          <BrandWorldMap
            initialBrand="UNIQ"
            assets={assets}
            customMapStatus={dynamicBrandMaps}
            onSelectCountry={(countryCode) => {
              // Switch to dashboard and filter by country if desired
              setFilterBrand('All');
            }}
            onSelectAsset={(asset) => setSelectedAsset(asset)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#B2D4EB]/40 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-[#4A6B82]">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <span>IP Asset Tracker • Registry of Trademarks, Patents, and Industrial Design Patents</span>
          <span>UNIQ • Skinarma • Energea Global IP Portfolios</span>
        </div>
      </footer>

      {/* Add New Asset Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewAsset}
      />

      {/* Google Sheets Sync Modal */}
      <GoogleSheetsSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        currentUser={currentUser}
        accessToken={accessToken}
        assets={assets}
        onAuthUpdated={(user, token) => {
          setCurrentUser(user);
          setAccessToken(token);
        }}
      />
    </div>
  );
}
