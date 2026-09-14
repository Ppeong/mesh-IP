import React, { useState, useEffect } from 'react';
import { IPAsset, IPType, IPStatus, BrandName } from '../types';
import { COUNTRY_OPTIONS } from '../mockData';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';

interface EditAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: IPAsset;
  onSave: (updatedAsset: IPAsset) => void;
}

export const EditAssetModal: React.FC<EditAssetModalProps> = ({ isOpen, onClose, asset, onSave }) => {
  const [assetName, setAssetName] = useState(asset.assetName);
  const [ipType, setIpType] = useState<IPType>(asset.ipType);
  const [brand, setBrand] = useState<BrandName>(asset.brand || 'UNIQ');
  const [applicationNumber, setApplicationNumber] = useState(asset.applicationNumber);
  const [country, setCountry] = useState(asset.country);
  const [countryCode, setCountryCode] = useState(asset.countryCode || 'SG');
  const [filingDate, setFilingDate] = useState(asset.filingDate);
  const [classes, setClasses] = useState(asset.classes || '');
  const [registrationNumber, setRegistrationNumber] = useState(asset.registrationNumber === '-' ? '' : (asset.registrationNumber || ''));
  const [registrationDate, setRegistrationDate] = useState(asset.registrationDate === '-' ? '' : (asset.registrationDate || ''));
  const [renewalDueDate, setRenewalDueDate] = useState(asset.renewalDueDate || '');
  const [firmAgent, setFirmAgent] = useState(asset.firmAgent || '');
  const [applicant, setApplicant] = useState(asset.applicant || '');
  const [status, setStatus] = useState<IPStatus>(asset.status);
  const [notes, setNotes] = useState(asset.notes || '');

  // File upload state
  const [documentName, setDocumentName] = useState<string>(asset.documentName || '');
  const [documentDataUrl, setDocumentDataUrl] = useState<string>(asset.documentDataUrl || '');
  const [documentSize, setDocumentSize] = useState<string>(asset.documentSize || '');
  const [documentType, setDocumentType] = useState<string>(asset.documentType || '');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Synchronize when the asset prop changes
  useEffect(() => {
    if (asset) {
      setAssetName(asset.assetName);
      setIpType(asset.ipType);
      setBrand(asset.brand || 'UNIQ');
      setApplicationNumber(asset.applicationNumber);
      setCountry(asset.country);
      setCountryCode(asset.countryCode || 'SG');
      setFilingDate(asset.filingDate);
      setClasses(asset.classes && asset.classes !== '-' ? asset.classes : '');
      setRegistrationNumber(asset.registrationNumber && asset.registrationNumber !== '-' ? asset.registrationNumber : '');
      setRegistrationDate(asset.registrationDate && asset.registrationDate !== '-' ? asset.registrationDate : '');
      setRenewalDueDate(asset.renewalDueDate || '');
      setFirmAgent(asset.firmAgent || '');
      setApplicant(asset.applicant || '');
      setStatus(asset.status);
      setNotes(asset.notes || '');
      setDocumentName(asset.documentName || '');
      setDocumentDataUrl(asset.documentDataUrl || '');
      setDocumentSize(asset.documentSize || '');
      setDocumentType(asset.documentType || '');
      setErrorMsg('');
    }
  }, [asset, isOpen]);

  if (!isOpen) return null;

  const handleCountryChange = (selectedName: string) => {
    setCountry(selectedName);
    const found = COUNTRY_OPTIONS.find((c) => c.name === selectedName);
    if (found) {
      setCountryCode(found.code);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    setDocumentName(file.name);
    setDocumentType(file.type || (file.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream'));
    const sizeKb = Math.round(file.size / 1024);
    setDocumentSize(sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`);

    const reader = new FileReader();
    reader.onload = () => {
      setDocumentDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setDocumentName('');
    setDocumentDataUrl('');
    setDocumentSize('');
    setDocumentType('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetName.trim() || !applicationNumber.trim() || !country.trim()) {
      setErrorMsg('Please fill in all mandatory fields (Asset Name, Application Number, Country).');
      return;
    }

    onSave({
      ...asset,
      assetName: assetName.trim(),
      ipType,
      brand,
      applicationNumber: applicationNumber.trim(),
      country,
      countryCode,
      filingDate,
      classes: classes.trim() || '-',
      registrationNumber: registrationNumber.trim() || '-',
      registrationDate: registrationDate || '-',
      renewalDueDate,
      firmAgent: firmAgent.trim() || undefined,
      applicant: applicant.trim() || undefined,
      status,
      notes: notes.trim(),
      documentName: documentName || undefined,
      documentDataUrl: documentDataUrl || undefined,
      documentSize: documentSize || undefined,
      documentType: documentType || undefined,
      updatedAt: new Date().toISOString(),
    });

    onClose();
  };

  return (
    <div
      id="edit-asset-modal-overlay"
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn"
    >
      <div
        id="edit-asset-modal-container"
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#B2D4EB]/50 text-[#252525]"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-[#B2D4EB]/40 bg-[#F5F8FA]">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-[#252525]">Edit IP Asset Information</h2>
            <p className="text-[11px] sm:text-xs text-[#4A6B82] truncate">
              Update details for {asset.assetName} ({asset.id})
            </p>
          </div>
          <button
            id="close-edit-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#4A6B82] hover:text-[#252525] hover:bg-white/80 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Asset Title */}
          <div>
            <label className="block text-xs font-semibold text-[#252525] mb-1">
              Asset Name / Title <span className="text-red-500">*</span>
            </label>
            <input
              id="edit-asset-name"
              type="text"
              required
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              placeholder="e.g. UNIQ MagSafe ShockProof Bumper Structure"
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
            />
          </div>

          {/* Type & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">IP Classification Type</label>
              <select
                id="edit-select-ip-type"
                value={ipType}
                onChange={(e) => setIpType(e.target.value as IPType)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525] bg-white"
              >
                <option value="Patent">Patent</option>
                <option value="Trademark">Trademark</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Corporate Portfolio Brand</label>
              <select
                id="edit-select-brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value as BrandName)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525] bg-white"
              >
                <option value="UNIQ">UNIQ</option>
                <option value="Skinarma">Skinarma</option>
                <option value="Energea">Energea</option>
              </select>
            </div>
          </div>

          {/* Application Number & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">
                Application Number <span className="text-red-500">*</span>
              </label>
              <input
                id="edit-application-number"
                type="text"
                required
                value={applicationNumber}
                onChange={(e) => setApplicationNumber(e.target.value)}
                placeholder="e.g. SG-PAT-2024-00124"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">
                Jurisdiction Country <span className="text-red-500">*</span>
              </label>
              <select
                id="edit-select-country"
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525] bg-white"
              >
                {COUNTRY_OPTIONS.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filing Date & Renewal Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Filing Date</label>
              <input
                id="edit-filing-date"
                type="date"
                value={filingDate}
                onChange={(e) => setFilingDate(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Renewal Due Date</label>
              <input
                id="edit-renewal-date"
                type="date"
                value={renewalDueDate}
                onChange={(e) => setRenewalDueDate(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>
          </div>

          {/* Firm/Agent & Applicant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Firm / Legal Agent</label>
              <input
                id="edit-firm-agent"
                type="text"
                value={firmAgent}
                onChange={(e) => setFirmAgent(e.target.value)}
                placeholder="e.g. Allen & Gledhill LLP, Sughrue Mion"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Applicant Entity</label>
              <input
                id="edit-applicant"
                type="text"
                value={applicant}
                onChange={(e) => setApplicant(e.target.value)}
                placeholder="e.g. Uniq Creation Pte. Ltd."
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>
          </div>

          {/* Classes, Registration No & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Nice / IPC Classes</label>
              <input
                id="edit-classes"
                type="text"
                value={classes}
                onChange={(e) => setClasses(e.target.value)}
                placeholder="e.g. Class 9, 18 or IPC"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Registration Number</label>
              <input
                id="edit-registration-number"
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. 6894120"
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#252525] mb-1">Registration Date</label>
              <input
                id="edit-registration-date"
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-xs font-semibold text-[#252525] mb-1.5">Lifecycle Status</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {(
                [
                  'To Be Filed',
                  'Pending Examination',
                  'Registered',
                  'Refusal',
                  'Refusal Responded',
                  'Abandoned',
                ] as IPStatus[]
              ).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-[11px] sm:text-xs font-medium border transition-all text-center truncate ${
                    status === s
                      ? 'border-[#B2D4EB] bg-[#B2D4EB] text-[#1C3A50] shadow-xs font-bold'
                      : 'border-[#B2D4EB]/40 text-[#252525] bg-[#F5F8FA] hover:bg-[#D9C9EB]/30'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Document Upload / Replacement */}
          <div>
            <label className="block text-xs font-semibold text-[#252525] mb-1">
              Filing Document / Certificate Dossier
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-3 sm:p-4 text-center transition-all ${
                dragActive
                  ? 'border-[#4A6B82] bg-[#B2D4EB]/20'
                  : 'border-[#B2D4EB] bg-[#F5F8FA] hover:bg-[#B2D4EB]/15'
              }`}
            >
              <input
                id="edit-file-upload-input"
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {documentName ? (
                <div className="flex items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-[#4A6B82] shrink-0" />
                    <div className="text-left min-w-0">
                      <p className="text-xs font-bold text-[#252525] truncate max-w-[200px] sm:max-w-xs">{documentName}</p>
                      <p className="text-[11px] sm:text-xs text-[#4A6B82]">{documentSize || 'Document Attached'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile();
                      }}
                      className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove attached document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-6 h-6 sm:w-7 sm:h-7 text-[#4A6B82] mb-1.5 sm:mb-2" />
                  <p className="text-xs font-medium text-[#252525]">
                    Click to browse or drag & drop replacement document
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-[#4A6B82] mt-0.5">PDF, PNG, JPG up to 25MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-[#252525] mb-1">
              Notes, Claims & Prosecution History
            </label>
            <textarea
              id="edit-asset-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter details on classes, claims, maintenance schedule, local attorneys, or licensing status..."
              className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-lg border border-[#B2D4EB]/70 focus:outline-none focus:ring-2 focus:ring-[#B2D4EB] focus:border-[#4A6B82] text-xs sm:text-sm text-[#252525]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#B2D4EB]/40">
            <button
              type="button"
              id="cancel-edit-btn"
              onClick={onClose}
              className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold text-[#4A6B82] hover:text-[#1C3A50] hover:bg-[#F5F8FA] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-edit-asset-btn"
              className="px-4 sm:px-5 py-2 rounded-lg text-xs font-bold bg-[#B2D4EB] hover:bg-[#9fc8e3] text-[#1C3A50] shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
