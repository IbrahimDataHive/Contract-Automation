import React, { useRef } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  CheckCircle2,
  Download,
  Zap,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { saveAs } from 'file-saver';
import {
  createSampleExcelBlob,
  createSampleDocxTemplateBlob,
} from '../utils/sampleData';

interface UploadSectionProps {
  excelFile: File | null;
  templateFile: File | null;
  excelFileName: string;
  templateFileName: string;
  onExcelUpload: (file: File) => void;
  onTemplateUpload: (file: File) => void;
  onLoadSamples: () => void;
  onResetFiles: () => void;
  rowCount: number;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  excelFile,
  templateFile,
  excelFileName,
  templateFileName,
  onExcelUpload,
  onTemplateUpload,
  onLoadSamples,
  onResetFiles,
  rowCount,
}) => {
  const excelInputRef = useRef<HTMLInputElement>(null);
  const templateInputRef = useRef<HTMLInputElement>(null);

  const handleExcelDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onExcelUpload(file);
      }
    }
  };

  const handleTemplateDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.docx')) {
        onTemplateUpload(file);
      }
    }
  };

  const handleDownloadSampleExcel = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = createSampleExcelBlob();
    saveAs(blob, 'sample_vendor_data.xlsx');
  };

  const handleDownloadSampleTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = createSampleDocxTemplateBlob();
    saveAs(blob, 'sample_contract_template.docx');
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 flex items-center">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mr-2.5">
              1
            </span>
            Upload Source Files
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Provide the Excel vendor dataset and Word template containing Jinja2 <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700 font-mono text-xs">{"{{ placeholder }}"}</code> variables.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="load-sample-data-btn"
            onClick={onLoadSamples}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Sample Files</span>
          </button>

          {(excelFile || templateFile) && (
            <button
              id="reset-files-btn"
              onClick={onResetFiles}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Excel Uploader Card */}
        <div
          id="excel-drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleExcelDrop}
          onClick={() => excelInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all text-center ${
            excelFile
              ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/20'
          }`}
        >
          <input
            ref={excelInputRef}
            type="file"
            accept=".xlsx,.xls"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onExcelUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
                excelFile ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
              }`}
            >
              {excelFile ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <FileSpreadsheet className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              {excelFile ? 'Excel Dataset Ready' : 'Excel Vendor Data (.xlsx, .xls)'}
            </h3>

            {excelFile ? (
              <div className="mt-1 space-y-1">
                <p className="text-xs font-mono text-emerald-700 font-medium truncate max-w-xs">
                  {excelFileName}
                </p>
                <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-500">
                  <span>{(excelFile.size / 1024).toFixed(1)} KB</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium">{rowCount} vendors parsed</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Drag &amp; drop your spreadsheet here, or{' '}
                <span className="text-blue-600 font-medium underline">browse</span>
              </p>
            )}

            <div className="mt-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadSampleExcel}
                className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-600 hover:text-blue-600 hover:underline px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample .xlsx</span>
              </button>
            </div>
          </div>
        </div>

        {/* Word Template Uploader Card */}
        <div
          id="template-drop-zone"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleTemplateDrop}
          onClick={() => templateInputRef.current?.click()}
          className={`relative group cursor-pointer border-2 border-dashed rounded-xl p-5 sm:p-6 transition-all text-center ${
            templateFile
              ? 'border-emerald-300 bg-emerald-50/40 hover:bg-emerald-50/70'
              : 'border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
          }`}
        >
          <input
            ref={templateInputRef}
            type="file"
            accept=".docx"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onTemplateUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-105 ${
                templateFile ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'
              }`}
            >
              {templateFile ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              ) : (
                <FileText className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-sm font-semibold text-slate-800">
              {templateFile ? 'Word Template Ready' : 'Word Contract Template (.docx)'}
            </h3>

            {templateFile ? (
              <div className="mt-1 space-y-1">
                <p className="text-xs font-mono text-emerald-700 font-medium truncate max-w-xs">
                  {templateFileName}
                </p>
                <p className="text-[11px] text-slate-500">
                  {(templateFile.size / 1024).toFixed(1)} KB • Jinja2 Placeholders
                </p>
              </div>
            ) : (
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Drag &amp; drop your Word document here, or{' '}
                <span className="text-indigo-600 font-medium underline">browse</span>
              </p>
            )}

            <div className="mt-4 flex items-center space-x-2">
              <button
                type="button"
                onClick={handleDownloadSampleTemplate}
                className="inline-flex items-center space-x-1 text-[11px] font-medium text-slate-600 hover:text-indigo-600 hover:underline px-2 py-1 rounded bg-white border border-slate-200 shadow-2xs"
              >
                <Download className="w-3 h-3" />
                <span>Download Sample .docx</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
