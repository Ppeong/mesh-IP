import React, { useState } from 'react';
import { IPAsset } from '../types';
import { StatusBadge } from './StatusBadge';
import { IPTypeBadge } from './IPTypeBadge';
import { EditAssetModal } from './EditAssetModal';
import {
  ArrowLeft,
  Calendar,
  Globe2,
  FileText,
  Download,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Check,
  AlertCircle,
  FileDown,
} from 'lucide-react';

interface AssetProfileProps {
  asset: IPAsset;
  onBack: () => void;
  onUpdateNotes: (assetId: string, updatedNotes: string) => void;
  onStatusChange: (assetId: string, newStatus: IPAsset['status']) => void;
  onUpdateAsset?: (updatedAsset: IPAsset) => void;
}

export const AssetProfile: React.FC<AssetProfileProps> = ({
  asset,
  onBack,
  onUpdateNotes,
  onStatusChange,
  onUpdateAsset,
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState(asset.notes);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveNotes = () => {
    onUpdateNotes(asset.id, editedNotes);
    setIsEditingNotes(false);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Bar with Back Button & Key Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-[#B2D4EB]/40">
        <button
          id="back-to-list-btn"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4A6B82] hover:text-[#1C3A50] transition-colors group self-start"
        >
          <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:-translate-x-1" />
          Back to Asset Registry
        </button>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[11px] sm:text-xs text-[#4A6B82] font-medium">Status:</span>
            <select
              id="change-status-select"
              value={asset.status}
              onChange={(e) => onStatusChange(asset.id, e.target.value as IPAsset['status'])}
              className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg border border-[#B2D4EB]/70 bg-white text-[#252525] shadow-xs focus:ring-1 focus:ring-[#B2D4EB] focus:border-[#4A6B82]"
            >
              <option value="To Be Filed">To Be Filed</option>
              <option value="Pending Examination">Pending Examination</option>
              <option value="Registered">Registered</option>
              <option value="Refusal">Refusal</option>
              <option value="Refusal Responded">Refusal Responded</option>
              <option value="Abandoned">Abandoned</option>
            </select>
          </div>
          <StatusBadge status={asset.status} size="sm" />

          {/* Edit Asset Button in Top Right Hand Corner Next to Status */}
          <button
            id="edit-asset-header-btn"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#B2D4EB] hover:bg-[#9fc8e3] text-[#1C3A50] border border-[#9fc8e3] shadow-xs transition-colors"
            title="Edit all information for this asset in one popup"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Asset</span>
          </button>
        </div>
      </div>

      {/* Main Asset Header Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#B2D4EB]/50 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5 sm:space-y-2 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <IPTypeBadge type={asset.ipType} />
              {asset.brand && (
                <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold bg-[#B2D4EB] text-[#1C3A50] border border-[#9fc8e3]">
                  Brand: {asset.brand}
                </span>
              )}
              <span className="text-[10px] sm:text-xs text-[#4A6B82] font-mono">ID: {asset.id}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#252525] leading-snug break-words">
              {asset.assetName}
            </h1>
            <p className="text-xs sm:text-sm text-[#4A6B82] break-words">
              Filing / Registration Reference: <span className="font-mono font-semibold text-[#252525]">{asset.applicationNumber}</span>
            </p>
          </div>

          <div className="bg-[#F5F8FA] rounded-xl p-3 sm:p-4 border border-[#B2D4EB]/50 w-full md:w-auto min-w-0 md:min-w-[220px]">
            <span className="text-[10px] sm:text-xs font-semibold text-[#4A6B82] uppercase tracking-wider block mb-0.5 sm:mb-1">
              Renewal Timeline
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#4A6B82] shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-[#252525]">{asset.renewalDueDate}</span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-[#4A6B82] mt-0.5 sm:mt-1">
              Filing recorded on {asset.filingDate}
            </p>
          </div>
        </div>

        {/* Key Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5 mt-3.5 sm:mt-6 pt-3.5 sm:pt-6 border-t border-[#B2D4EB]/30">
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Jurisdiction</span>
            <div className="flex items-center gap-1 sm:gap-1.5 mt-0.5 min-w-0">
              <Globe2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#4A6B82] shrink-0" />
              <span className="text-[11px] sm:text-sm font-semibold text-[#252525] truncate">
                {asset.country} ({asset.countryCode})
              </span>
            </div>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">IP Category</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 truncate">
              {asset.ipType}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Classes</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 font-mono truncate">
              {asset.classes || '-'}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Reg. No.</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 font-mono truncate" title={asset.registrationNumber}>
              {asset.registrationNumber || '-'}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Reg. Date</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 truncate">
              {asset.registrationDate || '-'}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Next Expiry</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 truncate">
              {asset.renewalDueDate}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Firm / Agent</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 truncate" title={asset.firmAgent}>
              {asset.firmAgent || '-'}
            </span>
          </div>
          <div className="p-2 sm:p-2.5 bg-[#F5F8FA] rounded-lg min-w-0 border border-[#B2D4EB]/30">
            <span className="text-[9.5px] sm:text-xs text-[#4A6B82] block truncate">Applicant</span>
            <span className="text-[11px] sm:text-sm font-semibold text-[#252525] block mt-0.5 truncate" title={asset.applicant}>
              {asset.applicant || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Columns: Notes & Document Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Notes & Legal Portfolio Details */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#B2D4EB]/50 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6B82] shrink-0" />
                <h3 className="text-sm sm:text-base font-bold text-[#252525]">Notes & Specification Claims</h3>
              </div>
              {!isEditingNotes ? (
                <button
                  id="edit-notes-btn"
                  onClick={() => setIsEditingNotes(true)}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[#4A6B82] hover:text-[#1C3A50] transition-colors"
                >
                  <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Edit Notes
                </button>
              ) : (
                <button
                  id="save-notes-btn"
                  onClick={handleSaveNotes}
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold bg-[#B2D4EB] text-[#1C3A50] px-2.5 py-1 rounded-md hover:bg-[#9fc8e3] transition-colors"
                >
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  Save
                </button>
              )}
            </div>

            {isEditingNotes ? (
              <textarea
                rows={6}
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            ) : (
              <div className="bg-[#F5F8FA] p-3 sm:p-4 rounded-xl border border-[#B2D4EB]/40 text-xs sm:text-sm text-[#252525] leading-relaxed whitespace-pre-line min-h-[120px] sm:min-h-[140px]">
                {asset.notes || 'No specific notes recorded for this intellectual property asset.'}
              </div>
            )}
          </div>

          <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-[#B2D4EB]/30 flex flex-wrap items-center justify-between gap-2 text-[10px] sm:text-xs text-[#4A6B82]">
            <span>System Record ID: {asset.id}</span>
            <span>Last Updated: {new Date(asset.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Document Upload & Preview Section */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-[#B2D4EB]/50 shadow-xs">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#4A6B82] shrink-0" />
              <h3 className="text-sm sm:text-base font-bold text-[#252525]">Document Dossier & Preview</h3>
            </div>
            {asset.documentName && (
              <span className="text-[10px] sm:text-xs font-medium text-[#4A6B82] bg-[#F5F8FA] px-2 py-0.5 rounded border border-[#B2D4EB]/40">
                {asset.documentSize || 'PDF'}
              </span>
            )}
          </div>

          {/* Document Preview Container */}
          <div className="border border-[#B2D4EB]/50 rounded-xl bg-[#F5F8FA]/60 p-4 min-h-[260px] flex flex-col items-center justify-center">
            {asset.documentDataUrl ? (
              // If user uploaded a real file (base64)
              asset.documentType?.startsWith('image/') ? (
                <div className="w-full max-h-72 overflow-hidden rounded-lg flex items-center justify-center bg-white p-2 border border-[#B2D4EB]/40">
                  <img
                    src={asset.documentDataUrl}
                    alt={asset.documentName || 'Document Preview'}
                    className="max-h-64 object-contain rounded"
                  />
                </div>
              ) : (
                <div className="w-full space-y-4 text-center py-4">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-[#B2D4EB]/30 flex items-center justify-center text-[#252525] border border-[#B2D4EB]">
                    <FileDown className="w-8 h-8 text-[#4A6B82]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#252525]">{asset.documentName}</h4>
                    <p className="text-xs text-[#4A6B82] mt-0.5">{asset.documentSize} • PDF Document</p>
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <a
                      href={asset.documentDataUrl}
                      download={asset.documentName || 'dossier.pdf'}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#B2D4EB] text-[#1C3A50] hover:bg-[#9fc8e3] shadow-xs"
                    >
                      <Download className="w-4 h-4" />
                      Download Document
                    </a>
                  </div>
                </div>
              )
            ) : asset.documentName ? (
              // Seeded PDF preview card (mocked legal document preview)
              <div className="w-full flex flex-col items-center justify-center text-center space-y-3 py-6">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F8FA] flex items-center justify-center text-[#4A6B82] border border-[#B2D4EB]/60 shadow-xs">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#252525]">{asset.documentName}</h4>
                  <p className="text-xs text-[#4A6B82] mt-0.5">
                    Official IP Office Certified Certificate • {asset.documentSize}
                  </p>
                </div>

                {/* Simulated Certificate Sheet Preview */}
                <div className="w-full max-w-sm bg-white rounded-lg border border-[#B2D4EB]/50 p-3 shadow-xs text-left space-y-1.5 mt-2">
                  <div className="flex items-center justify-between border-b border-[#F5F8FA] pb-1">
                    <span className="text-[10px] font-bold tracking-wider text-[#4A6B82] uppercase">
                      OFFICIAL CERTIFICATE PREVIEW
                    </span>
                    <span className="text-[10px] font-mono text-[#4A6B82]">{asset.countryCode}</span>
                  </div>
                  <p className="text-xs font-semibold text-[#252525] truncate">{asset.assetName}</p>
                  <p className="text-[11px] text-[#4A6B82]">Application No: {asset.applicationNumber}</p>
                  <p className="text-[11px] text-[#4A6B82]">Jurisdiction Authority: National IP Office of {asset.country}</p>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    onClick={() => {
                      // Generate and open an inline text/html preview blob
                      const blobContent = `
                        <html>
                          <head><title>${asset.assetName}</title></head>
                          <body style="font-family: sans-serif; padding: 40px; background: #F5F8FA; color: #252525;">
                            <h2>Official IP Dossier Preview</h2>
                            <p><strong>Asset:</strong> ${asset.assetName}</p>
                            <p><strong>Type:</strong> ${asset.ipType}</p>
                            <p><strong>Reference:</strong> ${asset.applicationNumber}</p>
                            <p><strong>Country:</strong> ${asset.country} (${asset.countryCode})</p>
                            <p><strong>Filing Date:</strong> ${asset.filingDate}</p>
                            <p><strong>Renewal Due Date:</strong> ${asset.renewalDueDate}</p>
                            <p><strong>Firm/Agent:</strong> ${asset.firmAgent || '-'}</p>
                            <p><strong>Applicant:</strong> ${asset.applicant || '-'}</p>
                            <hr/>
                            <h3>Notes:</h3>
                            <p>${asset.notes}</p>
                          </body>
                        </html>
                      `;
                      const blob = new Blob([blobContent], { type: 'text/html' });
                      const url = URL.createObjectURL(blob);
                      window.open(url, '_blank');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#B2D4EB] text-[#1C3A50] hover:bg-[#9fc8e3]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open Certificate View
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-10 h-10 text-[#4A6B82] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#252525]">No document attached</p>
                <p className="text-xs text-[#4A6B82] mt-0.5">Upload a filing certificate or PDF specification</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full Information Edit Asset Popup */}
      <EditAssetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        asset={asset}
        onSave={(updatedAsset) => {
          if (onUpdateAsset) {
            onUpdateAsset(updatedAsset);
          }
          setEditedNotes(updatedAsset.notes);
        }}
      />
    </div>
  );
};
