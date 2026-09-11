export type IPType = 'Patent' | 'Trademark' | 'Design';

export type IPStatus =
  | 'To Be Filed'
  | 'Pending Examination'
  | 'Registered'
  | 'Refusal'
  | 'Refusal Responded'
  | 'Abandoned';

export type BrandName = 'UNIQ' | 'Skinarma' | 'Energea';

export interface IPAsset {
  id: string;
  assetName: string;
  ipType: IPType;
  brand?: BrandName;
  applicationNumber: string;
  country: string; // e.g., 'United States', 'Singapore', 'Japan', etc.
  countryCode: string; // ISO 2 or 3 letter or map key e.g., 'US', 'SG', 'JP', 'CN', 'GB', 'DE', 'KR', etc.
  filingDate: string; // YYYY-MM-DD
  classes?: string; // e.g. Nice Classes ('Class 9, 18'), Locarno, or IPC
  registrationNumber?: string; // e.g. '10202308914Q' or '-' if pending
  registrationDate?: string; // YYYY-MM-DD or '-' if pending
  renewalDueDate: string; // YYYY-MM-DD
  firmAgent?: string; // Law firm or patent/trademark agent handling the filing
  applicant?: string; // Corporate entity or applicant name
  status: IPStatus;
  notes: string;
  documentName?: string;
  documentDataUrl?: string; // base64 / blob / data url for preview
  documentSize?: string;
  documentType?: string; // e.g. 'application/pdf' or 'image/png'
  createdAt: string;
  updatedAt: string;
}

export type MapCountryStatus = 'registered' | 'pending' | 'none';

export interface BrandMapData {
  brand: BrandName;
  registeredCountries: string[]; // country codes
  pendingCountries: string[];    // country codes
}

export interface MetricSummary {
  totalAssets: number;
  registeredAssets: number;
  upcomingRenewals: number;
  pendingFilings: number;
  refusalAlerts: number;
  abandonedAssets: number;
}
