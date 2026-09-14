import React from 'react';
import { X, BookOpen, Check, AlertCircle, FileText, Code } from 'lucide-react';

interface TemplateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TemplateGuideModal: React.FC<TemplateGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between sticky top-0 bg-white/95 backdrop-blur z-10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Word Template &amp; Jinja2 Placeholders Guide
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-sm text-slate-600">
          {/* Section 1: Basic Placeholders */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mr-2">
                1
              </span>
              Placeholder Syntax
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In your Microsoft Word (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">.docx</code>) template, insert variable tags surrounded by double curly braces matching your Excel spreadsheet column headers:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs space-y-1.5">
              <div><span className="text-slate-400"># Direct column mapping:</span></div>
              <div className="text-emerald-400">{"{{ vendor_name }}"}</div>
              <div className="text-emerald-400">{"{{ vendor_id }}"}</div>
              <div className="text-emerald-400">{"{{ effective_date }}"}</div>
              <div className="text-emerald-400">{"{{ contract_value }} {{ currency }}"}</div>
            </div>
          </div>

          {/* Section 2: Tables & Formatting */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mr-2">
                2
              </span>
              Tables &amp; Typography Preservation
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Because document rendering uses <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">docxtpl</code> (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">DocxTemplate</code> in Python) under the hood:
            </p>
            <ul className="text-xs space-y-1.5 list-disc pl-5 text-slate-600">
              <li>
                <strong>Styles remain intact:</strong> Font families, font sizes, colors, bold/italic, margins, and line heights applied to the placeholder will be inherited by the inserted data.
              </li>
              <li>
                <strong>Table cell layouts:</strong> You can place placeholders directly inside Word table cells, headers, and footers without corrupting cell borders or row heights.
              </li>
            </ul>
          </div>

          {/* Section 3: NaN Sanitization */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mr-2">
                3
              </span>
              Automated NaN &amp; Empty Cell Sanitization
            </h4>
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-1">
              <p className="font-semibold flex items-center">
                <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                Never see "nan" in generated contracts
              </p>
              <p>
                All missing or empty cells (<code className="font-mono">NaN</code>, <code className="font-mono">None</code>, or <code className="font-mono">NaT</code>) are converted into clean empty strings (<code className="font-mono">""</code>) before rendering.
              </p>
            </div>
          </div>

          {/* Section 4: Advanced Jinja2 Logic */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-900 flex items-center text-sm">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center mr-2">
                4
              </span>
              Conditional Logic (Jinja2)
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              You can include conditional clauses in your Word template to display special riders or notes only when present:
            </p>
            <div className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-xs space-y-1">
              <span className="text-amber-300">{"{% if notes %}"}</span>
              <br />
              &nbsp;&nbsp;Special Terms: {"{{ notes }}"}
              <br />
              <span className="text-amber-300">{"{% else %}"}</span>
              <br />
              &nbsp;&nbsp;Standard commercial terms apply.
              <br />
              <span className="text-amber-300">{"{% endif %}"}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
