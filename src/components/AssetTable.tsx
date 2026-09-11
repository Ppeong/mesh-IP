import React, { useState, useMemo } from 'react';
import { IPAsset, IPType, IPStatus, BrandName } from '../types';
import { StatusBadge } from './StatusBadge';
import { IPTypeBadge } from './IPTypeBadge';
import { exportIPAssetsToExcel } from '../services/exportToExcel';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  Calendar,
  Globe,
  ChevronRight,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';

interface AssetTableProps {
  assets: IPAsset[];
  onSelectAsset: (asset: IPAsset) => void;
  onOpenAddModal: () => void;
  filterBrand?: BrandName | 'All';
  onFilterBrandChange?: (brand: BrandName | 'All') => void;
}

export const AssetTable: React.FC<AssetTableProps> = ({
  assets,
  onSelectAsset,
  onOpenAddModal,
  filterBrand = 'All',
  onFilterBrandChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<IPType | 'All'>('All');
  const [selectedStatus, setSelectedStatus] = useState<IPStatus | 'All'>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');
  const [sortField, setSortField] = useState<'assetName' | 'filingDate' | 'renewalDueDate' | 'country' | 'registrationDate' | 'applicationNumber' | 'firmAgent' | 'applicant'>('renewalDueDate');
  const [sortAsc, setSortAsc] = useState(true);
  const [exportNotification, setExportNotification] = useState<string | null>(null);

  const handleExportToExcel = () => {
    try {
      const result = exportIPAssetsToExcel(filteredAssets, {
        brandFilter: filterBrand,
        searchQuery,
        selectedType,
        selectedStatus,
        selectedCountry,
      });
      setExportNotification(`Exported ${result.count} assets to ${result.filename}`);
      setTimeout(() => setExportNotification(null), 4500);
    } catch (err) {
      console.error('Failed to export to Excel:', err);
    }
  };

  // Extract unique countries
  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    assets.forEach((a) => set.add(a.country));
    return Array.from(set).sort();
  }, [assets]);

  // Filter and sort logic
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesQuery =
          asset.assetName.toLowerCase().includes(q) ||
          asset.applicationNumber.toLowerCase().includes(q) ||
          asset.country.toLowerCase().includes(q) ||
          (asset.brand && asset.brand.toLowerCase().includes(q)) ||
          (asset.classes && asset.classes.toLowerCase().includes(q)) ||
          (asset.registrationNumber && asset.registrationNumber.toLowerCase().includes(q)) ||
          (asset.registrationDate && asset.registrationDate.toLowerCase().includes(q)) ||
          (asset.firmAgent && asset.firmAgent.toLowerCase().includes(q)) ||
          (asset.applicant && asset.applicant.toLowerCase().includes(q)) ||
          asset.notes.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Brand Filter
      if (filterBrand !== 'All' && asset.brand !== filterBrand) {
        return false;
      }

      // Type Filter
      if (selectedType !== 'All' && asset.ipType !== selectedType) {
        return false;
      }

      // Status Filter
      if (selectedStatus !== 'All' && asset.status !== selectedStatus) {
        return false;
      }

      // Country Filter
      if (selectedCountry !== 'All' && asset.country !== selectedCountry) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA = (a[sortField] as string) || '';
      let valB = (b[sortField] as string) || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [assets, searchQuery, filterBrand, selectedType, selectedStatus, selectedCountry, sortField, sortAsc]);

  const handleSort = (field: 'assetName' | 'filingDate' | 'renewalDueDate' | 'country' | 'registrationDate' | 'applicationNumber' | 'firmAgent' | 'applicant') => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('All');
    setSelectedStatus('All');
    setSelectedCountry('All');
    if (onFilterBrandChange) onFilterBrandChange('All');
  };

  return (
    <div className="bg-white rounded-2xl border border-[#B2D4EB]/50 shadow-xs overflow-hidden">
      {/* Table Controls & Filters Header */}
      <div className="p-3.5 sm:p-5 border-b border-[#B2D4EB]/40 space-y-3 sm:space-y-4 bg-[#F5F8FA]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#252525] flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>Database Table: IP Assets</span>
              <span className="text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 py-0.5 rounded-full bg-[#B2D4EB]/60 text-[#1C3A50] border border-[#B2D4EB]">
                {filteredAssets.length} of {assets.length} items
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-[#4A6B82] mt-0.5 leading-snug">
              Registry of trademarks, patents, and industrial design patents
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              id="export-excel-btn"
              onClick={handleExportToExcel}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-[#C1E9D7] hover:bg-[#a9dec7] text-[#164E39] border border-[#A5D8C1] shadow-xs transition-colors"
              title="Export current IP assets list to Excel (.xlsx) for reporting purposes"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#164E39] shrink-0" />
              <span>Export to Excel</span>
            </button>

            <button
              id="add-new-asset-btn"
              onClick={onOpenAddModal}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-bold bg-[#B2D4EB] hover:bg-[#9ec8e4] text-[#1C3A50] border border-[#9ec8e4] shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Add New Asset</span>
            </button>
          </div>
        </div>

        {/* Excel Export Notification Toast */}
        {exportNotification && (
          <div className="flex items-center gap-2 px-3 sm:px-3.5 py-2 bg-[#C1E9D7]/30 text-[#164E39] border border-[#C1E9D7] rounded-lg text-xs font-medium animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#164E39] shrink-0" />
            <span>{exportNotification}</span>
          </div>
        )}

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 pt-1 sm:pt-2">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A6B82] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search asset, filing no, country, agent, applicant..."
              className="w-full pl-8 sm:pl-9 pr-3.5 py-1.5 sm:py-2 rounded-lg border border-[#B2D4EB] text-xs text-[#252525] bg-white focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82]"
            />
          </div>

          {/* Filter: IP Type */}
          <div>
            <select
              id="filter-type-select"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#B2D4EB] text-xs text-[#252525] bg-white focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82]"
            >
              <option value="All">All IP Types</option>
              <option value="Patent">Patent</option>
              <option value="Trademark">Trademark</option>
              <option value="Design">Design</option>
            </select>
          </div>

          {/* Filter: Status */}
          <div>
            <select
              id="filter-status-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#B2D4EB] text-xs text-[#252525] bg-white focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82]"
            >
              <option value="All">All Statuses</option>
              <option value="To Be Filed">To Be Filed</option>
              <option value="Pending Examination">Pending Examination</option>
              <option value="Registered">Registered</option>
              <option value="Refusal">Refusal</option>
              <option value="Refusal Responded">Refusal Responded</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>

          {/* Filter: Country */}
          <div>
            <select
              id="filter-country-select"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-[#B2D4EB] text-xs text-[#252525] bg-white focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82]"
            >
              <option value="All">All Countries</option>
              {availableCountries.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand quick filter pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#4A6B82]">
            <Filter className="w-3.5 h-3.5 shrink-0" />
            <span className="font-semibold text-[#252525] text-[11px] sm:text-xs">Brand:</span>
            {(['All', 'UNIQ', 'Skinarma', 'Energea'] as const).map((brand) => (
              <button
                key={brand}
                onClick={() => onFilterBrandChange && onFilterBrandChange(brand)}
                className={`px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-[11px] sm:text-xs font-semibold transition-all ${
                  filterBrand === brand
                    ? 'bg-[#B2D4EB] text-[#1C3A50] font-bold shadow-xs'
                    : 'bg-white text-[#4A6B82] border border-[#B2D4EB]/60 hover:bg-[#D9C9EB]/30'
                }`}
              >
                {brand}
              </button>
            ))}
          </div>

          {(searchQuery || selectedType !== 'All' || selectedStatus !== 'All' || selectedCountry !== 'All' || filterBrand !== 'All') && (
            <button
              onClick={handleResetFilters}
              className="text-[11px] sm:text-xs font-semibold text-[#4A6B82] hover:text-[#1C3A50] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Mobile Swipe Hint */}
      <div className="sm:hidden px-3.5 py-1.5 bg-[#F5F8FA] text-[10px] text-[#4A6B82] flex items-center justify-between border-b border-[#B2D4EB]/30 font-medium">
        <span>Swipe horizontally to view all 13 columns</span>
        <span className="text-[#4A6B82] font-semibold">13 columns →</span>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#F5F8FA] border-b border-[#B2D4EB]/40 text-[#4A6B82] uppercase font-semibold tracking-wider text-[10px] sm:text-[11px] whitespace-nowrap">
              {/* 1. Asset Name */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('assetName')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Asset Name <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 2. IP Type */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">IP Type</th>
              {/* 3. Country */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('country')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Country <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 4. Application Number */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('applicationNumber')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Application Number <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 5. Filing Date */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('filingDate')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Filing Date <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 6. Classes */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">Classes</th>
              {/* 7. Registration Number */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">Registration Number</th>
              {/* 8. Registration Date */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('registrationDate')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Registration Date <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 9. Status */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">Status</th>
              {/* 10. Renewal Due Date */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('renewalDueDate')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Renewal Due Date <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 11. Firm/Agent */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('firmAgent')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Firm/Agent <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 12. Applicant */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4">
                <button
                  onClick={() => handleSort('applicant')}
                  className="flex items-center gap-1 text-[#4A6B82] hover:text-[#1C3A50]"
                >
                  Applicant <ArrowUpDown className="w-3 h-3 text-[#4A6B82]" />
                </button>
              </th>
              {/* 13. Action */}
              <th className="py-2.5 sm:py-3 px-3 sm:px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#B2D4EB]/25 text-[#252525]">
            {filteredAssets.length === 0 ? (
              <tr>
                <td colSpan={13} className="py-12 text-center text-xs sm:text-sm text-[#4A6B82]">
                  No intellectual property assets found matching the selected criteria.
                </td>
              </tr>
            ) : (
              filteredAssets.map((asset) => (
                <tr
                  key={asset.id}
                  id={`asset-row-${asset.id}`}
                  onClick={() => onSelectAsset(asset)}
                  className="hover:bg-[#D9C9EB]/20 cursor-pointer transition-colors group"
                >
                  {/* 1. Asset Name */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-semibold text-[#252525]">
                    <div className="flex flex-col min-w-[140px] sm:min-w-[160px]">
                      <span className="group-hover:text-[#4A6B82] transition-colors text-xs font-semibold">
                        {asset.assetName}
                      </span>
                      {asset.brand && (
                        <span className="text-[9px] sm:text-[10px] text-[#4A6B82] font-medium">Brand: {asset.brand}</span>
                      )}
                    </div>
                  </td>

                  {/* 2. IP Type */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                    <IPTypeBadge type={asset.ipType} />
                  </td>

                  {/* 3. Country */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#4A6B82] shrink-0" />
                      <span>{asset.country}</span>
                      <span className="text-[10px] font-mono text-[#4A6B82]">({asset.countryCode})</span>
                    </div>
                  </td>

                  {/* 4. Application Number */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-mono text-[#252525] whitespace-nowrap text-xs">
                    {asset.applicationNumber}
                  </td>

                  {/* 5. Filing Date */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[#4A6B82] whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#4A6B82] shrink-0" />
                      <span>{asset.filingDate}</span>
                    </div>
                  </td>

                  {/* 6. Classes */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                    {asset.classes && asset.classes !== '-' ? (
                      <span className="inline-block px-1.5 sm:px-2 py-0.5 rounded bg-[#F5F8FA] border border-[#B2D4EB]/50 text-[#252525] font-mono text-[10px] sm:text-[11px] font-medium">
                        {asset.classes}
                      </span>
                    ) : (
                      <span className="text-[#4A6B82] text-xs">-</span>
                    )}
                  </td>

                  {/* 7. Registration Number */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-mono text-[#252525] whitespace-nowrap text-xs">
                    {asset.registrationNumber && asset.registrationNumber !== '-' ? (
                      asset.registrationNumber
                    ) : (
                      <span className="text-[#4A6B82]">-</span>
                    )}
                  </td>

                  {/* 8. Registration Date */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[#4A6B82] whitespace-nowrap text-xs">
                    {asset.registrationDate && asset.registrationDate !== '-' ? (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#4A6B82] shrink-0" />
                        <span>{asset.registrationDate}</span>
                      </div>
                    ) : (
                      <span className="text-[#4A6B82]">-</span>
                    )}
                  </td>

                  {/* 9. Status */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 whitespace-nowrap">
                    <StatusBadge status={asset.status} size="sm" />
                  </td>

                  {/* 10. Renewal Due Date */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 font-medium whitespace-nowrap text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className={asset.status === 'Renewal Due' ? 'text-[#DC2626] font-bold' : 'text-[#252525]'}>
                        {asset.renewalDueDate}
                      </span>
                    </div>
                  </td>

                  {/* 11. Firm/Agent */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[#252525] whitespace-nowrap text-xs">
                    {asset.firmAgent ? (
                      <span className="font-medium text-[#252525]">{asset.firmAgent}</span>
                    ) : (
                      <span className="text-[#4A6B82]">-</span>
                    )}
                  </td>

                  {/* 12. Applicant */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-[#252525] whitespace-nowrap text-xs">
                    {asset.applicant ? (
                      <span className="inline-block px-2 py-0.5 rounded bg-[#F5F8FA] text-[#252525] font-medium border border-[#B2D4EB]/50 text-[11px]">
                        {asset.applicant}
                      </span>
                    ) : (
                      <span className="text-[#4A6B82]">-</span>
                    )}
                  </td>

                  {/* 13. Action */}
                  <td className="py-2.5 sm:py-3.5 px-3 sm:px-4 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#4A6B82] group-hover:text-[#1C3A50] group-hover:translate-x-0.5 transition-transform">
                      View Profile <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
