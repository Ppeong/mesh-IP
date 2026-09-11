import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { IPAsset } from '../types';
import { exportAssetsToGoogleSheets } from '../services/sheetsService';
import { googleSignIn, googleSignOut } from '../services/firebaseAuth';
import {
  FileSpreadsheet,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  accessToken: string | null;
  assets: IPAsset[];
  onAuthUpdated: (user: User | null, token: string | null) => void;
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  accessToken,
  assets,
  onAuthUpdated,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ id: string; url: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  if (!isOpen) return null;

  const handleSignIn = async () => {
    try {
      setIsSigningIn(true);
      setErrorMsg(null);
      const res = await googleSignIn();
      if (res) {
        onAuthUpdated(res.user, res.accessToken);
      }
      // If res is null, the user cancelled or closed the popup; no error banner needed
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await googleSignOut();
      onAuthUpdated(null, null);
      setExportResult(null);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSyncToSheets = async () => {
    if (!accessToken) {
      setErrorMsg('Please sign in with Google first.');
      return;
    }

    try {
      setIsExporting(true);
      setErrorMsg(null);
      const res = await exportAssetsToGoogleSheets(
        accessToken,
        assets,
        'IP Assets Portfolio Register'
      );
      setExportResult({ id: res.spreadsheetId, url: res.spreadsheetUrl });
    } catch (err: any) {
      setErrorMsg(err.message || 'Error exporting to Google Sheets');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      id="sheets-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2.5 sm:p-4 backdrop-blur-xs overflow-y-auto"
    >
      <div
        id="sheets-modal-container"
        className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#B2D4EB]/50 text-[#252525] p-4 sm:p-6 space-y-3.5 sm:space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-[#B2D4EB]/40">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#C1E9D7] text-[#164E39] flex items-center justify-center border border-[#A7DEC6] shrink-0">
              <FileSpreadsheet className="w-4 h-4 sm:w-6 sm:h-6 text-[#164E39]" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-[#252525] truncate">Google Sheets Sync</h3>
              <p className="text-[10px] sm:text-xs text-[#4A6B82] truncate">Export & sync IP Assets to Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#4A6B82] hover:text-[#252525] shrink-0 px-1 py-0.5"
          >
            Close
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 sm:p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* User Auth Status */}
        <div className="bg-[#F5F8FA] rounded-xl p-3 sm:p-4 border border-[#B2D4EB]/50">
          <span className="text-[10px] sm:text-xs font-semibold text-[#4A6B82] uppercase tracking-wider block mb-1.5 sm:mb-2">
            Google Account Status
          </span>
          {currentUser && accessToken ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.displayName || 'User'}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#B2D4EB] shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#B2D4EB] text-[#1C3A50] flex items-center justify-center font-bold text-xs shrink-0">
                    {currentUser.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#252525] truncate">{currentUser.displayName || 'Google User'}</p>
                  <p className="text-[10px] sm:text-[11px] text-[#4A6B82] truncate">{currentUser.email}</p>
                </div>
              </div>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center gap-1 text-[11px] sm:text-xs text-[#4A6B82] hover:text-red-600 font-medium shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign out
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 sm:space-y-3 text-center py-1 sm:py-2">
              <p className="text-xs text-[#252525]">
                Sign in with your Google account to enable live synchronization to Google Sheets.
              </p>
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="w-full inline-flex items-center justify-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-[#B2D4EB]/60 rounded-lg bg-white hover:bg-[#D9C9EB]/20 text-xs font-semibold text-[#252525] shadow-xs"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isSigningIn ? 'Authorizing...' : 'Sign in with Google'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Sync details */}
        <div className="space-y-1.5 sm:space-y-2 text-[11px] sm:text-xs text-[#4A6B82]">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span>Assets to sync:</span>
            <span className="font-bold text-[#252525]">{assets.length} items</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="shrink-0 mr-2">Columns:</span>
            <span className="font-mono text-[#252525] truncate">Name, Type, Brand, App No, Country, Filing, Renewal...</span>
          </div>
        </div>

        {exportResult && (
          <div className="p-3 sm:p-4 bg-[#C1E9D7]/30 border border-[#C1E9D7] rounded-xl space-y-1.5 sm:space-y-2">
            <div className="flex items-center gap-2 text-[#164E39] font-bold text-xs">
              <CheckCircle2 className="w-4 h-4 text-[#164E39] shrink-0" />
              <span>Spreadsheet Successfully Created & Updated!</span>
            </div>
            <a
              href={exportResult.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#164E39] underline hover:text-[#0f3629]"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>
        )}

        {/* Action button */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 pt-2.5 sm:pt-3 border-t border-[#B2D4EB]/40">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 sm:px-4 py-2 rounded-lg text-xs font-semibold text-[#4A6B82] hover:text-[#252525]"
          >
            Done
          </button>
          <button
            type="button"
            onClick={handleSyncToSheets}
            disabled={isExporting || !accessToken}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs font-bold bg-[#B2D4EB] hover:bg-[#9fc8e3] text-[#1C3A50] disabled:opacity-50 shadow-xs"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Syncing to Sheets...</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4 shrink-0" />
                <span>Sync to Google Sheets</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
