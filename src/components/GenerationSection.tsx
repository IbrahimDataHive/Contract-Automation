import React from 'react';
import {
  Zap,
  Download,
  FileArchive,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
  HardDrive,
  FileCheck,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import { GeneratedContract, GenerationProgress } from '../types';

interface GenerationSectionProps {
  selectedCount: number;
  isReadyToGenerate: boolean;
  isGenerating: boolean;
  progress: GenerationProgress;
  generatedContracts: GeneratedContract[];
  errors: string[];
  onGenerate: () => void;
  zipBlob: Blob | null;
}

export const GenerationSection: React.FC<GenerationSectionProps> = ({
  selectedCount,
  isReadyToGenerate,
  isGenerating,
  progress,
  generatedContracts,
  errors,
  onGenerate,
  zipBlob,
}) => {
  const handleDownloadSingle = (contract: GeneratedContract) => {
    saveAs(contract.blob, contract.filename);
  };

  const handleDownloadZip = () => {
    if (!zipBlob) return;
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    saveAs(zipBlob, `Vendor_Contracts_${dateStr}.zip`);
  };

  const progressPercent =
    progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            4
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Document Generation &amp; Download
            </h2>
            <p className="text-xs text-slate-500">
              In-memory docx templating with automated NaN sanitization and instant ZIP packaging
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-5">
        {/* Action Button & Trigger */}
        <div>
          <button
            id="generate-contracts-btn"
            type="button"
            disabled={!isReadyToGenerate || isGenerating}
            onClick={onGenerate}
            className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 shadow-xs transition-all ${
              !isReadyToGenerate || isGenerating
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 active:scale-[0.99]'
            }`}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>
                  Generating ({progress.current}/{progress.total})...
                </span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  {selectedCount === 0
                    ? 'Select at least 1 vendor to generate'
                    : selectedCount === 1
                    ? '⚡ Generate 1 Contract (.docx)'
                    : `⚡ Generate ${selectedCount} Contracts (.zip bundle)`}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Progress Bar & Status Spinner during execution */}
        {isGenerating && (
          <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-blue-900 flex items-center">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600 mr-2" />
                {progress.status}
              </span>
              <span className="font-semibold text-blue-700 font-mono">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full bg-blue-200/60 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Error Callouts */}
        {errors.length > 0 && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5">
            <div className="flex items-center text-xs font-semibold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 mr-1.5 shrink-0" />
              <span>Generation Warnings ({errors.length})</span>
            </div>
            <ul className="text-xs text-amber-800 space-y-1 pl-5 list-disc">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Output & Download Section */}
        {generatedContracts.length > 0 && !isGenerating && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-700">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold">
                  Successfully generated {generatedContracts.length} contract
                  {generatedContracts.length > 1 ? 's' : ''} in-memory!
                </span>
              </div>
            </div>

            {/* If 1 contract: Direct single download button */}
            {generatedContracts.length === 1 ? (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-emerald-950">
                      {generatedContracts[0].filename}
                    </h4>
                    <p className="text-xs text-emerald-700">
                      {generatedContracts[0].sizeKb} KB • Microsoft Word Document
                    </p>
                  </div>
                </div>

                <button
                  id="download-single-contract-btn"
                  type="button"
                  onClick={() => handleDownloadSingle(generatedContracts[0])}
                  className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .docx</span>
                </button>
              </div>
            ) : (
              /* If multiple contracts: Bundle into ZIP download button */
              <div className="space-y-3">
                <div className="p-5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                      <FileArchive className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-blue-950">
                        Bundle Archive Ready (.ZIP)
                      </h4>
                      <p className="text-xs text-blue-700">
                        Contains all {generatedContracts.length} customized Word agreements
                        {zipBlob && ` (${(zipBlob.size / 1024).toFixed(1)} KB)`}
                      </p>
                    </div>
                  </div>

                  <button
                    id="download-all-zip-btn"
                    type="button"
                    onClick={handleDownloadZip}
                    className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all active:scale-98"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download All Contracts (.zip)</span>
                  </button>
                </div>

                {/* Manifest Table */}
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center">
                      <FileCheck className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                      Generated Documents Manifest
                    </span>
                    <span className="text-slate-500 font-normal">
                      {generatedContracts.length} files generated
                    </span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {generatedContracts.map((contract, i) => (
                      <div
                        key={i}
                        className="px-4 py-2.5 flex items-center justify-between text-xs hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center space-x-2.5 truncate pr-2">
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="font-mono text-slate-800 truncate font-medium">
                            {contract.filename}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 shrink-0">
                          <span className="text-slate-400 font-mono text-[11px]">
                            {contract.sizeKb} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDownloadSingle(contract)}
                            className="p-1 text-slate-500 hover:text-blue-600 rounded hover:bg-blue-50 transition-colors"
                            title="Download this individual document"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
