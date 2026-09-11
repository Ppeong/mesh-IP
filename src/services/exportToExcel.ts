import * as XLSX from 'xlsx';
import { IPAsset, BrandName } from '../types';

export interface ExcelExportOptions {
  brandFilter?: string;
  searchQuery?: string;
  selectedType?: string;
  selectedStatus?: string;
  selectedCountry?: string;
}

/**
 * Generates and downloads an Excel (.xlsx) file containing the IP assets list
 * along with an executive summary sheet for corporate reporting purposes.
 */
export function exportIPAssetsToExcel(
  assets: IPAsset[],
  options: ExcelExportOptions = {}
): { filename: string; count: number } {
  const {
    brandFilter = 'All',
    searchQuery = '',
    selectedType = 'All',
    selectedStatus = 'All',
    selectedCountry = 'All',
  } = options;

  const todayStr = new Date().toISOString().split('T')[0];
  const filename = `IP_Assets_Report_${brandFilter === 'All' ? 'Portfolio' : brandFilter}_${todayStr}.xlsx`;

  // 1. Prepare Primary IP Assets Data rows
  const assetRows = assets.map((a, index) => ({
    'No.': index + 1,
    'Asset ID': a.id,
    'Asset Name': a.assetName,
    'IP Type': a.ipType,
    'Brand': a.brand || 'Unassigned',
    'Application Number': a.applicationNumber,
    'Country / Jurisdiction': a.country,
    'Country Code': a.countryCode || '',
    'Filing Date': a.filingDate || 'N/A',
    'Classes': a.classes || 'N/A',
    'Registration Number': a.registrationNumber || 'N/A',
    'Registration Date': a.registrationDate || 'N/A',
    'Renewal Due Date': a.renewalDueDate || 'N/A',
    'Firm / Agent': a.firmAgent || 'N/A',
    'Applicant': a.applicant || 'N/A',
    'Status': a.status,
    'Document Attached': a.documentName ? `Yes (${a.documentName})` : 'No',
    'File Size': a.documentSize || 'N/A',
    'Notes / Claims': a.notes || '',
    'Record Created': a.createdAt ? a.createdAt.split('T')[0] : 'N/A',
    'Last Updated': a.updatedAt ? a.updatedAt.split('T')[0] : 'N/A',
  }));

  // Create primary worksheet
  const wsAssets = XLSX.utils.json_to_sheet(assetRows);

  // Set explicit column widths for readability in Excel
  wsAssets['!cols'] = [
    { wch: 6 },  // No.
    { wch: 12 }, // Asset ID
    { wch: 45 }, // Asset Name
    { wch: 14 }, // IP Type
    { wch: 14 }, // Brand
    { wch: 24 }, // Application Number
    { wch: 22 }, // Country
    { wch: 10 }, // Code
    { wch: 14 }, // Filing Date
    { wch: 20 }, // Classes
    { wch: 20 }, // Registration Number
    { wch: 16 }, // Registration Date
    { wch: 16 }, // Renewal Due Date
    { wch: 28 }, // Firm / Agent
    { wch: 26 }, // Applicant
    { wch: 22 }, // Status
    { wch: 28 }, // Document Attached
    { wch: 12 }, // File Size
    { wch: 55 }, // Notes
    { wch: 14 }, // Created
    { wch: 14 }, // Updated
  ];

  // 2. Prepare Executive Summary Data
  const totalCount = assets.length;
  const statusCounts = {
    'Registered': assets.filter((a) => a.status === 'Registered').length,
    'Pending Examination': assets.filter((a) => a.status === 'Pending Examination').length,
    'To Be Filed': assets.filter((a) => a.status === 'To Be Filed').length,
    'Refusal Responded': assets.filter((a) => a.status === 'Refusal Responded').length,
    'Refusal': assets.filter((a) => a.status === 'Refusal').length,
    'Abandoned': assets.filter((a) => a.status === 'Abandoned').length,
  };

  const brandCounts = {
    'UNIQ': assets.filter((a) => a.brand === 'UNIQ').length,
    'Skinarma': assets.filter((a) => a.brand === 'Skinarma').length,
    'Energea': assets.filter((a) => a.brand === 'Energea').length,
    'Other / Unassigned': assets.filter((a) => !a.brand || !['UNIQ', 'Skinarma', 'Energea'].includes(a.brand)).length,
  };

  const typeCounts = {
    'Patent': assets.filter((a) => a.ipType === 'Patent').length,
    'Trademark': assets.filter((a) => a.ipType === 'Trademark').length,
    'Design': assets.filter((a) => a.ipType === 'Design').length,
  };

  const summaryRows = [
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Report Title', 'Value': 'IP Asset Portfolio Executive Report' },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Export Timestamp', 'Value': new Date().toLocaleString() },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Active Brand Scope', 'Value': brandFilter },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Filter: IP Type', 'Value': selectedType },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Filter: Status', 'Value': selectedStatus },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Filter: Country', 'Value': selectedCountry },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Active Search Keyword', 'Value': searchQuery || '(None)' },
    { 'Category': 'REPORT OVERVIEW', 'Metric': 'Total Exported Records', 'Value': totalCount },
    { 'Category': '', 'Metric': '', 'Value': '' },

    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'Registered (In Force)', 'Value': statusCounts['Registered'] },
    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'Pending Examination', 'Value': statusCounts['Pending Examination'] },
    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'To Be Filed', 'Value': statusCounts['To Be Filed'] },
    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'Refusal Responded', 'Value': statusCounts['Refusal Responded'] },
    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'Refusal (Action Needed)', 'Value': statusCounts['Refusal'] },
    { 'Category': 'STATUS BREAKDOWN', 'Metric': 'Abandoned', 'Value': statusCounts['Abandoned'] },
    { 'Category': '', 'Metric': '', 'Value': '' },

    { 'Category': 'BRAND DISTRIBUTION', 'Metric': 'UNIQ Brand', 'Value': brandCounts['UNIQ'] },
    { 'Category': 'BRAND DISTRIBUTION', 'Metric': 'Skinarma Brand', 'Value': brandCounts['Skinarma'] },
    { 'Category': 'BRAND DISTRIBUTION', 'Metric': 'Energea Brand', 'Value': brandCounts['Energea'] },
    { 'Category': '', 'Metric': '', 'Value': '' },

    { 'Category': 'IP TYPE DISTRIBUTION', 'Metric': 'Patents', 'Value': typeCounts['Patent'] },
    { 'Category': 'IP TYPE DISTRIBUTION', 'Metric': 'Trademarks', 'Value': typeCounts['Trademark'] },
    { 'Category': 'IP TYPE DISTRIBUTION', 'Metric': 'Registered Designs', 'Value': typeCounts['Design'] },
  ];

  const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
  wsSummary['!cols'] = [
    { wch: 28 }, // Category
    { wch: 32 }, // Metric
    { wch: 40 }, // Value
  ];

  // 3. Assemble Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, wsAssets, 'IP Assets Registry');
  XLSX.utils.book_append_sheet(workbook, wsSummary, 'Executive Summary');

  // 4. Trigger download in browser
  XLSX.writeFile(workbook, filename);

  return { filename, count: totalCount };
}
