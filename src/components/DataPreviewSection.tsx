import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Table as TableIcon,
  Search,
  Copy,
  Check,
  Tag,
  Key,
  Building,
} from 'lucide-react';
import { VendorRow, ColumnMapping } from '../types';

interface DataPreviewSectionProps {
  data: VendorRow[];
  columns: string[];
  mapping: ColumnMapping;
  onMappingChange: (mapping: ColumnMapping) => void;
}

export const DataPreviewSection: React.FC<DataPreviewSectionProps> = ({
  data,
  columns,
  mapping,
  onMappingChange,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const filteredData = data.filter((row) => {
    if (!searchTerm.trim()) return true;
    const query = searchTerm.toLowerCase();
    return Object.values(row).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(query)
    );
  });

  const handleCopyTag = (colName: string) => {
    const tag = `{{ ${colName} }}`;
    navigator.clipboard.writeText(tag);
    setCopiedTag(colName);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      {/* Header with Collapsible Toggle */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-5 sm:px-6 py-4 flex items-center justify-between cursor-pointer bg-slate-50/70 hover:bg-slate-50 border-b border-slate-200 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
            2
          </span>
          <div>
            <h2 className="text-base font-semibold text-slate-900 flex items-center">
              <span>Data Preview &amp; Column Mapping</span>
              <span className="ml-2.5 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {data.length} records parsed
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Verify row parsing, identify key identifier columns, and view available Jinja2 tags
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-5 sm:p-6 space-y-5">
          {/* Column Mapping Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                <Key className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
                Vendor ID Column
              </label>
              <select
                id="vendor-id-col-select"
                value={mapping.idColumn}
                onChange={(e) =>
                  onMappingChange({ ...mapping, idColumn: e.target.value })
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used for selection labels and output document file naming.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center">
                <Building className="w-3.5 h-3.5 text-indigo-600 mr-1.5" />
                Vendor Name Column
              </label>
              <select
                id="vendor-name-col-select"
                value={mapping.nameColumn}
                onChange={(e) =>
                  onMappingChange({ ...mapping, nameColumn: e.target.value })
                }
                className="w-full text-xs sm:text-sm bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                Used to label options and generate customized contracts.
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-700 block mb-1">
                  Sanitization Status
                </span>
                <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <Check className="w-4 h-4 text-emerald-600 mr-1.5 shrink-0" />
                  <span>Missing values (NaN) are safely converted to empty strings</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Protects docx styles &amp; prevents literal "nan" text in output documents.
              </p>
            </div>
          </div>

          {/* Placeholders Tag Shelf */}
          <div className="border border-slate-200 rounded-xl p-3.5 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center">
                <Tag className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                Available Template Placeholders (Click to copy)
              </span>
              <span className="text-[11px] text-slate-400">
                Paste directly into your Word .docx template
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {columns.map((col) => {
                const isCopied = copiedTag === col;
                return (
                  <button
                    key={col}
                    type="button"
                    onClick={() => handleCopyTag(col)}
                    title={`Click to copy {{ ${col} }}`}
                    className={`group inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono transition-all border ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border-slate-200 hover:border-blue-300'
                    }`}
                  >
                    <span>{`{{ ${col} }}`}</span>
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 group-hover:text-blue-500 opacity-60 group-hover:opacity-100" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search & Table Data Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 flex items-center">
                <TableIcon className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
                Spreadsheet Rows Preview ({filteredData.length} shown)
              </span>
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-72">
              <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                <thead className="bg-slate-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-3 py-2.5 font-semibold text-slate-700 border-r border-slate-200 w-12 text-center">
                      #
                    </th>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className={`px-3 py-2.5 font-semibold border-r border-slate-200 whitespace-nowrap ${
                          col === mapping.idColumn
                            ? 'text-blue-700 bg-blue-50/70'
                            : col === mapping.nameColumn
                            ? 'text-indigo-700 bg-indigo-50/70'
                            : 'text-slate-700'
                        }`}
                      >
                        {col}
                        {col === mapping.idColumn && (
                          <span className="ml-1 text-[10px] font-normal text-blue-600">(ID)</span>
                        )}
                        {col === mapping.nameColumn && (
                          <span className="ml-1 text-[10px] font-normal text-indigo-600">(Name)</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="px-4 py-6 text-center text-slate-400">
                        No rows match your filter "{searchTerm}"
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-3 py-2 text-slate-400 text-center font-mono border-r border-slate-100">
                          {idx + 1}
                        </td>
                        {columns.map((col) => {
                          const val = row[col];
                          const isEmpty =
                            val === null ||
                            val === undefined ||
                            val === '' ||
                            (typeof val === 'number' && isNaN(val));
                          return (
                            <td
                              key={col}
                              className={`px-3 py-2 whitespace-nowrap border-r border-slate-100 ${
                                col === mapping.idColumn
                                  ? 'font-medium text-blue-900 bg-blue-50/20'
                                  : col === mapping.nameColumn
                                  ? 'font-medium text-slate-900'
                                  : 'text-slate-600'
                              }`}
                            >
                              {isEmpty ? (
                                <span className="text-slate-300 italic text-[11px]">—</span>
                              ) : (
                                String(val)
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
